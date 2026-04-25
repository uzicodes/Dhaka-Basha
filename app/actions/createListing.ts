"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/db";

export async function createListing(data: any) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.listing.create({
      data: {
        ...data,
        user: {
          connect: { clerkId: userId }
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating listing:", error);
    return { success: false, error: error.message || "Failed to create listing" };
  }
}
