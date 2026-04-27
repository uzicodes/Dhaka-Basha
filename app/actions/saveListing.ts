"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/src/lib/db";

export async function toggleSaveListing(listingId: string, pathname: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const savedListing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  const isSaved = !savedListing;

  if (savedListing) {
    await prisma.savedListing.delete({
      where: { userId_listingId: { userId, listingId } },
    });
  } else {
    await prisma.savedListing.create({
      data: { userId, listingId },
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

  const savedListing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  return Boolean(savedListing);
}