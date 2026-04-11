import "dotenv/config";

async function main() {
  console.log("Skipping migration - using Supabase instead of local PostgreSQL");
}

main().catch((error) => {
  console.error("Migration run failed:", error);
  process.exit(1);
});
