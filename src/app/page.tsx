"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AdsPlaceholder from "@/components/AdsPlaceholder";

export default function Home() {
  const { articles, settings, sendNotification, languageMode, loading } = useApp();
  const [notificationPrompt, setNotificationPrompt] = useState(false);

  // Load notification prompt
  useEffect(() => {
    const isSubbed = localStorage.getItem("ibn_push_subscribed");
    const dismissed = localStorage.getItem("ibn_push_dismissed");
    if (!isSubbed && !dismissed) {
      const timer = setTimeout(() => setNotificationPrompt(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handlePushSubscribe = () => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setNotificationPrompt(false);
            localStorage.setItem("ibn_push_subscribed", "true");
            sendNotification(
              languageMode === "hi" ? "🔔 सूचनाएं सक्रिय!" : "🔔 Alerts Enabled!",
              languageMode === "hi" 
                ? "आईबीएन न्यूज हिन्दी से ब्रेकिंग अलर्ट्स चालू हो चुके हैं।"
                : "IBN News English breaking alerts are now active.",
              "/"
            );
          } else {
            setNotificationPrompt(false);
            localStorage.setItem("ibn_push_dismissed", "true");
          }
        });
      } else {
        setNotificationPrompt(false);
        localStorage.setItem("ibn_push_subscribed", "true");
      }
    }
  };

  const handleDismissPush = () => {
    setNotificationPrompt(false);
    localStorage.setItem("ibn_push_dismissed", "true");
  };

  // Filter published, non-deleted articles
  const publishedArticles = articles.filter(
    (art) => art.status === "Published" && !art.isDeleted
  );

  const heroArticle = publishedArticles[0];
  const sideArticles = publishedArticles.slice(1, 4);
  const meerutArticles = publishedArticles.filter(art => art.category === "Meerut");
  const westUpArticles = publishedArticles.filter(art => art.category === "West UP");
  const editorsChoiceArticles = publishedArticles.filter(art => art.isEditorsChoice === true);
  const displayEditorsChoice = editorsChoiceArticles.length > 0 
    ? editorsChoiceArticles.slice(0, 4) 
    : publishedArticles.filter(art => art.isSticky).slice(0, 4);

  // Translation copy dictionary
  const t = {
    trending: languageMode === "hi" ? "ट्रेडिंग टॉपिक्स:" : "Trending Topics:",
    recent: languageMode === "hi" ? "ताज़ा अपडेट्स" : "Recent Updates",
    meerutTitle: languageMode === "hi" ? "मेरठ न्यूज़ (MEERUT NEWS)" : "Meerut News Bureau",
    westUpTitle: languageMode === "hi" ? "पश्चिमी उत्तर प्रदेश न्यूज़" : "Western Uttar Pradesh News",
    read: languageMode === "hi" ? "मिनट पठन" : "min read",
    views: languageMode === "hi" ? "व्यूज" : "views",
    all: languageMode === "hi" ? "सभी देखें" : "View All",
    editorsChoice: languageMode === "hi" ? "संपादक की पसंद" : "Editor's Choice",
    editorsChoiceDesc: languageMode === "hi" ? "विशेष लेख" : "Featured",
    citizenTitle: languageMode === "hi" ? "💬 सिटीजन रिपोर्टर टिप लाइन" : "💬 Citizen Reporter Tip-Line",
    citizenDesc: languageMode === "hi" 
      ? "क्या आपके आसपास कोई समस्या है? पानी की समस्या, सड़क का गड्ढा, या फिर कोई बड़ी घटना? हमें सीधे अपने फोन से व्हाट्सएप पर फोटो या वीडियो भेजें।"
      : "Have a local news tip or report? Send photos, videos, or information directly to our newsroom bureau via WhatsApp.",
    citizenBtn: languageMode === "hi" ? "व्हाट्सएप पर खबर भेजें" : "Submit via WhatsApp",
    notifyTitle: languageMode === "hi" ? "ताज़ा समाचार सूचनाएं चालू करें" : "Enable News Alerts",
    notifyDesc: languageMode === "hi"
      ? "क्या आप मेरठ, किसान आंदोलन और वेस्ट यूपी की किसी भी ब्रेकिंग खबर को मिस नहीं करना चाहते? नोटिफिकेशन चालू करें!"
      : "Don't want to miss any breaking local updates from Meerut or West UP? Enable browser push alerts now!",
    notifyBtn: languageMode === "hi" ? "स्वीकार करें" : "Enable Alerts",
    notifyLater: languageMode === "hi" ? "बाद में" : "Later",
    newsletterSub: languageMode === "hi" ? settings.newsletterSub : settings.newsletterSubEnglish,
  };

  let trendingTags: Array<{hi: string, en: string}> = [];
  if (settings?.trendingTopics) {
    try {
      trendingTags = JSON.parse(settings.trendingTopics);
    } catch (e) {
      console.error("Error parsing settings.trendingTopics:", e);
    }
  }
  if (!trendingTags || trendingTags.length === 0) {
    trendingTags = [
      { hi: "#मेरठहादसा", en: "#MeerutAccident" },
      { hi: "#गन्नामूल्य2026", en: "#SugarPrice2026" },
      { hi: "#नौचंदीमेला", en: "#NauchandiMela" },
      { hi: "#आईपीएल2026", en: "#IPL2026" },
      { hi: "#पश्चिमीयूपी_किसान", en: "#UPFarmers" },
    ];
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <AdsPlaceholder slotType="header-banner" />

      {/* Main Home Container */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 flex-1">
        
        {/* Trending tags row */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[var(--border-color)] pb-3 text-xs text-[var(--gray-text)] font-bold select-none">
          <span className="text-zinc-950 uppercase font-extrabold tracking-wider mr-2">{t.trending}</span>
          {trendingTags.map((tag) => {
            const displayTag = languageMode === "hi" ? tag.hi : tag.en;
            return (
              <Link
                key={tag.en}
                href={`/search?q=${encodeURIComponent(displayTag.replace("#", ""))}`}
                className="rounded-full bg-white border border-[var(--border-color)] px-3.5 py-1 text-2xs font-extrabold text-zinc-700 hover:border-[var(--apple-blue)] hover:text-[var(--apple-blue)] transition-colors"
              >
                {displayTag}
              </Link>
            );
          })}
        </div>

        {/* Hero Section (1 Big, 3 Sidebar cards) */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
          
          {/* Main Hero article */}
          {loading ? (
            <div className="lg:col-span-2 rounded-2xl border border-[var(--border-color)] bg-white p-6 md:p-8 space-y-5 animate-pulse select-none">
              <div className="aspect-video w-full rounded-xl bg-zinc-200" />
              <div className="space-y-3">
                <div className="h-3 w-1/4 rounded bg-zinc-200" />
                <div className="h-5 w-3/4 rounded bg-zinc-200" />
                <div className="h-5 w-1/2 rounded bg-zinc-200" />
                <div className="h-3 w-full rounded bg-zinc-200" />
              </div>
            </div>
          ) : heroArticle ? (
            <div className="lg:col-span-2 group">
              <Link
                href={`/article/${heroArticle.slug}`}
                className="block overflow-hidden bg-white rounded-2xl border border-[var(--border-color)] shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all group-hover:-translate-y-0.5"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-150">
                  <img
                    src={heroArticle.featuredImage}
                    alt={heroArticle.titleHindi}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-101"
                  />
                  {heroArticle.isBreaking && (
                    <span className="absolute top-4 left-4 rounded bg-[var(--news-red)] px-2.5 py-0.5 text-4xs font-black uppercase text-white tracking-widest">
                      LIVE BREAKING
                    </span>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-4xs font-black uppercase text-[var(--news-red)] tracking-widest mb-3 border-b border-zinc-100 pb-2.5">
                    <span>{heroArticle.category}</span>
                    {heroArticle.locationTag && (
                      <>
                        <span className="text-zinc-300">|</span>
                        <span className="text-[var(--apple-blue)] font-black">{heroArticle.locationTag}</span>
                      </>
                    )}
                    <span className="text-zinc-300">|</span>
                    <span className="text-[var(--gray-text)]">{heroArticle.readTime} {t.read}</span>
                  </div>
                  
                  <h2 className="title-font text-xl md:text-2xl font-black text-zinc-950 leading-tight group-hover:text-[var(--apple-blue)] transition-colors">
                    {languageMode === "hi" ? heroArticle.titleHindi : (heroArticle.titleEnglish || heroArticle.titleHindi)}
                  </h2>
                  
                  <p className="mt-3 text-xs text-zinc-500 leading-relaxed font-semibold">
                    {languageMode === "hi" 
                      ? heroArticle.excerpt 
                      : (heroArticle.excerptEnglish || heroArticle.excerpt)}
                  </p>
                </div>
              </Link>
            </div>
          ) : null}

          {/* Sidebar recent feed column */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-[var(--border-color)] pb-2.5 flex items-center gap-1.5 select-none">
              <span className="h-2 w-2 rounded-full bg-[var(--apple-blue)] animate-pulse" />
              {t.recent}
            </h3>

            <div className="flex flex-col gap-4 flex-1">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white border border-[var(--border-color)] rounded-2xl animate-pulse select-none">
                    <div className="h-16 w-24 shrink-0 rounded-xl bg-zinc-200" />
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="h-2 w-1/3 rounded bg-zinc-200" />
                      <div className="h-3 w-5/6 rounded bg-zinc-200" />
                      <div className="h-2 w-1/2 rounded bg-zinc-200" />
                    </div>
                  </div>
                ))
              ) : (
                sideArticles.map((art) => {
                  const displayTitle = languageMode === "hi" 
                    ? art.titleHindi 
                    : (art.titleEnglish || art.titleHindi);

                  return (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="group flex gap-3 p-3 bg-white border border-[var(--border-color)] rounded-2xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all"
                    >
                      <div className="h-16 w-24 shrink-0 overflow-hidden bg-zinc-100 rounded-xl border border-zinc-200">
                        <img
                          src={art.featuredImage}
                          alt="side-thumb"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <span className="text-5xs font-black uppercase text-[var(--news-red)] tracking-widest block mb-0.5">
                            {art.category}
                          </span>
                          <h4 className="text-2xs font-extrabold text-zinc-950 leading-snug group-hover:text-[var(--apple-blue)] transition-colors line-clamp-2">
                            {displayTitle}
                          </h4>
                        </div>
                        <div className="text-5xs text-[var(--gray-text)] font-bold mt-1">
                          {art.readTime} {t.read} &bull; {art.views} {t.views}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

        </section>

        {/* Categories split Grid (Meerut Left, Farmers Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main news categories grids */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Meerut Grid */}
            <section>
              <div className="flex items-baseline justify-between border-b border-[var(--news-red)] pb-2 mb-4">
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight flex items-baseline gap-1.5 select-none">
                  <span className="text-[var(--news-red)]">{languageMode === "hi" ? "मेरठ" : "MEERUT"}</span> {languageMode === "hi" ? "ब्यूरो न्यूज़" : "BUREAU NEWS"}
                </h3>
                <Link href="/category/meerut" className="text-3xs font-extrabold text-[var(--apple-blue)] uppercase hover:underline">
                  {t.all}<span className="ml-1">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meerutArticles.slice(0, 4).map(art => {
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
                      className="group bg-white border border-[var(--border-color)] rounded-2xl p-4 flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all"
                    >
                      <div>
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-200">
                          <img
                            src={art.featuredImage}
                            alt="thumb"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 text-4xs font-black text-[var(--news-red)] uppercase">
                          {art.subcategory || "Civic"}
                        </span>
                        <h4 className="text-xs font-black text-zinc-950 leading-snug group-hover:text-[var(--apple-blue)] transition-colors mt-2.5">
                          {displayTitle}
                        </h4>
                        <p className="text-3xs text-zinc-500 line-clamp-2 mt-1.5 font-semibold leading-relaxed">
                          {displayExcerpt}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-4xs text-[var(--gray-text)] font-bold border-t border-zinc-100 pt-2.5">
                        <span>{art.locationTag}</span>
                        <span>{art.readTime} {t.read} &bull; {art.views} Views</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* West UP Grid */}
            <section>
              <div className="flex items-baseline justify-between border-b border-[var(--apple-blue)] pb-2 mb-4">
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight flex items-baseline gap-1.5 select-none">
                  <span className="text-[var(--apple-blue)]">{languageMode === "hi" ? "पश्चिमी उत्तर प्रदेश" : "WESTERN UP"}</span> {languageMode === "hi" ? "कृषि & ग्रामीण" : "RURAL & FARMERS"}
                </h3>
                <Link href="/category/west-up" className="text-3xs font-extrabold text-[var(--apple-blue)] uppercase hover:underline">
                  {t.all}<span className="ml-1">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {westUpArticles.slice(0, 4).map(art => {
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
                      className="group bg-white border border-[var(--border-color)] rounded-2xl p-4 flex flex-col justify-between hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all"
                    >
                      <div>
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-200">
                          <img
                            src={art.featuredImage}
                            alt="thumb"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="rounded bg-zinc-50 border border-zinc-250 px-2 py-0.5 text-4xs font-black text-zinc-600 uppercase">
                          {art.subcategory || "Farmers"}
                        </span>
                        <h4 className="text-xs font-black text-zinc-950 leading-snug group-hover:text-[var(--apple-blue)] transition-colors mt-2.5">
                          {displayTitle}
                        </h4>
                        <p className="text-3xs text-zinc-500 line-clamp-2 mt-1.5 font-semibold leading-relaxed">
                          {displayExcerpt}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-4xs text-[var(--gray-text)] font-bold border-t border-zinc-100 pt-2.5">
                        <span>{art.locationTag}</span>
                        <span>{art.readTime} {t.read} &bull; {art.views} Views</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Right sidebar column widgets */}
          <div className="space-y-6">
            
            {/* Editor's Choice widgets */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-white p-5">
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-zinc-100 select-none">
                <h4 className="text-3xs font-black tracking-wider uppercase text-zinc-950 flex items-center gap-1.5">
                  <span className="text-amber-500 text-sm">⭐</span>
                  {t.editorsChoice}
                </h4>
                <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-5xs font-black text-amber-700 uppercase">
                  {t.editorsChoiceDesc}
                </span>
              </div>
              
              <div className="flex flex-col gap-4">
                {displayEditorsChoice.length === 0 ? (
                  <p className="text-4xs text-zinc-400 font-bold py-2 text-center select-none">
                    {languageMode === "hi" ? "कोई विशेष लेख नहीं है" : "No choice articles featured yet."}
                  </p>
                ) : (
                  displayEditorsChoice.map((art) => {
                    const displayTitle = languageMode === "hi"
                      ? art.titleHindi
                      : (art.titleEnglish || art.titleHindi);

                    return (
                      <Link
                        key={art.id}
                        href={`/article/${art.slug}`}
                        className="group flex gap-3 pb-3 border-b border-zinc-100/70 last:pb-0 last:border-b-0"
                      >
                        <div className="h-12 w-16 shrink-0 overflow-hidden bg-zinc-100 rounded-xl border border-zinc-200">
                          <img
                            src={art.featuredImage}
                            alt="thumb"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <span className="text-[9px] font-black uppercase text-[var(--apple-blue)] tracking-widest block mb-0.5 select-none">
                              {art.category}
                            </span>
                            <h4 className="text-3xs font-black text-zinc-950 leading-snug group-hover:text-[var(--apple-blue)] transition-colors line-clamp-2">
                              {displayTitle}
                            </h4>
                          </div>
                          <div className="text-[9px] text-[var(--gray-text)] font-bold mt-1 select-none">
                            {art.readTime} {t.read}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar display box ad placeholder */}
            <AdsPlaceholder slotType="sidebar-box" />

            {/* Whatsapp tip-line callout */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h4 className="text-3xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1 border-b border-zinc-100 pb-2 mb-3 select-none">
                {t.citizenTitle}
              </h4>
              <p className="text-3xs text-zinc-500 font-semibold leading-relaxed">
                {t.citizenDesc}
              </p>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace("+", "")}?text=${encodeURIComponent(languageMode === "hi" ? "नमस्ते IBN न्यूज, मेरे पास एक खबर है:" : "Hello IBN News, I have a news tip:")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--apple-blue)] py-2 text-center text-xs font-bold text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-sm"
              >
                {t.citizenBtn}
              </a>
            </div>

            {/* Newsletter widget */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-white p-5 text-center select-none">
              <span className="text-xl">📰</span>
              <h4 className="text-3xs font-black uppercase text-zinc-950 mt-2">
                {languageMode === "hi" ? settings.newsletterHeadline : settings.newsletterHeadlineEnglish}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-semibold">
                {t.newsletterSub}
              </p>
              <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); }}>
                <input
                  type="email"
                  required
                  placeholder={languageMode === "hi" ? "अपना ईमेल" : "Your Email"}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-2xs text-zinc-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--apple-blue)] px-3 text-2xs font-extrabold text-white"
                >
                  ✓
                </button>
              </form>
            </div>
            
          </div>
          
        </div>
      </main>

      {/* Floating Push Notification Opt-In Prompt */}
      {notificationPrompt && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-[var(--border-color)] bg-white/95 p-4 shadow-xl backdrop-blur-md animate-fade-in select-none">
          <div className="flex gap-3">
            <span className="text-2xl shrink-0">🔔</span>
            <div className="flex-1">
              <h4 className="text-xs font-black text-zinc-950">
                {t.notifyTitle}
              </h4>
              <p className="text-[10px] text-zinc-500 mt-1 leading-normal font-semibold">
                {t.notifyDesc}
              </p>
              <div className="mt-3 flex justify-end gap-2 text-4xs font-black uppercase tracking-widest">
                <button
                  onClick={handleDismissPush}
                  className="rounded px-2.5 py-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {t.notifyLater}
                </button>
                <button
                  onClick={handlePushSubscribe}
                  className="rounded bg-[var(--apple-blue)] px-3 py-1.5 text-white hover:bg-[var(--apple-blue-hover)] transition-colors shadow-sm"
                >
                  {t.notifyBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdsPlaceholder slotType="sticky-footer" />
      <Footer />
    </div>
  );
}
