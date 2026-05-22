import { Router, type IRouter, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { type AuthedRequest, requireAuth } from "../lib/auth";
import {
  createStripeConnectAccount,
  createStripeAccountLink,
  getStripeAccountStatus,
  getAppUrl,
  isStripeConfigured,
} from "../lib/stripe";

const router: IRouter = Router();

// POST /api/stripe-connect/onboarding/start
// Creates a Stripe Connect Express account and returns the onboarding link
router.post("/onboarding/start", requireAuth, async (req: AuthedRequest, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({
      error: "payments_unavailable",
      message: "Stripe is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and APP_URL.",
    });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found." });
      return;
    }

    // Check if user already has a Stripe Connect account
    if (user.stripeConnectId) {
      // If account exists but not active, return existing onboarding link
      if (user.stripeAccountStatus !== "active") {
        const appUrl = getAppUrl();
        if (!appUrl) {
          res.status(503).json({
            error: "payments_unavailable",
            message: "APP_URL or RENDER_EXTERNAL_URL must be available.",
          });
          return;
        }

        const accountLink = await createStripeAccountLink({
          accountId: user.stripeConnectId,
          refreshUrl: `${appUrl}/settings?section=payment&stripe=refresh`,
          returnUrl: `${appUrl}/settings?section=payment&stripe=return`,
        });

        res.status(200).json({
          url: accountLink.url,
          accountId: user.stripeConnectId,
          status: user.stripeAccountStatus,
        });
        return;
      }

      // Account is already active
      res.status(400).json({
        error: "already_active",
        message: "Your Stripe Connect account is already active.",
        accountId: user.stripeConnectId,
        status: user.stripeAccountStatus,
      });
      return;
    }

    // Create new Stripe Connect account
    const { accountId } = await createStripeConnectAccount({
      email: user.email,
      countryCode: user.countryCode || "US",
      businessType: "individual",
    });

    // Update user with Stripe Connect account ID
    await db
      .update(usersTable)
      .set({
        stripeConnectId: accountId,
        stripeAccountStatus: "pending",
      })
      .where(eq(usersTable.id, req.auth!.userId));

    // Generate onboarding link
    const appUrl = getAppUrl();
    if (!appUrl) {
      res.status(503).json({
        error: "payments_unavailable",
        message: "APP_URL or RENDER_EXTERNAL_URL must be available.",
      });
      return;
    }

    const accountLink = await createStripeAccountLink({
      accountId,
      refreshUrl: `${appUrl}/settings?section=payment&stripe=refresh`,
      returnUrl: `${appUrl}/settings?section=payment&stripe=return`,
    });

    res.status(201).json({
      url: accountLink.url,
      accountId,
      status: "pending",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Stripe Connect account.";
    res.status(400).json({ error: "stripe_error", message });
  }
});

async function sendAccountStatus(req: AuthedRequest, res: Response) {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found." });
      return;
    }

    if (!user.stripeConnectId) {
      res.status(200).json({
        hasAccount: false,
        status: "not_started",
      });
      return;
    }

    if (!isStripeConfigured()) {
      res.status(503).json({
        error: "payments_unavailable",
        message: "Stripe is not configured yet. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and APP_URL.",
      });
      return;
    }

    // Fetch latest status from Stripe
    const stripeStatus = await getStripeAccountStatus(user.stripeConnectId);

    // Update user's status in database if it changed
    if (stripeStatus.status !== user.stripeAccountStatus) {
      await db
        .update(usersTable)
        .set({
          stripeAccountStatus: stripeStatus.status,
        })
        .where(eq(usersTable.id, req.auth!.userId));
    }

    res.status(200).json({
      hasAccount: true,
      accountId: user.stripeConnectId,
      status: stripeStatus.status,
      detailsSubmitted: stripeStatus.detailsSubmitted,
      chargesEnabled: stripeStatus.chargesEnabled,
      payoutsEnabled: stripeStatus.payoutsEnabled,
      requirements: stripeStatus.requirements,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch Stripe Connect status.";
    res.status(400).json({ error: "stripe_error", message });
  }
}

// GET /api/stripe-connect/account-status
// Returns the current status of the user's Stripe Connect account
router.get("/account-status", requireAuth, sendAccountStatus);

// Backward-compatible route used by older UI builds.
router.get("/onboarding/status", requireAuth, sendAccountStatus);

// POST /api/stripe-connect/onboarding/refresh
// Generates a new onboarding link for an existing account
router.post("/onboarding/refresh", requireAuth, async (req: AuthedRequest, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({
      error: "payments_unavailable",
      message: "Stripe is not configured yet.",
    });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found." });
      return;
    }

    if (!user.stripeConnectId) {
      res.status(400).json({ error: "no_account", message: "No Stripe Connect account found." });
      return;
    }

    const appUrl = getAppUrl();
    if (!appUrl) {
      res.status(503).json({
        error: "payments_unavailable",
        message: "APP_URL or RENDER_EXTERNAL_URL must be available.",
      });
      return;
    }

    const accountLink = await createStripeAccountLink({
      accountId: user.stripeConnectId,
      refreshUrl: `${appUrl}/settings?section=payment&stripe=refresh`,
      returnUrl: `${appUrl}/settings?section=payment&stripe=return`,
    });

    res.status(200).json({
      url: accountLink.url,
      accountId: user.stripeConnectId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not refresh onboarding link.";
    res.status(400).json({ error: "stripe_error", message });
  }
});

// GET /api/stripe-connect/onboarding/return
// Handles the return from Stripe onboarding and updates account status
router.get("/onboarding/return", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found." });
      return;
    }

    if (!user.stripeConnectId) {
      res.status(400).json({ error: "no_account", message: "No Stripe Connect account found." });
      return;
    }

    // Fetch latest status from Stripe
    const stripeStatus = await getStripeAccountStatus(user.stripeConnectId);

    // Update user's status in database
    await db
      .update(usersTable)
      .set({
        stripeAccountStatus: stripeStatus.status,
      })
      .where(eq(usersTable.id, req.auth!.userId));

    // Redirect to settings page with status
    const appUrl = getAppUrl();
    if (!appUrl) {
      res.status(503).json({ error: "payments_unavailable", message: "APP_URL not configured." });
      return;
    }

    res.redirect(303, `${appUrl}/settings?section=payment&stripe=completed&status=${stripeStatus.status}`);
  } catch (error) {
    const appUrl = getAppUrl();
    const redirectUrl = appUrl ? `${appUrl}/settings?section=payment&stripe=error` : "/settings";
    res.redirect(303, redirectUrl);
  }
});

// POST /api/stripe-connect/auto-create
// Automatically creates a Stripe Connect account (used during signup)
router.post("/auto-create", requireAuth, async (req: AuthedRequest, res) => {
  if (!isStripeConfigured()) {
    res.status(503).json({
      error: "payments_unavailable",
      message: "Stripe is not configured.",
    });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.auth!.userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found." });
      return;
    }

    // If account already exists, just return its info
    if (user.stripeConnectId) {
      res.status(200).json({
        accountId: user.stripeConnectId,
        status: user.stripeAccountStatus,
        message: "Account already exists",
      });
      return;
    }

    // Create new Stripe Connect account
    const { accountId } = await createStripeConnectAccount({
      email: user.email,
      countryCode: user.countryCode || "US",
      businessType: "individual",
    });

    // Update user with Stripe Connect account ID
    await db
      .update(usersTable)
      .set({
        stripeConnectId: accountId,
        stripeAccountStatus: "pending",
      })
      .where(eq(usersTable.id, req.auth!.userId));

    res.status(201).json({
      accountId,
      status: "pending",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not auto-create Stripe Connect account.";
    res.status(400).json({ error: "stripe_error", message });
  }
});

export default router;
