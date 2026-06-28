"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context/AppContext";
import { authClient } from "@/lib/auth-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingStrip from "@/components/BreakingStrip";

export default function SignupPage() {
  const { languageMode } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    title: languageMode === "hi" ? "नया अकाउंट बनाएं" : "Create an Account",
    subtitle:
      languageMode === "hi"
        ? "गूगल के साथ एक क्लिक में सुरक्षित रूप से अपना नया अकाउंट सेटअप करें।"
        : "Set up your secure, passwordless user profile with one click using Google.",
    googleButton:
      languageMode === "hi" ? "गूगल के साथ साइन अप करें" : "Sign Up with Google",
    loading: languageMode === "hi" ? "रीडायरेक्ट किया जा रहा है..." : "Redirecting to Google...",
    securityNotice:
      languageMode === "hi"
        ? "सुरक्षित और त्वरित। पासवर्ड याद रखने की कोई आवश्यकता नहीं है।"
        : "100% secure. No passwords to remember or compromise.",
    footerDisclaimer:
      languageMode === "hi"
        ? "अकाउंट बनाकर आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं।"
        : "By signing up, you agree to our Terms of Service & Privacy Policy.",
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        rememberMe: true,
      } as any);
    } catch (submitError) {
      console.error("Google Auth failed:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : languageMode === "hi"
          ? "गूगल साइनअप विफल रहा।"
          : "Google signup failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <BreakingStrip />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16">
        <section className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-lg font-black text-[var(--apple-blue)]">
              +
            </div>
            <h1 className="title-font text-xl font-black text-zinc-950 tracking-tight">{t.title}</h1>
            <p className="mt-2 text-2xs font-medium text-[var(--gray-text)] leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-2xs font-bold text-[var(--news-red)]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white py-3 px-4 text-[11px] font-black text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100 disabled:opacity-50 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? t.loading : t.googleButton}</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 py-1 text-center text-4xs font-bold uppercase tracking-wider text-zinc-400">
              <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t.securityNotice}</span>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-5 text-center">
            <p className="text-4xs font-semibold leading-relaxed text-zinc-400">
              {t.footerDisclaimer}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
