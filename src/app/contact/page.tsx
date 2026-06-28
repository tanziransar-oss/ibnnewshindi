"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AdsPlaceholder from "@/components/AdsPlaceholder";

export default function ContactPage() {
  const { languageMode, settings } = useApp();
  const [tipName, setTipName] = useState("");
  const [tipPhone, setTipPhone] = useState("");
  const [tipTitle, setTipTitle] = useState("");
  const [tipDesc, setTipDesc] = useState("");
  const [tipSubmitted, setTipSubmitted] = useState(false);

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTipSubmitted(true);
    setTipName("");
    setTipPhone("");
    setTipTitle("");
    setTipDesc("");
    setTimeout(() => setTipSubmitted(false), 5000);
  };

  const t = {
    title: languageMode === "hi" ? "संपर्क करें" : "Contact Our Bureau",
    sub: languageMode === "hi" ? "आईबीएन न्यूज़ से जुड़ें - ग्राउंड रिपोर्टिंग में जन सरोकार का सहयोग दें।" : "Connect with IBN News. Report local issues and help support citizen journalism.",
    officeTitle: languageMode === "hi" ? "🏢 मुख्य कार्यालय (HEAD OFFICE)" : "🏢 HEAD OFFICE",
    officeDesc: languageMode === "hi"
      ? `आईबीएन डिजिटल मीडिया प्राइवेट लिमिटेड
         204, द्वितीय तल, साकेत टावर्स,
         साकेत रोड, मेरठ, उत्तर प्रदेश - 250001`
      : `IBN Digital Media Private Limited
         204, 2nd Floor, Saket Towers,
         Saket Road, Meerut, Uttar Pradesh - 250001`,
    phone: languageMode === "hi" ? "📞 दूरभाष:" : "📞 Phone:",
    email: languageMode === "hi" ? "✉️ ईमेल:" : "✉️ Email:",
    grievanceTitle: languageMode === "hi" ? "⚖️ शिकायत निवारण अधिकारी" : "⚖️ Grievance Officer",
    grievanceDesc: languageMode === "hi"
      ? "सूचना प्रौद्योगिकी नियम 2021 के तहत समाचार सामग्री से संबंधित किसी भी शिकायत के निवारण के लिए संपर्क करें:"
      : "For content grievances, copyright disputes or editorial error complaints under Information Technology Rules 2021:",
    grievanceOfficer: languageMode === "hi" ? "अधिकारी: श्री राजेश कुमार (वरिष्ठ संपादक)" : "Officer: Mr. Rajesh Kumar (Senior Editor)",
    grievanceTimeline: languageMode === "hi" ? "उत्तर समय सीमा: 15 कार्य दिवस" : "Response timeline: 15 working days",
    tipTitle: languageMode === "hi" ? "📢 सिटीजन रिपोर्टर: ख़बर भेजें" : "📢 Citizen Reporter: Submit Tip",
    tipDesc: languageMode === "hi"
      ? "क्या आपके पास मेरठ या पश्चिमी उत्तर प्रदेश से जुड़ा कोई विशेष समाचार है? विवरण भरकर हमें भेजें। हम पुष्टि कर प्रकाशित करेंगे।"
      : "Have a local news tip, photo, or report from Meerut or West UP? Fill in the form below. Our editors will verify and publish it.",
    doneTitle: languageMode === "hi" ? "🎉 समाचार टिप सफलतापूर्वक प्राप्त हुई!" : "🎉 News Tip Submitted Successfully!",
    doneDesc: languageMode === "hi" 
      ? "आपकी ख़बर भेजने के लिए धन्यवाद। हमारा मेरठ ब्यूरो डेस्क जल्द संपर्क करेगा।"
      : "Thank you for supporting regional citizen reporting. Our bureau desk will review and reach out shortly.",
    labelName: languageMode === "hi" ? "आपका नाम (Name)*" : "Your Name*",
    labelPhone: languageMode === "hi" ? "व्हाट्सएप नंबर (WhatsApp No)*" : "WhatsApp Phone*",
    labelSubject: languageMode === "hi" ? "खबर का शीर्षक (News Headline)*" : "News Topic/Headline*",
    labelBody: languageMode === "hi" ? "खबर का विस्तृत विवरण (Full Details)*" : "Full Story Details*",
    submitBtn: languageMode === "hi" ? "🚀 समाचार टिप ब्यूरो को भेजें" : "🚀 Submit to Editorial Bureau",
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 flex-1">
        
        {/* Page header */}
        <div className="mb-8 border-b border-[var(--border-color)] pb-4 select-none">
          <h1 className="title-font text-xl md:text-2xl font-black text-zinc-950 flex items-center gap-2">
            <span>📞</span>
            {t.title}
          </h1>
          <p className="text-3xs text-[var(--gray-text)] font-semibold mt-1">
            {t.sub}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info column left */}
          <div className="space-y-6">
            
            {/* Address */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <h3 className="title-font text-3xs font-black uppercase text-zinc-950 mb-3 select-none">
                {t.officeTitle}
              </h3>
              <p className="text-3xs text-zinc-500 font-semibold leading-relaxed whitespace-pre-line">
                {t.officeDesc}
              </p>
              <div className="mt-4 border-t border-zinc-100 pt-3 text-[10px] text-zinc-650 font-bold space-y-1">
                <p>{t.phone} +91-121-456789</p>
                <p>{t.email} contact@ibnnewshindi.in</p>
              </div>
            </div>

            {/* Grievance compliance */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <h3 className="title-font text-3xs font-black uppercase text-zinc-950 mb-2 select-none">
                {t.grievanceTitle}
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed mb-3">
                {t.grievanceDesc}
              </p>
              <div className="text-[10px] text-zinc-800 font-bold space-y-1">
                <p>{t.grievanceOfficer}</p>
                <p>{t.email} grievances@ibnnewshindi.in</p>
                <p>📍 {t.grievanceTimeline}</p>
              </div>
            </div>

            <AdsPlaceholder slotType="sidebar-box" />
          </div>

          {/* Form column right */}
          <div className="lg:col-span-2">
            
            {/* Tip line box */}
            <div id="tip-line" className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm">
              <h3 className="title-font text-xs font-black uppercase text-zinc-950 mb-1 flex items-center gap-1.5 select-none border-b pb-2 mb-3">
                {t.tipTitle}
              </h3>
              <p className="text-3xs text-zinc-500 mb-6 font-semibold leading-relaxed">
                {t.tipDesc}
              </p>

              {tipSubmitted ? (
                <div className="rounded-xl bg-zinc-50 border p-6 text-center text-[var(--apple-blue)] select-none">
                  <span className="text-3xl block mb-2">🎉</span>
                  <h4 className="text-xs font-black">{t.doneTitle}</h4>
                  <p className="text-3xs text-zinc-500 font-bold mt-1.5 leading-normal max-w-sm mx-auto">
                    {t.doneDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTipSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.labelName}</label>
                      <input
                        type="text"
                        required
                        value={tipName}
                        onChange={(e) => setTipName(e.target.value)}
                        placeholder="Reporter Name"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.labelPhone}</label>
                      <input
                        type="tel"
                        required
                        value={tipPhone}
                        onChange={(e) => setTipPhone(e.target.value)}
                        placeholder="+91..."
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.labelSubject}</label>
                    <input
                      type="text"
                      required
                      value={tipTitle}
                      onChange={(e) => setTipTitle(e.target.value)}
                      placeholder="Topic title..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.labelBody}</label>
                    <textarea
                      required
                      rows={4}
                      value={tipDesc}
                      onChange={(e) => setTipDesc(e.target.value)}
                      placeholder="Describe full details here..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[var(--apple-blue)] py-3 text-xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow"
                  >
                    {t.submitBtn}
                  </button>
                </form>
              )}
            </div>
            
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
