// Brevo Email Service using Fetch API
// Note: This runs on the client-side with Vite env variables

declare const __VITE_BREVO_API_KEY__: string | undefined;
declare const __VITE_BREVO_SENDER_EMAIL__: string | undefined;
declare const __VITE_BREVO_SENDER_NAME__: string | undefined;
declare const __VITE_APP_URL__: string | undefined;

// Access env vars through import.meta.env (Vite specific)
const getEnvVar = (name: string, fallback: string): string => {
  try {
    // @ts-ignore - Vite's import.meta.env
    return import.meta.env?.[name] || fallback;
  } catch {
    return fallback;
  }
};

const BREVO_API_KEY = getEnvVar('VITE_BREVO_API_KEY', '');
const BREVO_SENDER_EMAIL = getEnvVar('VITE_BREVO_SENDER_EMAIL', 'noreply@synthixgroup.co.uk');
const BREVO_SENDER_NAME = getEnvVar('VITE_BREVO_SENDER_NAME', 'Synthix');
const APP_URL = getEnvVar('VITE_APP_URL', 'https://synthixgroup.co.uk');

export interface EmailPayload {
  to: { email: string; name?: string }[];
  templateId?: number;
  params?: Record<string, any>;
  subject?: string;
  htmlContent?: string;
  sender?: { email: string; name: string };
}

/**
 * Send email via Brevo using Fetch API
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!BREVO_API_KEY) {
    console.warn('Brevo API key not configured');
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    const body: any = {
      sender: payload.sender || { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
      to: payload.to,
    };

    if (payload.templateId) {
      body.templateId = payload.templateId;
      body.params = payload.params;
    } else {
      body.subject = payload.subject;
      body.htmlContent = payload.htmlContent;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${error}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      messageId: data.messageId
    };
  } catch (error: any) {
    console.error('Brevo email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Send new quote notification to buyer
 */
export async function sendNewQuoteNotification(
  buyerEmail: string,
  buyerName: string,
  requestTitle: string,
  sellerName: string,
  quotePrice: number
): Promise<{ success: boolean; error?: string }> {
  const templateId = 0; // Template IDs can be configured here
  
  if (templateId) {
    return sendEmail({
      to: [{ email: buyerEmail, name: buyerName }],
      templateId,
      params: {
        buyerName,
        requestTitle,
        sellerName,
        quotePrice: quotePrice.toFixed(2)
      }
    });
  }

  // Fallback to raw HTML if no template configured
  return sendEmail({
    to: [{ email: buyerEmail, name: buyerName }],
    subject: `New Quote on "${requestTitle}"`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">New Quote Received!</h2>
        <p>Hi ${buyerName},</p>
        <p><strong>${sellerName}</strong> has submitted a quote for your request:</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0;">${requestTitle}</h3>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22c55e;">
            $${quotePrice.toFixed(2)}
          </p>
        </div>
        <a href="${APP_URL}/dashboard?tab=purchases"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Quote
        </a>
      </div>
    `
  });
}

/**
 * Send quote accepted notification to seller
 */
export async function sendQuoteAcceptedNotification(
  sellerEmail: string,
  sellerName: string,
  requestTitle: string,
  buyerName: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email: sellerEmail, name: sellerName }],
    subject: `Your Quote Was Accepted!`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Quote Accepted!</h2>
        <p>Hi ${sellerName},</p>
        <p><strong>${buyerName}</strong> has accepted your quote for:</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0;">${requestTitle}</h3>
        </div>
        <p>You can now proceed with the order. Check your dashboard for details.</p>
        <a href="${APP_URL}/dashboard"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Go to Dashboard
        </a>
      </div>
    `
  });
}

/**
 * Send order shipped notification
 */
export async function sendOrderShippedNotification(
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  trackingNumber?: string,
  courier?: string
): Promise<{ success: boolean; error?: string }> {
  const trackingInfo = trackingNumber 
    ? `<p><strong>Tracking:</strong> ${trackingNumber}</p>
       <p><strong>Courier:</strong> ${courier || 'N/A'}</p>`
    : '';

  return sendEmail({
    to: [{ email: buyerEmail, name: buyerName }],
    subject: `Order #${orderId.slice(-6)} Has Shipped!`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Your Order is on the Way!</h2>
        <p>Hi ${buyerName},</p>
        <p>Great news! Your order <strong>#${orderId.slice(-6)}</strong> has been shipped.</p>
        ${trackingInfo}
        <a href="${APP_URL}/dashboard?tab=purchases"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Track Order
        </a>
      </div>
    `
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email, name }],
    subject: "Welcome to Synthix!",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Synthix!</h1>
        </div>
        <div style="background: #18181b; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #27272a;">
          <p style="color: #e4e4e7; font-size: 16px;">Hi ${name},</p>
          <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">
            Thanks for joining Synthix! You're now part of the leading 3D printing marketplace where makers and buyers connect.
          </p>
          <div style="margin: 30px 0;">
            <h3 style="color: #e4e4e7; margin-bottom: 15px;">Get Started:</h3>
            <ul style="color: #a1a1aa; padding-left: 20px; line-height: 1.8;">
              <li>Browse thousands of 3D printable designs</li>
              <li>Connect with skilled makers worldwide</li>
              <li>Post custom service requests</li>
              <li>Track your orders in real-time</li>
            </ul>
          </div>
          <a href="${APP_URL}/explore"
             style="display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; 
                    padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Start Exploring
          </a>
          <p style="color: #71717a; font-size: 13px; margin-top: 30px;">
            Need help? Reply to this email or visit our <a href="${APP_URL}/help" style="color: #6366f1;">Help Center</a>.
          </p>
        </div>
      </div>
    `
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: [{ email, name }],
    subject: "Reset Your Password",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; 
                  text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #71717a; font-size: 13px;">This link will expire in 1 hour.</p>
        <p style="color: #71717a; font-size: 13px;">If you didn't request this, please ignore this email or <a href="${APP_URL}/contact" style="color: #6366f1;">contact support</a> if you have concerns.</p>
      </div>
    `
  });
}

/**
 * Send security alert - new device/login
 */
export async function sendSecurityAlertEmail(
  email: string,
  name: string,
  alertType: 'new_device' | 'password_changed' | 'suspicious_login',
  details: { ip?: string; location?: string; device?: string; timestamp?: string }
): Promise<{ success: boolean; error?: string }> {
  const alerts = {
    new_device: {
      subject: "New Device Sign-In Detected",
      title: "New Sign-In Detected",
      message: "We noticed a sign-in to your account from a new device or location."
    },
    password_changed: {
      subject: "Your Password Was Changed",
      title: "Password Changed",
      message: "Your account password was recently changed."
    },
    suspicious_login: {
      subject: "Suspicious Activity Detected",
      title: "Security Alert",
      message: "We detected unusual activity on your account."
    }
  };

  const alert = alerts[alertType];
  const detailsHtml = details.ip 
    ? `<div style="background: #18181b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #ef4444;">
        <p style="margin: 4px 0; color: #e4e4e7;"><strong>IP Address:</strong> ${details.ip}</p>
        ${details.location ? `<p style="margin: 4px 0; color: #e4e4e7;"><strong>Location:</strong> ${details.location}</p>` : ''}
        ${details.device ? `<p style="margin: 4px 0; color: #e4e4e7;"><strong>Device:</strong> ${details.device}</p>` : ''}
        ${details.timestamp ? `<p style="margin: 4px 0; color: #e4e4e7;"><strong>Time:</strong> ${details.timestamp}</p>` : ''}
       </div>`
    : '';

  return sendEmail({
    to: [{ email, name }],
    subject: alert.subject,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">⚠️ ${alert.title}</h2>
        </div>
        <div style="background: #18181b; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #27272a;">
          <p style="color: #e4e4e7;">Hi ${name},</p>
          <p style="color: #a1a1aa;">${alert.message}</p>
          ${detailsHtml}
          <p style="color: #fca5a5; font-weight: 600;">If this wasn't you, please secure your account immediately:</p>
          <a href="${APP_URL}/dashboard?tab=security"
             style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 10px 10px 10px 0; font-weight: 600;">
            Review Account
          </a>
          <a href="${APP_URL}/reset-password"
             style="display: inline-block; background: transparent; color: #ef4444; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; border: 2px solid #ef4444; font-weight: 600;">
            Change Password
          </a>
          <p style="color: #71717a; font-size: 13px; margin-top: 30px;">
            Need help? Contact us at <a href="mailto:support@synthixgroup.co.uk" style="color: #6366f1;">support@synthixgroup.co.uk</a>
          </p>
        </div>
      </div>
    `
  });
}

/**
 * Send order status update
 */
export async function sendOrderStatusUpdate(
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  sellerName?: string
): Promise<{ success: boolean; error?: string }> {
  const statusConfig = {
    confirmed: { color: '#22c55e', title: 'Order Confirmed', message: 'Your order has been confirmed and is being prepared.' },
    processing: { color: '#f59e0b', title: 'Order Processing', message: 'Your order is being processed by the maker.' },
    shipped: { color: '#6366f1', title: 'Order Shipped', message: 'Your order is on its way to you!' },
    delivered: { color: '#22c55e', title: 'Order Delivered', message: 'Your order has been delivered. Enjoy!' },
    cancelled: { color: '#ef4444', title: 'Order Cancelled', message: 'Your order has been cancelled.' }
  };

  const config = statusConfig[status];
  const sellerInfo = sellerName ? `<p style="color: #a1a1aa;">Seller: <strong>${sellerName}</strong></p>` : '';

  return sendEmail({
    to: [{ email: buyerEmail, name: buyerName }],
    subject: `${config.title} - Order #${orderId.slice(-6)}`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${config.color}; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${config.title}</h1>
        </div>
        <div style="background: #18181b; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #27272a;">
          <p style="color: #e4e4e7;">Hi ${buyerName},</p>
          <p style="color: #a1a1aa; font-size: 15px;">${config.message}</p>
          ${sellerInfo}
          <div style="background: #27272a; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #71717a; margin: 0 0 4px 0; font-size: 13px;">Order Number</p>
            <p style="color: #e4e4e7; margin: 0; font-size: 20px; font-weight: 700; font-family: monospace;">#${orderId.slice(-8).toUpperCase()}</p>
          </div>
          <a href="${APP_URL}/dashboard?tab=purchases"
             style="display: inline-block; background: ${config.color}; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Order Details
          </a>
        </div>
      </div>
    `
  });
}

/**
 * Send review request email after order delivered
 */
export async function sendReviewRequestEmail(
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  sellerName: string,
  productName: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email: buyerEmail, name: buyerName }],
    subject: "How was your order?",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Share Your Experience</h2>
        <p>Hi ${buyerName},</p>
        <p>Your order <strong>${productName}</strong> from ${sellerName} was recently delivered.</p>
        <p>How did it turn out? Your feedback helps other buyers and supports our maker community.</p>
        <div style="margin: 30px 0;">
          <a href="${APP_URL}/dashboard?tab=purchases&review=${orderId}"
             style="display: inline-block; background: #fbbf24; color: #000; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
            ⭐ Leave a Review
          </a>
          <a href="${APP_URL}/dashboard?tab=purchases"
             style="display: inline-block; background: transparent; color: #a1a1aa; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; border: 1px solid #52525b;">
            View Order
          </a>
        </div>
        <p style="color: #71717a; font-size: 13px;">Thank you for using Synthix!</p>
      </div>
    `
  });
}

/**
 * Send low stock alert to seller
 */
export async function sendLowStockAlert(
  sellerEmail: string,
  sellerName: string,
  productName: string,
  currentStock: number,
  productId: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email: sellerEmail, name: sellerName }],
    subject: `Low Stock Alert: ${productName}`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">⚠️ Low Stock Alert</h2>
        </div>
        <div style="background: #18181b; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #27272a;">
          <p style="color: #e4e4e7;">Hi ${sellerName},</p>
          <p style="color: #a1a1aa;">Your product is running low on stock:</p>
          <div style="background: #27272a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #e4e4e7; margin: 0 0 10px 0;">${productName}</h3>
            <p style="color: #f59e0b; font-size: 32px; font-weight: 700; margin: 0;">
              ${currentStock} remaining
            </p>
          </div>
          <a href="${APP_URL}/dashboard?tab=listings&edit=${productId}"
             style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            Update Stock
          </a>
          <p style="color: #71717a; font-size: 13px; margin-top: 20px;">
            Keep your listings active by restocking soon!
          </p>
        </div>
      </div>
    `
  });
}

/**
 * Send account verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  const verifyUrl = `${APP_URL}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    to: [{ email, name }],
    subject: "Verify Your Email Address",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        <div style="background: #18181b; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #27272a;">
          <p style="color: #e4e4e7;">Hi ${name},</p>
          <p style="color: #a1a1aa;">Thanks for signing up! Please verify your email address to complete your registration:</p>
          <a href="${verifyUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; 
                    padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
          <p style="color: #71717a; font-size: 13px;">This link will expire in 24 hours.</p>
          <p style="color: #52525b; font-size: 12px; word-break: break-all;">
            Button not working? Copy and paste this URL:<br>${verifyUrl}
          </p>
        </div>
      </div>
    `
  });
}

/**
 * Send 2FA code email
 */
export async function sendTwoFactorCodeEmail(
  email: string,
  name: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email, name }],
    subject: "Your Security Code",
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #18181b; padding: 40px; border-radius: 8px; border: 1px solid #27272a; text-align: center;">
          <h2 style="color: #6366f1; margin: 0 0 20px 0;">Two-Factor Authentication</h2>
          <p style="color: #a1a1aa;">Hi ${name},</p>
          <p style="color: #a1a1aa;">Use this code to complete your sign-in:</p>
          <div style="background: #27272a; padding: 24px; border-radius: 8px; margin: 24px 0; border: 2px solid #6366f1;">
            <p style="color: #e4e4e7; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: monospace;">
              ${code}
            </p>
          </div>
          <p style="color: #71717a; font-size: 13px;">This code expires in 10 minutes.</p>
          <p style="color: #ef4444; font-size: 13px; margin-top: 20px;">
            Didn't request this? Someone may be trying to access your account. 
            <a href="${APP_URL}/reset-password" style="color: #6366f1;">Change your password</a> immediately.
          </p>
        </div>
      </div>
    `
  });
}
