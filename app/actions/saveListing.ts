"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/src/lib/db";

export async function toggleSaveListing(
  listingId: string,
  pathname: string,
  _formData?: FormData,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.userId === user.id) {
    throw new Error("You cannot save your own listing");
  }

  const savedListing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  const isSaved = !savedListing;

  if (savedListing) {
    await prisma.savedListing.delete({
      where: { userId_listingId: { userId: user.id, listingId } },
    });
  } else {
    await prisma.savedListing.create({
      data: { userId: user.id, listingId },
    });
  }

  revalidatePath(pathname);

  return { success: true, isSaved };
}

export async function checkIfSaved(listingId: string) {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return false;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });

  if (!listing || listing.userId === user.id) {
    return false;
  }

  const savedListing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  return Boolean(savedListing);
}