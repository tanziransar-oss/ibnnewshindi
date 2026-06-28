"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { authClient } from "@/lib/auth-client";
import { canAccessAdminPanel, normalizeRole } from "@/lib/roles";
import { getSafeAvatarSrc } from "@/lib/avatar";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, categories, languageMode, setLanguageMode, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const resolvedProfile = currentUser;
  const canOpenAdminConsole = session?.user ? canAccessAdminPanel(resolvedProfile.role) : false;

  const handleLogout = async () => {
    try {
      await (authClient as any).signOut();
    } finally {
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      router.refresh();
    }
  };

  const formattedDate = new Date().toLocaleDateString(
    languageMode === "hi" ? "hi-IN" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Translation copy dictionary
  const t = {
    about: languageMode === "hi" ? "हमारे बारे में" : "About Us",
    contact: languageMode === "hi" ? "संपर्क करें" : "Contact Us",
    submitNews: languageMode === "hi" ? "ख़बर भेजें (WhatsApp)" : "Submit News (WhatsApp)",
    cmsPanel: languageMode === "hi" ? "CMS पैनल" : "CMS Panel",
    weather: languageMode === "hi" ? "मेरठ: 32°C ☀️" : "Meerut: 32°C ☀️",
    home: languageMode === "hi" ? "होम" : "Home",
    video: languageMode === "hi" ? "वीडियो" : "Videos",
    search: languageMode === "hi" ? "खोजें" : "Search",
    login: languageMode === "hi" ? "लॉग इन" : "Login",
    signup: languageMode === "hi" ? "साइन अप" : "Sign Up",
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-white/95 backdrop-blur-md">
      {/* Top utility bar */}
      <div className="hidden border-b border-[var(--border-color)] bg-zinc-50 px-4 py-1.5 text-xs text-[var(--gray-text)] md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4 font-semibold">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formattedDate}
            </span>
            <span className="h-3 w-px bg-zinc-200" />
            <span className="flex items-center gap-1 text-[var(--news-red)] font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--news-red)]" />
              {t.weather}
            </span>
          </div>

          <div className="flex items-center gap-4 font-bold text-zinc-600">
            <Link href="/about" className="hover:text-[var(--apple-blue)] transition-colors">{t.about}</Link>
            <Link href="/contact" className="hover:text-[var(--apple-blue)] transition-colors">{t.contact}</Link>
            <Link href="/contact#tip-line" className="text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {t.submitNews}
            </Link>
          </div>
        </div>
      </div>

      {/* Main header block */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        {/* Mobile burger trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-zinc-800 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Brand Logo */}
        <div className="flex flex-col items-center md:items-start select-none">
          <Link href="/" className="group flex items-center gap-1.5 font-bold tracking-tight">
            <span className="text-2xl font-black text-black md:text-3xl leading-none">
              IBN <span className="text-[var(--news-red)]">NEWS</span>
            </span>
            <span className="rounded bg-[var(--news-red)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white self-center">
              HINDI
            </span>
          </Link>
          <span className="hidden text-[8px] tracking-[0.25em] uppercase text-[var(--gray-text)] md:block font-extrabold mt-0.5">
            MEERUT &bull; WEST UP &bull; NATIONAL
          </span>
        </div>

        {/* Categories Desktop Menu */}
        <nav className="hidden items-center gap-1.5 text-xs font-bold text-zinc-700 md:flex">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full hover:bg-zinc-50 transition-colors ${
              pathname === "/" ? "text-[var(--apple-blue)] bg-zinc-100/70" : ""
            }`}
          >
            {t.home}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.name.toLowerCase().replace(" ", "-")}`}
              className={`px-3 py-1.5 rounded-full hover:bg-zinc-50 transition-colors ${
                pathname === `/category/${cat.name.toLowerCase().replace(" ", "-")}`
                  ? "text-[var(--apple-blue)] bg-zinc-100/70"
                  : ""
              }`}
            >
              {languageMode === "hi" ? cat.nameHindi : cat.name}
            </Link>
          ))}
          <Link
            href="/video"
            className={`px-3 py-1.5 rounded-full hover:bg-zinc-50 transition-colors ${
              pathname === "/video" ? "text-[var(--apple-blue)] bg-zinc-100/70" : ""
            }`}
          >
            {t.video}
          </Link>
        </nav>

        {/* Right operations (Language + Search) */}
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 md:flex">
            {session?.user ? (
              <div className="relative flex items-center gap-2 font-sans">
                {canAccessAdminPanel(resolvedProfile.role) && (
                  <Link
                    href="/admin"
                    className="rounded-full bg-[var(--news-red)] px-2.5 py-0.5 text-[9px] font-black text-white hover:bg-[var(--news-red-hover)] transition-colors animate-pulse uppercase tracking-wider font-sans"
                  >
                    Admin Console
                  </Link>
                )}
                <button
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  className="h-7 w-7 overflow-hidden rounded-full border border-zinc-200 shadow-sm transition hover:ring-2 hover:ring-[var(--apple-blue)]/20"
                  aria-label="Open profile menu"
                >
                  <img
                    src={getSafeAvatarSrc(resolvedProfile.avatar || session?.user?.image, resolvedProfile.name)}
                    alt={resolvedProfile.name}
                    className="h-full w-full object-cover"
                    title={`${resolvedProfile.name} (${resolvedProfile.role})`}
                  />
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-9 z-50 min-w-44 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <div className="text-4xs font-black uppercase tracking-widest text-zinc-400">Signed in as</div>
                      <div className="mt-1 text-3xs font-black text-zinc-950">{resolvedProfile.name}</div>
                      <div className="text-5xs font-bold text-zinc-500">{resolvedProfile.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-xl bg-zinc-950 px-3 py-2 text-4xs font-black uppercase tracking-widest text-white transition hover:bg-zinc-800"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[var(--apple-blue)] px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-[var(--apple-blue-hover)] transition-colors uppercase tracking-wider"
              >
                {t.login}
              </Link>
            )}
          </div>

          {/* Small Cute Segmented Capsule Toggle */}
          <div className="flex items-center rounded-full border border-[var(--border-color)] bg-zinc-50 p-0.5 text-[9px] font-bold h-6 shadow-sm select-none">
            <button
              onClick={() => setLanguageMode("hi")}
              className={`rounded-full px-2 py-0.5 text-[9px] font-black transition-all cursor-pointer ${
                languageMode === "hi"
                  ? "bg-[var(--apple-blue)] text-white font-black scale-102"
                  : "text-[var(--gray-text)] hover:text-zinc-900"
              }`}
            >
              HI
            </button>
            <span className="text-zinc-200 px-0.5 font-normal text-[8px]">|</span>
            <button
              onClick={() => setLanguageMode("en")}
              className={`rounded-full px-2 py-0.5 text-[9px] font-black transition-all cursor-pointer ${
                languageMode === "en"
                  ? "bg-[var(--apple-blue)] text-white font-black scale-102"
                  : "text-[var(--gray-text)] hover:text-zinc-900"
              }`}
            >
              EN
            </button>
          </div>

          {/* Search Button */}
          <Link
            href="/search"
            className="rounded-full border border-[var(--border-color)] bg-zinc-50 p-2 text-zinc-600 hover:text-[var(--apple-blue)]"
            aria-label="Search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-color)] bg-white px-4 py-5 shadow-lg md:hidden">
          <nav className="flex flex-col gap-3.5 font-bold text-zinc-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 border-b border-zinc-100 hover:text-[var(--apple-blue)]"
            >
              {t.home}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.name.toLowerCase().replace(" ", "-")}`}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 border-b border-zinc-100 hover:text-[var(--apple-blue)]"
              >
                {languageMode === "hi" ? cat.nameHindi : cat.name}
              </Link>
            ))}
            <Link
              href="/video"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 border-b border-zinc-100 hover:text-[var(--apple-blue)]"
            >
              {t.video}
            </Link>
            <div className="flex flex-col gap-2 pt-3">
              {session?.user ? (
                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-2.5 font-sans">
                  <div className="flex items-center gap-2">
                    <img
                      src={getSafeAvatarSrc(resolvedProfile.avatar || session?.user?.image, resolvedProfile.name)}
                      alt={resolvedProfile.name}
                      className="h-8 w-8 rounded-full object-cover border border-zinc-200"
                    />
                    <div className="text-left">
                      <span className="block text-3xs font-black text-zinc-900 leading-tight">{resolvedProfile.name}</span>
                      <span className="block text-5xs font-black text-zinc-400 uppercase tracking-wider mt-0.5">{resolvedProfile.role}</span>
                    </div>
                  </div>
                  {canOpenAdminConsole && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-full bg-[var(--news-red)] px-3 py-1 text-[9px] font-black text-white hover:bg-[var(--news-red-hover)] uppercase tracking-wider font-sans"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-full bg-[var(--apple-blue)] py-1.5 text-center text-[10px] font-extrabold text-white uppercase tracking-wider"
                  >
                    {t.login}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-full bg-white border border-zinc-200 py-1.5 text-center text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider"
                  >
                    {t.signup}
                  </Link>
                </div>
              )}
              {canOpenAdminConsole && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full border border-[var(--news-red)] bg-[var(--news-red)] py-2 text-center text-[10px] font-extrabold text-white uppercase tracking-wider"
                >
                  Admin Console
                </Link>
              )}
              <div className="flex gap-2 justify-between">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-3xs text-[var(--gray-text)] py-2 border border-[var(--border-color)] rounded-full font-bold"
                >
                  {t.about}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-3xs text-[var(--gray-text)] py-2 border border-[var(--border-color)] rounded-full font-bold"
                >
                  {t.contact}
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
export default Header;
