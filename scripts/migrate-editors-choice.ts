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
  console.log("Connecting to CockroachDB to apply Editor's Choice column migration...");
  const client = await pool.connect();
  try {
    console.log("Adding column 'isEditorsChoice' to table 'article'...");
    await client.query(`
      ALTER TABLE article ADD COLUMN IF NOT EXISTS "isEditorsChoice" BOOLEAN DEFAULT FALSE;
    `);
    console.log("Successfully added 'isEditorsChoice' column.");
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
