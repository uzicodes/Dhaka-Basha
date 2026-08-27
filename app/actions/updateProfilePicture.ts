"use server";

import prisma from "@/src/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(imageUrl: string) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: { profileImage: imageUrl },
    });

    revalidatePath("/profile");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile image:", error);
    return { success: false, error: "Database update failed" };
  }
}