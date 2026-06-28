import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET all push alerts
export async function GET() {
  try {
    const list = await db
      .selectFrom("push_notification")
      .selectAll()
      .orderBy("sentAt", "desc")
      .execute();

    const formatted = list.map(n => ({
      ...n,
      sentAt: n.sentAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching push notifications:", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

// POST to dispatch a new push notification
export async function POST(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const rawUrl = typeof body.url === "string" ? body.url.trim() : "/";
    let safeUrl = "/";

    try {
      const parsed = new URL(rawUrl, "http://localhost");
      if (parsed.origin === "http://localhost" && parsed.pathname.startsWith("/") && !rawUrl.startsWith("//")) {
        safeUrl = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      safeUrl = "/";
    }

    const newNot = {
      id: "n_" + Date.now(),
      title: body.title,
      message: body.message,
      url: safeUrl,
      sentAt: new Date(),
      clicks: 0,
    };

    await db.insertInto("push_notification").values(newNot).execute();

    return NextResponse.json({
      ...newNot,
      sentAt: newNot.sentAt.toISOString(),
    });
  } catch (err) {
    console.error("Error creating push notification:", err);
    return NextResponse.json({ error: "Failed to dispatch notification" }, { status: 500 });
  }
}
