import express, { type ErrorRequestHandler, type Express } from "express";
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found", message: "That API route does not exist." });
});

const apiErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (!req.path.startsWith("/api")) {
    next(error);
    return;
  }

  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      error: "invalid_json",
      message: "The request body is not valid JSON.",
    });
    return;
  }

  console.error("apiUnhandledError", {
    path: req.path,
    method: req.method,
    error,
  });
  res.status(500).json({
    error: "server_error",
    message: "The server could not complete that request. Please try again.",
  });
};

app.use(apiErrorHandler);

function resolveFrontendDistPath() {
  const runtimeEntry = process.argv[1] ? path.dirname(process.argv[1]) : process.cwd();
  const candidates = [
    path.resolve(process.cwd(), "artifacts", "print3d", "dist", "public"),
    path.resolve(runtimeEntry, "..", "..", "print3d", "dist", "public"),
    path.resolve(runtimeEntry, "..", "..", "..", "artifacts", "print3d", "dist", "public"),
  ];

  const resolved = candidates.find((candidate) => existsSync(path.join(candidate, "index.html"))) ?? null;

  console.log("Frontend resolution", {
    cwd: process.cwd(),
    runtimeEntry,
    candidates: candidates.map((candidate) => ({
      path: candidate,
      hasIndex: existsSync(path.join(candidate, "index.html")),
    })),
    resolved,
  });

  return resolved;
}

const frontendDistPath = resolveFrontendDistPath();

if (frontendDistPath) {
  console.log(`Serving frontend from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  console.warn("Frontend build output not found. Root requests will return 404 until the client is built.");
}

export default app;
