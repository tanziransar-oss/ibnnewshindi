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
  console.log("Connecting to Neon DB to apply new features schema migration...");
  const client = await pool.connect();
  try {
    // 1. Add correspondent to article table
    console.log("Adding column 'correspondent' to table 'article'...");
    await client.query(`
      ALTER TABLE article ADD COLUMN IF NOT EXISTS correspondent TEXT;
    `);
    console.log("Successfully added 'correspondent' column.");

    // 2. Add trendingTopics to site_settings table
    console.log("Adding column 'trendingTopics' to table 'site_settings'...");
    await client.query(`
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS "trendingTopics" TEXT;
    `);
    console.log("Successfully added 'trendingTopics' column.");

  } catch (err) {
    console.error("Error running Neon DB database migration:", err);
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
