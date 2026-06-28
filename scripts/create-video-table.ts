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
  console.log("Connecting to Neon DB to create the video table...");
  const client = await pool.connect();
  try {
    // Create video table
    await client.query(`
      CREATE TABLE IF NOT EXISTS video (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "youtubeId" TEXT NOT NULL,
        "thumbnailUrl" TEXT NOT NULL,
        "publishDate" TIMESTAMP NOT NULL DEFAULT NOW(),
        views INT NOT NULL DEFAULT 0
      );
    `);
    console.log("Successfully created the video table in Neon DB!");
    
    // Seed initial mock video if table is empty
    const countRes = await client.query('SELECT COUNT(*) FROM video');
    const count = parseInt(countRes.rows[0].count);
    if (count === 0) {
      console.log("Seeding initial YouTube videos...");
      await client.query(`
        INSERT INTO video (id, title, description, "youtubeId", "thumbnailUrl", views)
        VALUES 
        ('v1', 'मेरठ महापंचायत ग्राउंड रिपोर्ट: राकेश टिकैत ने बिजली प्रीपेड मीटरों पर कही बड़ी बात', 'मुजफ्फरनगर में राकेश टिकैत का किसानों के स्मार्ट मीटर पर बड़ा ऐलान। देखें ग्राउंड रिपोर्ट।', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 3420),
        ('v2', 'मेरठ नौचंदी मैदान का भव्य ड्रोन दृश्य: 25 मई से शुरू हो रहा ऐतिहासिक मेला', 'ऐतिहासिक नौचंदी मेला इस बार 25 मई से आरंभ होने जा रहा है। देखें ड्रोन विजुअल्स।', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 1890),
        ('v3', 'इकाना स्टेडियम लखनऊ: लखनऊ सुपर जायंट्स की जीत के बाद केएल राहुल की प्रेस कॉन्फ्रेंस', 'KL Rahul reviews dynamic match updates at Ekana Stadium in Lucknow.', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 5680)
      `);
      console.log("Successfully seeded initial videos!");
    }
  } catch (err) {
    console.error("Error creating video table:", err);
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
