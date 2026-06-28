"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";

export const Footer: React.FC = () => {
  const { settings, categories, languageMode } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  // Translation copy dictionary
  const t = {
    desc: languageMode === "hi"
      ? "मेरठ, मुजफ्फरनगर, सहारनपुर और पश्चिमी उत्तर प्रदेश का सबसे लोकप्रिय व विश्वसनीय स्वतंत्र डिजिटल समाचार नेटवर्क। हम बिना किसी पक्षपात के जनहित के मुद्दों को प्रमुखता से उठाते हैं।"
      : "The most popular and trusted independent digital news network of Meerut, Muzaffarnagar, Saharanpur, and Western Uttar Pradesh. We highlight public interest issues without bias.",
    newsletterTitle: languageMode === "hi" ? "✉️ न्यूज़लेटर - मेरठ बुलेटिन" : "✉️ Newsletter - Meerut Digest",
    newsletterSub: languageMode === "hi" ? settings.newsletterSub : settings.newsletterSubEnglish,
    newsletterPlaceholder: languageMode === "hi" ? "अपना ईमेल दर्ज करें..." : "Enter your email address...",
    newsletterBtn: languageMode === "hi" ? "जुड़ें" : "Subscribe",
    newsletterDone: languageMode === "hi" ? "✓ धन्यवाद! आप पंजीकृत हो चुके हैं।" : "✓ Thank you! You have successfully subscribed.",
    col1: languageMode === "hi" ? "मुख्य श्रेणियां" : "Key Categories",
    col2: languageMode === "hi" ? "विश्वसनीयता & नीतियां" : "Trust & Policies",
    col3: languageMode === "hi" ? "कानूनी जानकारी" : "Legal Compliance",
    home: languageMode === "hi" ? "मुख्य समाचार (Home)" : "Main News (Home)",
    videos: languageMode === "hi" ? "वीडियो गैलरी" : "Video Gallery",
    masthead: languageMode === "hi" ? "संपादकीय टीम (Masthead)" : "Editorial Team (Masthead)",
    corrections: languageMode === "hi" ? "सुधार नीति (Corrections)" : "Corrections Policy",
    factcheck: languageMode === "hi" ? "तथ्य-जांच नीति" : "Fact-Checking Standards",
    ownership: languageMode === "hi" ? "स्वामित्व विवरण (Ownership)" : "Ownership Information",
    reporter: languageMode === "hi" ? "सिटीजन रिपोर्टर (ख़बर भेजें)" : "Citizen Reporter Tip-Line",
    privacy: languageMode === "hi" ? "गोपनीयता नीति (Privacy)" : "Privacy Policy",
    terms: languageMode === "hi" ? "उपयोग की शर्तें (Terms)" : "Terms of Use",
    disclaimer: languageMode === "hi" ? "अस्वीकरण (Disclaimer)" : "Disclaimer",
    grievance: languageMode === "hi" ? "शिकायत अधिकारी (Grievance)" : "Grievance Officer",
    rss: languageMode === "hi" ? "आरएसएस फीड (RSS)" : "RSS Feed",
    copyright: languageMode === "hi"
      ? `© ${new Date().getFullYear()} ${settings.siteNameHindi}। सर्वाधिकार सुरक्षित। यह एक प्रोटोटाइप प्रदर्शन है।`
      : `© ${new Date().getFullYear()} ${settings.siteNameEnglish}. All Rights Reserved. This is a prototype demonstration.`,
  };

  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-white text-zinc-600">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block font-bold tracking-tight">
              <span className="text-xl font-black text-black">
                IBN <span className="text-[var(--news-red)]">NEWS</span>
              </span>
              <span className="ml-1 rounded bg-[var(--news-red)] px-1 py-0.5 text-4xs font-black uppercase tracking-widest text-white">
                HINDI
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              {t.desc}
            </p>

            {/* Newsletter form */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-zinc-50/50 p-4 max-w-sm">
              <h4 className="text-3xs font-extrabold tracking-wider uppercase text-zinc-800 mb-1">
                {t.newsletterTitle}
              </h4>
              <p className="text-4xs text-zinc-500 mb-3 leading-normal">
                {t.newsletterSub}
              </p>
              {newsletterSuccess ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-250 p-2.5 text-4xs text-emerald-700 font-bold text-center">
                  {t.newsletterDone}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={t.newsletterPlaceholder}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-2xs text-zinc-800 placeholder-zinc-400 focus:border-[var(--apple-blue)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--apple-blue)] px-4 py-1.5 text-2xs font-extrabold text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-sm"
                  >
                    {t.newsletterBtn}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Categories Navigation */}
          <div>
            <h4 className="text-4xs font-black tracking-wider uppercase text-zinc-950 mb-4 select-none">
              {t.col1}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/" className="hover:text-[var(--apple-blue)] transition-colors">{t.home}</Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.name.toLowerCase().replace(" ", "-")}`}
                    className="hover:text-[var(--apple-blue)] transition-colors"
                  >
                    {languageMode === "hi" ? cat.nameHindi : cat.name} {languageMode === "hi" ? "न्यूज़" : "News"}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/video" className="hover:text-[var(--apple-blue)] transition-colors">{t.videos}</Link>
              </li>
            </ul>
          </div>

          {/* Editorial & Trust Signals */}
          <div>
            <h4 className="text-4xs font-black tracking-wider uppercase text-zinc-950 mb-4 select-none">
              {t.col2}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/about" className="hover:text-[var(--apple-blue)] transition-colors">{t.masthead}</Link>
              </li>
              <li>
                <Link href="/corrections" className="hover:text-[var(--apple-blue)] transition-colors">{t.corrections}</Link>
              </li>
              <li>
                <Link href="/editorial" className="hover:text-[var(--apple-blue)] transition-colors">{t.factcheck}</Link>
              </li>
              <li>
                <Link href="/about#ownership" className="hover:text-[var(--apple-blue)] transition-colors">{t.ownership}</Link>
              </li>
              <li>
                <Link href="/contact#tip-line" className="text-[var(--apple-blue)] font-bold hover:underline">
                  {t.reporter}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Compliance Pages */}
          <div>
            <h4 className="text-4xs font-black tracking-wider uppercase text-zinc-950 mb-4 select-none">
              {t.col3}
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/privacy" className="hover:text-[var(--apple-blue)] transition-colors">{t.privacy}</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--apple-blue)] transition-colors">{t.terms}</Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--apple-blue)] transition-colors">{t.disclaimer}</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--apple-blue)] transition-colors">{t.grievance}</Link>
              </li>
              <li>
                <span className="flex items-center gap-1 hover:text-[var(--apple-blue)] cursor-pointer transition-colors text-zinc-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  {t.rss}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Socials & Copyright */}
        <div className="mt-12 border-t border-[var(--border-color)] pt-8 flex flex-col gap-4 items-center justify-between text-4xs font-bold text-zinc-400 md:flex-row select-none">
          <div>
            {t.copyright}
          </div>

          {/* Social Profiles */}
          <div className="flex gap-4">
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--apple-blue)] transition-colors" aria-label="Facebook">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-1 .5-1.5 1.5-1.5H16V1H13C9.7 1 9 2.5 9 5v3z" />
              </svg>
            </a>
            <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--apple-blue)] transition-colors" aria-label="Twitter">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--apple-blue)] transition-colors" aria-label="YouTube">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
