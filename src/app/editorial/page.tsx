"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function EditorialPage() {
  const { languageMode } = useApp();

  const t = {
    title: languageMode === "hi" ? "तथ्य-जांच & संपादकीय नीति" : "Editorial & Fact-Checking Policy",
    date: languageMode === "hi" ? "अंतिम अपडेट: 23 मई 2026" : "Last Updated: May 23, 2026",
    intro: languageMode === "hi"
      ? "आईबीएन न्यूज हिन्दी पाठकों को निष्पक्ष, तथ्य-आधारित और स्वतंत्र पत्रकारिता प्रदान करने के लिए प्रतिबद्ध है। हमारी खबरों की सत्यता और प्रामाणिकता ही हमारी साख है।"
      : "IBN News Hindi is dedicated to fair, fact-based independent journalism. The credibility of our reporting represents our core asset.",
    sec1: languageMode === "hi" ? "1. तथ्य-जांच मानदंड" : "1. Verification Protocol",
    sec1Body: languageMode === "hi"
      ? "हम बहु-स्रोतीकरण नीति का पालन करते हैं। किसी भी खबर को कम से कम दो स्वतंत्र या आधिकारिक स्रोतों से पुष्टि होने के बाद ही लाइव किया जाता है।"
      : "We enforce strict multi-sourcing. No news story goes live unless verified by at least two independent or official channels.",
    sec2: languageMode === "hi" ? "2. हितों का टकराव" : "2. Independence & Conflicts",
    sec2Body: languageMode === "hi"
      ? "हमारे सभी रिपोर्टर और संपादक कड़े नैतिक मापदंडों का पालन करते हैं। पत्रकार अपनी व्यक्तिगत भागीदारी या व्यावसायिक हितों से जुड़े मुद्दों की रिपोर्ट नहीं कर सकते।"
      : "Our reporters follow professional ethics. No writer is permitted to report on issues that pose a conflict of interest.",
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
