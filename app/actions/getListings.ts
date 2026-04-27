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

export async function deleteUserListing(listingId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const result = await prisma.listing.deleteMany({
      where: {
        id: listingId,
        userId: user.id,
      },
    });

    if (result.count === 0) {
      throw new Error("Listing not found or not owned by user");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user listing:", error);
    throw error;
  }
}

export async function getUserListingById(listingId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        user: {
          clerkId: userId,
        },
      },
    });

    return listing;
  } catch (error) {
    console.error("Error fetching user listing by id:", error);
    return null;
  }
}

export async function updateUserListing(
  listingId: string,
  data: {
    title: string;
    rentPrice: number;
    propertyType: string;
    location: string;
    rentFrom: string;
    address: string;
    contactInfo: string;
    mapLink?: string;
    images: string[];
    subLocation?: string;
  },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const result = await prisma.listing.updateMany({
      where: {
        id: listingId,
        userId: user.id,
      },
      data: {
        title: data.title,
        rentPrice: data.rentPrice,
        propertyType: data.propertyType,
        location: data.location,
        rentFrom: data.rentFrom,
        address: data.address,
        contactInfo: data.contactInfo,
        mapLink: data.mapLink || null,
        images: data.images,
        subLocation: data.subLocation || null,
      },
    });

    if (result.count === 0) {
      throw new Error("Listing not found or not owned by user");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user listing:", error);
    return { success: false, error: error.message || "Failed to update listing" };
  }
}
