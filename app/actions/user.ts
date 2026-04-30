"use server";

import prisma from "@/src/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getUserProfile() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      name: true,
      phone: true,
      address: true,
      profileImage: true,
      createdAt: true,
    },
  });

  return user;
}

export async function updateUserProfile(data: { name: string; phone: string; address: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: {
      clerkId: userId,
    },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
    },
  });

  return { success: true, user: updatedUser };
}
