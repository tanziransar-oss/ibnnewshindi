import { betterAuth } from "better-auth";
import { db } from "@/lib/db";
import { normalizeRole } from "@/lib/roles";

const isProd = process.env.NODE_ENV === "production";
const baseURL = isProd ? "https://ibnnewshindi.in" : (process.env.BETTER_AUTH_URL ?? "http://localhost:3000");
const secret = process.env.BETTER_AUTH_SECRET || "fallback_secret_key_for_ibnnewshindi_verification_32chars";

if (!process.env.BETTER_AUTH_SECRET) {
  console.warn("⚠️ WARNING: BETTER_AUTH_SECRET is missing. Using fallback key for build stability. Set BETTER_AUTH_SECRET in environment variables.");
}

export const auth = betterAuth({
  baseURL,
  secret,
  database: {
    db,
    type: "postgres",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days session persistence (remains logged in)
    updateAge: 60 * 60 * 24,     // 1 day update threshold
  },
  socialProviders: {
    google: {
      clientId: (process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_PLACEHOLDER") as string,
      clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET_PLACEHOLDER") as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: normalizeRole("User"),
      },
    },
  },
});