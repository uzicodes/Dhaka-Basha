"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { sendMessage } from "@/app/actions/chat";

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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
          {otherUser.profileImage ? (
            <img
              src={otherUser.profileImage}
              alt={otherUser.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-[#151717] font-bold text-base">
            {otherUser.name || "ব্যবহারকারী"}
          </h2>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f0f4f0]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-sm">
              কোনো ম্যাসেজ নেই। কথোপকথন শুরু করুন!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    isOwn
                      ? "bg-[#2d79f3] text-white rounded-br-md"
                      : "bg-white text-[#151717] border border-slate-100 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isOwn ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="আপনার ম্যাসেজ লিখুন..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-[#151717] focus:outline-none focus:border-[#2d79f3] transition-colors placeholder:text-slate-400"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="w-10 h-10 rounded-full bg-[#2d79f3] text-white flex items-center justify-center shrink-0 hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
