"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function CorrectionsPage() {
  const { languageMode } = useApp();

  const t = {
    title: languageMode === "hi" ? "सुधार नीति (CORRECTIONS POLICY)" : "Corrections Policy (CORRECTIONS POLICY)",
    date: languageMode === "hi" ? "अंतिम अपडेट: 23 मई 2026" : "Last Updated: May 23, 2026",
    intro: languageMode === "hi"
      ? "आईबीएन न्यूज हिन्दी में, हम तथ्यात्मक सटीकता और पारदर्शिता के लिए गहराई से प्रतिबद्ध हैं। यदि हमसे कोई तथ्यात्मक भूल हो जाती है, तो हम तुरंत और पारदर्शी तरीके से सुधारने की नीति का पालन करते हैं।"
      : "At IBN News Hindi, we are committed to accuracy and transparency. When factual errors occur, we prioritize correcting them promptly, transparently and fully.",
    sec1: languageMode === "hi" ? "1. भूल सुधार की प्रक्रिया" : "1. Corrections Process",
    sec1Body: languageMode === "hi"
      ? "तथ्यात्मक भूल की पहचान होने पर हम खबर को अपडेट करते हैं और लेख के अंत में स्पष्ट रूप से 'सुधार लॉग' जोड़ते हैं कि पहले क्या त्रुटि थी और सही तथ्य क्या है।"
      : "Upon verifying an error, the story is updated immediately with a correction log appended at the bottom, clarifying the nature of the error and the corrected fact.",
    sec2: languageMode === "hi" ? "2. भूल रिपोर्ट करें" : "2. How to Report a Correction",
    sec2Body: languageMode === "hi"
      ? "पाठक हमें corrections@ibnnewshindi.in पर ईमेल लिखकर संदर्भ दस्तावेजों के साथ भूल सुधार हेतु अनुरोध कर सकते हैं।"
      : "Readers can submit factual correction requests directly to corrections@ibnnewshindi.in, enclosing references or references documents.",
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
