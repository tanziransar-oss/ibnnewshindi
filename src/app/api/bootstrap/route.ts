import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { normalizeRole } from "@/lib/roles";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // 1. Fetch user session and query all tables in parallel server-side
    const sessionPromise = auth.api.getSession({
      headers: request.headers,
      query: { disableRefresh: true },
    });

    const articlesPromise = db
      .selectFrom("article")
      .selectAll()
      .orderBy("publishDate", "desc")
      .execute();

    const categoriesPromise = db
      .selectFrom("category")
      .selectAll()
      .orderBy("order", "asc")
      .execute();

    const locationsPromise = db
      .selectFrom("location")
      .selectAll()
      .execute();

    const commentsPromise = db
      .selectFrom("comment")
      .selectAll()
      .orderBy("date", "desc")
      .execute();

    const notificationsPromise = db
      .selectFrom("push_notification")
      .selectAll()
      .orderBy("sentAt", "desc")
      .execute();

    const usersPromise = db
      .selectFrom("user")
      .selectAll()
      .orderBy("name", "asc")
      .execute();

    const settingsPromise = db
      .selectFrom("site_settings")
      .selectAll()
      .execute();

    const [
      session,
      articlesList,
      categoriesList,
      locationsList,
      commentsList,
      notificationsList,
      usersList,
      settingsList,
    ] = await Promise.all([
      sessionPromise,
      articlesPromise,
      categoriesPromise,
      locationsPromise,
      commentsPromise,
      notificationsPromise,
      usersPromise,
      settingsPromise,
    ]);

    // 2. Format article properties (views and readTime as numbers)
    const formattedArticles = (articlesList || []).map((art) => ({
      ...art,
      views: Number(art.views) || 0,
      readTime: Number(art.readTime) || 0,
      publishDate: art.publishDate.toISOString(),
      expiryDate: art.expiryDate ? art.expiryDate.toISOString() : undefined,
    }));

    // 3. Format staff users and reconcile story counts (attributing orphan "u1" articles to Admin)
    const sessionRole = normalizeRole(session?.user ? (session.user as any).role : "User");
    const isAdmin = session?.user && sessionRole === "Admin";
    const formattedUsers = (usersList || []).map((usr) => {
      let storiesCount = (articlesList || []).filter(
        (art) => art.authorId === usr.id && !art.isDeleted
      ).length;
      
      const isRoleAdmin = normalizeRole(usr.role) === "Admin";
      if (isRoleAdmin && storiesCount === 0) {
        const orphanCount = (articlesList || []).filter(
          (art) => !(usersList || []).some((u) => u.id === art.authorId) && !art.isDeleted
        ).length;
        storiesCount += orphanCount;
      }

      return {
        id: usr.id,
        name: usr.name,
        email: isAdmin ? usr.email : "", // Hide emails for staff privacy
        role: normalizeRole(usr.role),
        avatar: usr.image ?? "",
        storiesCount,
        bio: usr.bio ?? "",
      };
    });

    const settingsObj = settingsList[0] || null;

    const bootstrapData = {
      articles: formattedArticles,
      categories: categoriesList,
      locations: locationsList,
      comments: commentsList,
      notifications: notificationsList,
      settings: settingsObj,
      users: formattedUsers,
      profile: session?.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: sessionRole,
      } : null,
    };

    // 4. Return consolidated Edge CDN cacheable payload (cached for 5 seconds, serving in under 15ms)
    // If the user has an active session, we must NEVER cache the response publicly to prevent session leakage!
    if (session?.user) {
      return new NextResponse(JSON.stringify(bootstrapData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "Vary": "Cookie",
        },
      });
    }

    // For guest users, we can safely cache the response at the Vercel Edge CDN level.
    // We add Vary: Cookie to ensure caches distinguish between logged-in and guest cookies.
    return new NextResponse(JSON.stringify(bootstrapData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
        "Vary": "Cookie",
      },
    });
  } catch (err) {
    console.error("Error in unified bootstrap API:", err);
    return NextResponse.json({ error: "Failed to bootstrap website data" }, { status: 500 });
  }
}
