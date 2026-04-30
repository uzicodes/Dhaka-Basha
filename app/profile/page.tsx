"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/app/actions/user";
import { updateProfileImage as updateDbProfileImage } from "@/app/actions/updateProfilePicture";
import { deleteUserListing, deleteSavedListing, getSavedListings, getUserListings } from "@/app/actions/getListings";

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

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/login?redirectUrl=/profile");
    }
  }, [isLoaded, user, router]);

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

    // Check file size (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert("ছবি ২ মেগাবাইটের কম হতে হবে");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          files: [{ name: file.name, type: file.type }],
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { results } = await response.json();
      const { signedUrl, publicUrl } = results[0];

      // 2. Upload to R2
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload to R2");

      // 3. Update database
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
    if (isDeletingListing) {
      return;
    }

    setListingToDelete(null);
  };

  const currentListings = activeSection === "my-listings" ? myListings : savedListings;
  const isLoadingCurrentListings = activeSection === "my-listings" ? isLoadingListings : isLoadingSavedListings;
  const currentSectionTitle = activeSection === "my-listings" ? "আমার বিজ্ঞাপন সমূহ" : "সংরক্ষিত বিজ্ঞাপন";

  const confirmDeleteListing = async () => {
    if (!listingToDelete) {
      return;
    }

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
    if (isDeletingSavedListing) {
      return;
    }

    setSavedListingToDelete(null);
  };

  const confirmDeleteSavedListing = async () => {
    if (!savedListingToDelete) {
      return;
    }

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
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-32 pb-12 min-h-screen">
      <div className="w-full max-w-4xl space-y-6">

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm border-2 border-[#2d79f3] flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture Logic */}
          <div className="shrink-0 relative group">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 object-cover shadow-sm"
                />
              ) : isGoogleUser && user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 object-cover shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 bg-slate-100 shadow-sm flex items-center justify-center text-slate-500">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}

              {/* Upload Button Icon (Bottom-right) */}
              {isEditing && (
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-[#2d79f3] rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer shadow-md hover:bg-blue-600 transition-colors z-10"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              {/* Full Overlay on Hover */}
              {isEditing && (
                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {!isUploading && <span className="text-white text-[10px] font-bold mt-8">পরিবর্তন করুন</span>}
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start grow text-center md:text-left">
            {isEditing ? (
              <div className="mb-2 w-full max-w-sm">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full text-2xl md:text-3xl font-bold text-[#151717] border-b-2 border-[#2d79f3] focus:outline-none bg-transparent"
                />
              </div>
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-[#151717]">
                {name || "N/A"}
              </h1>
            )}
            <p className="text-slate-500 mt-1">{user.emailAddresses[0]?.emailAddress ?? "N/A"}</p>

            <div className="mt-4 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`w-full px-3 py-1 text-sm text-[#151717] transition-all ${isEditing ? "rounded-none border-[1.5px] border-[#ecedec] bg-white shadow-sm" : "border-transparent bg-transparent"}`}>
                <p className="text-xs text-purple-700 mb-1">ফোন নম্বর</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="১১ ডিজিট নম্বর"
                      className="w-full border-none p-0 leading-tight focus:outline-none"
                    />
                    <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 16H9v-2l8.586-8.586z" />
                    </svg>
                  </div>
                ) : (
                  <p>{phone || "N/A"}</p>
                )}
              </div>

              <div className={`w-full px-3 py-1 text-sm text-[#151717] transition-all ${isEditing ? "rounded-none border-[1.5px] border-[#ecedec] bg-white shadow-sm" : "border-transparent bg-transparent"}`}>
                <p className="text-xs text-purple-700 mb-1">ঠিকানা</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="আপনার ঠিকানা"
                      className="w-full border-none p-0 leading-tight focus:outline-none"
                    />
                    <svg className="w-4 h-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                ) : (
                  <p>{address ? address.charAt(0).toUpperCase() + address.slice(1) : "N/A"}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 items-center justify-center md:justify-start">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 bg-slate-100 text-red-700 hover:bg-slate-300 text-sm font-medium rounded-full transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "সেভিং..." : (isEditing ? "সেভ" : "প্রোফাইল এডিট")}
              </button>
              {memberSince && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-purple-700">
                  সদস্য: {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- DASHBOARD SECTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Sidebar / Quick Links */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-[20px] shadow-sm border-[1.5px] border-[#ecedec]">
              <h2 className="text-lg font-bold text-[#151717] mb-4 border-b pb-2">ড্যাশবোর্ড মেনু</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveSection("my-listings")}
                    className={`w-full text-left px-4 py-2.5 rounded-none font-medium transition-colors ${activeSection === "my-listings"
                      ? "bg-[#2d79f3] text-white"
                      : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                      }`}
                  >
                    আমার বিজ্ঞাপন সমূহ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveSection("saved-listings")}
                    className={`w-full text-left px-4 py-2.5 rounded-none font-medium transition-colors ${activeSection === "saved-listings"
                      ? "bg-[#2d79f3] text-white"
                      : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                      }`}
                  >
                    সংরক্ষিত বিজ্ঞাপন (Saved)
                  </button>
                </li>
                <li>
                  <Link
                    href="/inbox"
                    className="block w-full text-left px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-none font-medium transition-colors cursor-pointer"
                  >
                    ম্যাসেজ সমূহ
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-none font-medium transition-colors cursor-pointer"
                  >
                    লগ আউট
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content Area (My Listings) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#151717]">{currentSectionTitle}</h2>
              <Link
                href="/post"
                className="text-sm font-medium text-[#2d79f3] hover:underline"
              >
                + নতুন পোস্ট করুন
              </Link>
            </div>

            {/* Real Listing Cards */}
            {isLoadingCurrentListings ? (
              <p className="text-slate-500">লোডিং...</p>
            ) : currentListings.length === 0 ? (
              <p className="text-slate-500">
                {activeSection === "my-listings"
                  ? "আপনার কোনো বিজ্ঞাপন নেই।"
                  : "আপনি এখনো কোনো বিজ্ঞাপন সংরক্ষণ করেননি।"}
              </p>
            ) : currentListings.map((listing) => {
              const authorName = listing.user?.name || "অজানা লেখক";
              const rentFromText = formatRentFromDate(listing.rentFrom);

              if (activeSection === "saved-listings") {
                return (
                  <div
                    key={listing.id}
                    className="group rounded-[18px] border border-[#d7e6ff] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d79f3] hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">


                      <div className="min-w-0 flex-1">
                        <h3 className="mt-2 truncate text-lg font-semibold text-[#151717]">
                          {listing.title}
                        </h3>

                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-500">লেখক:</span>
                            <span className="font-medium text-slate-800">{authorName}</span>
                            {listing.propertyType && (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                {listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <span className="text-purple-500">ভাড়া শুরু:</span>
                              <span className="font-medium text-slate-800">{rentFromText}</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <span className="text-purple-500">ভাড়া:</span>
                              <span className="font-medium text-slate-800">৳ {listing.rentPrice} / মাস</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <svg className="h-4 w-4 text-[#2d79f3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-purple-500">স্থান:</span>
                              <span className="font-medium text-slate-800">
                                {listing.location && listing.location.charAt(0).toUpperCase() + listing.location.slice(1)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#d7e6ff] px-3 py-2 text-sm font-medium text-[#043307] transition-colors hover:bg-red-100"
                        title="View"
                      >
                        দেখুন
                      </Link>
                      <button
                        type="button"
                        onClick={() => openDeleteSavedListingDialog(listing)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-none transition-colors shrink-0"
                        title="Delete from saved"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={listing.id}
                  className="group rounded-[18px] border border-[#d7e6ff] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2d79f3] hover:shadow-md"
                >
                  <div className="flex items-start gap-4">

                    <div className="min-w-0 flex-1">
                      <div className="mt-2 flex items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-[#151717]">
                          {listing.title}
                        </h3>
                        {listing.propertyType && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1)}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-slate-700 whitespace-nowrap">
                            <span className="text-purple-500">ভাড়া শুরু:</span>
                            <span className="font-medium text-slate-800">{rentFromText}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700 whitespace-nowrap">
                            <span className="text-purple-500">ভাড়া:</span>
                            <span className="font-medium text-slate-800">৳ {listing.rentPrice} / মাস</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700 whitespace-nowrap">
                            <svg className="h-4 w-4 text-[#2d79f3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-purple-500">স্থান:</span>
                            <span className="font-medium text-slate-800">
                              {listing.location && listing.location.charAt(0).toUpperCase() + listing.location.slice(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/listings/${listing.id}?from=profile`}
                      className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#d7e6ff] px-3 py-2 text-sm font-medium text-[#043307] transition-colors hover:bg-red-100"
                      title="View"
                    >
                      দেখুন
                    </Link>
                    <button
                      type="button"
                      onClick={() => router.push(`/post?listingId=${listing.id}`)}
                      className="p-2 text-slate-400 hover:text-[#2d79f3] hover:bg-blue-50 rounded-none transition-colors shrink-0"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteDialog(listing)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-none transition-colors shrink-0"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-[#151717]">এই পোস্টটি মুছতে চান?</h3>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{listingToDelete.title}</span> স্থায়ীভাবে মুছে যাবে এবং আর কোথাও দেখা যাবে না।
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeletingListing}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                না
              </button>
              <button
                type="button"
                onClick={confirmDeleteListing}
                disabled={isDeletingListing}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingListing ? "ডিলিট হচ্ছে..." : "হ্যাঁ, ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {savedListingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-[#151717]">এই সংরক্ষিত পোস্টটি সরাতে চান?</h3>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">{savedListingToDelete.title}</span> আপনার সংরক্ষিত তালিকা থেকে সরিয়ে ফেলা হবে।
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteSavedListingDialog}
                disabled={isDeletingSavedListing}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                না
              </button>
              <button
                type="button"
                onClick={confirmDeleteSavedListing}
                disabled={isDeletingSavedListing}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingSavedListing ? "সরাচ্ছে..." : "হ্যাঁ, সরান"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}