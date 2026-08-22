"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ShareListingButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `ঢাকা-বাসা: ${title}`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("লিংক ক্লিপবোর্ডে কপি করা হয়েছে!");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error("লিংক কপি করা যায়নি");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 text-xs font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer"
      title="শেয়ার করুন"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-700 font-bold">কপি হয়েছে</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>শেয়ার</span>
        </>
      )}
    </button>
  );
}
