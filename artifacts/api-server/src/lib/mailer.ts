type MailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getSmtpConfig() {
  const host = process.env["SMTP_HOST"]?.trim();
  const port = Number(process.env["SMTP_PORT"] ?? "587");
  const user = process.env["SMTP_USER"]?.trim();
  const pass = process.env["SMTP_PASS"]?.trim();
  const from = process.env["SMTP_FROM"]?.trim();

  if (!host || !Number.isFinite(port) || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from,
  };
}

export function isEmailDeliveryConfigured() {
  return getSmtpConfig() !== null;
}

export async function sendTransactionalEmail(options: MailOptions) {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error("Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.verify();

  await transporter.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
