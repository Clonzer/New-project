import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(currentFileDir, "../../../.env");
dotenv.config({ path: rootEnvPath });

const { default: app } = await import("./app");

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
