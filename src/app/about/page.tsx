"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AdsPlaceholder from "@/components/AdsPlaceholder";

export default function AboutPage() {
  const { languageMode } = useApp();

  const t = {
    title: languageMode === "hi" ? "हमारे बारे में" : "About Our Bureau",
    sub: languageMode === "hi" ? "सत्य, निष्पक्षता और जन सरोकार - हमारा मुख्य संकल्प।" : "Fact-based, non-partisan, public-interest news reporting across West UP.",
    sec1: languageMode === "hi" ? "1. हमारा परिचय (Who We Are)" : "1. Who We Are",
    sec1Body: languageMode === "hi"
      ? "आईबीएन न्यूज हिन्दी (IBN News Hindi) पश्चिमी उत्तर प्रदेश और मेरठ मंडल का एक प्रमुख स्वतंत्र डिजिटल समाचार नेटवर्क है। हमारा ध्येय स्थानीय किसानों, नागरिक समस्याओं और दबे-कुचले वर्गों की आवाज को उठाना है। हम बिना किसी राजनीतिक या कॉर्पोरेट दबाव के स्वतंत्र पत्रकारिता में विश्वास करते हैं।"
      : "IBN News Hindi is a leading independent digital news network covering Western Uttar Pradesh and Meerut Division. Our mission is to report on regional farmers, civic infrastructure, and local issues with complete journalistic integrity, free from any political or corporate bias.",
    sec2: languageMode === "hi" ? "2. संपादकीय मंडल (MASTHEAD)" : "2. Editorial Board (Masthead)",
    sec3: languageMode === "hi" ? "3. स्वामित्व विवरण (OWNERSHIP & TRANSPARENCY)" : "3. Ownership & Transparency",
    sec3Body: languageMode === "hi"
      ? "आईबीएन न्यूज हिन्दी 'आईबीएन डिजिटल मीडिया प्राइवेट लिमिटेड' के स्वामित्व में संचालित होता है, जिसका मुख्य कार्यालय मेरठ, उत्तर प्रदेश में स्थित है। हमारा राजस्व मुख्य रूप से गूगल एडसेंस, प्रायोजित लेखों और पाठकों के सहयोग से आता है।"
      : "IBN News Hindi is owned and operated by 'IBN Digital Media Private Limited', with its registered headquarters in Shastri Nagar, Meerut, Uttar Pradesh. Our revenue streams consist of Google AdSense program placements, sponsored content, and voluntary reader support.",
    roleEditor: languageMode === "hi" ? "प्रधान संपादक / Admin" : "Editor-in-Chief / Admin",
    roleReporter: languageMode === "hi" ? "वरिष्ठ ब्यूरो चीफ" : "Senior Bureau Chief, Meerut",
    roleFarmers: languageMode === "hi" ? "विशेष संवाददाता (किसान)" : "Special Correspondent (Rural & Farmers)",
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">
        
        {/* Page header */}
        <div className="mb-8 border-b border-[var(--border-color)] pb-4 select-none">
          <h1 className="title-font text-xl md:text-2xl font-black text-zinc-950 flex items-center gap-2">
            <span>🛡️</span>
            {t.title}
          </h1>
          <p className="text-3xs text-[var(--gray-text)] font-semibold mt-1">
            {t.sub}
          </p>
        </div>

        <div className="space-y-6 text-xs text-zinc-700 leading-relaxed font-semibold">
          {/* Slogan */}
          <section className="bg-white border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
            <h2 className="title-font text-2xs font-black text-zinc-950 uppercase mb-3.5 tracking-wider border-b pb-2">
              {t.sec1}
            </h2>
            <p className="text-zinc-650 leading-relaxed font-semibold">
              {t.sec1Body}
            </p>
          </section>

          {/* Editorial Masthead */}
          <section className="bg-white border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
            <h2 className="title-font text-2xs font-black text-zinc-950 uppercase mb-6 tracking-wider border-b pb-2 select-none">
              {t.sec2}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
              {/* Member 1 */}
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Azaan"
                  loading="lazy"
                  className="mx-auto h-20 w-20 rounded-full object-cover border bg-zinc-100 shadow-sm"
                />
                <h3 className="text-2xs font-black text-zinc-950 mt-3.5">Azaan Ali Raza</h3>
                <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 text-5xs font-black uppercase text-[var(--news-red)] tracking-wider mt-1 inline-block">
                  {t.roleEditor}
                </span>
                <p className="text-5xs text-[var(--gray-text)] mt-1">editor@ibnnewshindi.in</p>
              </div>

              {/* Member 2 */}
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Rajesh"
                  loading="lazy"
                  className="mx-auto h-20 w-20 rounded-full object-cover border bg-zinc-100 shadow-sm"
                />
                <h3 className="text-2xs font-black text-zinc-950 mt-3.5">Rajesh Kumar</h3>
                <span className="rounded bg-zinc-50 border px-2 py-0.5 text-5xs font-bold uppercase text-zinc-650 tracking-wider mt-1 inline-block">
                  {t.roleReporter}
                </span>
                <p className="text-5xs text-[var(--gray-text)] mt-1">rajesh.meerut@ibnnewshindi.in</p>
              </div>

              {/* Member 3 */}
              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Vikram"
                  loading="lazy"
                  className="mx-auto h-20 w-20 rounded-full object-cover border bg-zinc-100 shadow-sm"
                />
                <h3 className="text-2xs font-black text-zinc-950 mt-3.5">Vikram Singh</h3>
                <span className="rounded bg-zinc-50 border px-2 py-0.5 text-5xs font-bold uppercase text-zinc-650 tracking-wider mt-1 inline-block">
                  {t.roleFarmers}
                </span>
                <p className="text-5xs text-[var(--gray-text)] mt-1">vikram.farmers@ibnnewshindi.in</p>
              </div>
            </div>
          </section>

          {/* Corporate Transparency */}
          <section id="ownership" className="bg-white border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
            <h2 className="title-font text-2xs font-black text-zinc-950 uppercase mb-3.5 tracking-wider border-b pb-2">
              {t.sec3}
            </h2>
            <p className="text-zinc-650 leading-relaxed font-semibold">
              {t.sec3Body}
            </p>
          </section>
        </div>

        <AdsPlaceholder slotType="in-content" />
      </main>

      <Footer />
    </div>
  );
}
