import * as brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();

// Configure API key from environment
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  import.meta.env.VITE_BREVO_API_KEY || ""
);

export interface EmailPayload {
  to: { email: string; name?: string }[];
  templateId?: number;
  params?: Record<string, any>;
  subject?: string;
  htmlContent?: string;
  sender?: { email: string; name: string };
}

/**
 * Send email via Brevo using templates or raw HTML
 */
export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.to = payload.to;
    sendSmtpEmail.sender = payload.sender || {
      email: import.meta.env.VITE_BREVO_SENDER_EMAIL || "noreply@synthix.com",
      name: import.meta.env.VITE_BREVO_SENDER_NAME || "Synthix"
    };

    if (payload.templateId) {
      sendSmtpEmail.templateId = payload.templateId;
      sendSmtpEmail.params = payload.params;
    } else {
      sendSmtpEmail.subject = payload.subject;
      sendSmtpEmail.htmlContent = payload.htmlContent;
    }

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    return {
      success: true,
      messageId: response.body.messageId
    };
  } catch (error: any) {
    console.error("Brevo email error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email"
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
  const templateId = parseInt(import.meta.env.VITE_BREVO_TEMPLATE_QUOTE || "0");
  
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
        <a href="${import.meta.env.VITE_APP_URL || 'https://synthix.com'}/dashboard?tab=purchases"
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
        <a href="${import.meta.env.VITE_APP_URL || 'https://synthix.com'}/dashboard"
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
        <a href="${import.meta.env.VITE_APP_URL || 'https://synthix.com'}/dashboard?tab=purchases"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Track Order
        </a>
      </div>
    `
  });
}
