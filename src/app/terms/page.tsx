"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function TermsPage() {
  const { languageMode } = useApp();

  const t = {
    title: languageMode === "hi" ? "उपयोग की शर्तें (TERMS OF USE)" : "Terms of Use (TERMS OF USE)",
    date: languageMode === "hi" ? "अंतिम अपडेट: 23 मई 2026" : "Last Updated: May 23, 2026",
    sec1: languageMode === "hi" ? "1. बौद्धिक संपदा अधिकार" : "1. Intellectual Property Protection",
    sec1Body: languageMode === "hi"
      ? "वेबसाइट पर प्रकाशित सभी समाचार, हेडलाइन, चित्र, ग्राफ़िक्स और सामग्री आईबीएन डिजिटल मीडिया की संपत्ति हैं। लिखित पूर्वामुमति के बिना कॉपी या वितरित करना प्रतिबंधित है।"
      : "All news articles, graphics, headlines, photographs and logos published on this website are owned by IBN Digital Media. Unauthorized syndication is strictly prohibited.",
    sec2: languageMode === "hi" ? "2. पाठक टिप्पणियों के नियम" : "2. Comments Code of Conduct",
    sec2Body: languageMode === "hi"
      ? "पाठकों द्वारा टिप्पणियों में अभद्र भाषा, व्यक्तिगत हमले, विज्ञापन लिंक्स या भ्रामक प्रचार फैलाना पूर्णतया प्रतिबंधित है। हम ऐसी टिप्पणियों को हटाने का पूर्ण अधिकार रखते हैं।"
      : "Hate speech, personal threats, spam links, or defamatory copy submitted as comments will not be tolerated. We hold complete rights to delete violations.",
    intro: languageMode === "hi"
      ? "आईबीएन न्यूज़ वेबसाइट के उपयोग हेतु निम्नलिखित नियमों और शर्तों का पालन करना अनिवार्य है।"
      : "Welcome to IBN News Hindi. By browsing this portal, you agree to comply with the following editorial usage terms.",
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
        <article className="rounded-2xl border border-[var(--border-color)] bg-white p-6 md:p-8 shadow-sm prose max-w-none text-zinc-700 leading-relaxed font-semibold text-xs">
          <h1 className="title-font text-sm font-black text-zinc-950 border-b border-zinc-100 pb-3 mb-4 select-none">
            {t.title}
          </h1>
          
          <p className="text-5xs text-[var(--gray-text)] font-extrabold uppercase mb-4 select-none">{t.date}</p>

          <p className="text-zinc-650 mb-4">{t.intro}</p>

          <h2 className="title-font text-2xs font-black text-zinc-950 uppercase mt-6 mb-2">
            {t.sec1}
          </h2>
          <p className="text-zinc-600">{t.sec1Body}</p>

          <h2 className="title-font text-2xs font-black text-zinc-950 uppercase mt-6 mb-2">
            {t.sec2}
          </h2>
          <p className="text-zinc-600">{t.sec2Body}</p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
