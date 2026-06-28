import { createAuthClient } from "better-auth/react";

let authBaseURL: string;
if (typeof window !== "undefined") {
  // On the browser, always use the current origin to prevent CORS/Failed to fetch errors under preview URLs, localhost, or aliases.
  authBaseURL = new URL("/api/auth", window.location.origin).toString();
} else if (process.env.NODE_ENV === "production") {
  // SSR Production Fallback
  authBaseURL = "https://ibnnewshindi.in/api/auth";
} else if (process.env.BETTER_AUTH_URL) {
  // SSR Development Fallback
  authBaseURL = new URL("/api/auth", process.env.BETTER_AUTH_URL).toString();
} else {
  authBaseURL = "/api/auth";
}

export const authClient = createAuthClient({
  baseURL: authBaseURL,
});