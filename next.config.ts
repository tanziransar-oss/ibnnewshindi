import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' https://plausible.io https://cloud.umami.is 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "img-src 'self' data: https://images.unsplash.com https://storage.googleapis.com",
  "connect-src 'self' https://plausible.io https://cloud.umami.is",
  "font-src 'self' https://fonts.gstatic.com",
].join('; ');

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    // Only apply strict security headers in production to avoid interfering with dev tooling
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
