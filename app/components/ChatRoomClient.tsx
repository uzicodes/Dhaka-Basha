"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Pusher from "pusher-js";
import { sendMessage, deleteConversation } from "@/app/actions/chat";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  phone?: string | null;
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isOnline] = useState(true); // placeholder
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(conversationId);

    channel.bind("new-message", (data: MessageType) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(conversationId);
      pusher.disconnect();
    };
  }, [conversationId]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, input);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      textareaRef.current?.focus();
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error.message || "ম্যাসেজ পাঠাতে সমস্যা হয়েছে");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    toast("এই কথোপকথনটি মুছে ফেলবেন?", {
      description: "এটি আর ফিরে পাওয়া যাবে না।",
      action: {
        label: "মুছুন",
        onClick: () => {
          startTransition(async () => {
            try {
              await deleteConversation(conversationId);
              toast.success("কথোপকথনটি মুছে ফেলা হয়েছে");
              router.push("/inbox");
            } catch (error) {
              toast.error("মুছে ফেলতে সমস্যা হয়েছে");
            }
          });
        },
      },
      cancel: {
        label: "বাতিল",
        onClick: () => { },
      },
    });
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

    if (date.toDateString() === today.toDateString()) return "আজ";
    if (date.toDateString() === yesterday.toDateString()) return "গতকাল";
    return date.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg, index) => {
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const isSameDay =
      prevMsg &&
      new Date(msg.createdAt).toDateString() ===
      new Date(prevMsg.createdAt).toDateString();
    const isSameSender =
      prevMsg &&
      prevMsg.senderId === msg.senderId &&
      isSameDay &&
      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000;

    return [
      ...groups,
      { ...msg, showDateSeparator: !isSameDay, isGrouped: !!isSameSender },
    ];
  }, [] as Array<MessageType & { showDateSeparator: boolean; isGrouped: boolean }>);

  const avatarInitial = otherUser.name ? otherUser.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

        .chat-root {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0f1117;
          position: relative;
          overflow: hidden;
        }

        /* Subtle noise texture overlay */
        .chat-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        /* ── HEADER ── */
        .chat-header {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          flex-shrink: 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          transition: all 0.2s ease;
          flex-shrink: 0;
          text-decoration: none;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.9);
          transform: translateX(-1px);
        }

        .avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .avatar-fallback {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: white;
          border: 2px solid rgba(255,255,255,0.1);
          letter-spacing: -0.3px;
        }
        .online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #0f1117;
        }

        .header-info {
          flex: 1;
          min-width: 0;
        }
        .header-name {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          truncate: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.2px;
        }
        .header-status {
          font-size: 11.5px;
          color: #22c55e;
          margin-top: 1px;
          font-weight: 400;
          letter-spacing: 0.1px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          position: relative;
        }
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.18s ease;
          text-decoration: none;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: #1c1f2b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 6px;
          z-index: 50;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: dropIn 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 9px;
          border: none;
          background: transparent;
          transition: background 0.15s;
          font-family: inherit;
        }
        .dropdown-item.danger {
          color: #f87171;
        }
        .dropdown-item.danger:hover {
          background: rgba(239,68,68,0.12);
        }
        .dropdown-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── MESSAGES ── */
        .messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
          z-index: 1;
          scroll-behavior: smooth;
        }
        .messages-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .messages-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }

        .date-separator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 16px;
        }
        .date-separator-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .date-separator-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.6px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .msg-row {
          display: flex;
          animation: msgIn 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-row.own { justify-content: flex-end; }
        .msg-row.other { justify-content: flex-start; }
        .msg-row.grouped { margin-top: 2px; }
        .msg-row:not(.grouped) { margin-top: 12px; }

        .bubble {
          max-width: min(75%, 380px);
          padding: 10px 14px;
          position: relative;
          word-break: break-word;
          white-space: pre-wrap;
        }

        /* Own bubble */
        .bubble.own {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 18px 18px 4px 18px;
          box-shadow: 0 4px 16px rgba(59,130,246,0.25);
        }
        /* Other bubble */
        .bubble.other {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.88);
          border-radius: 18px 18px 18px 4px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .bubble.grouped.own {
          border-radius: 18px 4px 4px 18px;
        }
        .bubble.grouped.other {
          border-radius: 4px 18px 18px 4px;
        }

        .bubble-text {
          font-size: 14px;
          line-height: 1.55;
          font-weight: 400;
          letter-spacing: 0.05px;
        }
        .bubble-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }
        .bubble-meta.own { justify-content: flex-end; }
        .bubble-meta.other { justify-content: flex-start; }
        .bubble-time {
          font-size: 10px;
          font-weight: 400;
        }
        .bubble.own .bubble-time { color: rgba(255,255,255,0.55); }
        .bubble.other .bubble-time { color: rgba(255,255,255,0.28); }

        .tick-icon { color: rgba(255,255,255,0.55); }

        /* Empty state */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding-bottom: 40px;
        }
        .empty-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.25);
        }
        .empty-label {
          font-size: 14px;
          color: rgba(255,255,255,0.25);
          font-weight: 400;
        }

        /* ── INPUT AREA ── */
        .input-area {
          position: relative;
          z-index: 10;
          padding: 12px 16px 16px;
          background: rgba(255,255,255,0.03);
          border-top: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }
        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 900px;
          margin: 0 auto;
        }
        .input-wrap {
          flex: 1;
          position: relative;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .input-wrap:focus-within {
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
        }
        .chat-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          padding: 11px 16px;
          font-size: 14px;
          color: rgba(255,255,255,0.88);
          font-family: inherit;
          font-weight: 400;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          line-height: 1.5;
          letter-spacing: 0.05px;
        }
        .chat-textarea::placeholder {
          color: rgba(255,255,255,0.22);
        }

        .attach-btn {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
          margin-bottom: 1px;
        }
        .attach-btn:hover {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
        }

        .send-btn {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          flex-shrink: 0;
          margin-bottom: 1px;
          font-family: inherit;
        }
        .send-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(59,130,246,0.35);
        }
        .send-btn.active:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(59,130,246,0.45);
        }
        .send-btn.active:active {
          transform: scale(0.96);
        }
        .send-btn.inactive {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }

        .input-hint {
          text-align: center;
          font-size: 10.5px;
          color: rgba(255,255,255,0.15);
          margin-top: 8px;
          letter-spacing: 0.1px;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="chat-root">
        {/* ── HEADER ── */}
        <header className="chat-header">
          <Link href="/inbox" className="back-btn">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="avatar-wrap">
            {otherUser.profileImage ? (
              <img src={otherUser.profileImage} alt={otherUser.name || "User"} className="avatar-img" />
            ) : (
              <div className="avatar-fallback">{avatarInitial}</div>
            )}
          </div>

          <div className="header-info">
            <div className="header-name">{otherUser.name || "ব্যবহারকারী"}</div>
          </div>

          <div className="header-actions" ref={menuRef}>
            {otherUser.phone && (
              <a href={`tel:${otherUser.phone}`} className="icon-btn" title="Call">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            )}
            <button className="icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item danger"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  কথোপকথন মুছুন
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── MESSAGES ── */}
        <div className="messages-scroll">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="empty-label">কথোপকথন শুরু করুন</p>
            </div>
          ) : (
            groupedMessages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;

              return (
                <div key={msg.id}>
                  {msg.showDateSeparator && (
                    <div className="date-separator">
                      <div className="date-separator-line" />
                      <span className="date-separator-label">{formatDateLabel(msg.createdAt)}</span>
                      <div className="date-separator-line" />
                    </div>
                  )}
                  <div className={`msg-row ${isOwn ? "own" : "other"} ${msg.isGrouped ? "grouped" : ""}`}>
                    <div className={`bubble ${isOwn ? "own" : "other"} ${msg.isGrouped ? "grouped" : ""}`}>
                      <p className="bubble-text">{msg.content}</p>
                      <div className={`bubble-meta ${isOwn ? "own" : "other"}`}>
                        <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                        {isOwn && (
                          <svg className="tick-icon" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT ── */}
        <div className="input-area">
          <form onSubmit={handleSend} className="input-row">
            <button type="button" className="attach-btn">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            <div className="input-wrap">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="ম্যাসেজ লিখুন..."
                className="chat-textarea"
                disabled={isSending}
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className={`send-btn ${!input.trim() || isSending ? "inactive" : "active"}`}
            >
              {isSending ? (
                <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 12a8 8 0 018-8" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>
          <p className="input-hint">Shift + Enter — নতুন লাইন</p>
        </div>
      </div>
    </>
  );
}