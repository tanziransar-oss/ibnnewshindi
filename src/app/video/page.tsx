"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AdsPlaceholder from "@/components/AdsPlaceholder";

interface DBVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl: string;
  publishDate: string;
  views: number;
}

const FALLBACK_VIDEOS: DBVideo[] = [
  {
    id: "v1",
    title: "मेरठ महापंचायत ग्राउंड रिपोर्ट: राकेश टिकैत ने बिजली प्रीपेड मीटरों पर कही बड़ी बात",
    description: "मुजफ्फरनगर में राकेश टिकैत का किसानों के स्मार्ट मीटर पर बड़ा ऐलान। देखें ग्राउंड रिपोर्ट।",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=600&h=337&q=80",
    views: 3420,
    publishDate: new Date().toISOString()
  },
  {
    id: "v2",
    title: "मेरठ नौचंदी मैदान का भव्य ड्रोन दृश्य: 25 मई से शुरू हो रहा ऐतिहासिक मेला",
    description: "ऐतिहासिक नौचंदी मेला इस बार 25 मई से आरंभ होने जा रहा है। देखें ड्रोन विजुअल्स।",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=600&h=337&q=80",
    views: 1890,
    publishDate: new Date().toISOString()
  }
];

export default function VideoPage() {
  const { languageMode } = useApp();
  const [videos, setVideos] = useState<DBVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<DBVideo | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: languageMode === "hi" ? "वीडियो रिपोर्ट्स" : "Video Bulletins",
    sub: languageMode === "hi" ? "मेरठ और पश्चिमी उत्तर प्रदेश के ताज़ा वीडियो समाचार" : "Watch recent regional reports and video analyses covering West UP.",
    playlist: languageMode === "hi" ? "ताज़ा बुलेटिन लिस्ट" : "Recent Videos Playlist",
    footer: languageMode === "hi" 
      ? "व्हाट्सएप / यूट्यूब लाइव फ़ीड का सीधा प्रसारण।"
      : "Broadcasting official live streams. Submit news tips via Citizen Reporter portal.",
    views: languageMode === "hi" ? "बार देखा गया" : "views",
    published: languageMode === "hi" ? "प्रसारित" : "Published",
  };

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setVideos(data);
            setActiveVideo(data[0]);
          } else {
            setVideos(FALLBACK_VIDEOS);
            setActiveVideo(FALLBACK_VIDEOS[0]);
          }
        } else {
          setVideos(FALLBACK_VIDEOS);
          setActiveVideo(FALLBACK_VIDEOS[0]);
        }
      } catch (err) {
        console.error("Failed to load DB videos:", err);
        setVideos(FALLBACK_VIDEOS);
        setActiveVideo(FALLBACK_VIDEOS[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 flex-1">
        
        {/* Page header */}
        <div className="mb-6 border-b border-[var(--border-color)] pb-4 select-none">
          <h1 className="title-font text-xl md:text-2xl font-black text-zinc-950 flex items-center gap-2">
            <span>🎥</span>
            {t.title}
          </h1>
          <p className="text-3xs text-[var(--gray-text)] font-semibold mt-1">
            {t.sub}
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--apple-blue)] border-t-transparent" />
          </div>
        ) : activeVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Player block */}
            <div className="lg:col-span-2">
              <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-sm border border-zinc-200">
                <iframe
                  title={activeVideo.title}
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
              
              <div className="mt-4 p-5 bg-white rounded-2xl border border-[var(--border-color)]">
                <div className="flex flex-wrap items-center gap-2 text-4xs font-black uppercase text-[var(--news-red)] tracking-widest mb-2 border-b border-zinc-100 pb-2">
                  <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5">IBN News Live</span>
                  <span>|</span>
                  <span className="text-[var(--apple-blue)] font-black">YouTube Channel</span>
                  <span>|</span>
                  <span className="text-[var(--gray-text)]">{t.published}: {new Date(activeVideo.publishDate).toLocaleDateString(languageMode === "hi" ? "hi-IN" : "en-US", { dateStyle: "medium" })}</span>
                </div>
                
                <h2 className="title-font text-sm md:text-base font-black text-zinc-950 leading-tight">
                  {activeVideo.title}
                </h2>

                <p className="mt-3 text-2xs font-semibold text-zinc-600 leading-relaxed whitespace-pre-line">
                  {activeVideo.description}
                </p>
                
                <div className="mt-4 flex justify-between text-4xs text-[var(--gray-text)] font-bold border-t border-zinc-100 pt-3">
                  <span>{new Date(activeVideo.publishDate).toLocaleDateString(languageMode === "hi" ? "hi-IN" : "en-US", { dateStyle: "long" })}</span>
                  <span>{activeVideo.views} {t.views}</span>
                </div>
              </div>
            </div>

            {/* Playlist Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5 select-none">
                <span>📂</span>
                {t.playlist}
              </h3>

              <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                {videos.map((vid) => {
                  return (
                    <button
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      className={`flex gap-3 p-2 bg-white border rounded-2xl text-left hover:shadow-sm transition-all w-full cursor-pointer ${
                        activeVideo.id === vid.id
                          ? "border-[var(--apple-blue)] shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                          : "border-[var(--border-color)]"
                      }`}
                    >
                      <div className="relative h-14 w-24 shrink-0 overflow-hidden bg-zinc-150 rounded-xl border border-zinc-200">
                        <img
                          src={vid.thumbnailUrl}
                          alt="thumb"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <h4 className="text-3xs font-extrabold text-zinc-950 line-clamp-2 leading-snug hover:text-[var(--apple-blue)]">
                          {vid.title}
                        </h4>
                        <span className="text-5xs text-[var(--gray-text)] font-extrabold mt-1 block uppercase">
                          IBN News &bull; {vid.views} Views
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <AdsPlaceholder slotType="sidebar-box" />
            </div>

          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400 font-bold">
            No video reports available.
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
