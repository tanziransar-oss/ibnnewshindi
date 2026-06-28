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
  console.log("Connecting to CockroachDB to apply Google Site Verification migration...");
  const client = await pool.connect();
  try {
    console.log("Adding column 'googleSiteVerification' to table 'site_settings'...");
    await client.query(`
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "googleSiteVerification" TEXT;
    `);
    console.log("Successfully added 'googleSiteVerification' column.");
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
