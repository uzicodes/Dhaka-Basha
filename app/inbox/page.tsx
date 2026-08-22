"use client";

import { getConversations, deleteConversation } from "@/app/actions/chat";
import { Loader } from "@/app/components/GlobalLoader";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

export default function InboxPage() {
  const { isLoaded, userId } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isLoaded && !userId) {
      redirect("/login?redirectUrl=/inbox");
    }
  }, [isLoaded, userId]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations);
      setCurrentUserId(data.currentUserId);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("ম্যাসেজ লোড করতে সমস্যা হয়েছে");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();

    toast("কথোপকথনটি মুছে ফেলবেন?", {
      description: "এটি আর ফিরে পাওয়া যাবে না।",
      action: {
        label: "মুছুন",
        onClick: () => {
          startTransition(async () => {
            toast.promise(deleteConversation(conversationId), {
              loading: "কথোপকথন মোছা হচ্ছে...",
              success: () => {
                setConversations((prev) => prev.filter((c) => c.id !== conversationId));
                return "কথোপকথনটি মুছে ফেলা হয়েছে";
              },
              error: "মুছে ফেলতে সমস্যা হয়েছে",
            });
          });
        },
      },
      cancel: {
        label: "বাতিল",
        onClick: () => {},
      },
    });
  };

  if (!isLoaded || isLoading) {
    return (
      <main className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center pt-28 pb-12">
        <Loader />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50/80 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-3xl px-4 sm:px-6 pt-28 md:pt-32 pb-20 space-y-6">
        
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="space-y-1">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>প্রোফাইলে ফিরে যান</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ম্যাসেজ ইনবক্স
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
                {conversations.length}টি
              </span>
            </div>
          </div>

          <Link
            href="/listings"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
          >
            টু-লেট খুঁজুন →
          </Link>
        </div>

        {/* CONVERSATION LIST */}
        {conversations.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">আপনার কোনো কথোপকথন নেই</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                পছন্দের টু-লেট পোস্টে গিয়ে &quot;মেসেজ দিন&quot; বাটনে ক্লিক করে সরাসরি মালিকের সাথে কথোপকথন শুরু করুন।
              </p>
            </div>
            <Link
              href="/listings"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              টু-লেট সমূহ দেখুন
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((convo) => {
              const otherUser = convo.user1Id === currentUserId ? convo.user2 : convo.user1;
              const lastMessage = convo.messages[0];
              const lastMessageTime = lastMessage
                ? new Date(lastMessage.createdAt).toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "short",
                })
                : "";

              return (
                <div key={convo.id} className="relative group">
                  <Link
                    href={`/inbox/${convo.id}`}
                    className="block bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5">
                      
                      {/* Avatar */}
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center text-slate-600 font-bold text-base">
                        {otherUser.profileImage ? (
                          <Image
                            src={otherUser.profileImage}
                            alt={otherUser.name || "User"}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          otherUser.name?.[0]?.toUpperCase() || "U"
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {otherUser.name || "ব্যবহারকারী"}
                          </h3>

                          <div className="flex items-center gap-2 shrink-0">
                            {lastMessageTime && (
                              <span className="text-[11px] font-medium text-slate-400">
                                {lastMessageTime}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, convo.id)}
                              disabled={isPending}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="কথোপকথন মুছুন"
                              aria-label="Delete conversation"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-xs text-slate-500 truncate flex-1 font-normal">
                            {lastMessage?.content || "কথোপকথন শুরু হয়েছে..."}
                          </p>
                          {convo._count?.messages > 0 && (
                            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full shrink-0">
                              {convo._count.messages}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
