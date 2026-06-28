import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articlesList: any[] = [];
  let categoriesList: any[] = [];

  try {
    // Query all published articles from Neon DB
    articlesList = await db
      .selectFrom("article")
      .select(["slug", "publishDate"])
      .where("status", "=", "Published")
      .where("isDeleted", "=", false)
      .execute();

    // Query all categories to dynamically include their URLs
    categoriesList = await db
      .selectFrom("category")
      .select("name")
      .execute();
  } catch (e) {
    console.warn("⚠️ Failed to query sitemap details from database during build:", e);
  }

  const baseUrl = "https://ibnnewshindi.in";

  const staticUrls = [
    { url: `${baseUrl}/`, changeFrequency: "always" as const, priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/video`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/editorial`, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/corrections`, changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  const categoryUrls = categoriesList.map((cat) => ({
    url: `${baseUrl}/category/${cat.name.toLowerCase().replace(" ", "-")}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const articleUrls = articlesList.map((art) => ({
    url: `${baseUrl}/article/${art.slug}`,
    lastModified: new Date(art.publishDate),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...categoryUrls, ...articleUrls];
}
