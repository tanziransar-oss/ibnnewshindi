import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ibnnewshindi.in"),
  title: {
    default: "IBN News Hindi - मेरठ & पश्चिमी उत्तर प्रदेश की ताज़ा ख़बरें",
    template: "%s | IBN News Hindi",
  },
  description: "मेरठ, मुजफ्फरनगर, सहारनपुर, बागपत और पश्चिमी उत्तर प्रदेश की हर छोटी-बड़ी खबर, अपराध, राजनीति, किसान आंदोलन, खेल और तकनीक का सबसे विश्वसनीय स्रोत।",
  keywords: "ibnnewshindi, IBN News Hindi, Meerut News, West UP News, किसान आंदोलन, मेरठ समाचार",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "IBN News Hindi - मेरठ & पश्चिमी उत्तर प्रदेश की ताज़ा ख़बरें",
    description: "मेरठ, मुजफ्फरनगर, सहारनपुर, बागपत और पश्चिमी उत्तर प्रदेश की हर छोटी-बड़ी खबर, अपराध, राजनीति, किसान आंदोलन, खेल और तकनीक का सबसे विश्वसनीय स्रोत।",
    url: "https://ibnnewshindi.in",
    siteName: "IBN News Hindi",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "IBN News Hindi Logo",
      },
    ],
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IBN News Hindi - मेरठ & पश्चिमी उत्तर प्रदेश की ताज़ा ख़बरें",
    description: "मेरठ, मुजफ्फरनगर, सहारनपुर, बागपत और पश्चिमी उत्तर प्रदेश की हर छोटी-बड़ी खबर, अपराध, राजनीति, किसान आंदोलन, खेल और तकनीक का सबसे विश्वसनीय स्रोत।",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteConfig = null;
  try {
    siteConfig = await db
      .selectFrom("site_settings")
      .select("googleSiteVerification")
      .executeTakeFirst();
  } catch (e) {
    console.warn("⚠️ Failed to load site verification config from DB during build:", e);
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsMediaOrganization",
        "@id": "https://ibnnewshindi.in/#organization",
        "name": "IBN News Hindi",
        "url": "https://ibnnewshindi.in",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://ibnnewshindi.in/#logo",
          "url": "https://ibnnewshindi.in/logo.png",
          "caption": "IBN News Hindi"
        },
        "sameAs": [
          "https://facebook.com/ibnnewshindi",
          "https://twitter.com/ibnnewshindi",
          "https://youtube.com/ibnnewshindi",
          "https://instagram.com/ibnnewshindi"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://ibnnewshindi.in/#website",
        "url": "https://ibnnewshindi.in",
        "name": "IBN News Hindi",
        "description": "मेरठ & पश्चिमी उत्तर प्रदेश की ताज़ा ख़बरें",
        "publisher": {
          "@id": "https://ibnnewshindi.in/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://ibnnewshindi.in/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html
      lang="hi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://plausible.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cloud.umami.is" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        {/* Privacy-Focused Plausible Analytics Integration */}
        <Script
          defer
          data-domain="ibnnewshindi.in"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        {/* Keyless Open-Source Umami Web Analytics Script */}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "3a1309f4-eb7e-41bc-9b62-dfccae047df1"}
          strategy="afterInteractive"
        />
        {/* Vercel Speed Insights (include by setting NEXT_PUBLIC_VERCEL_INSIGHTS_TOKEN) */}
        {process.env.NEXT_PUBLIC_VERCEL_INSIGHTS_TOKEN && (
          <Script
            defer
            src="https://static.vercel-insights.com/v1/script.js"
            data-token={process.env.NEXT_PUBLIC_VERCEL_INSIGHTS_TOKEN}
            strategy="afterInteractive"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {siteConfig?.googleSiteVerification && (
          <meta name="google-site-verification" content={siteConfig.googleSiteVerification} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
        <AppProvider>{children}</AppProvider>
        <Analytics />
      </body>
    </html>
  );
}

