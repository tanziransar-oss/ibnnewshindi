import { Pool } from "pg";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Please check your .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Connecting to CockroachDB and setting up database schemas...");

  const client = await pool.connect();
  try {
    // 1. Create better-auth tables
    console.log("Creating better-auth tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN NOT NULL,
        image TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        role TEXT NOT NULL DEFAULT 'Author'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        id TEXT PRIMARY KEY,
        "expiresAt" TIMESTAMP NOT NULL,
        token TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        id TEXT PRIMARY KEY,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "idToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP,
        "refreshTokenExpiresAt" TIMESTAMP,
        scope TEXT,
        password TEXT,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP,
        "updatedAt" TIMESTAMP
      );
    `);

    // 2. Create domain application tables
    console.log("Creating domain tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS article (
        id TEXT PRIMARY KEY,
        "titleHindi" TEXT NOT NULL,
        "titleEnglish" TEXT,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        "excerptEnglish" TEXT,
        content TEXT NOT NULL,
        "contentEnglish" TEXT,
        "featuredImage" TEXT NOT NULL,
        gallery TEXT[],
        category TEXT NOT NULL,
        subcategory TEXT,
        "locationTag" TEXT NOT NULL,
        language TEXT NOT NULL,
        tags TEXT[],
        "isBreaking" BOOLEAN NOT NULL DEFAULT false,
        "isSticky" BOOLEAN NOT NULL DEFAULT false,
        status TEXT NOT NULL DEFAULT 'Published',
        "publishDate" TIMESTAMP NOT NULL DEFAULT NOW(),
        "expiryDate" TIMESTAMP,
        "authorId" TEXT NOT NULL,
        "readTime" INT NOT NULL DEFAULT 3,
        views INT NOT NULL DEFAULT 0,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "isDeleted" BOOLEAN NOT NULL DEFAULT false
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS category (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        "nameHindi" TEXT NOT NULL,
        color TEXT NOT NULL,
        "order" INT NOT NULL,
        subcategories TEXT[]
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS location (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        "nameHindi" TEXT NOT NULL,
        parent TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comment (
        id TEXT PRIMARY KEY,
        "articleId" TEXT NOT NULL,
        "articleTitle" TEXT NOT NULL,
        author TEXT NOT NULL,
        email TEXT NOT NULL,
        content TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'pending'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS media_item (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        size TEXT NOT NULL,
        date TEXT NOT NULL,
        width INT,
        height INT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS push_notification (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        url TEXT NOT NULL,
        "sentAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        clicks INT NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        "siteNameHindi" TEXT NOT NULL,
        "siteNameEnglish" TEXT NOT NULL,
        "logoUrl" TEXT NOT NULL,
        "faviconUrl" TEXT NOT NULL,
        "newsletterHeadline" TEXT NOT NULL,
        "newsletterHeadlineEnglish" TEXT NOT NULL,
        "newsletterSub" TEXT NOT NULL,
        "newsletterSubEnglish" TEXT NOT NULL,
        "whatsappNumber" TEXT NOT NULL,
        "facebookUrl" TEXT NOT NULL,
        "twitterUrl" TEXT NOT NULL,
        "youtubeUrl" TEXT NOT NULL,
        "instagramUrl" TEXT NOT NULL,
        "googleAnalyticsId" TEXT NOT NULL,
        "adSlotHeader" TEXT NOT NULL,
        "adSlotSidebar" TEXT NOT NULL,
        "adSlotInContent" TEXT NOT NULL,
        "adSlotStickyFooter" TEXT NOT NULL
      );
    `);

    console.log("Database tables created successfully.");

    // 3. Seed Mock Data
    console.log("Checking and seeding initial data...");

    // Seed Categories
    const catCheck = await client.query("SELECT COUNT(*) FROM category");
    if (parseInt(catCheck.rows[0].count) === 0) {
      console.log("Seeding Categories...");
      const cats = [
        { id: "1", name: "Meerut", nameHindi: "मेरठ", color: "#d6001c", order: 1, subcategories: ["Crime", "Politics", "Civic", "Education", "Health", "Business"] },
        { id: "2", name: "West UP", nameHindi: "पश्चिमी यूपी", color: "#d6001c", order: 2, subcategories: ["Farmers", "Muzaffarnagar", "Saharanpur", "Bijnor", "Baghpat", "Shamli"] },
        { id: "3", name: "National", nameHindi: "राष्ट्रीय", color: "#d6001c", order: 3, subcategories: ["Politics", "Economy", "Defense", "Foreign Policy"] },
        { id: "4", name: "Sports", nameHindi: "खेल", color: "#d6001c", order: 4, subcategories: ["Cricket", "IPL 2026", "Wrestling", "Athletics"] },
        { id: "5", name: "Tech", nameHindi: "टेक्नोलॉजी", color: "#d6001c", order: 5, subcategories: ["Mobiles", "AI & Robotics", "Internet", "Cyber Security"] },
      ];
      for (const cat of cats) {
        await client.query(
          "INSERT INTO category (id, name, \"nameHindi\", color, \"order\", subcategories) VALUES ($1, $2, $3, $4, $5, $6)",
          [cat.id, cat.name, cat.nameHindi, cat.color, cat.order, cat.subcategories]
        );
      }
    }

    // Seed Locations
    const locCheck = await client.query("SELECT COUNT(*) FROM location");
    if (parseInt(locCheck.rows[0].count) === 0) {
      console.log("Seeding Locations...");
      const locs = [
        { id: "1", name: "Meerut Sadar", nameHindi: "मेरठ सदर", parent: "Meerut" },
        { id: "2", name: "Kanker Khera", nameHindi: "कंकरखेड़ा", parent: "Meerut" },
        { id: "3", name: "Muzaffarnagar", nameHindi: "मुजफ्फरनगर", parent: "West UP" },
        { id: "4", name: "Saharanpur", nameHindi: "सहारनपुर", parent: "West UP" },
        { id: "5", name: "Bijnor", nameHindi: "बिजनौर", parent: "West UP" },
        { id: "6", name: "Shamli", nameHindi: "शामली", parent: "West UP" },
        { id: "7", name: "Baghpat", nameHindi: "बागपत", parent: "West UP" },
      ];
      for (const loc of locs) {
        await client.query(
          "INSERT INTO location (id, name, \"nameHindi\", parent) VALUES ($1, $2, $3, $4)",
          [loc.id, loc.name, loc.nameHindi, loc.parent]
        );
      }
    }

    // Seed Users (Inject the Super Admin)
    const userCheck = await client.query("SELECT COUNT(*) FROM \"user\"");
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log("Seeding Admin User...");
      await client.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6)`,
        [
          "u1",
          "Azaan Ali Raza",
          "editor@ibnnewshindi.in",
          true,
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
          "Super Admin"
        ]
      );
    }

    // Seed Media
    const mediaCheck = await client.query("SELECT COUNT(*) FROM media_item");
    if (parseInt(mediaCheck.rows[0].count) === 0) {
      console.log("Seeding Media Library...");
      const items = [
        { id: "m1", name: "meerut_traffic.webp", url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "124 KB", date: "2026-05-23" },
        { id: "m2", name: "farmers_meeting.webp", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "235 KB", date: "2026-05-22" },
        { id: "m3", name: "ipl_match_stadium.webp", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "182 KB", date: "2026-05-21" },
        { id: "m4", name: "tech_ai_chip.webp", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=450&q=80", type: "image", size: "95 KB", date: "2026-05-23" },
      ];
      for (const item of items) {
        await client.query(
          "INSERT INTO media_item (id, name, url, type, size, date, width, height) VALUES ($1, $2, $3, $4, $5, $6, 800, 450)",
          [item.id, item.name, item.url, item.type, item.size, item.date]
        );
      }
    }

    // Seed Articles
    const articleCheck = await client.query("SELECT COUNT(*) FROM article");
    if (parseInt(articleCheck.rows[0].count) === 0) {
      console.log("Seeding Initial Articles...");
      const articles = [
        {
          id: "art1",
          titleHindi: "मेरठ में भीषण सड़क हादसा: दिल्ली-देहरादून हाईवे पर कार और डंपर की टक्कर, 3 की मौत",
          titleEnglish: "Tragic Road Accident in Meerut: Car and Dumper Collide on Delhi-Dehradun Highway, 3 Dead",
          slug: "tragic-road-accident-in-meerut-highway-3-dead",
          excerpt: "मेरठ के कंकरखेड़ा क्षेत्र में बाईपास पर देर रात एक तेज रफ्तार कार बेकाबू होकर डंपर से टकरा गई। हादसे में 3 दोस्तों की मौके पर ही मौत हो गई।",
          excerptEnglish: "Three young friends from Meerut's Shastri Nagar died in a critical crash on Delhi-Dehradun Highway near Kanker Khera on Saturday night. Read more details.",
          content: `मेरठ के कंकरखेड़ा थाना क्षेत्र में शनिवार देर रात एक दर्दनाक हादसा हो गया। दिल्ली-देहरादून नेशनल हाईवे-58 पर तेज रफ्तार कार आगे चल रहे डंपर में पीछे से घुस गई। टक्कर इतनी भीषण थी कि कार के परखच्चे उड़ गए। कार सवार तीन युवकों की मौके पर ही मौत हो गई, जबकि दो गंभीर रूप से घायल हैं। \n\nचश्मदीदों के अनुसार, कार की रफ्तार 100 किमी/घंटा से अधिक थी। पुलिस ने मौके पर पहुंचकर गैस कटर से कार के हिस्सों को काटकर शवों को बाहर निकाला। घायलों को सुभारती मेडिकल कॉलेज में भर्ती कराया गया है, जहां उनकी हालत नाजुक बनी हुई है। \n\nमृतकों की पहचान अंकित (24), सुमित (26) और सागर (25) के रूप में हुई है, जो मेरठ के शास्त्रीनगर के रहने वाले थे। वे ऋषिकेश से वीकेंड मनाकर लौट रहे थे। \n\nपुलिस क्षेत्राधिकारी ने बताया कि डंपर को कब्जे में ले लिया गया है और डंपर चालक की तलाश जारी है। हादसे के कारणों की जांच की जा रही है।`,
          contentEnglish: `In a horrifying incident in Meerut's Kanker Khera zone, three youths died on the spot when their speeding hatchback crashed into a dumper truck on the Delhi-Dehradun Highway (NH-58) late Saturday night. \n\nTwo others are critically injured and hospitalized. The victims were returning from a weekend trip to Rishikesh. The deceased have been identified as Ankit (24), Sumit (26), and Sagar (25), residents of Shastri Nagar, Meerut. \n\nAccording to eyewitnesses, the car was speeding at over 100 km/h. Police arrived on the spot and had to use gas cutters to extract the bodies. The injured are undergoing treatment at Subharti Medical College where their condition remains highly critical.`,
          featuredImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=450&q=80",
          gallery: ["https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&h=450&q=80"],
          category: "Meerut",
          subcategory: "Crime",
          locationTag: "Kanker Khera",
          language: "bilingual",
          tags: ["MeerutAccident", "Highway58", "MeerutPolice", "Breaking"],
          isBreaking: true,
          isSticky: true,
          status: "Published",
          publishDate: new Date("2026-05-23T20:30:00.000Z"),
          authorId: "u1",
          readTime: 3,
          views: 1240,
          metaTitle: "Meerut Road Accident: 3 Dead on NH-58 Kanker Khera | IBN News",
          metaDescription: "Three young friends from Meerut's Shastri Nagar died in a critical crash on Delhi-Dehradun Highway near Kanker Khera on Saturday night. Read more details."
        },
        {
          id: "art2",
          titleHindi: "पश्चिमी यूपी में भारतीय किसान यूनियन (BKU) की महापंचायत: फसलों के दाम और बिजली बिल को लेकर किसानों का बड़ा ऐलान",
          titleEnglish: "BKU Mahapanchayat in West UP: Farmers Declare Mass Movement Over Crop Pricing and Electric Bills",
          slug: "bku-mahapanchayat-west-up-farmers-protest-announcement",
          excerpt: "मुजफ्फरनगर के राजकीय इंटर कॉलेज मैदान में बीकेयू की विशाल महापंचायत आयोजित की गई, जिसमें चौधरी नरेश टिकैत ने बिजली मीटरों के विरोध का आह्वान किया।",
          excerptEnglish: "BKU Mahapanchayat held in Muzaffarnagar Inter College Ground, farmer leader Naresh Tikait issued protest calls against smart electricity meters starting June 1st.",
          content: `पश्चिमी उत्तर प्रदेश के मुजफ्फरनगर जिले में भारतीय किसान यूनियन (भाकियू) की महापंचायत में किसानों का जनसैलाब उमड़ पड़ा। राजकीय इंटर कॉलेज के विशाल मैदान में आयोजित इस महापंचायत में किसानों की विभिन्न समस्याओं, विशेष रूप से गन्ने की मूल्य वृद्धि, ट्यूबवेलों पर मुफ्त बिजली और स्मार्ट मीटर लगाने के विरोध में कड़े फैसले लिए गए। \n\nमहापंचायत को संबोधित करते हुए भाकियू के राष्ट्रीय अध्यक्ष चौधरी नरेश टिकैत ने कहा, "सरकार किसानों के धैर्य की परीक्षा न ले। यदि बिजली मीटरों के नाम पर शोषण बंद नहीं हुआ, तो किसान सड़कों पर उतरने के लिए मजबूर होंगे। हम आगामी 1 जून से पूरे वेस्ट यूपी में बड़ा आंदोलन शुरू करेंगे।" \n\nकिसान नेता राकेश टिकैत ने भी केंद्र व प्रदेश सरकार पर निशाना साधते हुए कहा कि स्वामीनाथन आयोग की सिफारिशों को लागू करना ही किसानों की भलाई का एकमात्र रास्ता है। महापंचायत में मेरठ, बागपत, शामली, बिजनौर और सहारनपुर से हजारों की संख्या में किसान ट्रैक्टर-ट्रॉली लेकर पहुंचे थे।`,
          contentEnglish: `Tens of thousands of farmers gathered at Muzaffarnagar's GIC Ground for the mega BKU Mahapanchayat. Led by Naresh Tikait and Rakesh Tikait, the union declared an aggressive regional agitation starting June 1st against prepaid electrical meters and low sugarcane state-advised prices. \n\nAddressing the mahapanchayat, Naresh Tikait warned: "The government should not test the patience of our farmers. If exploitation under the guise of smart meters doesn't stop, we will take to the streets. A mass agitation will begin across West UP on June 1st." \n\nFarmers from Meerut, Baghpat, Shamli, Bijnor, and Saharanpur arrived in thousands on tractor-trolleys to support the resolution.`,
          featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=80",
          gallery: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&h=450&q=80"],
          category: "West UP",
          subcategory: "Farmers",
          locationTag: "Muzaffarnagar",
          language: "bilingual",
          tags: ["FarmersProtest", "RakeshTikait", "MuzaffarnagarMahapanchayat", "UPGovernment"],
          isBreaking: false,
          isSticky: true,
          status: "Published",
          publishDate: new Date("2026-05-23T18:15:00.000Z"),
          authorId: "u1",
          readTime: 4,
          views: 890,
          metaTitle: "BKU Mahapanchayat Muzaffarnagar: Tikait Issues June 1 Protest Call",
          metaDescription: "Naresh Tikait addresses thousands of western UP farmers in Muzaffarnagar, opposing smart meters and demanding guaranteed MSP."
        }
      ];
      for (const art of articles) {
        await client.query(
          `INSERT INTO article (id, "titleHindi", "titleEnglish", slug, excerpt, "excerptEnglish", content, "contentEnglish", "featuredImage", gallery, category, subcategory, "locationTag", language, tags, "isBreaking", "isSticky", status, "publishDate", "authorId", "readTime", views, "metaTitle", "metaDescription") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
          [
            art.id, art.titleHindi, art.titleEnglish, art.slug, art.excerpt, art.excerptEnglish, art.content, art.contentEnglish, art.featuredImage, art.gallery, art.category, art.subcategory, art.locationTag, art.language, art.tags, art.isBreaking, art.isSticky, art.status, art.publishDate, art.authorId, art.readTime, art.views, art.metaTitle, art.metaDescription
          ]
        );
      }
    }

    // Seed Comments
    const commentCheck = await client.query("SELECT COUNT(*) FROM comment");
    if (parseInt(commentCheck.rows[0].count) === 0) {
      console.log("Seeding Initial Comments...");
      const comments = [
        { id: "c1", articleId: "art1", articleTitle: "मेरठ में भीषण सड़क हादसा: दिल्ली-देहरादून हाईवे पर कार और डंपर की टक्कर, 3 की मौत", author: "अमित चौधरी", email: "amit.c@gmail.com", content: "यह बहुत ही दुखद समाचार है। इस हाईवे पर रात में तेज रफ्तार ट्रकों और डंपरों पर कोई नियंत्रण नहीं रहता। प्रशासन को इस पर कड़ा कदम उठाना चाहिए!", status: "approved" },
        { id: "c2", articleId: "art1", articleTitle: "मेरठ में भीषण सड़क हादसा: दिल्ली-देहरादून हाईवे पर कार और डंपर की टक्कर, 3 की मौत", author: "Rahul Sharma", email: "rahul.sharma@yahoo.com", content: "Very sad news. Highway NH-58 needs strict speed limit checks. Condolences to the families of Shastri Nagar boys.", status: "approved" },
      ];
      for (const com of comments) {
        await client.query(
          "INSERT INTO comment (id, \"articleId\", \"articleTitle\", author, email, content, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [com.id, com.articleId, com.articleTitle, com.author, com.email, com.content, com.status]
        );
      }
    }

    // Seed Site Settings
    const settingsCheck = await client.query("SELECT COUNT(*) FROM site_settings");
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      console.log("Seeding Site Settings...");
      const settingsMock = {
        id: "1",
        siteNameHindi: "आईबीएन न्यूज हिन्दी",
        siteNameEnglish: "IBN News Hindi",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        newsletterHeadline: "मेरठ और पश्चिमी उत्तर प्रदेश की खबरें पाएं सीधे ईमेल पर",
        newsletterHeadlineEnglish: "Get Meerut & West UP News Directly in Your Inbox",
        newsletterSub: "रोजाना सुबह की ताजा खबरों और महत्वपूर्ण समाचारों के लिए आज ही सब्सक्राइब करें।",
        newsletterSubEnglish: "Subscribe today to receive daily local news digests, reports and breaking alerts.",
        whatsappNumber: "+919876543210",
        facebookUrl: "https://facebook.com/ibnnewshindi",
        twitterUrl: "https://twitter.com/ibnnewshindi",
        youtubeUrl: "https://youtube.com/ibnnewshindi",
        instagramUrl: "https://instagram.com/ibnnewshindi",
        googleAnalyticsId: "UA-12345678-9",
        adSlotHeader: "Header Ad Banner Placeholder (728x90 px)",
        adSlotSidebar: "Sidebar Ad Widget Placeholder (300x250 px)",
        adSlotInContent: "In-Content Inline Ad Unit (Responsive)",
        adSlotStickyFooter: "Sticky Footer Anchor Ad Unit (320x50 px)",
      };
      await client.query(
        `INSERT INTO site_settings (id, "siteNameHindi", "siteNameEnglish", "logoUrl", "faviconUrl", "newsletterHeadline", "newsletterHeadlineEnglish", "newsletterSub", "newsletterSubEnglish", "whatsappNumber", "facebookUrl", "twitterUrl", "youtubeUrl", "instagramUrl", "googleAnalyticsId", "adSlotHeader", "adSlotSidebar", "adSlotInContent", "adSlotStickyFooter") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          settingsMock.id, settingsMock.siteNameHindi, settingsMock.siteNameEnglish, settingsMock.logoUrl, settingsMock.faviconUrl, settingsMock.newsletterHeadline, settingsMock.newsletterHeadlineEnglish, settingsMock.newsletterSub, settingsMock.newsletterSubEnglish, settingsMock.whatsappNumber, settingsMock.facebookUrl, settingsMock.twitterUrl, settingsMock.youtubeUrl, settingsMock.instagramUrl, settingsMock.googleAnalyticsId, settingsMock.adSlotHeader, settingsMock.adSlotSidebar, settingsMock.adSlotInContent, settingsMock.adSlotStickyFooter
        ]
      );
    }

    console.log("Database set up and seeded successfully!");
  } catch (err) {
    console.error("Error setting up database:", err);
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
