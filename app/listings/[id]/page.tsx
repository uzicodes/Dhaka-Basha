import prisma from "@/src/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkIfSaved, toggleSaveListing } from "@/app/actions/saveListing";
import { locations, propertyTypes } from "@/src/lib/constants";
import Link from "next/link";
import Image from "next/image";
import ImageGallery from "@/app/components/ImageGallery";
import ShareListingButton from "@/app/components/ShareListingButton";
import StartChatButton from "@/app/components/StartChatButton";

export default async function ListingDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const backHref = from === "profile" ? "/profile" : "/listings";
  const backLabel = from === "profile" ? "প্রোফাইলে ফিরে যান" : "সকল টু-লেট";

  let listing: any = null;
  let currentUser: any = null;
  let authorClerkImage: string | null = null;
  let similarListings: any[] = [];

  try {
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      currentUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      });
    }

    listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            clerkId: true,
          },
        },
      },
    });

    if (listing) {
      similarListings = await prisma.listing.findMany({
        where: {
          location: listing.location,
          id: { not: listing.id },
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      });

      if (listing.user?.clerkId) {
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(listing.user.clerkId);
          authorClerkImage = clerkUser.imageUrl;
        } catch (err) {
          console.error("Failed to fetch Clerk avatar:", err);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch listing:", error);
    return (
      <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center justify-center px-4 pt-28 pb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#2E2910]">লোড করতে সমস্যা হয়েছে</h2>
          <p className="text-xs text-slate-500">বিজ্ঞাপনটি লোড করতে সাময়িক সমস্যা দেখা দিয়েছে।</p>
          <Link
            href="/listings"
            className="inline-block px-5 py-2.5 bg-[#2C5745] hover:bg-[#2E2910] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            টু-লেট তালিকায় ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center justify-center px-4 pt-28 pb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-[#EBE3A7]/20 text-[#2E2910] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#2E2910]">বিজ্ঞাপন পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">এই বিজ্ঞাপনটি মুছে ফেলা হয়েছে অথবা আর সক্রিয় নেই।</p>
          <Link
            href="/listings"
            className="inline-block px-5 py-2.5 bg-[#2C5745] hover:bg-[#2E2910] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            সকল টু-লেট দেখুন
          </Link>
        </div>
      </main>
    );
  }

  const listingId = listing.id;
  const isOwner = Boolean(currentUser && currentUser.id === listing.userId);
  const isSaved = currentUser && !isOwner ? await checkIfSaved(id) : false;

  async function handleToggleSaveAction() {
    "use server";
    await toggleSaveListing(listingId, `/listings/${listingId}`);
  }

  const propTypeLabel = propertyTypes.find((pt) => pt.value === listing.propertyType)?.label || listing.propertyType;
  const locObj = locations.find((l) => l.value === listing.location);
  const locLabel = locObj?.label || listing.location;
  let subLocLabel = "";
  if (listing.subLocation) {
    if (locObj && locObj.subLocations) {
      subLocLabel = locObj.subLocations.find((sl) => sl.value === listing.subLocation)?.label || listing.subLocation;
    } else {
      subLocLabel = listing.subLocation;
    }
  }

  return (
    <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#EBE3A7]/15 via-[#2C5745]/5 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-6">
        
        {/* TOP NAVIGATION & ACTIONS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb & Back */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#2E2910] hover:text-[#2C5745] border border-slate-200 shadow-2xs transition-colors font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{backLabel}</span>
            </Link>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="hidden sm:inline text-slate-600 font-semibold truncate max-w-xs">{locLabel}</span>
          </div>

          {/* Quick Actions (Share & Save) */}
          <div className="flex items-center gap-2">
            <ShareListingButton title={listing.title} />

            {!isOwner && (
              currentUser ? (
                <form action={handleToggleSaveAction}>
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                      isSaved
                        ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                        : "bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200"
                    }`}
                    title={isSaved ? "সংরক্ষণ বাতিল করুন" : "পোস্ট সংরক্ষণ করুন"}
                  >
                    <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{isSaved ? "সংরক্ষিত" : "সংরক্ষণ"}</span>
                  </button>
                </form>
              ) : (
                <Link
                  href={`/login?redirectUrl=${encodeURIComponent(`/listings/${listing.id}`)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-all"
                  title="সংরক্ষণ করতে লগইন করুন"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>সংরক্ষণ</span>
                </Link>
              )
            )}
          </div>
        </div>

        {/* 2-COLUMN MODERN PROPERTY LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: MEDIA & DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* MAIN CONTENT CARD */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Image Gallery with Lightbox */}
              <ImageGallery images={listing.images ?? []} />

              {/* Badges & Title */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#2E2910] text-[#EB7D00] text-xs font-bold shadow-2xs">
                    {propTypeLabel}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] border border-[#EBE3A7]/40 text-xs font-bold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    ভাড়া শুরু: {listing.rentFrom}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(listing.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2E2910] leading-tight">
                  {listing.title}
                </h1>
              </div>

              {/* KEY HIGHLIGHTS 4-GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#EBE3A7] p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">প্রপার্টি ধরন</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{propTypeLabel}</span>
                </div>
                <div className="bg-[#EBE3A7] p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">এলাকা</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{locLabel}</span>
                </div>
                <div className="bg-[#EBE3A7] p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">ভাড়া শুরু</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{listing.rentFrom}</span>
                </div>
                <div className="bg-[#EBE3A7] p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">মাসিক ভাড়া</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-red-600">৳{listing.rentPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

            </div>

            {/* ADDRESS & LOCATION DETAILS CARD */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#2E2910] flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                ঠিকানা ও অবস্থান
              </h3>
              
              <div className="bg-[#EBE3A7] p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <span>{locLabel}</span>
                  {subLocLabel && (
                    <span className="px-2 py-0.5 rounded-md bg-[#EBE3A7]/20 text-[#2E2910] text-xs font-bold">
                      {subLocLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {listing.address}
                </p>
              </div>

              {/* Google Maps search link */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.address}, ${locLabel}, Dhaka`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C5745] hover:text-[#2E2910] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                গুগল ম্যাপসে ঠিকানাটি দেখুন
              </a>
            </div>

            {/* DESCRIPTION & DETAILS CARD */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#2E2910] flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                বাসার বিস্তারিত বিবরণ
              </h3>
              
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal bg-[#EBE3A7] p-5 rounded-2xl border border-slate-100">
                {listing.description}
              </div>
            </div>

            {/* SAFETY & GUIDELINES CALLOUT */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                নিরাপত্তা পরামর্শ:
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed font-normal">
                বাসা সরাসরি পরিদর্শন না করে এবং মালিকের পরিচয় নিশ্চিত না করে কখনোই কোনো অগ্রিম টাকা বা বুকিং মানি পাঠাবেন না।
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY SIDEBAR */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
            
            {/* PRICING & CONTACT ACTION CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/50 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#2E2910] via-[#2C5745] to-[#EBE3A7]" />
              
              <div className="p-6 space-y-6">
                
                {/* Price Display */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">মাসিক ভাড়া</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight">
                      ৳{listing.rentPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-semibold text-slate-400"> / মাস</span>
                  </div>
                </div>

                {/* Contact Box */}
                {listing.contactInfo && (
                  <div className="bg-[#EBE3A7] p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">যোগাযোগের নম্বর</span>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xl font-bold text-slate-900 tracking-wide">{listing.contactInfo}</span>
                    </div>
                  </div>
                )}

                {/* Action CTA Buttons */}
                {!isOwner && (
                  <div className="space-y-3">
                    {listing.contactInfo && (
                      <a
                        href={`tel:${listing.contactInfo}`}
                        className="w-full h-12 bg-[#2C5745] hover:bg-[#2E2910] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-[#2C5745]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        সরাসরি কল করুন
                      </a>
                    )}

                    <StartChatButton landlordId={listing.userId} />
                  </div>
                )}

              </div>
            </div>

            {/* LANDLORD PROFILE CARD */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">বিজ্ঞাপনদাতা</span>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBE3A7]/20 text-[#2E2910] overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-base">
                  {listing.user.profileImage ? (
                    <Image src={listing.user.profileImage} alt={listing.user.name || ""} width={48} height={48} className="object-cover" />
                  ) : authorClerkImage ? (
                    <Image src={authorClerkImage} alt={listing.user.name || ""} width={48} height={48} className="object-cover" />
                  ) : (
                    listing.user.name?.[0] || "U"
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#2E2910] truncate">
                    {listing.user.name || "নাম পাওয়া যায়নি"}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-[#2C5745] font-semibold mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ভেরিফায়েড বিজ্ঞাপনদাতা
                  </div>
                </div>
              </div>
            </div>

            {/* SIMILAR LISTINGS IN SAME AREA (If any) */}
            {similarListings.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {locLabel} এলাকার অন্যান্য টু-লেট
                </span>
                
                <div className="space-y-3">
                  {similarListings.map((sim: any) => (
                    <Link
                      key={sim.id}
                      href={`/listings/${sim.id}`}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EBE3A7] border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#2C5745] transition-colors truncate">
                          {sim.title}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {sim.rentFrom}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-red-600 shrink-0">
                        ৳{sim.rentPrice.toLocaleString("en-IN")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}