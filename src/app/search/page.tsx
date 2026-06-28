"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AdsPlaceholder from "@/components/AdsPlaceholder";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { articles, categories, locations, languageMode } = useApp();

  const queryParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Perform search filtering
  const filteredArticles = articles.filter((art) => {
    if (art.status !== "Published" || art.isDeleted) return false;

    const matchesKeyword = searchQuery.trim()
      ? art.titleHindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.titleEnglish && art.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.contentEnglish && art.contentEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesCategory = selectedCategory
      ? art.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;

    const matchesLocation = selectedLocation
      ? art.locationTag.toLowerCase() === selectedLocation.toLowerCase()
      : true;

    return matchesKeyword && matchesCategory && matchesLocation;
  });

  const t = {
    title: languageMode === "hi" ? "खोजें" : "Search News Index",
    sub: languageMode === "hi" ? "सत्य-आधारित समाचार बुलेटिनों के व्यापक डेटाबेस में खोजें।" : "Search our extensive factual archive covering Meerut & West UP.",
    placeholder: languageMode === "hi" ? "खबर हेडलाइन, स्थान या कीवर्ड खोजें..." : "Search headline keywords, tags or locations...",
    btn: languageMode === "hi" ? "खोजें" : "Search",
    cat: languageMode === "hi" ? "श्रेणी (Category)" : "Category",
    loc: languageMode === "hi" ? "स्थान (Location)" : "Location Tag",
    allCats: languageMode === "hi" ? "सभी श्रेणियां" : "All Categories",
    allLocs: languageMode === "hi" ? "सभी स्थान" : "All Locations",
    found: languageMode === "hi" ? "खोज परिणाम:" : "Search Results:",
    foundSub: languageMode === "hi" ? "लेख मिले" : "bulletins found",
    empty: languageMode === "hi" ? "कोई परिणाम नहीं मिले" : "No Bulletins Found",
    emptySub: languageMode === "hi" 
      ? "कृपया दूसरे कीवर्ड का उपयोग करें या फ़िल्टर सेटिंग्स बदलें।" 
      : "Try searching other keywords, removing filters, or checking spelling.",
    read: languageMode === "hi" ? "मिनट पठन" : "min read",
    date: languageMode === "hi" ? "दिनांक:" : "Date:",
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 flex-1">
        
        {/* Page header */}
        <div className="mb-6 border-b border-[var(--border-color)] pb-4 select-none">
          <h1 className="title-font text-xl md:text-2xl font-black text-zinc-950 flex items-center gap-2">
            <span>🔍</span>
            {t.title}
          </h1>
          <p className="text-3xs text-[var(--gray-text)] font-semibold mt-1">
            {t.sub}
          </p>
        </div>

        {/* Search controls */}
        <div className="mb-8 rounded-2xl bg-white border border-[var(--border-color)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-800 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[var(--apple-blue)] px-6 text-xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-sm"
              >
                {t.btn}
              </button>
            </div>

            {/* Filter selects */}
            <div className="flex flex-wrap gap-4 border-t border-zinc-100 pt-4 text-2xs font-extrabold text-zinc-500">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">{t.cat}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 focus:outline-none text-zinc-700 font-bold"
                >
                  <option value="">{t.allCats}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{languageMode === "hi" ? cat.nameHindi : cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">{t.loc}</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 focus:outline-none text-zinc-700 font-bold"
                >
                  <option value="">{t.allLocs}</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{languageMode === "hi" ? loc.nameHindi : loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center text-4xs font-black text-zinc-400 uppercase tracking-widest select-none">
          <span>{t.found} {filteredArticles.length} {t.foundSub}</span>
          {searchQuery && <span>Keyword: "{searchQuery}"</span>}
        </div>

        {/* Results Grid */}
        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[var(--border-color)] py-16 text-center shadow-sm">
            <span className="text-4xl">🔎</span>
            <h3 className="text-xs font-black text-zinc-950 mt-2">
              {t.empty}
            </h3>
            <p className="text-3xs text-[var(--gray-text)] mt-1 font-semibold max-w-xs mx-auto leading-relaxed">
              {t.emptySub}
            </p>
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
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-150 border-b border-zinc-200">
                      <img
                        src={art.featuredImage}
                        alt="thumb"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-4xs font-black uppercase text-[var(--news-red)] tracking-widest mb-2.5">
                        <span>{art.category}</span>
                        <span className="text-zinc-300">|</span>
                        <span className="text-[var(--apple-blue)]">{art.locationTag}</span>
                      </div>
                      <h2 className="title-font text-xs font-black text-zinc-950 leading-snug group-hover:text-[var(--apple-blue)] transition-colors line-clamp-2">
                        {displayTitle}
                      </h2>
                      <p className="text-3xs text-zinc-500 line-clamp-2 mt-2 font-semibold leading-relaxed">
                        {displayExcerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-4xs text-[var(--gray-text)] font-bold">
                    <span>{art.readTime} {t.read}</span>
                    <span>{t.date} {new Date(art.publishDate).toLocaleDateString(languageMode === "hi" ? "hi-IN" : "en-US")}</span>
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-zinc-50 items-center justify-center">
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Searching Archive...</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
