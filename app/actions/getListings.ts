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

export async function getRecentListings() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to recent 20 for performance
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    });
    return listings;
  } catch (error) {
    console.error("Error fetching recent listings:", error);
    return [];
  }
}
