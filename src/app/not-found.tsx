"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function NotFound() {
  const router = useRouter();
  const { languageMode } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const t = {
    title: languageMode === "hi" ? "पेज नहीं मिला (404)" : "Page Not Found (404)",
    desc: languageMode === "hi" 
      ? "क्षमा करें, जिस पृष्ठ की आप खोज कर रहे हैं वह उपलब्ध नहीं है। संभवतः इसका यूआरएल बदल गया है या यह हटा दिया गया है।"
      : "The page you are looking for does not exist. It may have been moved, syndication expired, or path was modified.",
    placeholder: languageMode === "hi" ? "खबर हेडलाइन खोजें..." : "Search news headlines...",
    btn: languageMode === "hi" ? "खोजें" : "Search",
    back: languageMode === "hi" ? "← मुख्य पृष्ठ (Home)" : "← Go Home",
    support: languageMode === "hi" ? "सहायता केंद्र" : "Contact Support",
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-xl px-4 py-24 text-center flex-1">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 md:p-12 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-6">
          <span className="text-6xl inline-block">🔍</span>
          
          <h1 className="title-font text-2xl font-black text-zinc-950 leading-tight">
            {t.title}
          </h1>
          
          <p className="text-3xs text-[var(--gray-text)] leading-relaxed font-semibold max-w-sm mx-auto">
            {t.desc}
          </p>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-800 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--apple-blue)] px-5 text-xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-sm"
            >
              {t.btn}
            </button>
          </form>

          <div className="pt-5 border-t border-zinc-100 flex justify-center gap-4 text-3xs font-extrabold uppercase tracking-widest text-[var(--apple-blue)]">
            <Link href="/" className="hover:underline">
              {t.back}
            </Link>
            <span className="text-zinc-200">|</span>
            <Link href="/contact" className="hover:underline">
              {t.support} →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
