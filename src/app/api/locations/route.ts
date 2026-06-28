import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET all locations
export async function GET() {
  try {
    const list = await db
      .selectFrom("location")
      .selectAll()
      .execute();
    return new NextResponse(JSON.stringify(list), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error fetching locations:", err);
    return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
  }
}

// POST to create a new location
export async function POST(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const newLoc = {
      id: body.id || "loc_" + Date.now(),
      name: body.name,
      nameHindi: body.nameHindi,
      parent: body.parent || "West UP",
    };

    await db.insertInto("location").values(newLoc).execute();
    return NextResponse.json(newLoc);
  } catch (err) {
    console.error("Error creating location:", err);
    return NextResponse.json({ error: "Failed to add location" }, { status: 500 });
  }
}

// DELETE to remove a location
export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
    }

    await db.deleteFrom("location").where("id", "=", id).execute();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting location:", err);
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}
