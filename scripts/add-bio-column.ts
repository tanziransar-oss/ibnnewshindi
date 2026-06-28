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
  console.log("Connecting to Neon DB to add user bio column...");
  const client = await pool.connect();
  try {
    // Alter table "user" to add a "bio" column if it doesn't exist
    await client.query(`
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio VARCHAR;
    `);
    console.log("Successfully ran: ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS bio VARCHAR;");
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
