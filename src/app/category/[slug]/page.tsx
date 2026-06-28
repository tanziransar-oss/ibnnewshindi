import React from "react";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  // Capitalize name search
  const categoriesList = await db
    .selectFrom("category")
    .selectAll()
    .execute();

  const category = categoriesList.find(
    (c) => c.name.toLowerCase().replace(" ", "-") === slug.toLowerCase()
  );

  if (!category) {
    return {
      title: "Category Not Found - IBN News Hindi",
      description: "Search local news and bulletins on IBN News Hindi.",
    };
  }

  const title = `${category.nameHindi} (${category.name}) समाचार - IBN News Hindi`;
  const description = `मेरठ, मुजफ्फरनगर, सहारनपुर और पश्चिमी उत्तर प्रदेश के ${category.nameHindi} क्षेत्र की ताज़ा ख़बरें, ग्राउंड रिपोर्ट और ब्रेकिंग न्यूज़ बुलेटिन।`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ibnnewshindi.in/category/${slug.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ibnnewshindi.in/category/${slug.toLowerCase()}`,
      siteName: "IBN News Hindi",
      locale: "hi_IN",
      type: "website",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const categoriesList = await db
    .selectFrom("category")
    .selectAll()
    .execute();

  const category = categoriesList.find(
    (c) => c.name.toLowerCase().replace(" ", "-") === slug.toLowerCase()
  );

  if (!category) {
    notFound();
  }

  return <CategoryClient params={params} />;
}
