"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { sendMessage } from "@/app/actions/chat";
import Link from "next/link";

type MessageType = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    profileImage: string | null;
    clerkId: string;
  };
};

type OtherUser = {
  id: string;
  name: string | null;
  profileImage: string | null;
  clerkId: string;
};

export default function ChatRoomClient({
  initialMessages,
  conversationId,
  currentUserId,
  otherUser,
}: {
  initialMessages: MessageType[];
  conversationId: string;
  currentUserId: string;
  otherUser: OtherUser;
}) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Pusher subscription for real-time updates
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(conversationId);

    channel.bind("new-message", (data: MessageType) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((msg) => msg.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(conversationId);
      pusher.disconnect();
    };
  }, [conversationId]);

  // Send message handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, input);
      setInput("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "আজ";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "গতকাল";
    } else {
      return date.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0 sticky top-0 z-10 shadow-sm">
        <Link 
          href="/inbox" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2d79f3]/10 shrink-0 relative shadow-sm">
          {otherUser.profileImage ? (
            <img
              src={otherUser.profileImage}
              alt={otherUser.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" title="Online"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[#151717] font-bold text-base truncate">
            {otherUser.name || "ব্যবহারকারী"}
          </h2>
          <p className="text-[11px] text-green-600 font-medium leading-tight">অনলাইন</p>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-[#2d79f3] hover:bg-blue-50 rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 text-slate-400 hover:text-[#2d79f3] hover:bg-blue-50 rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#2d79f3]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              কোনো ম্যাসেজ নেই। কথোপকথন শুরু করুন!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isOwn = msg.senderId === currentUserId;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isSameDay = prevMsg && new Date(msg.createdAt).toDateString() === new Date(prevMsg.createdAt).toDateString();
              const isSameSender = prevMsg && prevMsg.senderId === msg.senderId && isSameDay;

              return (
                <div key={msg.id} className="space-y-4">
                  {!isSameDay && (
                    <div className="flex justify-center">
                      <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider shadow-sm border border-slate-100">
                        {formatDateLabel(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isSameSender ? "-mt-4" : ""}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        isOwn
                          ? "bg-[#2d79f3] text-white rounded-[20px] rounded-tr-[4px]"
                          : "bg-white text-[#151717] border border-slate-100 rounded-[20px] rounded-tl-[4px]"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <div
                        className={`flex items-center gap-1.5 mt-1 ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className={`text-[10px] ${isOwn ? "text-blue-100/80" : "text-slate-400"}`}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <svg className="w-3.5 h-3.5 text-blue-100/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-slate-100 p-4 shrink-0">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto"
        >
          <button 
            type="button"
            className="mb-1 p-2.5 text-slate-400 hover:text-[#2d79f3] hover:bg-blue-50 rounded-full transition-all shrink-0"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef as any}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="আপনার ম্যাসেজ লিখুন..."
              className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-5 py-3 text-sm text-[#151717] focus:outline-none focus:border-[#2d79f3] focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 resize-none max-h-32"
              disabled={isSending}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className={`mb-1 w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${
              !input.trim() || isSending
                ? "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                : "bg-[#2d79f3] text-white hover:bg-blue-600 hover:shadow-blue-500/20 active:scale-95"
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 rotate-45 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          শিফট + এন্টার দিয়ে নতুন লাইন লিখুন
        </p>
      </div>
    </div>
  );
}
