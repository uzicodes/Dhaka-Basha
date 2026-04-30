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

  const conversations = await prisma.conversation.findMany({
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
    },
    orderBy: { updatedAt: "desc" },
  });

  return { conversations, currentUserId: currentUser.id };
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
