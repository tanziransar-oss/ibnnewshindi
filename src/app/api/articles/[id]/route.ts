import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireArticleWriteAccess } from "@/lib/admin-auth";

export const runtime = "nodejs";

// PUT to edit an existing article
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireArticleWriteAccess(request);
    if (denied) return denied;

    const { id } = await params;
    const body = await request.json();

    const updatedFields: any = {
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
      language: body.language,
      tags: body.tags || null,
      isBreaking: body.isBreaking,
      isSticky: body.isSticky,
      isEditorsChoice: body.isEditorsChoice ?? false,
      status: body.status,
      readTime: body.readTime,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      correspondent: body.correspondent || null,
    };

    await db
      .updateTable("article")
      .set(updatedFields)
      .where("id", "=", id)
      .execute();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating article in CockroachDB:", err);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

// DELETE to soft delete, or hard delete if query param ?hard=true is present
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireArticleWriteAccess(request);
    if (denied) return denied;

    const { id } = await params;
    const url = new URL(request.url);
    const isHard = url.searchParams.get("hard") === "true";

    if (isHard) {
      await db.deleteFrom("article").where("id", "=", id).execute();
    } else {
      await db
        .updateTable("article")
        .set({ isDeleted: true })
        .where("id", "=", id)
        .execute();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting article in CockroachDB:", err);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}

// PATCH to restore an article from Recycle Bin, or increment view count if ?action=view
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "view") {
      await db
        .updateTable("article")
        .set((eb) => ({
          views: eb("views", "+", 1),
        }))
        .where("id", "=", id)
        .execute();
      return NextResponse.json({ success: true });
    }

    const denied = await requireArticleWriteAccess(request);
    if (denied) return denied;

    await db
      .updateTable("article")
      .set({ isDeleted: false })
      .where("id", "=", id)
      .execute();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error executing patch action on article:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
