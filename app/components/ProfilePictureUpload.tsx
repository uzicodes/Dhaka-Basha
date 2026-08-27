"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { updateProfileImage } from "@/app/actions/updateProfilePicture";

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  name?: string;
  onUploaded?: (url: string) => void;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  name = "User",
  onUploaded,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);

  useEffect(() => {
    setPreviewUrl(currentImageUrl ?? null);
  }, [currentImageUrl]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবিটি ৫MB এর চেয়ে বড়! (File too large)");
      return;
    }

    setIsUploading(true);
    let blobUrl: string | null = null;

    try {
      // 1. Compress the image
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
        fileType: "image/jpeg",
      };
      const compressedFile = await imageCompression(file, options);

      // Immediate local preview
      blobUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(blobUrl);

      // 2. Request presigned URL from Cloudflare R2
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ name: compressedFile.name || "avatar.jpg", type: compressedFile.type }],
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload ticket");
      const { results } = await res.json();
      if (!results || results.length === 0) throw new Error("Invalid upload response");

      const { signedUrl, publicUrl } = results[0];

      // 3. Upload file directly to Cloudflare R2
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": compressedFile.type,
        },
        body: compressedFile,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to storage");

      // 4. Save the new public URL via Server Action
      const result = await updateProfileImage(publicUrl);
      if (!result.success) {
        throw new Error(result.error || "Failed to update profile picture");
      }

      // Broadcast event so Navbar and other components update immediately without a full reload
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("profile-updated", { detail: { profileImage: publicUrl } })
        );
      }

      toast.success("প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!");
      onUploaded?.(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("ছবি আপলোড করতে সমস্যা হয়েছে। (Upload failed)");
      setPreviewUrl(currentImageUrl ?? null);
    } finally {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group shrink-0">
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[#EBE3A7]/20 text-[#2E2910] border-2 border-slate-200 shadow-md flex items-center justify-center font-bold text-3xl">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={name || "User"}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover"
            unoptimized={previewUrl.startsWith("blob:")}
          />
        ) : (
          name?.[0]?.toUpperCase() || "U"
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Change Photo Trigger */}
      <label
        htmlFor="avatar-upload-input"
        className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-[#2E2910] hover:bg-[#2C5745] text-[#EB7D00] shadow-md border-2 border-white transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="ছবি পরিবর্তন করুন"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          id="avatar-upload-input"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
}