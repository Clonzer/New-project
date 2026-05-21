const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT || 3000);

const appUrl = process.env.APP_URL?.trim();
const platformUrl = appUrl
  ? appUrl.replace(/\/+$/, "")
  : process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-${process.env.PORT || 3000}.app.github.dev`
  : "http://localhost:3000";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = {
  port,
  platformUrl,
  stripeSecretKey,
  stripeWebhookSecret,
};
