"use server";

import prisma from "@/src/lib/db";
import pusher from "@/src/lib/pusher";
import { auth } from "@clerk/nextjs/server";

// Get or create a conversation between two users
export async function getOrCreateConversation(otherUserId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!currentUser) throw new Error("User not found");

  // Check if conversation already exists (in either direction)
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: currentUser.id, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: currentUser.id },
      ],
    },
  });

  // If not, create one
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
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, name: true, profileImage: true },
  });
  if (!currentUser) throw new Error("User not found");

  if (!content.trim()) throw new Error("Message cannot be empty");

  const newMessage = await prisma.message.create({
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
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Trigger Pusher event for real-time updates
  await pusher.trigger(conversationId, "new-message", newMessage);

  return newMessage;
}

// Get all conversations for the current user
export async function getConversations() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!currentUser) throw new Error("User not found");

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
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!currentUser) throw new Error("User not found");

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
      user1: { select: { id: true, name: true, profileImage: true, clerkId: true } },
      user2: { select: { id: true, name: true, profileImage: true, clerkId: true } },
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
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!currentUser) throw new Error("User not found");

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

  await prisma.message.deleteMany({
    where: { conversationId },
  });

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  return { success: true };
}

// Get count of unread messages for the current user (messages sent by others that haven't been read)
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

// Mark all messages in a conversation as read (for messages not sent by the current user)
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
