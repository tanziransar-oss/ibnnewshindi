import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET all categories
export async function GET() {
  try {
    const list = await db
      .selectFrom("category")
      .selectAll()
      .orderBy("order", "asc")
      .execute();
    return new NextResponse(JSON.stringify(list), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

// POST to create a new category
export async function POST(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const newCat = {
      id: body.id || "cat_" + Date.now(),
      name: body.name,
      nameHindi: body.nameHindi,
      color: body.color || "#d6001c",
      order: body.order ?? 1,
      subcategories: body.subcategories || ["Civic", "Politics", "General"],
    };

    await db.insertInto("category").values(newCat).execute();
    return NextResponse.json(newCat);
  } catch (err) {
    console.error("Error creating category:", err);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}

// DELETE to remove a category
export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await db.deleteFrom("category").where("id", "=", id).execute();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

// PUT to edit/update an existing category's attributes (e.g. subcategories array)
export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const { id, name, nameHindi, color, order, subcategories } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updatedFields: any = {};
    if (name !== undefined) updatedFields.name = name;
    if (nameHindi !== undefined) updatedFields.nameHindi = nameHindi;
    if (color !== undefined) updatedFields.color = color;
    if (order !== undefined) updatedFields.order = order;
    if (subcategories !== undefined) updatedFields.subcategories = subcategories;

    await db
      .updateTable("category")
      .set(updatedFields)
      .where("id", "=", id)
      .execute();

    return NextResponse.json({ success: true, updated: updatedFields });
  } catch (err) {
    console.error("Error updating category:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
