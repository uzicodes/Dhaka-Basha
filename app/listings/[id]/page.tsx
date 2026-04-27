import prisma from "@/src/lib/db";
import { locations, propertyTypes } from "@/src/lib/constants";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { checkIfSaved, toggleSaveListing } from "@/app/actions/saveListing";

export default async function ListingDetails({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: Promise<{ from?: string }> | { from?: string };
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const listing = await prisma.listing.findUnique({ where: { id } });
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

  if (!listing) {
    return <div className="text-center pt-32 text-xl text-slate-700">পোস্টটি পাওয়া যায়নি (Post not found)</div>;
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
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-32 pb-12 min-h-screen">
      <div className="w-full max-w-4xl bg-white p-6 md:p-8 rounded-[20px] shadow-sm border-2 border-[#2d79f3]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[#ecedec] pb-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold text-[#151717] mb-2">{listing.title}</h1>
            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
              {propTypeLabel}
            </span>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <p className="text-sm text-slate-500 mb-1">ভাড়া</p>
            <p className="text-2xl font-bold text-[#2d79f3]">৳ {listing.rentPrice.toLocaleString('en-IN')} / মাস</p>
            <p className="text-sm text-slate-600 font-medium mt-1">শুরু: {listing.rentFrom}</p>
            {canSaveListing && (
              <div className="mt-4 flex justify-start md:justify-end">
                <form action={handleToggleSaveAction}>
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      isSaved
                        ? "border-[#2d79f3] bg-[#2d79f3] text-white hover:bg-blue-700"
                        : "border-[#2d79f3] bg-white text-[#2d79f3] hover:bg-blue-50"
                    }`}
                  >
                    <svg className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isSaved ? "সংরক্ষিত" : "সংরক্ষণ করুন"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Images Placeholder */}
            <div>
              <h2 className="text-lg font-bold text-[#151717] mb-3">ছবি</h2>
              <div className="w-full h-64 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[15px] flex items-center justify-center">
                <span className="text-slate-400 font-medium">ছবি খুব শীঘ্রই আসছে - Images coming soon</span>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-slate-50 p-5 rounded-[15px] border border-[#ecedec]">
              <h2 className="text-lg font-bold text-[#151717] mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                লোকেশন বিস্তারিত
              </h2>
              <p className="text-slate-700 mb-2"><strong>এলাকা:</strong> {locLabel}</p>
              {subLocLabel && <p className="text-slate-700 mb-2"><strong>উপ-এলাকা:</strong> {subLocLabel}</p>}
              <p className="text-slate-700"><strong>ঠিকানা:</strong> {listing.address}</p>
              
              {listing.mapLink && (
                <a href={listing.mapLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-[#2d79f3] font-medium hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  ম্যাপে দেখুন
                </a>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Box */}
            <div className="bg-[#2d79f3]/10 p-6 rounded-[15px] border-2 border-[#2d79f3]">
              <h2 className="text-xl font-bold text-[#151717] mb-4 border-b border-[#2d79f3]/20 pb-2">যোগাযোগ করুন</h2>
              <p className="text-slate-700 mb-4">এই টু-লেট সম্পর্কে বিস্তারিত জানতে বা বুকিং করতে কল করুন:</p>
              <div className="bg-white p-4 rounded-none flex items-center justify-center gap-3 shadow-sm border border-blue-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-2xl font-bold text-[#151717]">{listing.contactInfo}</span>
              </div>
              <a href={`tel:${listing.contactInfo}`} className="w-full mt-4 bg-[#2d79f3] text-white text-center font-semibold py-3 rounded-none shadow-sm hover:bg-blue-700 transition-colors block">
                কল করুন (Call Now)
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href={backHref} className="text-slate-500 hover:text-[#2d79f3] font-medium transition-colors">
            {backLabel}
          </Link>
        </div>

      </div>
    </main>
  );
}
