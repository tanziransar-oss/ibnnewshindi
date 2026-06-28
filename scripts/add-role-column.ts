import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Check your .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to Neon DB to add missing user role column...");
  const client = await pool.connect();
  try {
    // Check if table user exists and alter it
    await client.query(`
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'Author';
    `);
    console.log("Successfully ran: ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'Author';");
  } catch (err) {
    console.error("Error running database migration:", err);
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await pool.end();
  });
