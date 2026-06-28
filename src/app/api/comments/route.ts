import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET all comments
export async function GET() {
  try {
    const list = await db
      .selectFrom("comment")
      .selectAll()
      .orderBy("date", "desc")
      .execute();

    const formatted = list.map(c => ({
      ...c,
      date: c.date.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

// POST to create a new comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newComment = {
      id: "c_" + Date.now(),
      articleId: body.articleId,
      articleTitle: body.articleTitle,
      author: body.author,
      email: body.email,
      content: body.content,
      date: new Date(),
      status: "pending" as const, // Always moderation first
    };

    await db.insertInto("comment").values(newComment).execute();

    return NextResponse.json({
      ...newComment,
      date: newComment.date.toISOString(),
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

// PATCH to moderate comment (approve, spam, trash)
export async function PATCH(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Comment ID and status are required" }, { status: 400 });
    }

    await db
      .updateTable("comment")
      .set({ status })
      .where("id", "=", id)
      .execute();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error moderating comment:", err);
    return NextResponse.json({ error: "Failed to moderate comment" }, { status: 500 });
  }
}
