"use client";

import { useState } from "react";

interface SectionItem {
  id: string;
  title: string;
}

interface PostContentsProps {
  sections: SectionItem[];
}

export default function PostContents({ sections }: PostContentsProps) {
  const [open, setOpen] = useState(true);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        className="w-full flex items-center justify-between px-5 py-4"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="text-base font-semibold text-gray-900">Post Contents</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <nav className="px-5 pb-4 space-y-3">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleClick(s.id)}
              className="block text-left w-full text-sm text-gray-700 hover:text-[#FF6B6B]"
            >
              <span className="font-medium mr-1">{i + 1}.</span> {s.title}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}


