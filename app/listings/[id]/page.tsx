import prisma from "@/src/lib/db";
import { locations, propertyTypes } from "@/src/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkIfSaved, toggleSaveListing } from "@/app/actions/saveListing";
import ImageGallery from "@/app/components/ImageGallery";
import StartChatButton from "@/app/components/StartChatButton";
import ShareListingButton from "@/app/components/ShareListingButton";
import { unstable_cache } from "next/cache";

// CACHED: Fetch Property Details (Refresh every 5 minutes)
const getCachedListing = unstable_cache(
  async (listingId: string) => {
    return await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
      },
    });
  },
  ["single-listing-details"],
  { revalidate: 300 }
);

// Fetch similar listings in same area
async function getSimilarListings(currentId: string, location: string) {
  try {
    return await prisma.listing.findMany({
      where: {
        location: location,
        id: { not: currentId },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, profileImage: true } },
      },
    });
  } catch (err) {
    return [];
  }
}

export default async function ListingDetails({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Promise<{ from?: string }> | { from?: string };
}) {
  const [{ id }, resolvedSearchParams, { userId: clerkUserId }] = await Promise.all([
    params,
    searchParams || Promise.resolve<{ from?: string }>({}),
    auth(),
  ]);

  const listing = await getCachedListing(id);
  const currentUser = clerkUserId
    ? await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    })
    : null;

  const isFromProfile = resolvedSearchParams?.from === "profile";
  const backHref = isFromProfile ? "/profile" : "/listings";
  const backLabel = isFromProfile ? "প্রোফাইল পেজে ফিরে যান" : "সকল টু-লেট দেখুন";

  // Fetch author's Clerk data for the image fallback
  let authorClerkImage = null;
  if (listing?.user?.clerkId) {
    try {
      const client = await clerkClient();
      if (client && client.users) {
        const authorClerkUser = await client.users.getUser(listing.user.clerkId);
        authorClerkImage = authorClerkUser?.imageUrl || null;
      }
    } catch (error: any) {
      console.warn("Author Clerk data not available:", error?.message);
    }
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">টু-লেট পোস্টটি পাওয়া যায়নি</h2>
          <p className="text-slate-500 text-sm">এই পোস্টটি মুছে ফেলা হয়েছে অথবা লিংকটি সঠিক নয়।</p>
          <Link
            href="/listings"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
          >
            সব টু-লেট দেখুন
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

  const similarListings = await getSimilarListings(listing.id, listing.location);

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50/80 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-6">
        
        {/* TOP NAVIGATION & ACTIONS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb & Back */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-700 hover:text-blue-600 border border-slate-200 shadow-2xs transition-colors"
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

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: Property Gallery & Deep Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* HERO CARD (Images, Title, Highlights) */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Image Gallery with Lightbox */}
              <ImageGallery images={listing.images ?? []} />

              {/* Badges & Title */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-bold">
                    {propTypeLabel}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {listing.title}
                </h1>
              </div>

              {/* KEY HIGHLIGHTS 4-GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">প্রপার্টি ধরন</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{propTypeLabel}</span>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">এলাকা</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{locLabel}</span>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">ভাড়া শুরু</span>
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 truncate">{listing.rentFrom}</span>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">মাসিক ভাড়া</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-red-600">৳{listing.rentPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

            </div>

            {/* ADDRESS & LOCATION DETAILS CARD */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                ঠিকানা ও অবস্থান
              </h3>

              <div className="space-y-3">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">সম্পূর্ণ ঠিকানা</span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                    {listing.address}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="text-slate-400">লোকেশন:</span>
                    <span>{locLabel} {subLocLabel && `— ${subLocLabel}`}</span>
                  </div>

                  {listing.mapLink && (
                    <a
                      href={listing.mapLink.startsWith("http") ? listing.mapLink : `https://${listing.mapLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      গুগল ম্যাপে দেখুন ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* SAFETY & TENANT TIPS CARD */}
            <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 p-5 rounded-3xl border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ভাড়াটিয়াদের জন্য নিরাপত্তা টিপস
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
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />
              
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
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">যোগাযোগের নম্বর</span>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center text-slate-600 font-bold text-base">
                  {listing.user.profileImage ? (
                    <Image src={listing.user.profileImage} alt={listing.user.name || ""} width={48} height={48} className="object-cover" />
                  ) : authorClerkImage ? (
                    <Image src={authorClerkImage} alt={listing.user.name || ""} width={48} height={48} className="object-cover" />
                  ) : (
                    listing.user.name?.[0] || "U"
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {listing.user.name || "নাম পাওয়া যায়নি"}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
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
                  {similarListings.map((sim) => (
                    <Link
                      key={sim.id}
                      href={`/listings/${sim.id}`}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
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