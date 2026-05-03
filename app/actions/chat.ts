"use server";

import prisma from "@/src/lib/db";
import pusher from "@/src/lib/pusher";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


// UPSTASH REDIS: Rate Limiter Setup
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// (5 messages per 1 minute)
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "dhakabasha:ratelimit:chat",
});

// ------------------------------------------------------------------
// HELPER Function : Gets the current user (prevent repeating)
// ------------------------------------------------------------------
async function getAuthenticatedUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized: No Clerk session");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, name: true, profileImage: true },
  });

  if (!currentUser) throw new Error("Unauthorized: User not found in database");
  return currentUser;
}

// ------------------------------------------------------------------
// ACTIONS
// ------------------------------------------------------------------

// Get/Create conversation between two users
export async function getOrCreateConversation(otherUserId: string) {
  const currentUser = await getAuthenticatedUser();

  // Check convo already exists?
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: currentUser.id, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: currentUser.id },
      ],
    },
  });

  // If not? create one
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        user1Id: currentUser.id,
        user2Id: otherUserId,
      },
    });
  }

  return conversation;
}

// Send a message in a conversation
export async function sendMessage(conversationId: string, content: string) {
  const currentUser = await getAuthenticatedUser();
  if (!content.trim()) throw new Error("Message cannot be empty");

  // Check the rate limit 
  const { success } = await ratelimit.limit(currentUser.id);

  if (!success) {
    throw new Error("আপনি খুব দ্রুত মেসেজ পাঠাচ্ছেন। কিছুক্ষণ পর আবার চেষ্টা করুন। (Rate limit exceeded)");
  }

  // Use $transaction to ensure both DB updates happen simultaneously safely
  const [newMessage] = await prisma.$transaction([
    prisma.message.create({
      data: {
        content: content.trim(),
        senderId: currentUser.id,
        conversationId,
      },
      include: {
        sender: {
          select: { id: true, name: true, profileImage: true, clerkId: true },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  ]);

  // Trigger Pusher event for real-time updates
  await pusher.trigger(conversationId, "new-message", newMessage);

  return newMessage;
}

// Get all conversations for the current user
export async function getConversations() {
  const currentUser = await getAuthenticatedUser();

  const conversationsData = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: currentUser.id },
        { user2Id: currentUser.id },
      ],
    },
    include: {
      user1: { select: { id: true, name: true, profileImage: true, clerkId: true } },
      user2: { select: { id: true, name: true, profileImage: true, clerkId: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              senderId: { not: currentUser.id },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { conversations: conversationsData, currentUserId: currentUser.id };
}

// Get messages for a specific conversation
export async function getMessages(conversationId: string) {
  const currentUser = await getAuthenticatedUser();

  // Verify user is part of this conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { user1Id: currentUser.id },
        { user2Id: currentUser.id },
      ],
    },
    include: {
      user1: { select: { id: true, name: true, profileImage: true, clerkId: true, phone: true } },
      user2: { select: { id: true, name: true, profileImage: true, clerkId: true, phone: true } },
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, profileImage: true, clerkId: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return { messages, conversation, currentUserId: currentUser.id };
}

// Delete Conversation
export async function deleteConversation(conversationId: string) {
  const currentUser = await getAuthenticatedUser();

  // Verify user is part of this conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { user1Id: currentUser.id },
        { user2Id: currentUser.id },
      ],
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  // Use $transaction to delete messages BEFORE deleting the conversation safely
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { conversationId } }),
    prisma.conversation.delete({ where: { id: conversationId } })
  ]);

  return { success: true };
}

// count of unread messages (current user) 
export async function getUnreadMessageCount() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return 0;

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!currentUser) return 0;

  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderId: { not: currentUser.id },
      conversation: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
      },
    },
  });

  return count;
}

// Mark all messages in a conversation as read 
export async function markMessagesAsRead(conversationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return;

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!currentUser) return;

  await prisma.message.updateMany({
    where: {
      conversationId,
      isRead: false,
      senderId: { not: currentUser.id },
    },
    data: { isRead: true },
  });
}