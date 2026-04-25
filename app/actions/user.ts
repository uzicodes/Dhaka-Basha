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
      phone: true,
      address: true,
    },
  });

  return user;
}

export async function updateUserProfile(data: { phone: string; address: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const updatedUser = await prisma.user.update({
    where: {
      clerkId: userId,
    },
    data: {
      phone: data.phone,
      address: data.address,
    },
  });

  return { success: true, user: updatedUser };
}
