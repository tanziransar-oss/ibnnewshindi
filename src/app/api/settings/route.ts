import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET site settings
export async function GET() {
  try {
    const list = await db
      .selectFrom("site_settings")
      .selectAll()
      .execute();

    if (list.length === 0) {
      return NextResponse.json({ error: "Settings not initialized" }, { status: 404 });
    }

    return new NextResponse(JSON.stringify(list[0]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error fetching site settings:", err);
    return NextResponse.json({ error: "Failed to load site settings" }, { status: 500 });
  }
}

// PUT to update site settings
export async function PUT(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();

    const updated = {
      siteNameHindi: body.siteNameHindi,
      siteNameEnglish: body.siteNameEnglish,
      logoUrl: body.logoUrl || "/logo.png",
      faviconUrl: body.faviconUrl || "/favicon.ico",
      newsletterHeadline: body.newsletterHeadline,
      newsletterHeadlineEnglish: body.newsletterHeadlineEnglish,
      newsletterSub: body.newsletterSub,
      newsletterSubEnglish: body.newsletterSubEnglish,
      whatsappNumber: body.whatsappNumber,
      facebookUrl: body.facebookUrl,
      twitterUrl: body.twitterUrl,
      youtubeUrl: body.youtubeUrl,
      instagramUrl: body.instagramUrl,
      googleAnalyticsId: body.googleAnalyticsId || "UA-12345678-9",
      adSlotHeader: body.adSlotHeader || "Header Ad Banner Placeholder",
      adSlotSidebar: body.adSlotSidebar || "Sidebar Ad Widget Placeholder",
      adSlotInContent: body.adSlotInContent || "In-Content Inline Ad Unit",
      adSlotStickyFooter: body.adSlotStickyFooter || "Sticky Footer Anchor Ad Unit",
      trendingTopics: body.trendingTopics || null,
      googleSiteVerification: body.googleSiteVerification || null,
    };

    // Since we only ever store 1 settings row, update ID = '1'
    await db
      .updateTable("site_settings")
      .set(updated)
      .where("id", "=", "1")
      .execute();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating site settings:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
