import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://cloud.umami.is https://static.vercel-insights.com https://va.vercel-scripts.com https://apis.google.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://storage.googleapis.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://i.ytimg.com https://img.youtube.com",
  "connect-src 'self' https://plausible.io https://cloud.umami.is https://vitals.vercel-insights.com https://*.vercel-insights.com https://va.vercel-scripts.com https://lh3.googleusercontent.com https://accounts.google.com https://*.neondatabase.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src 'self' https://www.youtube.com https://youtube.com https://accounts.google.com",
  "media-src 'self' blob: data:",
].join('; ');

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
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
