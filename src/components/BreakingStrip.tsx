"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";

export const BreakingStrip: React.FC = () => {
  const { articles, languageMode } = useApp();
  
  // Extract all published, non-deleted articles marked as breaking
  const breakingArticles = articles.filter(
    (art) => art.isBreaking && art.status === "Published" && !art.isDeleted
  );

  if (breakingArticles.length === 0) return null;

  return (
    <div className="relative flex h-10 w-full overflow-hidden border-b border-red-200 bg-[var(--news-red)] text-white shadow-sm select-none">
      {/* Absolute badge on left */}
      <div className="z-10 flex items-center bg-black px-4 text-3xs font-black uppercase tracking-widest text-white">
        <span className="mr-1.5 h-2 w-2 rounded-full bg-[var(--news-red)] animate-pulse" />
        {languageMode === "hi" ? "ब्रेकिंग" : "BREAKING"}
      </div>
      
      {/* Ticker marquee box */}
      <div className="relative flex-1 flex items-center overflow-hidden">
        <div className="animate-marquee flex items-center gap-16 py-1">
          {[...breakingArticles, ...breakingArticles].map((art, idx) => {
            const displayTitle = languageMode === "hi" 
              ? art.titleHindi 
              : (art.titleEnglish || art.titleHindi);
            
            return (
              <Link
                key={`${art.id}-${idx}`}
                href={`/article/${art.slug}`}
                className="flex items-center gap-2 text-xs font-bold hover:underline transition-all group whitespace-nowrap"
              >
                <span className="rounded bg-black/30 px-1.5 py-0.5 text-4xs uppercase tracking-widest font-black">
                  {art.category} {art.locationTag ? `> ${art.locationTag}` : ""}
                </span>
                <span>{displayTitle}</span>
                <span className="text-red-200 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default BreakingStrip;
