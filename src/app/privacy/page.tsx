"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function PrivacyPage() {
  const { languageMode } = useApp();

  const t = {
    title: languageMode === "hi" ? "गोपनीयता नीति (PRIVACY POLICY)" : "Privacy Policy (PRIVACY POLICY)",
    date: languageMode === "hi" ? "अंतिम अपडेट: 23 मई 2026" : "Last Updated: May 23, 2026",
    sec1: languageMode === "hi" ? "1. जानकारी जो हम एकत्र करते हैं" : "1. Information We Collect",
    sec1Body: languageMode === "hi"
      ? "हम अपने पाठकों से नाम, ईमेल पता (न्यूज़लेटर पंजीकरण या टिप्पणी करते समय) और कुकीज़ के माध्यम से विज़िट पृष्ठों का विश्लेषण डेटा एकत्र करते हैं।"
      : "We collect reader details including names and emails (submitted via comments or newsletters), alongside analytics metrics logged by site visits.",
    sec2: languageMode === "hi" ? "2. कुकीज़ और गूगल विज्ञापन नीतियां" : "2. Cookies & Google AdSense policies",
    sec2Body: languageMode === "hi"
      ? "हम विज्ञापन दिखाने के लिए कुकीज़ और Google AdSense का उपयोग करते हैं। विज्ञापन अनुकूलन को प्रबंधित करने के लिए आप कुकीज़ को अपनी ब्राउज़र सेटिंग्स में निष्क्रिय कर सकते हैं।"
      : "We serve ads using Google AdSense. Cookies allow optimized ad serving. You can disable cookie logging inside browser preferences.",
    intro: languageMode === "hi"
      ? "आईबीएन न्यूज हिन्दी पर आपके डेटा की सुरक्षा हमारी प्राथमिकता है। यह नीति स्पष्ट करती है कि हम कौन सी जानकारी और डेटा एकत्र करते हैं।"
      : "Your privacy is highly valued. This policy outlines how IBN News Hindi collects, protects, and utilizes user data.",
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

          <div className="mt-8 border-t pt-4 text-center select-none">
            <Link href="/contact" className="text-4xs font-black text-[var(--apple-blue)] uppercase hover:underline">
              {languageMode === "hi" ? "संपर्क पृष्ठ" : "Contact Desk"} &rarr;
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
