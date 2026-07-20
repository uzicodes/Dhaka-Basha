"use client";

import "./chat/chat.css";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import { useEffect, useRef, useState, useTransition } from "react";
import Pusher from "pusher-js";
import { sendMessage, deleteConversation } from "@/app/actions/chat";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type MessageType = {
  id: string;
  content: string;
  createdAt: Date | string;
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

const formatTime = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  return date.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateLabel = (dateInput: Date | string) => {
  const date = new Date(dateInput);
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
    <div className="chat-root">
        <ChatHeader
          otherUser={otherUser}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          handleDelete={handleDelete}
          isPending={isPending}
          menuRef={menuRef}
        />
        <MessageList
          messages={messages}
          groupedMessages={groupedMessages}
          currentUserId={currentUserId}
          formatTime={formatTime}
          formatDateLabel={formatDateLabel}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput
          handleSend={handleSend}
          input={input}
          handleInputChange={handleInputChange}
          isSending={isSending}
          textareaRef={textareaRef}
        />
      </div>
  );
}

