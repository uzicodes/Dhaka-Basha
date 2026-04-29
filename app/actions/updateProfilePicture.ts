"use server";
import prisma from "@/src/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(imageUrl: string) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { clerkId: clerkUserId },
        data: { profileImage: imageUrl },
    });

    revalidatePath("/profile");
    return { success: true };
}