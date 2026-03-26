import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";

const app: Express = express();

// CORS: set CORS_ORIGINS="https://app.example.com,https://www.example.com" in production.
// credentials: true allows httpOnly cookies + Authorization from SPA.
const corsOrigins = process.env["CORS_ORIGINS"]?.split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const frontendDistPath = path.resolve(process.cwd(), "artifacts", "print3d", "dist", "public");

if (existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

export default app;
