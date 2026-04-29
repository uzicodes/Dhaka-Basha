"use client";

import { useState } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { updateProfileImage } from "@/app/actions/updateProfilePicture";

interface ProfilePictureUploadProps {
    currentImageUrl?: string | null;
}

export default function ProfilePictureUpload({ currentImageUrl }: ProfilePictureUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    // This state allows us to instantly show the new picture to the user
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Strict 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            toast.error("ছবিটি ৫MB এর চেয়ে বড়! (File too large)");
            return;
        }

        setIsUploading(true);

        try {
            // 1. Compress the image (Squash it down to max 100KB)
            const options = {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 500,
                useWebWorker: true,
                fileType: "image/jpeg",
            };
            const compressedFile = await imageCompression(file, options);

            // Show immediate preview to the user so it feels fast
            setPreviewUrl(URL.createObjectURL(compressedFile));

            // 2. Ask backend for the Cloudflare R2 Presigned URL
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: [{ name: compressedFile.name || "avatar.jpg", type: compressedFile.type }],
                }),
            });

            if (!res.ok) throw new Error("Failed to get upload tickets");
            const data = await res.json();
            const { signedUrl, publicUrl } = data[0];

            // 3. Upload directly to Cloudflare
            const uploadRes = await fetch(signedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": compressedFile.type,
                },
                body: compressedFile, // Send the compressed file!
            });

            if (!uploadRes.ok) throw new Error("Failed to upload to Cloudflare");

            // 4. Save the new public URL to Neon via Server Action
            await updateProfileImage(publicUrl);

            toast.success("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("ছবি আপলোড করতে সমস্যা হয়েছে। (Upload failed)");
            // Revert preview if the upload fails
            setPreviewUrl(currentImageUrl || null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <label
                htmlFor="avatar-upload"
                className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 hover:border-[#2d79f3] transition-colors group"
            >
                {/* Background Image Preview */}
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Profile Avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-xs text-gray-400">ছবি নাই</span>
                )}

                {/* Black Overlay for Hover & Uploading State */}
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-200 
          ${isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                    {isUploading ? (
                        // Spinning Loading Icon
                        <svg className="h-6 w-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        // Camera Icon
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    )}
                </div>
            </label>

            {/* Hidden File Input */}
            <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
            />
        </div>
    );
}