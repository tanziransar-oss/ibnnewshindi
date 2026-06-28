"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AdsPlaceholder from "@/components/AdsPlaceholder";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const { articles, categories, languageMode } = useApp();
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  // Find category based on name slug
  const category = categories.find(
    (c) => c.name.toLowerCase().replace(" ", "-") === slug.toLowerCase()
  ) || categories[0];

  // Filter articles
  const categoryArticles = articles.filter(
    (art) =>
      art.category.toLowerCase() === category.name.toLowerCase() &&
      art.status === "Published" &&
      !art.isDeleted
  );

  const filteredArticles = selectedSub
    ? categoryArticles.filter((art) => art.subcategory === selectedSub)
    : categoryArticles;

  const t = {
    empty: languageMode === "hi" ? "कोई समाचार उपलब्ध नहीं" : "No Articles Available",
    emptySub: languageMode === "hi" 
      ? "इस श्रेणी में अभी कोई लेख प्रकाशित नहीं किया गया है।"
      : "No news stories have been published under this category or subcategory yet.",
    homeBtn: languageMode === "hi" ? "होमपेज पर जाएं" : "Return Homepage",
    all: languageMode === "hi" ? "सभी समाचार" : "All News",
    read: languageMode === "hi" ? "मिनट पठन" : "min read",
    views: languageMode === "hi" ? "व्यूज" : "views",
    sub: languageMode === "hi" 
      ? `आईबीएन न्यूज़ • ${category.nameHindi} क्षेत्र की ताज़ा ख़बरें और विशेष ग्राउंड रिपोर्ट`
      : `IBN News • Recent reports, bulletins and analyses covering ${category.name}.`,
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 flex-1">
        {/* Category Header Card */}
        <div className="mb-8 rounded-2xl bg-white border border-[var(--border-color)] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <span className="h-6 w-2 rounded-full bg-[var(--apple-blue)]" />
            <div>
              <h1 className="title-font text-xl md:text-2xl font-black text-zinc-950">
                {languageMode === "hi" ? category.nameHindi : category.name}
              </h1>
              <p className="text-3xs text-[var(--gray-text)] font-semibold mt-1">
                {t.sub}
              </p>
            </div>
          </div>

          {/* Subcategories Row */}
          {category.subcategories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
              <button
                onClick={() => setSelectedSub(null)}
                className={`rounded-full px-4 py-1.5 text-2xs font-extrabold transition-all border ${
                  selectedSub === null
                    ? "bg-[var(--apple-blue)] text-white border-[var(--apple-blue)]"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {t.all}
              </button>
              {category.subcategories.map((sub) => {
                const subDisplay = languageMode === "hi"
                  ? (sub === "Farmers" ? "किसान" : sub === "Crime" ? "अपराध" : sub === "Politics" ? "राजनीति" : sub === "Civic" ? "नागरिक मुद्दे" : sub === "Education" ? "शिक्षा" : sub === "Health" ? "स्वास्थ्य" : sub === "Business" ? "व्यापार" : sub)
                  : sub;

                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSub(sub)}
                    className={`rounded-full px-4 py-1.5 text-2xs font-extrabold transition-all border ${
                      selectedSub === sub
                        ? "bg-[var(--apple-blue)] text-white border-[var(--apple-blue)]"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {subDisplay}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Listings */}
        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[var(--border-color)] py-16 text-center shadow-sm">
            <span className="text-4xl">📭</span>
            <h3 className="text-xs font-black text-zinc-950 mt-2">
              {t.empty}
            </h3>
            <p className="text-3xs text-[var(--gray-text)] mt-1 font-semibold">
              {t.emptySub}
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-[var(--apple-blue)] px-6 py-2.5 text-xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-sm"
            >
              {t.homeBtn}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => {
              const displayTitle = languageMode === "hi" 
                ? art.titleHindi 
                : (art.titleEnglish || art.titleHindi);
              const displayExcerpt = languageMode === "hi"
                ? art.excerpt
                : (art.excerptEnglish || art.excerpt);

              return (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}`}
                  className="group bg-white border border-[var(--border-color)] rounded-2xl overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all flex flex-col h-full justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 border-b border-zinc-200">
                      <img
                        src={art.featuredImage}
                        alt="thumb"
                        className="h-full w-full object-cover"
                      />
                      {art.isBreaking && (
                        <span className="absolute top-3 left-3 rounded bg-[var(--news-red)] px-2 py-0.5 text-4xs font-black text-white uppercase">
                          🚨 BREAKING
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-4xs font-black uppercase text-[var(--news-red)] tracking-widest mb-2.5">
                        <span>{art.category}</span>
                        {art.locationTag && (
                          <>
                            <span className="text-zinc-300">|</span>
                            <span className="text-[var(--apple-blue)]">{art.locationTag}</span>
                          </>
                        )}
                      </div>
                      
                      <h2 className="title-font text-xs font-black text-zinc-950 leading-snug group-hover:text-[var(--apple-blue)] transition-colors line-clamp-2">
                        {displayTitle}
                      </h2>
                      
                      <p className="text-3xs text-zinc-500 line-clamp-2 mt-2 font-semibold leading-relaxed">
                        {displayExcerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-4xs text-[var(--gray-text)] font-extrabold">
                    <span>{art.readTime} {t.read}</span>
                    <span>{art.views} {t.views}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <AdsPlaceholder slotType="in-content" />
      </main>

      <Footer />
    </div>
  );
}
