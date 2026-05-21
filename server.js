const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required in environment variables.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27",
});

app.use(express.json());

const ordersDatabase = Object.create(null);

function logEmail(to, subject, body) {
  console.log(`EMAIL to ${to}: ${subject}\n${body}\n`);
}

function createOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function triggerDynamicTimeoutCheck(orderId) {
  const order = ordersDatabase[orderId];
  if (!order) {
    console.warn(`Timeout fired for missing order ${orderId}`);
    return;
  }

  if (order.status !== "PAID") {
    return;
  }

  try {
    order.status = "REFUNDED";
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
    });

    logEmail(
      order.buyerEmail,
      "Order refund initiated",
      `Your order ${orderId} was automatically refunded on ${new Date().toISOString()} because the item was not marked shipped by the deadline. Refund ID: ${refund.id}`,
    );

    logEmail(
      order.sellerEmail,
      "Order cancelled and refunded",
      `Order ${orderId} was automatically cancelled because it was not shipped by the deadline. The buyer has been refunded and no transfer was sent to the seller account.`,
    );
  } catch (error) {
    console.error(`Failed to refund order ${orderId}:`, error);
    order.status = "REFUND_FAILED";
  }
}

app.post("/api/checkout", async (req, res) => {
  try {
    const {
      amount,
      paymentMethodId,
      vendorStripeAccountId,
      buyerEmail,
      sellerEmail,
      productionDays,
      shippingDays,
    } = req.body;

    if (!amount || !paymentMethodId || !vendorStripeAccountId || !buyerEmail || !sellerEmail) {
      return res.status(400).json({ error: "validation_error", message: "Missing required checkout fields." });
    }

    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ error: "validation_error", message: "Amount must be a positive number." });
    }

    const productionDaysValue = Math.max(0, Math.floor(Number(productionDays) || 0));
    const shippingDaysValue = Math.max(0, Math.floor(Number(shippingDays) || 0));
    const totalDays = productionDaysValue + shippingDaysValue;
    const timeoutMs = totalDays * 24 * 60 * 60 * 1000;
    const refundTriggerDate = new Date(Date.now() + timeoutMs).toISOString();
    const orderId = createOrderId();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      payment_method: paymentMethodId,
      receipt_email: buyerEmail,
      metadata: {
        orderId,
        vendorStripeAccountId,
      },
      confirm: true,
    });

    ordersDatabase[orderId] = {
      orderId,
      status: "PAID",
      amountCents,
      paymentIntentId: paymentIntent.id,
      vendorStripeAccountId,
      buyerEmail,
      sellerEmail,
      createdAt: new Date().toISOString(),
      refundTriggerDate,
    };

    setTimeout(() => {
      void triggerDynamicTimeoutCheck(orderId);
    }, timeoutMs);

    logEmail(
      buyerEmail,
      "Order received and escrow started",
      `Your payment for order ${orderId} was accepted. If the item is not marked shipped by ${refundTriggerDate}, the order will be automatically refunded.`,
    );

    logEmail(
      sellerEmail,
      "New order received",
      `Order ${orderId} was placed and paid. The automatic refund deadline is ${refundTriggerDate} if the item is not shipped in time.`,
    );

    return res.status(201).json({ orderId, paymentIntentId: paymentIntent.id, refundTriggerDate });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: "checkout_error", message: "Unable to complete checkout." });
  }
});

app.post("/api/fulfill", async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: "validation_error", message: "orderId is required." });
    }

    const order = ordersDatabase[orderId];
    if (!order) {
      return res.status(404).json({ error: "not_found", message: "Order not found." });
    }

    if (order.status === "REFUNDED") {
      return res.status(400).json({ error: "invalid_state", message: "Order has already been refunded." });
    }

    if (order.status === "SHIPPED") {
      return res.status(400).json({ error: "invalid_state", message: "Order has already been marked shipped." });
    }

    const transferAmount = Math.floor(order.amountCents * 0.9);
    const platformFee = order.amountCents - transferAmount;

    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: "usd",
      destination: order.vendorStripeAccountId,
      metadata: {
        orderId,
      },
    });

    order.status = "SHIPPED";
    order.shippedAt = new Date().toISOString();
    order.platformFeeCents = platformFee;
    order.transferId = transfer.id;

    logEmail(
      order.buyerEmail,
      "Order shipped",
      `Order ${orderId} has been marked shipped. The seller has been paid after the platform fee of ${platformFee} cents.`,
    );

    logEmail(
      order.sellerEmail,
      "Order fulfillment confirmed",
      `Order ${orderId} is marked shipped and ${transferAmount} cents has been transferred to your Stripe balance.`,
    );

    return res.status(200).json({ orderId, status: order.status, transferId: transfer.id });
  } catch (error) {
    console.error("Fulfill error:", error);
    return res.status(500).json({ error: "fulfill_error", message: "Unable to fulfill order." });
  }
});

app.get("/api/order/:orderId", (req, res) => {
  const order = ordersDatabase[req.params.orderId];
  if (!order) {
    return res.status(404).json({ error: "not_found", message: "Order not found." });
  }

  return res.json({ order });
});

app.get("/", (_req, res) => {
  res.send("Marketplace escrow server is running.");
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "server_error", message: "An unexpected error occurred." });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
