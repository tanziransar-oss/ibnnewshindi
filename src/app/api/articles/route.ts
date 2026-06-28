import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireArticleWriteAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET all articles
export async function GET() {
  try {
    const list = await db
      .selectFrom("article")
      .selectAll()
      .orderBy("publishDate", "desc")
      .execute();

    // Map Kysely dates back to string format for context hydration
    const formatted = list.map((art) => ({
      ...art,
      views: Number(art.views) || 0,
      readTime: Number(art.readTime) || 0,
      publishDate: art.publishDate.toISOString(),
      expiryDate: art.expiryDate ? art.expiryDate.toISOString() : undefined,
    }));

    return new NextResponse(JSON.stringify(formatted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error fetching articles from Neon DB:", err);
    return NextResponse.json({ error: "Failed to load database articles" }, { status: 500 });
  }
}

// POST a new article
export async function POST(request: Request) {
  try {
    const denied = await requireArticleWriteAccess(request);
    if (denied) return denied;

    const body = await request.json();
    const id = body.id || "art_" + Date.now();

    const newArt = {
      id,
      titleHindi: body.titleHindi,
      titleEnglish: body.titleEnglish || null,
      slug: body.slug,
      excerpt: body.excerpt,
      excerptEnglish: body.excerptEnglish || null,
      content: body.content,
      contentEnglish: body.contentEnglish || null,
      featuredImage: body.featuredImage,
      gallery: body.gallery || null,
      category: body.category,
      subcategory: body.subcategory || null,
      locationTag: body.locationTag,
      language: body.language || "bilingual",
      tags: body.tags || null,
      isBreaking: body.isBreaking ?? false,
      isSticky: body.isSticky ?? false,
      isEditorsChoice: body.isEditorsChoice ?? false,
      status: body.status || "Published",
      publishDate: new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      authorId: body.authorId || "u1",
      readTime: body.readTime ?? 3,
      views: 0,
      metaTitle: body.metaTitle || body.titleHindi,
      metaDescription: body.metaDescription || body.excerpt,
      isDeleted: false,
      correspondent: body.correspondent || null,
    };

    await db.insertInto("article").values(newArt).execute();

    return NextResponse.json({
      ...newArt,
      publishDate: newArt.publishDate.toISOString(),
      expiryDate: newArt.expiryDate ? newArt.expiryDate.toISOString() : undefined,
    });
  } catch (err) {
    console.error("Error inserting article into Neon DB:", err);
    return NextResponse.json({ error: "Failed to publish article" }, { status: 500 });
  }
}
