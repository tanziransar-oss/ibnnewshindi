import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET all media library items
export async function GET() {
  try {
    const list = await db
      .selectFrom("media_item")
      .selectAll()
      .orderBy("date", "desc")
      .execute();
    return NextResponse.json(list);
  } catch (err) {
    console.error("Error fetching media items:", err);
    return NextResponse.json({ error: "Failed to load media vault" }, { status: 500 });
  }
}

// POST to insert a new media item link
export async function POST(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const newItem = {
      id: body.id || "m_" + Date.now(),
      name: body.name,
      url: body.url,
      type: body.type || "image",
      size: body.size || "100 KB",
      date: body.date || new Date().toISOString().split("T")[0],
      width: body.width || 800,
      height: body.height || 450,
    };

    await db.insertInto("media_item").values(newItem).execute();
    return NextResponse.json(newItem);
  } catch (err) {
    console.error("Error creating media item record:", err);
    return NextResponse.json({ error: "Failed to create media record" }, { status: 500 });
  }
}

// DELETE to purge a media item record
export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Media item ID is required" }, { status: 400 });
    }

    await db.deleteFrom("media_item").where("id", "=", id).execute();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting media item record:", err);
    return NextResponse.json({ error: "Failed to delete media record" }, { status: 500 });
  }
}
