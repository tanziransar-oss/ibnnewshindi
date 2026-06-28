import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeRole } from "@/lib/roles";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableRefresh: true },
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db
      .selectFrom("user")
      .select(["id", "name", "email", "image", "role", "bio"])
      .where((qb) =>
        qb.or([
          qb("id", "=", session.user.id),
          qb("email", "=", session.user.email),
        ])
      )
      .executeTakeFirst();

    return NextResponse.json({
      id: user?.id ?? session.user.id,
      name: user?.name ?? session.user.name,
      email: user?.email ?? session.user.email,
      role: normalizeRole(user?.role ?? (session.user as any).role),
      avatar: user?.image ?? session.user.image ?? "",
      storiesCount: 0,
      bio: user?.bio ?? "",
    });
  } catch (err) {
    console.error("Error fetching current profile:", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers, query: { disableRefresh: true } });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId, email: sessionEmail, name: sessionName, image: sessionImage, } = session.user as any;

    const now = new Date();

    const existing = await db
      .selectFrom("user")
      .selectAll()
      .where((qb) =>
        qb.or([
          sessionId ? qb("id", "=", sessionId) : undefined,
          sessionEmail ? qb("email", "=", sessionEmail) : undefined,
        ].filter(Boolean) as any)
      )
      .executeTakeFirst();

    if (existing) {
      // update image/name if changed
      const updates: Record<string, any> = { updatedAt: now };
      if (sessionImage && existing.image !== sessionImage) updates.image = sessionImage;
      if (sessionName && existing.name !== sessionName) updates.name = sessionName;

      if (Object.keys(updates).length > 1) {
        await db.updateTable("user").set(updates).where("id", "=", existing.id).execute();
      }
    } else {
      // insert a new user row if one doesn't exist
      const newId = sessionId ?? (typeof globalThis.crypto?.randomUUID === "function" ? (globalThis.crypto as any).randomUUID() : String(Date.now()));
      await db.insertInto("user").values({
        id: newId,
        name: sessionName ?? "",
        email: sessionEmail ?? "",
        emailVerified: Boolean((session.user as any).emailVerified),
        image: sessionImage ?? null,
        createdAt: now,
        updatedAt: now,
        role: "User",
      }).execute();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error syncing profile to DB:", err);
    return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers, query: { disableRefresh: true } });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const nextName = typeof body.name === "string" ? body.name.trim() : "";
    const nextImage = typeof body.image === "string" ? body.image.trim() : "";
    const nextBio = typeof body.bio === "string" ? body.bio.trim() : undefined;

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (nextName) updates.name = nextName;
    if (nextImage) updates.image = nextImage;
    if (nextBio !== undefined) updates.bio = nextBio;

    const existing = await db
      .selectFrom("user")
      .selectAll()
      .where((qb) =>
        qb.or([
          qb("id", "=", session.user.id),
          qb("email", "=", session.user.email),
        ])
      )
      .executeTakeFirst();

    if (existing) {
      await db.updateTable("user").set(updates).where("id", "=", existing.id).execute();
    } else {
      await db.insertInto("user").values({
        id: session.user.id,
        name: nextName || session.user.name || "",
        email: session.user.email || "",
        emailVerified: Boolean((session.user as any).emailVerified),
        image: nextImage || session.user.image || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: normalizeRole((session.user as any).role),
      }).execute();
    }

    const updatedUser = await db
      .selectFrom("user")
      .select(["id", "name", "email", "image", "role", "bio"])
      .where((qb) => qb.or([qb("id", "=", session.user.id), qb("email", "=", session.user.email)]))
      .executeTakeFirst();

    return NextResponse.json({
      id: updatedUser?.id ?? session.user.id,
      name: updatedUser?.name ?? nextName ?? session.user.name,
      email: updatedUser?.email ?? session.user.email,
      role: normalizeRole(updatedUser?.role ?? (session.user as any).role),
      avatar: updatedUser?.image ?? nextImage ?? session.user.image ?? "",
      storiesCount: 0,
      bio: updatedUser?.bio ?? "",
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}