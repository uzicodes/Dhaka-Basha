"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/src/lib/db";

export async function getUserListings() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    const listings = await prisma.listing.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return listings;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return [];
  }
}
