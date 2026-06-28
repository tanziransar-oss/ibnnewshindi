import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canAccessAdminPanel, canManageAll, canWriteArticles } from "@/lib/roles";

async function resolveSessionRole(sessionUserId: string | undefined, sessionUserEmail: string | undefined) {
  if (!sessionUserId && !sessionUserEmail) {
    return null;
  }

  const user = await db
    .selectFrom("user")
    .select(["role"])
    .where((qb) =>
      qb.or([
        sessionUserId ? qb("id", "=", sessionUserId) : undefined,
        sessionUserEmail ? qb("email", "=", sessionUserEmail) : undefined,
      ].filter(Boolean) as any)
    )
    .executeTakeFirst();

  return user?.role ?? null;
}

export async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableRefresh: true },
  });

  const resolvedRole = await resolveSessionRole(session?.user?.id, session?.user?.email) ?? (session?.user as any)?.role;

  if (!session?.user || !canManageAll(resolvedRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function requireAdminPanelAccess(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableRefresh: true },
  });

  const resolvedRole = await resolveSessionRole(session?.user?.id, session?.user?.email) ?? (session?.user as any)?.role;

  if (!session?.user || !canAccessAdminPanel(resolvedRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function requireArticleWriteAccess(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableRefresh: true },
  });

  const resolvedRole = await resolveSessionRole(session?.user?.id, session?.user?.email) ?? (session?.user as any)?.role;

  if (!session?.user || !canWriteArticles(resolvedRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}