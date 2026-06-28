"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import { getSafeAvatarSrc } from "@/lib/avatar";

interface AuthorBioProps {
  authorId: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({ authorId }) => {
  const { users, languageMode } = useApp();
  const defaultAuthor = {
    id: "u1",
    name: "Azaan Ali Raza",
    email: "editor@ibnnewshindi.in",
    role: "Admin" as const,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    storiesCount: 42
  };
  const author = users.find((u) => u.id === authorId) || users[0] || defaultAuthor;

  const t = {
    verified: languageMode === "hi" ? "सत्यापित समाचार लेखक" : "Verified Staff Writer",
    published: languageMode === "hi" ? "लेख प्रकाशित" : "Stories Published",
    certified: languageMode === "hi" ? "सत्यापित समाचार लेखक • IBN NETWORK" : "Verified Journalist • IBN NETWORK",
    factchecked: languageMode === "hi" ? "तथ्य-जांच" : "Fact-Checked",
    bio: author.bio || (languageMode === "hi"
      ? `${author.name} मेरठ ब्यूरो के एक वरिष्ठ पत्रकार हैं जो पश्चिमी उत्तर प्रदेश की अपराध, राजनीति, जन कल्याणकारी योजनाओं और किसान आंदोलन से जुड़ी ग्राउंड रिपोर्ट्स को करीब से कवर करते हैं। उनके पास क्षेत्रीय पत्रकारिता में 8 वर्षों से अधिक का अनुभव है।`
      : `${author.name} is a senior staff journalist at the Meerut Bureau, closely covering crime, regional politics, civic developments, and farmer agitations across Western Uttar Pradesh. Holds over 8 years of newsroom experience.`),
  };

  return (
    <div className="my-8 rounded-2xl border border-[var(--border-color)] bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Avatar */}
        <img
          src={getSafeAvatarSrc(author.avatar, author.name)}
          loading="lazy"
          alt={author.name}
          className="h-14 w-14 rounded-full border border-[var(--border-color)] object-cover shadow-sm bg-zinc-100"
        />

        {/* Bio information */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-black text-zinc-950">
              {author.name}
            </h4>
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-4xs font-bold uppercase tracking-wider text-zinc-600">
              {author.role}
            </span>
            <span className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-4xs font-black uppercase text-emerald-700">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              {t.factchecked}
            </span>
          </div>

          <p className="mt-2 text-2xs text-zinc-500 leading-relaxed font-semibold">
            {t.bio}
          </p>

          <div className="mt-4 flex items-center justify-between text-4xs font-bold text-[var(--apple-blue)] uppercase tracking-wider">
            <Link href={`/search?q=${encodeURIComponent(author.name)}`} className="hover:underline flex items-center gap-1 font-black">
              <span>{author.storiesCount} {t.published}</span>
              <span>&rarr;</span>
            </Link>
            <span className="text-zinc-400 font-bold">{t.certified}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthorBio;
