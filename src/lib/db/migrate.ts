import { config } from "dotenv";
import { resolve } from "path";

async function runMigration() {
  // Load environment variables first
  config({ path: resolve(process.cwd(), ".env.db") });

  // Dynamically import dependencies after env vars are loaded
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const { db } = await import("./index");

  console.log("Running database migrations...");
  
  // This will run migrations on the database, skipping the ones already applied
  migrate(db, { migrationsFolder: "src/lib/db/migrations" });

  console.log("Migrations applied successfully.");
}

runMigration().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
