import React from "react";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const article = await db
    .selectFrom("article")
    .selectAll()
    .where((eb) =>
      eb.or([
        eb("slug", "=", slug),
        eb("slug", "=", slug.toLowerCase()),
      ])
    )
    .where("isDeleted", "=", false)
    .executeTakeFirst();

  if (!article) {
    return {
      title: "Article Not Found - IBN News Hindi",
      description: "This article is either removed or Syndicated on another route.",
    };
  }

  const title = `${article.titleHindi} - IBN News Hindi`;
  const description = article.excerpt || article.metaDescription || "आईबीएन न्यूज़ मेरठ और उत्तर प्रदेश की विश्वसनीय ख़बरें।";
  const keywords = article.tags ? article.tags.join(", ") : "IBN News Hindi, Meerut, Muzaffarnagar, Farmers";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://ibnnewshindi.in/article/${article.slug}`,
    },
    openGraph: {
      title: article.titleHindi,
      description,
      url: `https://ibnnewshindi.in/article/${article.slug}`,
      siteName: "IBN News Hindi",
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.titleHindi,
        },
      ],
      locale: "hi_IN",
      type: "article",
      publishedTime: article.publishDate.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleHindi,
      description,
      images: [article.featuredImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const article = await db
    .selectFrom("article")
    .selectAll()
    .where((eb) =>
      eb.or([
        eb("slug", "=", slug),
        eb("slug", "=", slug.toLowerCase()),
      ])
    )
    .where("isDeleted", "=", false)
    .executeTakeFirst();

  if (!article) {
    notFound();
  }

  // Google Structured NewsArticle JSON-LD Markup
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.titleHindi,
    "image": [article.featuredImage],
    "datePublished": article.publishDate.toISOString(),
    "dateModified": article.publishDate.toISOString(),
    "author": [{
      "@type": "Person",
      "name": article.correspondent || "IBN News Desk",
      "url": "https://ibnnewshindi.in"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "IBN News Hindi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ibnnewshindi.in/logo.png"
      }
    },
    "description": article.excerpt
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClient params={params} />
    </>
  );
}
