import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

async function tryUpsertFromSetCookie(response: Response) {
	try {
		const setCookie = response.headers.get("set-cookie") || response.headers.get("Set-Cookie");
		if (!setCookie) return;

		// Build a Cookie header from Set-Cookie(s)
		const cookieValue = setCookie
			.split(/,(?=[^ ]+=[^;]+)/) // split on commas that precede a cookie-like token
			.map((c) => c.split(";")[0].trim())
			.filter(Boolean)
			.join("; ");

		const session = await auth.api.getSession({ headers: { cookie: cookieValue } as any, query: { disableRefresh: true } });
		const user = session?.user as any;
		if (!user) return;

		const { id: sessionId, email: sessionEmail, name: sessionName, image: sessionImage } = user;
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
			const updates: Record<string, any> = { updatedAt: now };
			if (sessionImage && existing.image !== sessionImage) updates.image = sessionImage;
			if (sessionName && existing.name !== sessionName) updates.name = sessionName;

			if (Object.keys(updates).length > 1) {
				await db.updateTable("user").set(updates).where("id", "=", existing.id).execute();
			}
		} else {
			const newId = sessionId ?? (typeof globalThis.crypto?.randomUUID === "function" ? (globalThis.crypto as any).randomUUID() : String(Date.now()));
			await db.insertInto("user").values({
				id: newId,
				name: sessionName ?? "",
				email: sessionEmail ?? "",
				emailVerified: Boolean(user?.emailVerified),
				image: sessionImage ?? null,
				createdAt: now,
				updatedAt: now,
				role: "User",
			}).execute();
		}
	} catch (err) {
		// swallow errors to avoid breaking auth flow
		console.error("Error upserting auth callback user:", err);
	}
}

export const GET = async (request: Request) => {
	const res = await handlers.GET(request as any);

	try {
		const url = new URL(request.url);
		if (url.pathname.includes("/callback")) {
			await tryUpsertFromSetCookie(res as Response);
		}
	} catch (err) {
		console.error(err);
	}

	return res as any;
};

export const POST = async (request: Request) => {
	const res = await handlers.POST(request as any);

	try {
		const url = new URL(request.url);
		if (url.pathname.includes("/callback")) {
			await tryUpsertFromSetCookie(res as Response);
		}
	} catch (err) {
		console.error(err);
	}

	return res as any;
};

export const PATCH = handlers.PATCH;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;