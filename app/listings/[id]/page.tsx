import prisma from "@/src/lib/db";
import { locations, propertyTypes } from "@/src/lib/constants";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkIfSaved, toggleSaveListing } from "@/app/actions/saveListing";
import ImageGallery from "@/app/components/ImageGallery";
import StartChatButton from "@/app/components/StartChatButton";

export default async function ListingDetails({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Promise<{ from?: string }> | { from?: string };
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: true
    }
  });
  const { userId: clerkUserId } = await auth();
  const currentUser = clerkUserId
    ? await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    })
    : null;
  const isFromProfile = resolvedSearchParams?.from === "profile";
  const backHref = isFromProfile ? "/profile" : "/listings";
  const backLabel = isFromProfile ? "← প্রোফাইল পেজে ফিরে যান" : "← সব টু-লেট এ ফিরে যান";

  // Fetch author's Clerk data for the image fallback
  let authorClerkImage = null;
  if (listing?.user?.clerkId) {
    try {
      const client = await clerkClient();
      const authorClerkUser = await client.users.getUser(listing.user.clerkId);
      authorClerkImage = authorClerkUser.imageUrl;
    } catch (error) {
      console.error("Error fetching author Clerk data:", error);
    }
  }

  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#daf2e0]">
        <div className="bg-white p-8 rounded-[20px] shadow-sm border border-red-200 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">পোস্টটি পাওয়া যায়নি</h2>
          <p className="text-slate-500 mb-6">এই টু-লেট পোস্টটি মুছে ফেলা হয়েছে অথবা আর নেই। (Post not found)</p>
          <Link href="/listings" className="bg-[#2d79f3] text-white px-6 py-2.5 rounded-[10px] font-medium hover:bg-blue-700 transition-colors">
            সব টু-লেট দেখুন
          </Link>
        </div>
      </div>
    );
  }

  const listingId = listing.id;
  const canSaveListing = Boolean(currentUser && currentUser.id !== listing.userId);
  const isSaved = canSaveListing ? await checkIfSaved(id) : false;

  async function handleToggleSaveAction() {
    "use server";
    await toggleSaveListing(listingId, `/listings/${listingId}`);
  }

  const propTypeLabel = propertyTypes.find(pt => pt.value === listing.propertyType)?.label || listing.propertyType;
  const locLabel = locations.find(l => l.value === listing.location)?.label || listing.location;
  let subLocLabel = "";
  if (listing.subLocation) {
    const loc = locations.find(l => l.value === listing.location);
    if (loc && loc.subLocations) {
      subLocLabel = loc.subLocations.find(sl => sl.value === listing.subLocation)?.label || listing.subLocation;
    } else {
      subLocLabel = listing.subLocation;
    }
  }

  return (
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-28 pb-16 min-h-screen">
      <div className="w-full max-w-6xl space-y-6">

        {/* Top Navigation */}
        <div>
          <Link href={backHref} className="inline-flex items-center text-slate-600 hover:text-[#2d79f3] font-medium transition-colors bg-white/50 px-4 py-2 rounded-full border border-white hover:border-[#2d79f3]/30 shadow-sm backdrop-blur-sm">
            {backLabel}
          </Link>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN: Property Images & Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Card (Images & Title) */}
            <div className="bg-white p-4 md:p-6 rounded-[20px] shadow-sm border border-[#ecedec]">
              {/* Image Gallery */}
              <ImageGallery images={listing.images ?? []} />

              {/* Title & Badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-green-100 text-green-700 text-xs md:text-sm font-bold px-3 py-1.5 rounded-md border border-green-200">
                    {propTypeLabel}
                  </span>
                  <span className="bg-blue-50 text-[#2d79f3] text-xs md:text-sm font-bold px-3 py-1.5 rounded-md border border-purple-100">
                    ভাড়া শুরু: {listing.rentFrom}
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-[#151717] leading-tight">
                  {listing.title}
                </h1>
                <div className="text-slate-500 mt-3 flex flex-wrap items-center gap-y-2 gap-x-4">
                  <p className="flex items-center gap-1.5 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    পোস্ট করা হয়েছে: {new Date(listing.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  <div className="flex items-center gap-2 text-sm bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    <span className="text-slate-400">লেখক:</span>
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      {listing.user.profileImage ? (
                        <img src={listing.user.profileImage} alt={listing.user.name || ""} className="w-full h-full object-cover" />
                      ) : authorClerkImage ? (
                        <img src={authorClerkImage} alt={listing.user.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-slate-700">{listing.user.name || "নাম পাওয়া যায়নি"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-28">

            {/* CARD 1: Pricing & Action Buttons */}
            <div className="bg-white p-6 rounded-[20px] shadow-lg border-2 border-[#2d79f3]">

              {/* Pricing Section */}
              <div className="text-center md:text-left mb-6">
                <p className="text-sm text-purple-700 font-medium mb-1 uppercase tracking-wider">মাসিক ভাড়া</p>
                <p className="text-3xl md:text-4xl font-extrabold text-red-700">
                  ৳ {listing.rentPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <hr className="border-slate-100 mb-6" />

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Contact Box */}
                <div className="bg-[#2d79f3]/5 p-4 rounded-[12px] border border-[#2d79f3]/20">
                  <p className="text-xs text-slate-500 font-semibold mb-2 text-center">যোগাযোগের নম্বর</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span className="text-2xl font-bold text-[#151717] tracking-wider">{listing.contactInfo}</span>
                  </div>
                  <a href={`tel:${listing.contactInfo}`} className="w-full bg-[#2d79f3] text-white flex items-center justify-center gap-2 font-bold py-3 shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-[0.98]">
                    কল করুন (Call Now)
                  </a>
                </div>

                {/* Message Button */}
                {canSaveListing && (
                  <StartChatButton landlordId={listing.userId} />
                )}

                {/* Save Button */}
                {canSaveListing && (
                  <form action={handleToggleSaveAction}>
                    <button
                      type="submit"
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] font-bold border-2 transition-all active:scale-[0.98] ${isSaved
                        ? "border-[#2d79f3] bg-[#2d79f3] text-white hover:bg-blue-800"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#2d79f3] hover:text-[#2d79f3]"
                        }`}
                    >
                      <svg className={`w-5 h-5 ${isSaved ? 'text-white' : 'text-slate-400'}`} fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isSaved ? 1.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isSaved ? "সংরক্ষিত হয়েছে (Saved)" : "সংরক্ষণ করুন (Save Post)"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* CARD 2: Location Section (Separate Card) */}
            <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#ecedec]">
              <h3 className="text-lg font-bold text-[#151717] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ঠিকানা ও অবস্থান
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-purple-700 font-medium mb-1">এলাকা</p>
                  <p className="text-[#151717] font-semibold text-base">
                    {locLabel} {subLocLabel && <span className="text-slate-500 font-normal">({subLocLabel})</span>}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-[10px] border border-slate-100">
                  <p className="text-xs text-purple-700 font-medium mb-1">সম্পূর্ণ ঠিকানা</p>
                  <p className="text-[#151717] font-medium text-sm leading-relaxed">{listing.address}</p>
                </div>

                {listing.mapLink && (
                  <a href={listing.mapLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[#2d79f3] text-sm font-bold hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2.5 rounded-[10px] w-full justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    গুগল ম্যাপে দেখুন
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}