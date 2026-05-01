"use client";

import { getConversations, deleteConversation } from "@/app/actions/chat";
import Link from "next/link";
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
      description: "এটি আর ফিরে পাওয়া যাবে না।",
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
      <main className="grow flex flex-col items-center justify-center bg-[#daf2e0] pt-32 pb-12 min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-32 pb-12 min-h-screen">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2d79f3] transition-colors w-fit group"
          >
            <div className="p-2 bg-white rounded-full border border-[#ecedec] group-hover:border-[#2d79f3] group-hover:bg-blue-50 transition-all shadow-sm">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-sm font-medium">প্রোফাইলে ফিরে যান</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-[#151717]">
            ম্যাসেজ সমূহ
          </h1>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white p-8 rounded-[20px] shadow-sm border border-[#ecedec] text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-slate-500 text-sm">আপনার কোনো কথোপকথন নেই।</p>
            <p className="text-slate-400 text-xs mt-1">টু-লেট পোস্টে মেসেজ পাঠিয়ে কথোপকথন শুরু করুন।</p>
          </div>
        ) : (
          <div className="space-y-2">
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
                <div key={convo.id} className="relative">
                  <Link
                    href={`/inbox/${convo.id}`}
                    className="block bg-white p-4 rounded-[16px] border border-[#ecedec] shadow-sm hover:border-[#2d79f3] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                        {otherUser.profileImage ? (
                          <img
                            src={otherUser.profileImage}
                            alt={otherUser.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-[#151717] truncate">
                            {otherUser.name || "ব্যবহারকারী"}
                          </h3>
                          <div className="flex flex-col items-end shrink-0 ml-2">
                            {lastMessageTime && (
                              <span className="text-xs text-slate-400">
                                {lastMessageTime}
                              </span>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, convo.id)}
                              disabled={isPending}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete conversation"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-sm text-slate-500 truncate flex-1 pr-4">
                            {lastMessage?.content || "কোনো ম্যাসেজ নেই"}
                          </p>
                          {convo._count?.messages > 0 && (
                            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shrink-0">
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
