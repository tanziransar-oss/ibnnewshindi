"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function DisclaimerPage() {
  const { languageMode } = useApp();

  const t = {
    title: languageMode === "hi" ? "अस्वीकरण (DISCLAIMER)" : "Disclaimer (DISCLAIMER)",
    date: languageMode === "hi" ? "अंतिम अपडेट: 23 मई 2026" : "Last Updated: May 23, 2026",
    intro: languageMode === "hi"
      ? "आईबीएन न्यूज हिन्दी पर प्रकाशित सभी सामग्री केवल सामान्य सूचनात्मक उद्देश्यों के लिए है। यद्यपि हम विश्वसनीय स्रोतों से तथ्य संकलित करते हैं, फिर भी हम पूर्ण सटीकता की कोई वारंटी नहीं देते।"
      : "The information served by IBN News Hindi is for general information. While we compile facts from trusted sources, we offer no warranty on 100% accuracy.",
    sec1: languageMode === "hi" ? "1. संपादकीय और राय" : "1. Opinion Disclaimers",
    sec1Body: languageMode === "hi"
      ? "वेबसाइट के ओपिनियन या ब्लॉक अनुभाग में व्यक्त विचार लेखकों के व्यक्तिगत विचार हैं और आवश्यक नहीं कि वे हमारे संपादकीय बोर्ड का प्रतिनिधित्व करें।"
      : "Views expressed in the opinion columns are personal opinions of the authors and do not necessarily reflect the official stances of our editorial board.",
    sec2: languageMode === "hi" ? "2. बाहरी कड़ियां" : "2. Third-Party Linkage",
    sec2Body: languageMode === "hi"
      ? "हमारी साइट पर बाहरी वेब कड़ियां हो सकती हैं। हम उन बाहरी वेबसाइटों की सामग्री की विश्वसनीयता या गोपनीयता के लिए उत्तरदायी नहीं हैं।"
      : "Our pages may contain links to external sites. We hold no responsibility for privacy protocols or fact accuracy on third-party domains.",
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
