"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import ImageUploadSection from "../components/post/ImageUploadSection";
import MonthPickerInput from "../components/post/MonthPickerInput";
import PropertyTypeSelect from "../components/post/PropertyTypeSelect";
import LocationSelect from "../components/post/LocationSelect";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams, redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { locations, propertyTypes } from "@/src/lib/constants";
import { createListing } from "@/app/actions/createListing";
import { getUserListingById, updateUserListing } from "@/app/actions/getListings";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// --- ZOD SCHEMA ---
const formSchema = z.object({
  title: z.string().min(5, "টাইটেল কমপক্ষে ৫ অক্ষরের হতে হবে").max(100, "টাইটেল ১০০ অক্ষরের বেশি হতে পারবে না"),
  rentPrice: z.string().min(3, "ভাড়ার পরিমাণ দিন"),
  propertyType: z.string().min(1, "প্রপার্টির ধরন নির্বাচন করুন"),
  location: z.string().min(1, "লোকেশন নির্বাচন করুন"),
  rentFrom: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "MM/YYYY ফরম্যাটে দিন (যেমন: 06/2026)"),
  address: z.string().min(5, "সম্পূর্ণ ঠিকানা দিন (বাড়ি, ব্লক, রাস্তা)"),
  contactInfo: z.string().min(11, "সঠিক মোবাইল নম্বর দিন").max(11, "সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)"),
  mapLink: z.string().optional(),
  images: z.array(z.string()),
  subLocation: z.string().optional(),
});

type PostFormValues = z.infer<typeof formSchema>;

const monthsBN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

function PostToLetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const listingId = searchParams.get("listingId");
  const isEditMode = Boolean(listingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [expandedLoc, setExpandedLoc] = useState("");
  const [isLoadingListing, setIsLoadingListing] = useState(isEditMode);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [listingError, setListingError] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const propertyTypeRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
      if (propertyTypeRef.current && !propertyTypeRef.current.contains(event.target as Node)) {
        setIsPropertyTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize React Hook Form 
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      rentPrice: "",
      propertyType: "",
      location: "",
      rentFrom: "",
      address: "",
      contactInfo: "",
      mapLink: "",
      images: [],
      subLocation: "",
    },
  });

  const selectedLocation = watch("location");
  const selectedSubLocation = watch("subLocation");

  if (listingError) {
    redirect("/profile");
  }

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const savedData = localStorage.getItem('savedPostData:v1');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.keys(parsed).forEach(key => {
          setValue(key as keyof PostFormValues, parsed[key]);
        });
      } catch (e) {
        console.error("Failed to parse saved data");
      }
    }
  }, [setValue, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !listingId) {
      setIsLoadingListing(false);
      return;
    }

    let isMounted = true;

    const loadListing = async () => {
      setIsLoadingListing(true);

      try {
        const listing = await getUserListingById(listingId);

        if (!listing) {
          toast.error("এই পোস্টটি খুঁজে পাওয়া যায়নি বা আপনার নয়।");
          setListingError(true);
          return;
        }

        reset({
          title: listing.title,
          rentPrice: String(listing.rentPrice),
          propertyType: listing.propertyType,
          location: listing.location,
          rentFrom: listing.rentFrom,
          address: listing.address,
          contactInfo: listing.contactInfo,
          mapLink: listing.mapLink ?? "",
          images: listing.images ?? [],
          subLocation: listing.subLocation ?? "",
        });
        setExistingImages(listing.images ?? []);
      } catch (error) {
        console.error("Failed to load listing for edit:", error);
        toast.error("পোস্টের তথ্য লোড করতে সমস্যা হয়েছে।");
        setListingError(true);
      } finally {
        if (isMounted) {
          setIsLoadingListing(false);
        }
      }
    };

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, listingId, reset, router]);

  // --- File selection handler (max 5 images total: existing + new) ---
  const totalImageCount = existingImages.length + selectedFiles.length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);

    // Filter out files exceeding 5MB
    const oversized = incoming.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    const validFiles = incoming.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      toast.error(
        `${oversized.length}টি ছবি ৫MB এর বেশি হওয়ায় বাদ দেওয়া হয়েছে। প্রতিটি ছবি সর্বোচ্চ ৫MB হতে হবে।`
      );
    }

    const slotsAvailable = 5 - existingImages.length;
    const combined = [...selectedFiles, ...validFiles].slice(0, slotsAvailable);
    setSelectedFiles(combined);
    // Reset the input so re-selecting the same file works
    e.target.value = "";
    if (existingImages.length + selectedFiles.length + validFiles.length > 5) {
      toast.error("সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।");
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Delete an existing (already-uploaded) image from R2 and the form ---
  const removeExistingImage = async (url: string) => {
    if (!confirm("এই ছবিটি স্থায়ীভাবে মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।")) return;
    setIsDeletingImage(true);
    try {
      // Delete from R2
      const res = await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("ছবি মুছতে সমস্যা হয়েছে।");

      // Update local state
      const updated = existingImages.filter((img) => img !== url);
      setExistingImages(updated);
      setValue("images", updated);

      // Persist to DB immediately so the deletion is saved even if the user doesn't submit
      if (isEditMode && listingId) {
        await updateUserListing(listingId, {
          title: watch("title"),
          rentPrice: Number(watch("rentPrice")),
          propertyType: watch("propertyType"),
          location: watch("location"),
          rentFrom: watch("rentFrom"),
          address: watch("address"),
          contactInfo: watch("contactInfo"),
          mapLink: watch("mapLink"),
          images: updated,
          subLocation: watch("subLocation"),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "ছবি মুছতে সমস্যা হয়েছে।");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const onSubmit = async (data: PostFormValues) => {
    if (isLoaded && !user) {
      localStorage.setItem('savedPostData:v1', JSON.stringify(data));
      toast.error("দয়া করে আগে লগইন করুন। রিডাইরেক্ট করা হচ্ছে...");
      setTimeout(() => {
        router.push("/login?redirectUrl=/post");
      }, 2000);
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      let uploadedImageUrls: string[] = [...existingImages];

      // ---Compress images client-side ---
      if (selectedFiles.length > 0) {
        const compressionOptions = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/jpeg" as const,
        };

        const compressedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            try {
              const compressed = await imageCompression(file, compressionOptions);
              // Preserve the original name but change extension to .jpg
              const baseName = file.name.replace(/\.[^.]+$/, "");
              return new File([compressed], `${baseName}.jpg`, {
                type: "image/jpeg",
              });
            } catch {
              // If compression fails, fall back to original file
              console.warn(`কম্প্রেশন ব্যর্থ: ${file.name}, মূল ফাইল ব্যবহার করা হচ্ছে`);
              return file;
            }
          })
        );

        // --- Get presigned URLs ---
        const presignRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: compressedFiles.map((f) => ({ name: f.name, type: f.type })),
          }),
        });

        if (!presignRes.ok) {
          throw new Error("প্রি-সাইনড URL তৈরি করতে সমস্যা হয়েছে।");
        }

        const { results } = await presignRes.json();

        // --- Upload compressed files to R2 in parallel ---
        await Promise.all(
          compressedFiles.map((file, idx) =>
            fetch(results[idx].signedUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            }).then((res) => {
              if (!res.ok) throw new Error(`"${file.name}" আপলোড ব্যর্থ হয়েছে।`);
            })
          )
        );

        uploadedImageUrls = [
          ...uploadedImageUrls,
          ...results.map((r: { publicUrl: string }) => r.publicUrl),
        ];
      }

      // --- Save to database ---
      const finalDataForDatabase = {
        ...data,
        rentPrice: Number(data.rentPrice),
        images: uploadedImageUrls,
      };

      const result = isEditMode && listingId
        ? await updateUserListing(listingId, finalDataForDatabase)
        : await createListing(finalDataForDatabase);

      // --- Cleanup ---
      if (result.success) {
        localStorage.removeItem('savedPostData:v1');
        setSelectedFiles([]);
        toast.success(isEditMode ? "আপনার পোস্ট সফলভাবে আপডেট হয়েছে!" : "আপনার টু-লেট সফলভাবে পোস্ট করা হয়েছে!");

        // Update local state to reflect successful submission
        if (!isEditMode) {
          reset();
          setExistingImages([]);
        } else {
          setExistingImages(uploadedImageUrls);
          // Also update the form's images field to match the new set
          setValue("images", uploadedImageUrls);
        }
      } else {
        toast.error(result.error || (isEditMode ? "পোস্ট আপডেট করতে সমস্যা হয়েছে।" : "পোস্ট করতে সমস্যা হয়েছে।"));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : (isEditMode ? "পোস্ট আপডেট করতে সমস্যা হয়েছে।" : "পোস্ট করতে সমস্যা হয়েছে।"));
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };



  const activeLocationObj = locations.find(loc => loc.value === selectedLocation);




  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-24 pb-12 relative">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-[20px] shadow-sm border-2 border-[#2d79f3]">
        <h1 className="text-2xl md:text-3xl font-bold text-[#151717] mb-6 text-center">
          {isEditMode ? "টু-লেট পোস্ট এডিট করুন" : "টু-লেট পোস্ট করুন"}
        </h1>

        {isEditMode && isLoadingListing ? (
          <p className="text-center text-slate-500 py-10">পোস্টের তথ্য লোড হচ্ছে...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-[#151717] text-sm font-semibold">বিজ্ঞাপনের টাইটেল</label>
              <input
                id="title"
                {...register("title")}
                type="text"
                className={`border-[1.5px] rounded-none h-11 px-3 text-blue-600 placeholder:text-blue-600 focus:outline-none transition-colors duration-200 ${errors.title ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rent Price */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rentPrice" className="text-[#151717] text-sm font-semibold">ভাড়ার পরিমাণ (টাকা)</label>
                <input
                  id="rentPrice"
                  {...register("rentPrice")}
                  type="number"
                  className={`border-[1.5px] rounded-none h-11 px-3 text-blue-600 placeholder:text-blue-600 focus:outline-none transition-colors duration-200 ${errors.rentPrice ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
                />
                {errors.rentPrice && <span className="text-red-500 text-xs">{errors.rentPrice.message}</span>}
              </div>

              <MonthPickerInput
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
                isMonthPickerOpen={isMonthPickerOpen}
                setIsMonthPickerOpen={setIsMonthPickerOpen}
                monthPickerRef={monthPickerRef}
                viewYear={viewYear}
                setViewYear={setViewYear}
                currentDate={currentDate}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PropertyTypeSelect
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
                isPropertyTypeOpen={isPropertyTypeOpen}
                setIsPropertyTypeOpen={setIsPropertyTypeOpen}
                propertyTypeRef={propertyTypeRef}
              />

              <LocationSelect
                register={register}
                setValue={setValue}
                errors={errors}
                isSelectOpen={isSelectOpen}
                setIsSelectOpen={setIsSelectOpen}
                expandedLoc={expandedLoc}
                setExpandedLoc={setExpandedLoc}
                selectedLocation={selectedLocation}
                selectedSubLocation={selectedSubLocation}
              />
            </div>

            {/* Exact Address */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="text-[#151717] text-sm font-semibold">সম্পূর্ণ ঠিকানা</label>
              <input
                id="address"
                {...register("address")}
                type="text"
                placeholder="বাড়ি নং, ব্লক, রাস্তা নং"
                className={`border-[1.5px] rounded-none h-11 px-3 text-blue-600 placeholder:text-blue-600 focus:outline-none transition-colors duration-200 ${errors.address ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
              />
              {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Info */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contactInfo" className="text-[#151717] text-sm font-semibold">যোগাযোগের নম্বর</label>
                <input
                  id="contactInfo"
                  {...register("contactInfo")}
                  type="text"
                  maxLength={11}
                  placeholder="01XXXXXXXXX"
                  className={`border-[1.5px] rounded-none h-11 px-3 text-blue-600 placeholder:text-blue-600 focus:outline-none transition-colors duration-200 ${errors.contactInfo ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
                />
                {errors.contactInfo && <span className="text-red-500 text-xs">{errors.contactInfo.message}</span>}
              </div>

              {/* Google Maps Link */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mapLink" className="text-[#151717] text-sm font-semibold">গুগল ম্যাপস লিংক / লোকেশন কোড</label>
                <input
                  id="mapLink"
                  {...register("mapLink")}
                  type="text"
                  placeholder="লিংক / কোড দিন "
                  className={`border-[1.5px] rounded-none h-11 px-3 text-blue-600 placeholder:text-blue-600 focus:outline-none transition-colors duration-200 ${errors.mapLink ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
                />
                {errors.mapLink && <span className="text-red-500 text-xs">{errors.mapLink.message}</span>}
              </div>
            </div>

            <ImageUploadSection
              existingImages={existingImages}
              isDeletingImage={isDeletingImage}
              removeExistingImage={removeExistingImage}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              totalImageCount={totalImageCount}
              selectedFiles={selectedFiles}
              removeFile={removeFile}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="mt-4 bg-blue-900 text-white text-[15px] font-medium rounded-none h-12 w-full cursor-pointer hover:bg-blue-900 hover:text-green-500 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "আপলোড হচ্ছে..." : isSubmitting ? "প্রসেস হচ্ছে..." : isEditMode ? "আপডেট সেভ করুন" : "বিজ্ঞাপন পোস্ট করুন"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}



export default function PostToLet() {
  return (
    <Suspense fallback={<div className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-24 pb-12 relative">Loading...</div>}>
      <PostToLetForm />
    </Suspense>
  );
}
