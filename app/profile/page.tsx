"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/app/actions/user";
import { updateProfileImage as updateDbProfileImage } from "@/app/actions/updateProfilePicture";
import { deleteUserListing, deleteSavedListing, getSavedListings, getUserListings } from "@/app/actions/getListings";
import { getUnreadMessageCount } from "@/app/actions/chat";
import { propertyTypes, locations } from "@/src/lib/constants";

type DashboardSection = "my-listings" | "saved-listings";

function formatRentFromDate(rentFrom?: string) {
  if (!rentFrom) {
    return "ভাড়া শুরুর তারিখ নেই";
  }

  const [monthPart, yearPart] = rentFrom.split("/");
  const month = Number(monthPart);
  const year = Number(yearPart);

  if (!month || !year || month < 1 || month > 12) {
    return rentFrom;
  }

  const parsedDate = new Date(year, month - 1, 1);

  return parsedDate.toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
  });
}

const propertyTypeMap = new Map(propertyTypes.map((t) => [t.value, t.label]));
const locationMap = new Map<string, string>();
locations.forEach((l) => {
  locationMap.set(l.value, l.label);
  if (l.subLocations) {
    l.subLocations.forEach((s) => {
      locationMap.set(s.value, s.label);
    });
  }
});

function getPropertyTypeLabel(value: string) {
  return propertyTypeMap.get(value) || value;
}

function getLocationLabel(value: string) {
  return locationMap.get(value) || value;
}

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [memberSince, setMemberSince] = useState<string>("");
  const [myListings, setMyListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [isLoadingSavedListings, setIsLoadingSavedListings] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("my-listings");
  const [listingToDelete, setListingToDelete] = useState<any | null>(null);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [savedListingToDelete, setSavedListingToDelete] = useState<any | null>(null);
  const [isDeletingSavedListing, setIsDeletingSavedListing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  if (isLoaded && !user) {
    redirect("/login?redirectUrl=/profile");
  }

  // Poll for unread message count
  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const count = await getUnreadMessageCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          const dbUser = await getUserProfile();
          if (dbUser) {
            setName(dbUser.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
            setPhone(dbUser.phone || user.phoneNumbers?.[0]?.phoneNumber || "");
            setAddress(dbUser.address || "");
            setProfileImage(dbUser.profileImage || null);
            if (dbUser.createdAt) {
              const date = new Date(dbUser.createdAt);
              const monthYear = date.toLocaleDateString("bn-BD", {
                month: "long",
                year: "numeric",
              });
              setMemberSince(monthYear);
            }
          } else {
            setName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
            setPhone(user.phoneNumbers?.[0]?.phoneNumber || "");
          }

          const listings = await getUserListings();
          setMyListings(listings);

          const savedPosts = await getSavedListings();
          setSavedListings(savedPosts);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setPhone(user.phoneNumbers?.[0]?.phoneNumber || "");
        } finally {
          setIsLoadingListings(false);
          setIsLoadingSavedListings(false);
        }
      }
    }
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (isEditing) {
      setIsSaving(true);
      try {
        await updateUserProfile({ name, phone, address });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update profile", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("ছবি ২ মেগাবাইটের কম হতে হবে");
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          files: [{ name: file.name, type: file.type }],
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { results } = await response.json();
      const { signedUrl, publicUrl } = results[0];

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload to R2");

      await updateDbProfileImage(publicUrl);
      setProfileImage(publicUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  const isGoogleUser = user.externalAccounts?.some(
    (account) => account.provider === "google",
  );

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
    setPhone(digitsOnly);
  };

  const openDeleteDialog = (listing: any) => {
    setListingToDelete(listing);
  };

  const closeDeleteDialog = () => {
    if (isDeletingListing) return;
    setListingToDelete(null);
  };

  const currentListings = activeSection === "my-listings" ? myListings : savedListings;
  const isLoadingCurrentListings = activeSection === "my-listings" ? isLoadingListings : isLoadingSavedListings;
  const currentSectionTitle = activeSection === "my-listings" ? "আমার বিজ্ঞাপন সমূহ" : "সংরক্ষিত বিজ্ঞাপন সমূহ";

  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;
    setIsDeletingListing(true);

    try {
      await deleteUserListing(listingToDelete.id);
      setMyListings((currentListings) =>
        currentListings.filter((listing) => listing.id !== listingToDelete.id),
      );
      setListingToDelete(null);
    } catch (error) {
      console.error("Failed to delete listing:", error);
    } finally {
      setIsDeletingListing(false);
    }
  };

  const openDeleteSavedListingDialog = (listing: any) => {
    setSavedListingToDelete(listing);
  };

  const closeDeleteSavedListingDialog = () => {
    if (isDeletingSavedListing) return;
    setSavedListingToDelete(null);
  };

  const confirmDeleteSavedListing = async () => {
    if (!savedListingToDelete) return;
    setIsDeletingSavedListing(true);

    try {
      await deleteSavedListing(savedListingToDelete.id);
      setSavedListings((currentListings) =>
        currentListings.filter((listing) => listing.id !== savedListingToDelete.id),
      );
      setSavedListingToDelete(null);
    } catch (error) {
      console.error("Failed to delete saved listing:", error);
    } finally {
      setIsDeletingSavedListing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50/80 via-emerald-50/20 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-8">
        
        {/* PROFILE HEADER CARD */}
        <ProfileHeader
          user={user}
          isGoogleUser={isGoogleUser}
          profileImage={profileImage}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          name={name}
          setName={setName}
          phone={phone}
          handlePhoneChange={handlePhoneChange}
          address={address}
          setAddress={setAddress}
          isUploading={isUploading}
          handleImageChange={handleImageChange}
          isSaving={isSaving}
          handleSave={handleSave}
          memberSince={memberSince}
        />

        {/* 2-COLUMN DASHBOARD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">
            <ProfileSidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              myListingsCount={myListings.length}
              savedListingsCount={savedListings.length}
              unreadCount={unreadCount}
              signOut={signOut}
            />
          </div>

          {/* RIGHT 3 COLUMNS: LISTINGS CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileListings
              activeSection={activeSection}
              currentSectionTitle={currentSectionTitle}
              isLoadingCurrentListings={isLoadingCurrentListings}
              currentListings={currentListings}
              openDeleteDialog={openDeleteDialog}
              openDeleteSavedListingDialog={openDeleteSavedListingDialog}
              router={router}
            />
          </div>

        </div>

      </div>

      {/* CONFIRMATION DIALOGS */}
      <DeleteListingDialog
        listingToDelete={listingToDelete}
        closeDeleteDialog={closeDeleteDialog}
        confirmDeleteListing={confirmDeleteListing}
        isDeletingListing={isDeletingListing}
      />

      <DeleteSavedListingDialog
        savedListingToDelete={savedListingToDelete}
        closeDeleteSavedListingDialog={closeDeleteSavedListingDialog}
        confirmDeleteSavedListing={confirmDeleteSavedListing}
        isDeletingSavedListing={isDeletingSavedListing}
      />
    </main>
  );
}

function ProfileHeader({
  user,
  isGoogleUser,
  profileImage,
  isEditing,
  setIsEditing,
  name,
  setName,
  phone,
  handlePhoneChange,
  address,
  setAddress,
  isUploading,
  handleImageChange,
  isSaving,
  handleSave,
  memberSince,
}: any) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
      
      {/* Avatar Container */}
      <div className="shrink-0 relative group">
        <div className="relative">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-50 shadow-sm"
            />
          ) : isGoogleUser && user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="Profile"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-blue-50 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-slate-100 flex items-center justify-center text-blue-600 font-extrabold text-3xl shadow-sm">
              {name?.[0] || user.firstName?.[0] || "U"}
            </div>
          )}

          {/* Upload overlay button */}
          {isEditing && (
            <label
              htmlFor="profile-upload"
              className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 hover:bg-blue-700 rounded-xl border-2 border-white flex items-center justify-center text-white cursor-pointer shadow-md transition-colors z-10"
              title="ছবি পরিবর্তন করুন"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* User Info & Edit Form */}
      <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
        
        <div className="space-y-1 w-full max-w-md">
          {isEditing ? (
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">নাম</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="w-full text-lg font-bold text-slate-900 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-slate-50"
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
                {name || "ইউজার নাম নেই"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                ভেরিফায়েড একাউন্ট
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500 font-medium truncate">
            {user.emailAddresses[0]?.emailAddress ?? "ইমেইল পাওয়া যায়নি"}
          </p>
        </div>

        {/* Details Matrix (Phone, Address) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Phone */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ফোন নম্বর</span>
            {isEditing ? (
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="১১ ডিজিট মোবাইল নম্বর"
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <span className="text-xs font-bold text-slate-800 block">
                {phone || "ফোন নম্বর যুক্ত করা নেই"}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ঠিকানা</span>
            {isEditing ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="আপনার পূর্ণ ঠিকানা"
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <span className="text-xs font-bold text-slate-800 block truncate">
                {address || "ঠিকানা যুক্ত করা নেই"}
              </span>
            )}
          </div>

        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isEditing
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSaving ? "সেভ হচ্ছে..." : isEditing ? "✓ পরিবর্তন সেভ করুন" : "প্রোফাইল এডিট করুন"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
          )}

          {memberSince && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              সদস্য: {memberSince}
            </span>
          )}
        </div>

      </div>

    </div>
  );
}

function ProfileSidebar({
  activeSection,
  setActiveSection,
  myListingsCount,
  savedListingsCount,
  unreadCount,
  signOut,
}: any) {
  return (
    <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs space-y-1.5">
      
      {/* My Listings Tab */}
      <button
        type="button"
        onClick={() => setActiveSection("my-listings")}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
          activeSection === "my-listings"
            ? "bg-blue-600 text-white shadow-xs"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          আমার বিজ্ঞাপন
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          activeSection === "my-listings" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
        }`}>
          {myListingsCount}
        </span>
      </button>

      {/* Saved Listings Tab */}
      <button
        type="button"
        onClick={() => setActiveSection("saved-listings")}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
          activeSection === "saved-listings"
            ? "bg-blue-600 text-white shadow-xs"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          সংরক্ষিত বিজ্ঞাপন
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          activeSection === "saved-listings" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
        }`}>
          {savedListingsCount}
        </span>
      </button>

      {/* Messages / Inbox */}
      <Link
        href="/inbox"
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          মেসেজ সমূহ
        </span>
        {unreadCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium">ইনবক্স</span>
        )}
      </Link>

      <div className="pt-2 border-t border-slate-100 my-1">
        {/* Post New Listing Action */}
        <Link
          href="/post"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors mb-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          নতুন বিজ্ঞাপন দিন
        </Link>

        {/* Sign Out */}
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          লগ আউট করুন
        </button>
      </div>

    </div>
  );
}

function ProfileListings({
  activeSection,
  currentSectionTitle,
  isLoadingCurrentListings,
  currentListings,
  openDeleteDialog,
  openDeleteSavedListingDialog,
  router,
}: any) {
  return (
    <div className="space-y-4">
      
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{currentSectionTitle}</h2>
          {!isLoadingCurrentListings && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
              {currentListings.length}টি
            </span>
          )}
        </div>

        {activeSection === "my-listings" && (
          <Link
            href="/post"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            + নতুন পোস্ট করুন
          </Link>
        )}
      </div>

      {/* Listings List */}
      {isLoadingCurrentListings ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4" />
          ))}
        </div>
      ) : currentListings.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-sm font-medium">
            {activeSection === "my-listings"
              ? "আপনার কোনো সক্রিয় বিজ্ঞাপন নেই।"
              : "আপনি এখনো কোনো বিজ্ঞাপন সংরক্ষণ করেননি।"}
          </p>
          <Link
            href={activeSection === "my-listings" ? "/post" : "/listings"}
            className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {activeSection === "my-listings" ? "বিজ্ঞাপন পোস্ট করুন" : "টু-লেট খুঁজুন"}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {currentListings.map((listing: any) => {
            const propType = getPropertyTypeLabel(listing.propertyType);
            const locLabel = getLocationLabel(listing.location);
            const rentFromText = formatRentFromDate(listing.rentFrom);
            const hasImages = listing.images && Array.isArray(listing.images) && listing.images.length > 0;

            if (activeSection === "saved-listings") {
              return (
                <div
                  key={listing.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                      {hasImages ? (
                        <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {propType}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          ৳{listing.rentPrice.toLocaleString("en-IN")} /মাস
                        </span>
                      </div>

                      <Link href={`/listings/${listing.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {listing.title}
                        </h3>
                      </Link>

                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {locLabel} • ভাড়া শুরু: {rentFromText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                    >
                      দেখুন
                    </Link>
                    <button
                      type="button"
                      onClick={() => openDeleteSavedListingDialog(listing)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="সংরক্ষণ বাতিল"
                      aria-label="Remove saved"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }

            // MY LISTINGS ITEM
            return (
              <div
                key={listing.id}
                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                    {hasImages ? (
                      <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {propType}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        ৳{listing.rentPrice.toLocaleString("en-IN")} /মাস
                      </span>
                    </div>

                    <Link href={`/listings/${listing.id}?from=profile`}>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {listing.title}
                      </h3>
                    </Link>

                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <svg className="w-3 h-3 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {locLabel} • ভাড়া শুরু: {rentFromText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/listings/${listing.id}?from=profile`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-colors"
                  >
                    দেখুন
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push(`/post?listingId=${listing.id}`)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="এডিট"
                    aria-label="Edit listing"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(listing)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ডিলিট"
                    aria-label="Delete listing"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

function DeleteListingDialog({
  listingToDelete,
  closeDeleteDialog,
  confirmDeleteListing,
  isDeletingListing,
}: any) {
  if (!listingToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">বিজ্ঞাপনটি মুছে ফেলতে চান?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-800">{listingToDelete.title}</span> পোস্টটি স্থায়ীভাবে মুছে ফেলা হবে এবং আর ফিরে পাওয়া যাবে না।
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeDeleteDialog}
            disabled={isDeletingListing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={confirmDeleteListing}
            disabled={isDeletingListing}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDeletingListing ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছে ফেলুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteSavedListingDialog({
  savedListingToDelete,
  closeDeleteSavedListingDialog,
  confirmDeleteSavedListing,
  isDeletingSavedListing,
}: any) {
  if (!savedListingToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">সংরক্ষিত তালিকা থেকে সরাতে চান?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-800">{savedListingToDelete.title}</span> পোস্টটি আপনার সংরক্ষিত তালিকা থেকে সরিয়ে ফেলা হবে।
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeDeleteSavedListingDialog}
            disabled={isDeletingSavedListing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={confirmDeleteSavedListing}
            disabled={isDeletingSavedListing}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDeletingSavedListing ? "সরানো হচ্ছে..." : "হ্যাঁ, সরান"}
          </button>
        </div>
      </div>
    </div>
  );
}