"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";
import AuthorBio from "@/components/AuthorBio";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { authClient } from "@/lib/auth-client";
import { useMemo } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticlePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { articles, comments, addComment, incrementViews, languageMode, loading } = useApp();
  const { data: session } = authClient.useSession();
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Find article (supporting URL encoded non-ASCII Devanagari Hindi slug parameters)
  const decodedSlug = decodeURIComponent(slug);
  const article = articles.find(
    (art) =>
      (art.slug.toLowerCase() === slug.toLowerCase() ||
        art.slug.toLowerCase() === decodedSlug.toLowerCase()) &&
      !art.isDeleted
  );

  // Increment views
  useEffect(() => {
    if (article) {
      incrementViews(article.id);
      
      const bookmarks = JSON.parse(localStorage.getItem("ibn_bookmarks") || "[]");
      setIsBookmarked(bookmarks.includes(article.id));
    }
  }, [slug, article?.id]);

  const toggleBookmark = () => {
    if (!article) return;
    const bookmarks = JSON.parse(localStorage.getItem("ibn_bookmarks") || "[]");
    let updated;
    if (isBookmarked) {
      updated = bookmarks.filter((id: string) => id !== article.id);
      setIsBookmarked(false);
    } else {
      updated = [...bookmarks, article.id];
      setIsBookmarked(true);
    }
    localStorage.setItem("ibn_bookmarks", JSON.stringify(updated));
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !commentText.trim()) return;

    const authorName = session?.user ? session.user.name : commentName;
    const authorEmail = session?.user ? session.user.email : commentEmail;

    if (!authorName.trim() || !authorEmail.trim()) {
      alert("Please specify your name and email to comment!");
      return;
    }

    addComment({
      articleId: article.id,
      articleTitle: article.titleHindi,
      author: authorName,
      email: authorEmail,
      content: commentText,
    });

    setCommentSubmitted(true);
    setCommentName("");
    setCommentEmail("");
    setCommentText("");
    setTimeout(() => setCommentSubmitted(false), 5000);
  };

  // Translation copy dictionary
  const t = {
    notFound: languageMode === "hi" ? "खबर नहीं मिली" : "Article Not Found",
    notFoundSub: languageMode === "hi" 
      ? "संभवतः यह लेख हटा दिया गया है या इसका यूआरएल बदल गया है।"
      : "The article may have been deleted, syndicated or its URL path was modified.",
    notFoundBtn: languageMode === "hi" ? "होमपेज पर लौटें" : "Return Homepage",
    home: languageMode === "hi" ? "होम" : "Home",
    news: languageMode === "hi" ? "समाचार" : "News",
    by: languageMode === "hi" ? "संवाददाता:" : "Correspondent:",
    pub: languageMode === "hi" ? "प्रकाशित:" : "Published:",
    read: languageMode === "hi" ? "मिनट पठन" : "min read",
    verified: languageMode === "hi" ? "✓ प्रमाणित रिपोर्ट" : "✓ Verified Story",
    share: languageMode === "hi" ? "साझा करें" : "Share",
    relatedTitle: languageMode === "hi" ? "सम्बंधित ख़बरें (RELATED)" : "Related Stories",
    noRelated: languageMode === "hi" ? "कोई सम्बंधित खबर नहीं मिली" : "No related stories found",
    trustTitle: languageMode === "hi" ? "पत्रकारिता के उच्च मानक" : "Rigorous Journalistic Standards",
    trustDesc: languageMode === "hi"
      ? "आईबीएन न्यूज 'भारतीय प्रेस परिषद' के मानदंडों का पालन करता है। तथ्यों की संपूर्ण पुष्टि के पश्चात ही समाचार प्रकाशित किए जाते हैं।"
      : "IBN News adheres to national press council code of ethics. All news items undergo rigorous sourcing verification before release.",
    trustLink: languageMode === "hi" ? "हमारी तथ्य-जांच नीति" : "Our Fact-Check Policy",
    reactions: languageMode === "hi" ? "प्रतिक्रियाएं" : "Reader Reactions",
    comments: languageMode === "hi" ? "टिप्पणियां" : "comments",
    noComments: languageMode === "hi" ? "अभी तक कोई टिप्पणी नहीं है। पहली प्रतिक्रिया आप लिखें!" : "No comments yet. Be the first to express your thoughts!",
    addComment: languageMode === "hi" ? "✍️ अपनी टिप्पणी दर्ज करें" : "✍️ Post a Reaction (Moderated)",
    doneComment: languageMode === "hi" 
      ? "✓ आपकी टिप्पणी सफलतापूर्वक दर्ज हो चुकी है! संपादकीय अनुमोदन (Editor approval) के बाद इसे वेबसाइट पर लाइव कर दिया जाएगा।"
      : "✓ Comment submitted successfully! It will be live after editorial approval.",
    name: languageMode === "hi" ? "नाम (Name)*" : "Name*",
    email: languageMode === "hi" ? "ईमेल (Email)*" : "Email*",
    body: languageMode === "hi" ? "टिप्पणी सामग्री (Your Comment)*" : "Comment Body*",
    submitBtn: languageMode === "hi" ? "समीक्षा के लिए भेजें" : "Submit for Bureau Review",
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 select-none">
        <Header />
        <BreakingStrip />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 flex-1 animate-pulse">
          <div className="h-4 w-32 rounded bg-zinc-200 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 w-3/4 rounded bg-zinc-200" />
              <div className="h-4 w-1/4 rounded bg-zinc-200" />
              <div className="aspect-video w-full rounded-2xl bg-zinc-200" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-zinc-200" />
                <div className="h-4 w-full rounded bg-zinc-200" />
                <div className="h-4 w-5/6 rounded bg-zinc-200" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-32 rounded-2xl bg-zinc-200" />
              <div className="h-48 rounded-2xl bg-zinc-200" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50">
        <Header />
        <main className="mx-auto w-full max-w-xl px-4 py-32 text-center flex-1">
          <span className="text-5xl">⚠️</span>
          <h1 className="text-xl font-black mt-4 text-zinc-950">{t.notFound}</h1>
          <p className="text-xs text-[var(--gray-text)] mt-2 font-semibold">{t.notFoundSub}</p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-[var(--apple-blue)] px-6 py-2.5 text-xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow text-xs font-black text-white">
            {t.notFoundBtn}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Related
  const relatedStories = articles.filter(
    (art) =>
      art.category === article.category &&
      art.id !== article.id &&
      art.status === "Published" &&
      !art.isDeleted
  ).slice(0, 3);

  // Approved Comments
  const approvedComments = comments.filter(
    (c) => c.articleId === article.id && c.status === "approved"
  );

  const displayTitle = languageMode === "hi" ? article.titleHindi : (article.titleEnglish || article.titleHindi);
  const displayContent = languageMode === "hi" ? article.content : (article.contentEnglish || article.content);

  const isHtml = /<[a-z][\s\S]*>/i.test(displayContent);

  // Helper to strip HTML for safe plain text paywall preview
  const stripHtml = (htmlStr: string) => {
    return htmlStr
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // Generate plain text paragraphs for preview
  const getPlainParagraphs = () => {
    const plainText = isHtml ? stripHtml(displayContent) : displayContent;
    return plainText.split("\n\n").map(p => p.trim()).filter(Boolean);
  };

  const plainParagraphs = getPlainParagraphs();
  const previewParagraphs = plainParagraphs.slice(0, 2);
  const canReadFullArticle = Boolean(session?.user);

  const safeHtml = useMemo(() => {
    // sanitize on the client only using DOMPurify dynamically
    if (!isHtml) return displayContent;
    if (typeof window === "undefined") return displayContent;
    // require DOMPurify at runtime to avoid server-side jsdom dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const DOMPurify = require("dompurify")((window as any).window || window);
    return DOMPurify.sanitize(displayContent);
  }, [displayContent, isHtml]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 flex-1">
        {/* Breadcrumbs */}
        <nav className="mb-4 text-4xs font-black uppercase tracking-widest text-[var(--gray-text)] flex items-center gap-1.5 select-none">
          <Link href="/" className="hover:text-[var(--apple-blue)]">{t.home}</Link>
          <span>/</span>
          <Link href={`/category/${article.category.toLowerCase().replace(" ", "-")}`} className="hover:text-[var(--apple-blue)]">
            {article.category}
          </Link>
          <span>/</span>
          <span className="text-zinc-950 truncate max-w-xs">{article.subcategory || t.news}</span>
        </nav>

        {/* Layout: Content Left, Sidebar widgets Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article sheet */}
          <div className="lg:col-span-2">
            <article className="rounded-2xl border border-[var(--border-color)] bg-white p-5 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              
              {/* Top toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4 mb-4">
                <div className="flex items-center gap-2 text-4xs font-black uppercase text-[var(--news-red)] tracking-widest">
                  <span className="rounded bg-red-50 border border-red-255 px-2 py-0.5 text-[var(--news-red)]">
                    {article.category}
                  </span>
                  {article.locationTag && (
                    <>
                      <span className="text-zinc-300">|</span>
                      <span className="text-[var(--apple-blue)] font-black">{article.locationTag}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 select-none">
                  {/* Font Resizer */}
                  <div className="flex items-center rounded-lg border border-[var(--border-color)] bg-zinc-50 p-0.5">
                    <button
                      onClick={() => setFontSize("normal")}
                      className={`px-2 py-0.5 text-2xs font-extrabold rounded ${fontSize === "normal" ? "bg-white shadow text-zinc-950 font-black" : "text-zinc-500"}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize("large")}
                      className={`px-2 py-0.5 text-xs font-extrabold rounded ${fontSize === "large" ? "bg-white shadow text-zinc-950 font-black" : "text-zinc-500"}`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setFontSize("xlarge")}
                      className={`px-2 py-0.5 text-sm font-extrabold rounded ${fontSize === "xlarge" ? "bg-white shadow text-zinc-950 font-black" : "text-zinc-500"}`}
                    >
                      A++
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={toggleBookmark}
                    className={`rounded-lg border border-[var(--border-color)] p-1.5 transition-colors cursor-pointer ${
                      isBookmarked
                        ? "bg-zinc-50 border-zinc-300 text-amber-500 shadow-sm"
                        : "bg-zinc-50 text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <svg className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="title-font text-2xl md:text-3xl font-black text-zinc-950 leading-tight mb-4">
                {displayTitle}
              </h1>

              {/* Authorship details */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-y border-zinc-100 py-3.5 mb-6 text-4xs text-[var(--gray-text)] font-extrabold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">{t.by}</span>
                  <span className="text-[var(--apple-blue)] font-black hover:underline cursor-pointer">
                    {article.correspondent 
                      ? article.correspondent 
                      : (article.authorId === "u2" ? "Rajesh Kumar" : article.authorId === "u3" ? "Vikram Singh" : "Azaan Ali Raza")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span>{t.pub} {new Date(article.publishDate).toLocaleDateString(languageMode === "hi" ? "hi-IN" : "en-US", { dateStyle: "medium" })}</span>
                  <span>&bull;</span>
                  <span>{article.readTime} {t.read}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-black">{t.verified}</span>
                </div>
              </div>

              {/* Featured Image */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 mb-6">
                <img
                  src={article.featuredImage}
                  alt="featured"
                  className="h-full w-full object-cover"
                />
              </div>

              <AdsPlaceholder slotType="in-content" />

              {/* Rich Body Paragraphs */}
              <div
                className={`prose max-w-none text-zinc-800 leading-relaxed font-semibold space-y-5 ${
                  fontSize === "normal"
                    ? "text-xs md:text-sm"
                    : fontSize === "large"
                    ? "text-sm md:text-base"
                    : "text-base md:text-lg"
                }`}
              >
                {!canReadFullArticle ? (
                  // Paywall view: show first 2 paragraphs in plain text
                  <>
                    {previewParagraphs.map((para, idx) => (
                      <p key={idx} className="whitespace-pre-line leading-relaxed">{para}</p>
                    ))}
                    
                    {plainParagraphs.length > 2 && (
                      <div className="rounded-2xl border border-[var(--border-color)] bg-zinc-50 p-5 text-center shadow-sm">
                        <p className="text-2xs font-bold text-zinc-700">
                          Log in to continue reading the full article.
                        </p>
                        <Link
                          href="/login"
                          className="mt-4 inline-flex rounded-full bg-[var(--apple-blue)] px-5 py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-colors"
                        >
                          Log in to unlock the rest
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  // Logged in: show full article (render as HTML or split plain text)
                  <>
                    {isHtml ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: safeHtml }} 
                        className="space-y-5 prose max-w-none text-zinc-800 font-semibold select-text prose-headings:font-black prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2.5 prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-2 prose-h4:text-xs prose-h4:mt-3 prose-h4:mb-1.5 prose-p:leading-relaxed prose-a:text-[var(--apple-blue)] prose-a:font-black prose-a:underline hover:prose-a:text-[var(--apple-blue-hover)] prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-blockquote:border-l-4 prose-blockquote:border-zinc-300 prose-blockquote:pl-4 prose-blockquote:italic"
                      />
                    ) : (
                      plainParagraphs.map((para, idx) => (
                        <p key={idx} className="whitespace-pre-line leading-relaxed">{para}</p>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* Social Share Sheet */}
              <div className="mt-8 border-t border-zinc-100 pt-6">
                <h4 className="text-4xs font-black uppercase tracking-widest text-zinc-400 mb-3.5 select-none">
                  {languageMode === "hi" ? "इस खबर को अपने दोस्तों के साथ साझा करें:" : "SHARE THIS NEWS BULLETIN:"}
                </h4>
                
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(displayTitle + " - " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4.5 py-2 text-3xs font-black text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://telegram.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(displayTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-sky-500 px-4.5 py-2 text-3xs font-black text-white hover:bg-sky-600 transition-colors"
                  >
                    <span>Telegram</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-[var(--apple-blue)] px-4.5 py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-colors shadow-sm"
                  >
                    <span>Facebook</span>
                  </a>
                </div>
              </div>

              {/* Author bio box */}
              <AuthorBio authorId={article.authorId} />

            </article>

            {/* Simulated comments feed panel */}
            <section className="mt-8 rounded-2xl border border-[var(--border-color)] bg-white p-5 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <h3 className="title-font text-xs font-black text-zinc-950 border-b border-zinc-100 pb-3 mb-6 select-none">
                {t.reactions} ({approvedComments.length} {t.comments})
              </h3>

              {approvedComments.length === 0 ? (
                <div className="py-8 text-center text-2xs text-zinc-400 font-bold">
                  {t.noComments}
                </div>
              ) : (
                <div className="space-y-4 mb-8 select-none">
                  {approvedComments.map((c) => (
                    <div key={c.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xs font-black text-zinc-800">
                          {c.author}
                        </span>
                        <span className="text-5xs font-bold text-[var(--gray-text)]">
                          {new Date(c.date).toLocaleDateString("hi-IN")}
                        </span>
                      </div>
                      <p className="mt-2 text-2xs text-zinc-600 font-semibold leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Form submit comments */}
              <div className="rounded-xl border border-[var(--border-color)] bg-zinc-50 p-5">
                <h4 className="text-3xs font-black text-zinc-950 uppercase mb-3.5 tracking-wider select-none">
                  {t.addComment}
                </h4>
                
                {commentSubmitted ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-250 p-4 text-xs text-emerald-700 font-black text-center">
                    {t.doneComment}
                  </div>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="space-y-3.5">
                    {session?.user ? (
                      /* Authenticated commenting identity card */
                      <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-3.5 select-none mb-3">
                        <img
                          src={session.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                          alt="avatar"
                          className="h-8 w-8 rounded-full object-cover border border-zinc-150 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-3xs font-black text-zinc-950 leading-tight">Commenting as {session.user.name}</span>
                          <span className="block text-5xs text-zinc-400 font-bold mt-0.5">{session.user.email}</span>
                        </div>
                        <span className="rounded bg-emerald-50 border border-emerald-250 px-2 py-0.5 text-5xs font-black text-emerald-700 uppercase shrink-0">Verified Profile</span>
                      </div>
                    ) : (
                      /* Guest commenter credentials card */
                      <div className="space-y-2">
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5 select-none">
                          <span className="text-base leading-none">💡</span>
                          <div className="text-4xs text-amber-800 font-semibold leading-normal">
                            You are commenting as a guest. <Link href="/login" className="text-[var(--apple-blue)] font-black hover:underline">Log in with Google</Link> to automatically post comments under your verified account with zero typing!
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.name}</label>
                            <input
                              type="text"
                              required
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              placeholder="Your Name"
                              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.email}</label>
                            <input
                              type="email"
                              required
                              value={commentEmail}
                              onChange={(e) => setCommentEmail(e.target.value)}
                              placeholder="email@example.com"
                              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-5xs font-black uppercase text-zinc-500 mb-1">{t.body}</label>
                      <textarea
                        required
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write comment details..."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs text-zinc-800 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-[var(--apple-blue)] px-6 py-2 text-xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-sm"
                    >
                      {t.submitBtn}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>

          {/* Right sidebar column widgets */}
          <div className="space-y-6">
            
            {/* Related articles list widget */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-white p-4">
              <h3 className="text-3xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-100 pb-2.5 mb-3 select-none">
                {t.relatedTitle}
              </h3>
              
              {relatedStories.length === 0 ? (
                <div className="py-4 text-center text-4xs text-zinc-400 font-bold">{t.noRelated}</div>
              ) : (
                <div className="space-y-3">
                  {relatedStories.map((art) => {
                    const rTitle = languageMode === "hi" ? art.titleHindi : (art.titleEnglish || art.titleHindi);

                    return (
                      <Link
                        key={art.id}
                        href={`/article/${art.slug}`}
                        className="group flex gap-2.5 items-center p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                      >
                        <img
                          src={art.featuredImage}
                          alt="thumb"
                          className="h-12 w-16 object-cover rounded bg-zinc-100 shrink-0 border"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-5xs text-[var(--news-red)] font-black tracking-widest uppercase">{art.subcategory}</span>
                          <h4 className="text-3xs font-extrabold text-zinc-950 line-clamp-2 leading-tight group-hover:text-[var(--apple-blue)] transition-colors mt-0.5">
                            {rTitle}
                          </h4>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar ad placeholder widget */}
            <AdsPlaceholder slotType="sidebar-box" />

            {/* Journalistic trust badge card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
              <span className="text-xl">🛡️</span>
              <h4 className="text-3xs font-black text-zinc-950 uppercase mt-2 select-none">{t.trustTitle}</h4>
              <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal max-w-xs mx-auto font-semibold">
                {t.trustDesc}
              </p>
              <Link href="/editorial" className="mt-3.5 inline-block text-[10px] font-black text-[var(--apple-blue)] uppercase hover:underline">
                {t.trustLink} &rarr;
              </Link>
            </div>
            
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
