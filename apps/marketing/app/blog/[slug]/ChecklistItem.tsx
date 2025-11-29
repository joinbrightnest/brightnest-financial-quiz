"use client";

import { useState, ReactNode } from "react";

interface ChecklistItemProps {
  bullet: string;
  idx: number;
  parsedContent: ReactNode;
}

export default function ChecklistItem({ bullet, idx, parsedContent }: ChecklistItemProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <li key={idx} className="flex items-start gap-3 cursor-pointer group" onClick={() => setIsChecked(!isChecked)}>
      <div className={`flex-shrink-0 w-5 h-5 mt-0.5 border-2 rounded-sm bg-white flex items-center justify-center transition-all hover:border-teal-500 hover:shadow-sm ${isChecked ? 'border-teal-600 bg-teal-50' : 'border-slate-400'}`}>
        {isChecked && (
          <svg className="w-3 h-3 text-teal-600 transition-all animate-in fade-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`flex-1 transition-all ${isChecked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
        {parsedContent}
      </span>
    </li>
  );
}

