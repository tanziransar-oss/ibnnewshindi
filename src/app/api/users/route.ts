import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { User } from "@/app/context/AppContext";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeRole } from "@/lib/roles";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

// GET all registered users and count their published stories
export async function GET(request: Request) {
  try {
    // Make GET public to load staff bios, but restrict emails to Admin only
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableRefresh: true },
    });

    const sessionRole = normalizeRole(session?.user ? (session.user as any).role : "User");
    const isAdmin = session?.user && sessionRole === "Admin";

    const userList = await db
      .selectFrom("user")
      .selectAll()
      .orderBy("name", "asc")
      .execute();

    const articles = await db
      .selectFrom("article")
      .select(["authorId"])
      .where("isDeleted", "=", false)
      .execute();

    // Calculate story count for each user
    const formatted: User[] = userList.map((usr) => {
      let storiesCount = articles.filter(art => art.authorId === usr.id).length;
      
      // Reconcile pre-seeded/orphan articles (like authorId = 'u1' or other non-existent IDs)
      // and attribute them to the Admin user so their story stats are legitimate
      const isRoleAdmin = normalizeRole(usr.role) === "Admin";
      if (isRoleAdmin && storiesCount === 0) {
        const orphanCount = articles.filter(art => !userList.some(u => u.id === art.authorId)).length;
        storiesCount += orphanCount;
      }

      return {
        id: usr.id,
        name: usr.name,
        email: isAdmin ? usr.email : "", // Hide emails for privacy of staff members
        role: normalizeRole(usr.role),
        avatar: usr.image ?? "",
        storiesCount,
        bio: usr.bio ?? "",
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching users from CockroachDB:", err);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

// PATCH a user's role
export async function PATCH(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: "Missing user ID or role" }, { status: 400 });
    }

    const validRoles = ["Admin", "Editor", "User"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    await db
      .updateTable("user")
      .set({ role: role as any, updatedAt: new Date() })
      .where("id", "=", id)
      .execute();

    return NextResponse.json({ success: true, id, role });
  } catch (err) {
    console.error("Error updating user role in CockroachDB:", err);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
