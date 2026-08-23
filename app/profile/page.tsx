"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader } from "@/app/components/GlobalLoader";
import { getUserProfile, updateUserProfile } from "@/app/actions/user";
import {
  getUserListings,
  getSavedListings,
  deleteUserListing,
  deleteSavedListing,
} from "@/app/actions/getListings";
import { getUnreadMessageCount } from "@/app/actions/chat";
import { locations, propertyTypes } from "@/src/lib/constants";

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Local editable profile states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Status & Control states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"my-listings" | "saved-listings">("my-listings");

  // Listings data states
  const [myListings, setMyListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [isLoadingMyListings, setIsLoadingMyListings] = useState(true);
  const [isLoadingSavedListings, setIsLoadingSavedListings] = useState(true);

  // Unread messages count
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals / Dialogs for deletion
  const [listingToDelete, setListingToDelete] = useState<any | null>(null);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [savedListingToDelete, setSavedListingToDelete] = useState<any | null>(null);
  const [isDeletingSavedListing, setIsDeletingSavedListing] = useState(false);

  const isGoogleUser = user?.externalAccounts?.some(
    (account: any) => account.provider === "oauth_google" || account.provider === "google",
  );

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
    })
    : "";

  // Auth redirect check
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login?redirectUrl=/profile");
    }
  }, [isLoaded, isSignedIn, router]);

  // Load user data and listings
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchUserData = async () => {
      try {
        const [profile, myListingsData, savedListingsData] = await Promise.all([
          getUserProfile(),
          getUserListings(),
          getSavedListings(),
        ]);

        if (profile) {
          setName(profile.name || user?.fullName || "");
          setPhone(profile.phone || "");
          setAddress(profile.address || "");
          setProfileImage(profile.profileImage || user?.imageUrl || null);
        } else {
          setName(user?.fullName || "");
          setProfileImage(user?.imageUrl || null);
        }

        setMyListings(myListingsData || []);
        setSavedListings(savedListingsData || []);
      } catch (error) {
        console.error("Failed to load user profile data:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMyListings(false);
        setIsLoadingSavedListings(false);
      }
    };

    fetchUserData();
  }, [isSignedIn, user]);

  // Load unread count
  useEffect(() => {
    if (!isSignedIn) return;
    const fetchUnread = async () => {
      try {
        const count = await getUnreadMessageCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load unread messages:", err);
      }
    };
    fetchUnread();
  }, [isSignedIn]);

  // Save profile updates
  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        phone,
        address,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload profile photo
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const imageUrl = data.url;

      setProfileImage(imageUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (numeric.length <= 11) {
      setPhone(numeric);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center justify-center pt-28 pb-12">
        <Loader />
      </main>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const currentListings = activeSection === "my-listings" ? myListings : savedListings;
  const isLoadingCurrentListings = activeSection === "my-listings" ? isLoadingMyListings : isLoadingSavedListings;
  const currentSectionTitle = activeSection === "my-listings" ? "আমার বিজ্ঞাপন সমূহ" : "সংরক্ষিত বিজ্ঞাপন সমূহ";

  const openDeleteDialog = (listing: any) => {
    setListingToDelete(listing);
  };

  const closeDeleteDialog = () => {
    if (isDeletingListing) return;
    setListingToDelete(null);
  };

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
    <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#EBE3A7]/15 via-[#2C5745]/5 to-transparent pointer-events-none -z-10" />

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
      <div className="relative group shrink-0">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[#EBE3A7]/20 text-[#2E2910] border-2 border-slate-200 shadow-md flex items-center justify-center font-bold text-3xl">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={name || "User"}
              fill
              className="object-cover"
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
          htmlFor="profile-upload"
          className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-[#2E2910] hover:bg-[#2C5745] text-[#EB7D00] shadow-md border-2 border-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="ছবি পরিবর্তন করুন"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* User Information Details */}
      <div className="flex-1 space-y-4 text-center md:text-left w-full">
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="text-lg font-bold text-[#2E2910] bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2C5745]"
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2E2910]">
                {name || "ব্যবহারকারী"}
              </h1>
            )}

            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EBE3A7]/20 text-[#2E2910] border border-[#EBE3A7]/40 px-2.5 py-0.5 rounded-full">
              <svg className="w-3 h-3 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ভেরিফায়েড ইউজার
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {user?.primaryEmailAddress?.emailAddress || "ইমেইল পাওয়া যায়নি"}
          </p>
        </div>

        {/* Details Matrix (Phone, Address) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Phone */}
          <div className="p-3 rounded-2xl bg-[#EBE3A7] border border-slate-100 text-left space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ফোন নম্বর</span>
            {isEditing ? (
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="১১ ডিজিট মোবাইল নম্বর"
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#2C5745]"
              />
            ) : (
              <span className="text-xs font-bold text-slate-800 block">
                {phone || "ফোন নম্বর যুক্ত করা নেই"}
              </span>
            )}
          </div>

          {/* Address */}
          <div className="p-3 rounded-2xl bg-[#EBE3A7] border border-slate-100 text-left space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ঠিকানা</span>
            {isEditing ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="আপনার পূর্ণ ঠিকানা"
                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#2C5745]"
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
                ? "bg-[#2C5745] hover:bg-[#2E2910] text-white"
                : "bg-[#2E2910] hover:bg-[#2C5745] text-[#EB7D00]"
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
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-[#EBE3A7] border border-slate-200 px-3 py-1 rounded-full">
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
            ? "bg-[#2C5745] text-white shadow-xs"
            : "text-slate-700 hover:bg-[#EBE3A7]/15 hover:text-[#2E2910]"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          আমার বিজ্ঞাপন
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          activeSection === "my-listings" ? "bg-[#EBE3A7] text-[#2E2910]" : "bg-slate-100 text-slate-600"
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
            ? "bg-[#2C5745] text-white shadow-xs"
            : "text-slate-700 hover:bg-[#EBE3A7]/15 hover:text-[#2E2910]"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          সংরক্ষিত বিজ্ঞাপন
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          activeSection === "saved-listings" ? "bg-[#EBE3A7] text-[#2E2910]" : "bg-slate-100 text-slate-600"
        }`}>
          {savedListingsCount}
        </span>
      </button>

      {/* Messages / Inbox */}
      <Link
        href="/inbox"
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-[#EBE3A7]/15 hover:text-[#2E2910] transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-[#2E2910] bg-[#EBE3A7]/20 hover:bg-[#EBE3A7]/35 border border-[#EBE3A7]/40 transition-colors mb-1.5"
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
          <h2 className="text-lg sm:text-xl font-bold text-[#2E2910]">{currentSectionTitle}</h2>
          {!isLoadingCurrentListings && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] text-xs font-bold border border-[#EBE3A7]/40">
              {currentListings.length}টি
            </span>
          )}
        </div>
      </div>

      {/* Listings List */}
      {isLoadingCurrentListings ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : currentListings.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EBE3A7]/20 flex items-center justify-center mx-auto text-[#2E2910]">
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
            className="inline-block px-5 py-2 bg-[#2C5745] hover:bg-[#2E2910] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
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
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#EBE3A7] p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                        <span className="px-2 py-0.5 rounded-md bg-[#2E2910] text-[#EB7D00] text-[10px] font-bold">
                          {propType}
                        </span>
                        <span className="text-xs font-bold text-red-600 truncate">
                          ৳{listing.rentPrice.toLocaleString("en-IN")} /মাস
                        </span>
                      </div>

                      <Link href={`/listings/${listing.id}`}>
                        <h3 className="text-sm font-bold text-[#2E2910] group-hover:text-[#2C5745] transition-colors line-clamp-1">
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
                      className="px-3.5 py-1.5 rounded-xl bg-[#2C5745]/15 hover:bg-[#2C5745]/25 text-[#2E2910] text-xs font-bold transition-colors"
                    >
                      দেখুন
                    </Link>
                    <button
                      type="button"
                      onClick={() => openDeleteSavedListingDialog(listing)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="সংরক্ষণ মুছুন"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }

            // Default: My Listings
            return (
              <div
                key={listing.id}
                className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#EBE3A7] p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                      <span className="px-2 py-0.5 rounded-md bg-[#2E2910] text-[#EB7D00] text-[10px] font-bold">
                        {propType}
                      </span>
                      <span className="text-xs font-bold text-red-600 truncate">
                        ৳{listing.rentPrice.toLocaleString("en-IN")} /মাস
                      </span>
                    </div>

                    <Link href={`/listings/${listing.id}?from=profile`}>
                      <h3 className="text-sm font-bold text-[#2E2910] group-hover:text-[#2C5745] transition-colors line-clamp-1">
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
                    className="px-3.5 py-1.5 rounded-xl bg-[#2C5745]/15 hover:bg-[#2C5745]/25 text-[#2E2910] text-xs font-bold transition-colors"
                  >
                    দেখুন
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push(`/post?listingId=${listing.id}`)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-[#2C5745] hover:bg-[#EBE3A7]/20 transition-colors cursor-pointer"
                    title="এডিট"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(listing)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="মুছুন"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900">বিজ্ঞাপন মুছে ফেলবেন?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            &quot;{listingToDelete.title}&quot; বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলা হবে।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={closeDeleteDialog}
            disabled={isDeletingListing}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={confirmDeleteListing}
            disabled={isDeletingListing}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDeletingListing ? "মুছে ফেলা হচ্ছে..." : "মুছুন"}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900">সংরক্ষণ থেকে সরাবেন?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            &quot;{savedListingToDelete.title}&quot; আপনার সংরক্ষিত তালিকা থেকে সরিয়ে ফেলা হবে।
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={closeDeleteSavedListingDialog}
            disabled={isDeletingSavedListing}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={confirmDeleteSavedListing}
            disabled={isDeletingSavedListing}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDeletingSavedListing ? "মুছে ফেলা হচ্ছে..." : "সরিয়ে ফেলুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Format Helpers
function getPropertyTypeLabel(typeVal: string) {
  return propertyTypes.find((p) => p.value === typeVal)?.label || typeVal || "টু-লেট";
}

function getLocationLabel(locVal: string) {
  return locations.find((l) => l.value === locVal)?.label || locVal || "ঢাকা";
}

function formatRentFromDate(dateStr: string) {
  if (!dateStr) return "অবিলম্বে";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("bn-BD", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}