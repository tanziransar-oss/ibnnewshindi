"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { getSafeAvatarSrc } from "@/lib/avatar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, comments, articles } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active status counts
  const pendingCommentsCount = comments.filter(c => c.status === "pending").length;
  const draftsCount = articles.filter(art => art.status === "Draft" && !art.isDeleted).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full max-w-full overflow-hidden overflow-x-hidden bg-zinc-50 font-sans text-zinc-900">
      
      {/* Mobile Header Bar */}
      <header className="flex h-14 w-full flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] bg-white px-4 text-zinc-900 lg:hidden shadow-sm">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1 text-zinc-600 hover:text-zinc-900"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-black tracking-tight text-xs uppercase text-[var(--apple-blue)]">IBN News CMS</span>
        <Link
          href="/"
          className="rounded-full border p-1.5 text-zinc-600 hover:text-[var(--apple-blue)] bg-zinc-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </header>

      {/* Rebuilt Pure White Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-[var(--border-color)] bg-white text-zinc-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Banner */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-color)] px-6 select-none">
          <Link href="/admin" className="flex items-baseline gap-1 font-bold">
            <span className="text-xl font-black text-zinc-950">IBN <span className="text-[var(--news-red)]">CMS</span></span>
            <span className="rounded bg-[var(--news-red)] px-1.5 py-0.5 text-5xs font-black text-white uppercase tracking-widest">
              CONSOLE
            </span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 text-zinc-400 hover:text-zinc-800 lg:hidden text-lg"
          >
            &times;
          </button>
        </div>

        {/* Sidebar Nav (Administrative nodes) */}
        <div className="flex-1 overflow-y-auto px-4 py-6 text-2xs font-bold text-zinc-600 space-y-4 select-none">
          <div>
            <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">SYSTEM</div>
            <div className="space-y-1">
              <span className="flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-zinc-50 px-3 py-2 text-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-blue)]" />
                <span>Console active</span>
              </span>
            </div>
          </div>

          <div>
            <div className="mb-2 px-2 text-[9px] font-black uppercase tracking-widest text-zinc-400">BULLETINS STATUS</div>
            <div className="space-y-1.5 px-2 text-3xs font-extrabold uppercase text-zinc-500">
              <div className="flex justify-between items-center">
                <span>Drafts Pending:</span>
                <span className="rounded-full border border-[var(--border-color)] bg-white px-2 py-0.5 text-zinc-800">{draftsCount}</span>
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span>Pending Comments:</span>
                <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-black text-[var(--news-red)]">{pendingCommentsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom User Profile block (Pure white card frame) */}
        <div className="border-t border-[var(--border-color)] bg-zinc-50 p-4">
          <div className="flex items-center gap-3">
            {currentUser.avatar ? (
              <img
                src={getSafeAvatarSrc(currentUser.avatar, currentUser.name)}
                alt={currentUser.name}
                className="h-9 w-9 shrink-0 rounded-full border border-[var(--border-color)] object-cover bg-zinc-100"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-2xs font-black leading-tight text-zinc-950">
                {currentUser.name}
              </h4>
              <span className="mt-1 inline-block rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[8px] font-black uppercase text-[var(--news-red)]">
                {currentUser.role}
              </span>
            </div>
            <Link
              href="/"
              title="Go to Website"
              className="rounded-full border border-[var(--border-color)] bg-white p-1.5 text-zinc-500 transition-all hover:text-[var(--apple-blue)] hover:bg-zinc-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
      
    </div>
  );
}
