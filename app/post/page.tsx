"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { locations, propertyTypes } from "@/src/lib/constants";
import { createListing } from "@/app/actions/createListing";
import { getUserListingById, updateUserListing } from "@/app/actions/getListings";

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

function PostToLetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const listingId = searchParams.get("listingId");
  const isEditMode = Boolean(listingId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [expandedLoc, setExpandedLoc] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isLoadingListing, setIsLoadingListing] = useState(isEditMode);

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

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    const savedData = localStorage.getItem('savedPostData');
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
          alert("এই পোস্টটি খুঁজে পাওয়া যায়নি বা আপনার নয়।");
          router.replace("/profile");
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
      } catch (error) {
        console.error("Failed to load listing for edit:", error);
        alert("পোস্টের তথ্য লোড করতে সমস্যা হয়েছে।");
        router.replace("/profile");
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

  const onSubmit = async (data: PostFormValues) => {
    if (isLoaded && !user) {
      localStorage.setItem('savedPostData', JSON.stringify(data));
      setShowToast(true);
      setTimeout(() => {
        router.push("/login?redirectUrl=/post");
      }, 2000);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDataForDatabase = {
        ...data,
        rentPrice: Number(data.rentPrice),
      };

      const result = isEditMode && listingId
        ? await updateUserListing(listingId, finalDataForDatabase)
        : await createListing(finalDataForDatabase);

      if (result.success) {
        localStorage.removeItem('savedPostData');
        alert(isEditMode ? "আপনার পোস্ট সফলভাবে আপডেট হয়েছে!" : "আপনার পোস্ট সফলভাবে তৈরি হয়েছে!");
        router.push(isEditMode ? "/profile" : "/");
      } else {
        alert(result.error || (isEditMode ? "পোস্ট আপডেট করতে সমস্যা হয়েছে।" : "পোস্ট করতে সমস্যা হয়েছে।"));
      }
    } catch (error) {
      console.error(error);
      alert(isEditMode ? "পোস্ট আপডেট করতে সমস্যা হয়েছে।" : "পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };



  const activeLocationObj = locations.find(loc => loc.value === selectedLocation);




  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-24 pb-12 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in-down">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium text-sm">দয়া করে আগে লগইন করুন। রিডাইরেক্ট করা হচ্ছে...</span>
        </div>
      )}

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
            <label className="text-[#151717] text-sm font-semibold">বিজ্ঞাপনের টাইটেল</label>
            <input
              {...register("title")}
              type="text"
              className={`border-[1.5px] rounded-none h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.title ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                }`}
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rent Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">ভাড়ার পরিমাণ (টাকা)</label>
              <input
                {...register("rentPrice")}
                type="number"
                className={`border-[1.5px] rounded-none h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.rentPrice ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.rentPrice && <span className="text-red-500 text-xs">{errors.rentPrice.message}</span>}
            </div>

            {/* Rent From */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">ভাড়া শুরু (মাস/বছর)</label>
              <input
                {...register("rentFrom")}
                type="text"
                placeholder="MM / YYYY"
                className={`border-[1.5px] rounded-none h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.rentFrom ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.rentFrom && <span className="text-red-500 text-xs">{errors.rentFrom.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">প্রপার্টির ধরন</label>
              <select
                {...register("propertyType")}
                className={`border-[1.5px] bg-white text-green-600 rounded-none h-11 px-3 focus:outline-none transition-colors duration-200 ${errors.propertyType ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value} className="text-green-600">{type.label}</option>
                ))}
              </select>
              {errors.propertyType && <span className="text-red-500 text-xs">{errors.propertyType.message}</span>}
            </div>

            {/* Location (Custom Dropdown) */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[#151717] text-sm font-semibold">এলাকা / লোকেশন</label>
              <input type="hidden" {...register("location")} />
              <input type="hidden" {...register("subLocation")} />

              <button
                type="button"
                className={`w-full border-[1.5px] bg-white rounded-none h-11 px-3 focus:outline-none transition-colors duration-200 flex items-center justify-between text-left ${errors.location ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"}`}
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                onBlur={() => setTimeout(() => setIsSelectOpen(false), 200)}
              >
                <span className={selectedLocation ? "text-green-600 truncate pr-4" : "text-green-600"}>
                  {selectedLocation
                    ? (() => {
                      const loc = locations.find(l => l.value === selectedLocation);
                      if (!loc) return "-- নির্বাচন করুন --";
                      if (selectedSubLocation) {
                        const sub = loc.subLocations?.find(s => s.value === selectedSubLocation);
                        if (sub) {
                          const locBn = loc.label.split(" (")[0];
                          const locEn = loc.label.split(" (")[1]?.replace(")", "") || "";
                          const subBn = sub.label.split(" (")[0];
                          const subEn = sub.label.split(" (")[1]?.replace(")", "") || "";
                          return `${locBn} - ${subBn} (${locEn} - ${subEn})`;
                        }
                      }
                      return loc.label;
                    })()
                    : "-- নির্বাচন করুন --"}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isSelectOpen && (
                <ul
                  className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-none max-h-60 overflow-y-auto z-50 py-1"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {locations.map((loc) => (
                    <div key={loc.value}>
                      <li
                        className={`px-4 py-2.5 text-slate-900 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors flex justify-between items-center ${expandedLoc === loc.value ? 'bg-slate-100 font-semibold' : ''}`}
                        onClick={(e) => {
                          if (loc.subLocations) {
                            e.stopPropagation();
                            setExpandedLoc(expandedLoc === loc.value ? "" : loc.value);
                          } else {
                            setValue("location", loc.value, { shouldValidate: true });
                            setValue("subLocation", "");
                            setIsSelectOpen(false);
                            setExpandedLoc("");
                          }
                        }}
                      >
                        <span>{loc.label}</span>
                        {loc.subLocations && (
                          <svg className={`w-4 h-4 transition-transform ${expandedLoc === loc.value ? 'rotate-180 text-[#2d79f3]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        )}
                      </li>

                      {loc.subLocations && expandedLoc === loc.value && (
                        <ul className="bg-slate-50 border-y border-gray-100">
                          <li
                            className="px-8 py-2.5 text-slate-700 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-0"
                            onClick={() => {
                              setValue("location", loc.value, { shouldValidate: true });
                              setValue("subLocation", "");
                              setIsSelectOpen(false);
                              setExpandedLoc("");
                            }}
                          >
                            যেকোনো (Any)
                          </li>
                          {loc.subLocations.map((sub) => (
                            <li
                              key={sub.value}
                              className="px-8 py-2.5 text-slate-700 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-100 last:border-0"
                              onClick={() => {
                                setValue("location", loc.value, { shouldValidate: true });
                                setValue("subLocation", sub.value, { shouldValidate: true });
                                setIsSelectOpen(false);
                                setExpandedLoc("");
                              }}
                            >
                              {sub.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </ul>
              )}
              {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
            </div>
          </div>

          {/* Exact Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#151717] text-sm font-semibold">সম্পূর্ণ ঠিকানা</label>
            <input
              {...register("address")}
              type="text"
              placeholder="বাড়ি নং, ব্লক, রাস্তা নং"
              className={`border-[1.5px] rounded-none h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.address ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                }`}
            />
            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
          </div>

          {/* Contact Info & Map Link placed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Contact Info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">যোগাযোগের নম্বর</label>
              <input
                {...register("contactInfo")}
                type="text"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                className={`border-[1.5px] rounded-none h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.contactInfo ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.contactInfo && <span className="text-red-500 text-xs">{errors.contactInfo.message}</span>}
            </div>

            {/* Google Maps Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#151717] text-sm font-semibold">গুগল ম্যাপস লিংক / লোকেশন কোড</label>
              <input
                {...register("mapLink")}
                type="text"
                placeholder="লিংক / কোড দিন "
                className={`border-[1.5px] rounded-none h-11 px-3 text-green-600 placeholder:text-green-600 focus:outline-none transition-colors duration-200 ${errors.mapLink ? "border-red-500" : "border-[#ecedec] focus:border-[#2d79f3]"
                  }`}
              />
              {errors.mapLink && <span className="text-red-500 text-xs">{errors.mapLink.message}</span>}
            </div>

          </div>

          {/* Image Upload Mockup */}
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[#151717] text-sm font-semibold">ছবি আপলোড</label>
            <div className="border-2 border-dashed border-[#ecedec] rounded-none h-32 flex flex-col items-center justify-center bg-slate-50 text-slate-400 hover:border-[#2d79f3] transition-colors cursor-pointer">
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">ছবি যোগ করতে এখানে ক্লিক করুন</span>
            </div>
            <span className="text-xs text-slate-400 mt-1">* ছবি আপলোডের লজিক পরবর্তীতে যোগ করা হবে</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-blue-900 text-white text-[15px] font-medium rounded-none h-12 w-full cursor-pointer hover:bg-blue-900 hover:text-green-500 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "প্রসেস হচ্ছে..." : isEditMode ? "আপডেট সেভ করুন" : "বিজ্ঞাপন পোস্ট করুন"}
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