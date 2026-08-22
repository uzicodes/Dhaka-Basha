"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getOrCreateConversation } from "@/app/actions/chat";

export default function StartChatButton({
  landlordId,
}: {
  landlordId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const conversation = await getOrCreateConversation(landlordId);
      router.push(`/inbox/${conversation.id}`);
    } catch (error: any) {
      console.error("StartChatButton error:", error);
      toast.error("মেসেজ পাঠাতে লগইন করুন");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold border-2 border-emerald-600/30 bg-emerald-50/50 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-100/70 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-2xs"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>লোড হচ্ছে...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>মেসেজ দিন</span>
        </>
      )}
    </button>
  );
}
