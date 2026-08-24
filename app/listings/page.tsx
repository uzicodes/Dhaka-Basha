"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { locations, propertyTypes } from "@/src/lib/constants";
import { getRecentListings, searchListings } from "@/app/actions/getListings";

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsLoadingSkeleton />}>
      <ListingsContent />
    </Suspense>
  );
}

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state initialization
  const urlLocation = searchParams.get("location") || "";
  const urlSubLocation = searchParams.get("subLocation") || "";
  const urlType = searchParams.get("type") || "";
  const urlSort = searchParams.get("sort") || "newest";

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState<string>(urlLocation);
  const [selectedSubLocation, setSelectedSubLocation] = useState<string>(urlSubLocation);
  const [selectedType, setSelectedType] = useState<string>(urlType);
  const [sortBy, setSortBy] = useState<string>(urlSort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dropdown States
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState<boolean>(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>("");
  const [expandedLoc, setExpandedLoc] = useState<string>("");

  // Data States
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedLocation(urlLocation);
    setSelectedSubLocation(urlSubLocation);
    setSelectedType(urlType);
    if (urlLocation) setExpandedLoc(urlLocation);
  }, [urlLocation, urlSubLocation, urlType]);

  // Fetch initial listings or search query
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        if (urlLocation || urlSubLocation || urlType) {
          const results = await searchListings({
            location: urlLocation || undefined,
            subLocation: urlSubLocation || undefined,
            propertyType: urlType || undefined,
          });
          setListings(results);
        } else {
          const recent = await getRecentListings();
          setListings(recent);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [urlLocation, urlSubLocation, urlType]);

  // Update URL helper
  const updateUrlParams = (loc: string, sub: string, type: string, sort: string = sortBy) => {
    const params = new URLSearchParams();
    if (loc) params.set("location", loc);
    if (sub) params.set("subLocation", sub);
    if (type) params.set("type", type);
    if (sort && sort !== "newest") params.set("sort", sort);

    const queryString = params.toString();
    router.push(queryString ? `/listings?${queryString}` : "/listings", { scroll: false });
  };

  // Perform search
  const handleExecuteSearch = async (loc = selectedLocation, sub = selectedSubLocation, type = selectedType) => {
    setIsSearching(true);
    setIsLocDropdownOpen(false);
    setIsTypeDropdownOpen(false);

    try {
      updateUrlParams(loc, sub, type);
      if (loc || sub || type) {
        const results = await searchListings({
          location: loc || undefined,
          subLocation: sub || undefined,
          propertyType: type || undefined,
        });
        setListings(results);
      } else {
        const recent = await getRecentListings();
        setListings(recent);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset all filters
  const handleResetFilters = async () => {
    setSelectedLocation("");
    setSelectedSubLocation("");
    setSelectedType("");
    setExpandedLoc("");
    updateUrlParams("", "", "", "newest");
    setIsLoading(true);
    try {
      const recent = await getRecentListings();
      setListings(recent);
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick category select
  const handleCategorySelect = (typeVal: string) => {
    const newType = selectedType === typeVal ? "" : typeVal;
    setSelectedType(newType);
    handleExecuteSearch(selectedLocation, selectedSubLocation, newType);
  };

  // Filtered locations for dropdown search
  const filteredLocations = useMemo(() => {
    if (!locationSearchQuery.trim()) return locations;
    const q = locationSearchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.label.toLowerCase().includes(q) ||
        loc.value.toLowerCase().includes(q) ||
        loc.subLocations?.some(
          (sub) => sub.label.toLowerCase().includes(q) || sub.value.toLowerCase().includes(q)
        )
    );
  }, [locationSearchQuery]);

  // Sorted listings
  const sortedListings = useMemo(() => {
    if (!listings || listings.length === 0) return [];
    const list = [...listings];
    if (sortBy === "price_asc") {
      return list.sort((a, b) => a.rentPrice - b.rentPrice);
    }
    if (sortBy === "price_desc") {
      return list.sort((a, b) => b.rentPrice - a.rentPrice);
    }
    return list; // default newest
  }, [listings, sortBy]);

  // Labels
  const selectedLocationObj = locations.find((l) => l.value === selectedLocation);
  const selectedSubLocationObj = selectedLocationObj?.subLocations?.find(
    (s) => s.value === selectedSubLocation
  );
  const selectedTypeObj = propertyTypes.find((t) => t.value === selectedType);

  const hasActiveFilters = Boolean(selectedLocation || selectedSubLocation || selectedType);

  return (
    <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#EBE3A7]/15 via-[#2C5745]/5 to-transparent pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-8">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBE3A7]/25 border border-[#EBE3A7]/40 text-[#2E2910] text-xs font-bold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EBE3A7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2C5745]"></span>
            </span>
            ভেরিফায়েড টু-লেট পোর্টাল
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2E2910] tracking-tight leading-tight">
            আপনার পছন্দের <span className="text-[#2C5745]">বাসা খুঁজুন</span> সহজে
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-normal">
            মেস, ফ্ল্যাট, সিঙ্গেল রুম ও অফিস স্পেস—ঢাকা শহরের যে কোনো এলাকার বাসা খুঁজে নিন সরাসরি মালিকের সাথে যোগাযোগ করে।
          </p>
        </section>

        {/* UNIFIED SEARCH CARD */}
        <div className="relative z-30 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl md:rounded-full shadow-lg shadow-[#2E2910]/5 border border-slate-200/90 p-2 md:p-2.5 transition-all focus-within:ring-2 focus-within:ring-[#EBE3A7]/30 focus-within:border-[#2C5745]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              
              {/* Location Input / Dropdown Trigger */}
              <div className="relative md:col-span-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsLocDropdownOpen(!isLocDropdownOpen);
                    setIsTypeDropdownOpen(false);
                  }}
                  className="w-full h-13 px-4 rounded-xl md:rounded-full hover:bg-[#EBE3A7] text-left flex items-center gap-3 transition-colors border border-transparent focus:border-slate-200 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">এলাকা / লোকেশন</span>
                    <span className={`block text-sm font-semibold truncate ${selectedLocation ? "text-[#2E2910]" : "text-slate-500"}`}>
                      {selectedLocationObj
                        ? `${selectedLocationObj.label} ${selectedSubLocationObj ? `(${selectedSubLocationObj.label})` : ""}`
                        : "এলাকা নির্বাচন করুন"}
                    </span>
                  </div>
                  {selectedLocation && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation("");
                        setSelectedSubLocation("");
                        setExpandedLoc("");
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
                      title="মুছুন"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isLocDropdownOpen ? "rotate-180 text-[#2C5745]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Location Dropdown Modal */}
                {isLocDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLocDropdownOpen(false)} />
                    <div
                      data-lenis-prevent="true"
                      className="absolute left-0 top-full mt-2 w-full sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Search box within location dropdown */}
                      <div className="p-3 border-b border-slate-100 bg-[#EBE3A7]">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="এলাকার নাম খুঁজুন (যেমন: ধানমন্ডি)..."
                            value={locationSearchQuery}
                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-[#2C5745] text-slate-800 placeholder-slate-400 font-medium"
                            autoFocus
                          />
                          <svg className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Dropdown Items List */}
                      <div
                        data-lenis-prevent="true"
                        onWheel={(e) => e.stopPropagation()}
                        className="max-h-72 overflow-y-auto overscroll-contain p-1.5 divide-y divide-slate-100/60"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocation("");
                            setSelectedSubLocation("");
                            setIsLocDropdownOpen(false);
                            setExpandedLoc("");
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${!selectedLocation ? "bg-[#2C5745]/10 text-[#2E2910]" : "text-slate-700 hover:bg-[#EBE3A7]"}`}
                        >
                          <span>যেকোনো এলাকা (All Locations)</span>
                          {!selectedLocation && <span className="text-[#2C5745] font-bold">✓</span>}
                        </button>

                        {filteredLocations.map((loc) => {
                          const isLocSelected = selectedLocation === loc.value && !selectedSubLocation;
                          const isExpanded = expandedLoc === loc.value;

                          return (
                            <div key={loc.value} className="pt-1">
                              <div
                                onClick={() => {
                                  if (loc.subLocations) {
                                    setExpandedLoc(isExpanded ? "" : loc.value);
                                  } else {
                                    setSelectedLocation(loc.value);
                                    setSelectedSubLocation("");
                                    setIsLocDropdownOpen(false);
                                  }
                                }}
                                className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-xs font-semibold transition-colors flex items-center justify-between ${isLocSelected ? "bg-[#2C5745]/10 text-[#2E2910]" : "text-slate-800 hover:bg-[#EBE3A7]"}`}
                              >
                                <span>{loc.label}</span>
                                {loc.subLocations ? (
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <span className="text-[10px] font-semibold bg-[#EBE3A7]/20 px-1.5 py-0.5 rounded-md text-[#2E2910]">
                                      {loc.subLocations.length}টি সাব-এলাকা
                                    </span>
                                    <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180 text-[#2C5745]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                ) : (
                                  isLocSelected && <span className="text-[#2C5745] font-bold">✓</span>
                                )}
                              </div>

                              {/* Sublocations Accordion */}
                              {loc.subLocations && isExpanded && (
                                <div className="ml-3 pl-2 my-1 border-l-2 border-[#EBE3A7] space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLocation(loc.value);
                                      setSelectedSubLocation("");
                                      setIsLocDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${selectedLocation === loc.value && !selectedSubLocation ? "bg-[#2C5745]/10 text-[#2E2910] font-bold" : "text-slate-600 hover:bg-slate-100"}`}
                                  >
                                    <span>{loc.label} - পুরো এলাকা</span>
                                  </button>

                                  {loc.subLocations.map((sub) => {
                                    const isSubSelected = selectedLocation === loc.value && selectedSubLocation === sub.value;
                                    return (
                                      <button
                                        key={sub.value}
                                        type="button"
                                        onClick={() => {
                                          setSelectedLocation(loc.value);
                                          setSelectedSubLocation(sub.value);
                                          setIsLocDropdownOpen(false);
                                        }}
                                        className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${isSubSelected ? "bg-[#2C5745] text-white font-bold" : "text-slate-600 hover:bg-slate-100"}`}
                                      >
                                        <span>{sub.label}</span>
                                        {isSubSelected && <span>✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Property Type Dropdown Trigger */}
              <div className="relative md:col-span-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsTypeDropdownOpen(!isTypeDropdownOpen);
                    setIsLocDropdownOpen(false);
                  }}
                  className="w-full h-13 px-4 rounded-xl md:rounded-full hover:bg-[#EBE3A7] text-left flex items-center gap-3 transition-colors border border-transparent focus:border-slate-200 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#2C5745]/15 text-[#2C5745] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">প্রপার্টির ধরন</span>
                    <span className={`block text-sm font-semibold truncate ${selectedType ? "text-[#2E2910]" : "text-slate-500"}`}>
                      {selectedTypeObj ? selectedTypeObj.label : "কি খুঁজছেন?"}
                    </span>
                  </div>
                  {selectedType && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedType("");
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
                      title="মুছুন"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </span>
                  )}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isTypeDropdownOpen ? "rotate-180 text-[#2C5745]" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Property Type Dropdown Modal */}
                {isTypeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsTypeDropdownOpen(false)} />
                    <div
                      data-lenis-prevent="true"
                      onWheel={(e) => e.stopPropagation()}
                      className="absolute left-0 top-full mt-2 w-full sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden max-h-80 overflow-y-auto overscroll-contain p-2 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedType("");
                          setIsTypeDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${!selectedType ? "bg-[#2C5745]/10 text-[#2E2910] font-bold" : "text-slate-700 hover:bg-[#EBE3A7]"}`}
                      >
                        <span>যেকোনো ক্যাটাগরি (All Types)</span>
                        {!selectedType && <span className="text-[#2C5745]">✓</span>}
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      {propertyTypes.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => {
                            setSelectedType(t.value);
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${selectedType === t.value ? "bg-[#2C5745] text-white font-bold" : "text-slate-800 hover:bg-[#EBE3A7]"}`}
                        >
                          <span>{t.label}</span>
                          {selectedType === t.value && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Search CTA Button */}
              <div className="md:col-span-3">
                <button
                  type="button"
                  disabled={isSearching}
                  onClick={() => handleExecuteSearch()}
                  className="w-full h-13 px-6 bg-[#2C5745] hover:bg-[#2E2910] active:scale-[0.98] text-white font-bold text-sm rounded-xl md:rounded-full shadow-md shadow-[#2C5745]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      খুঁজছে...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      বাসা খুঁজুন
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* QUICK CATEGORY FILTER PILLS */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1.5 scrollbar-none justify-start md:justify-center">
          <button
            type="button"
            onClick={() => handleCategorySelect("")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              !selectedType
                ? "bg-[#2E2910] text-[#EB7D00] shadow-xs"
                : "bg-white text-slate-700 border border-slate-200/90 shadow-2xs hover:bg-[#EBE3A7]/20 hover:text-[#2E2910]"
            }`}
          >
            সকল টু-লেট
          </button>
          {propertyTypes.map((type) => {
            const isSelected = selectedType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleCategorySelect(type.value)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#2E2910] text-[#EB7D00] shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200/90 shadow-2xs hover:bg-[#EBE3A7]/20 hover:text-[#2E2910]"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </section>

        {/* RESULTS HEADER & SORTING / VIEW CONTROLS */}
        <section className="border-t border-slate-200/80 pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Title & Results Counter */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-[#2E2910]">
                  {hasActiveFilters ? "অনুসন্ধানের ফলাফল" : "সাম্প্রতিক টু-লেট সমূহ"}
                </h2>
                {!isLoading && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] text-xs font-bold border border-[#EBE3A7]/40">
                    {sortedListings.length}টি
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {hasActiveFilters
                  ? `${selectedLocationObj?.label || ""} ${selectedSubLocationObj ? `(${selectedSubLocationObj.label})` : ""} ${selectedTypeObj ? `• ${selectedTypeObj.label}` : ""} ফিল্টারকৃত প্রপার্টি`
                  : "ঢাকা শহরের সর্বশেষ পোস্ট করা টু-লেট তালিকা"}
              </p>
            </div>

            {/* Sort & Layout Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden md:inline">সাজান:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateUrlParams(selectedLocation, selectedSubLocation, selectedType, e.target.value);
                  }}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-[#2C5745] cursor-pointer shadow-2xs"
                >
                  <option value="newest">সর্বশেষ পোস্ট আগে</option>
                  <option value="price_asc">ভাড়া: কম থেকে বেশি</option>
                  <option value="price_desc">ভাড়া: বেশি থেকে কম</option>
                </select>
              </div>

              {/* View Mode Toggle (Grid vs List) */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="গ্রিড ভিউ"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#2C5745]/15 text-[#2C5745]" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="লিস্ট ভিউ"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#2C5745]/15 text-[#2C5745]" : "text-slate-400 hover:text-slate-700"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

            </div>

          </div>

          {/* Active Filter Chips Bar (When active) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">সক্রিয় ফিল্টার:</span>
              {selectedLocation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] border border-[#EBE3A7]/40 text-xs font-semibold">
                  এলাকা: {selectedLocationObj?.label || selectedLocation}
                  {selectedSubLocation && ` - ${selectedSubLocationObj?.label || selectedSubLocation}`}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation("");
                      setSelectedSubLocation("");
                      handleExecuteSearch("", "", selectedType);
                    }}
                    className="hover:text-black cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C5745]/15 text-[#2E2910] border border-[#2C5745]/30 text-xs font-semibold">
                  ধরন: {selectedTypeObj?.label || selectedType}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType("");
                      handleExecuteSearch(selectedLocation, selectedSubLocation, "");
                    }}
                    className="hover:text-black cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors ml-auto flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                সব ফিল্টার মুছুন
              </button>
            </div>
          )}
        </section>

        {/* LISTINGS DISPLAY GRID / LIST */}
        <section className="min-h-[350px]">
          {isLoading ? (
            <ListingsLoadingSkeleton />
          ) : sortedListings.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {sortedListings.map((listing) => (
                <ModernListingCard key={listing.id} listing={listing} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <EmptyListingsState onReset={handleResetFilters} />
          )}
        </section>

      </div>
    </main>
  );
}

// MODERN PROPERTY CARD COMPONENT
function ModernListingCard({ listing, viewMode = "grid" }: { listing: any; viewMode?: "grid" | "list" }) {
  const propType = propertyTypes.find((pt) => pt.value === listing.propertyType)?.label || listing.propertyType;
  const locObj = locations.find((l) => l.value === listing.location);
  const locLabel = locObj?.label || listing.location;
  const subLocLabel = listing.subLocation
    ? locObj?.subLocations?.find((sl) => sl.value === listing.subLocation)?.label || listing.subLocation
    : "";

  const hasImages = listing.images && Array.isArray(listing.images) && listing.images.length > 0;
  const firstImage = hasImages ? listing.images[0] : null;

  if (viewMode === "list") {
    return (
      <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#EBE3A7] shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch">
        
        {/* List Thumbnail */}
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
          {hasImages ? (
            <Image
              src={firstImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 256px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4">
              <svg className="w-10 h-10 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[11px] font-medium">ছবি নেই</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-[#2E2910] text-[#EB7D00] text-[11px] font-bold border border-white/20 shadow-2xs">
              {propType}
            </span>
          </div>
          {hasImages && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {listing.images.length}টি ছবি
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {locLabel} {subLocLabel && `(${subLocLabel})`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#2C5745] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  ভাড়া: {listing.rentFrom}
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <span className="text-xl font-extrabold text-red-600">
                  ৳{listing.rentPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-slate-400 font-medium"> /মাস</span>
              </div>
            </div>

            <Link href={`/listings/${listing.id}`}>
              <h3 className="text-base sm:text-lg font-bold text-[#2E2910] group-hover:text-[#2C5745] transition-colors line-clamp-1">
                {listing.title}
              </h3>
            </Link>

            <p className="text-xs text-slate-500 line-clamp-2">{listing.address}</p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] overflow-hidden flex items-center justify-center text-[10px] font-bold">
                {listing.user?.profileImage ? (
                  <Image src={listing.user.profileImage} alt={listing.user?.name || ""} width={24} height={24} className="object-cover" />
                ) : (
                  listing.user?.name?.[0] || "U"
                )}
              </div>
              <span className="text-xs font-semibold text-slate-700">{listing.user?.name || "ইউজার"}</span>
            </div>

            <div className="flex items-center gap-2">
              {listing.contactInfo && (
                <a
                  href={`tel:${listing.contactInfo}`}
                  className="px-3 py-1.5 rounded-lg bg-[#2C5745]/15 hover:bg-[#2C5745]/25 text-[#2E2910] text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  কল
                </a>
              )}
              <Link
                href={`/listings/${listing.id}`}
                className="px-4 py-1.5 rounded-lg bg-[#2C5745] hover:bg-[#2E2910] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
              >
                বিস্তারিত →
              </Link>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // DEFAULT GRID VIEW
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#EBE3A7] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* Thumbnail Banner */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        {hasImages ? (
          <Image
            src={firstImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EBE3A7] via-[#EBE3A7]/10 to-slate-200 text-slate-400">
            <svg className="w-12 h-12 mb-1.5 opacity-40 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[11px] font-medium text-slate-500">ঢাকা-বাসা ভেরিফাইড প্রপার্টি</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-[#2E2910] text-[#EB7D00] text-[11px] font-bold border border-white/20 shadow-2xs">
            {propType}
          </span>
          {hasImages && (
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {listing.images.length}
            </span>
          )}
        </div>

        {/* Rent badge overlay on thumbnail */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-white border border-white/10 shadow-md">
            <span className="text-base font-extrabold text-red-500">
              ৳{listing.rentPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-300 font-medium"> /মাস</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5">
          {/* Location & Rent Date / Call Action */}
          <div className="flex items-start justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[58%] pt-0.5">
              <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="truncate">{locLabel} {subLocLabel && `(${subLocLabel})`}</span>
            </span>

            {/* Date & Call Button */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="flex items-center gap-1 text-[11px] bg-[#EBE3A7]/20 text-[#2E2910] font-semibold px-2 py-0.5 rounded-md">
                <svg className="w-3 h-3 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {listing.rentFrom}
              </span>
              {listing.contactInfo && (
                <a
                  href={`tel:${listing.contactInfo}`}
                  title={`কল করুন: ${listing.contactInfo}`}
                  className="px-2.5 py-0.5 rounded-md bg-[#2C5745]/15 hover:bg-[#2C5745]/25 text-[#2E2910] text-[11px] font-bold transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  কল
                </a>
              )}
            </div>
          </div>

          {/* Title */}
          <Link href={`/listings/${listing.id}`}>
            <h3 className="text-base font-bold text-[#2E2910] group-hover:text-[#2C5745] transition-colors line-clamp-2 leading-snug">
              {listing.title}
            </h3>
          </Link>

          {/* Address */}
          <p className="text-xs text-slate-500 line-clamp-1 font-normal">
            {listing.address}
          </p>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          
          {/* User info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-full bg-[#EBE3A7]/20 text-[#2E2910] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold">
              {listing.user?.profileImage ? (
                <Image src={listing.user.profileImage} alt={listing.user?.name || ""} width={24} height={24} className="object-cover" />
              ) : (
                listing.user?.name?.[0] || "U"
              )}
            </div>
            <span className="text-xs font-semibold text-slate-700 truncate" title={listing.user?.name || "ইউজার"}>
              {listing.user?.name || "ইউজার"}
            </span>
          </div>

          {/* Actions */}
          <div className="shrink-0">
            <Link
              href={`/listings/${listing.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-[#2C5745] hover:bg-[#2E2910] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            >
              বিস্তারিত →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

// SKELETON LOADING STATE
function ListingsLoadingSkeleton() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden space-y-4 p-4">
          <div className="w-full h-44 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-200 rounded-md w-1/2" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <div className="w-20 h-4 bg-slate-200 rounded-md" />
            <div className="w-16 h-8 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// EMPTY STATE COMPONENT
function EmptyListingsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto space-y-5">
      <div className="w-18 h-18 bg-[#EBE3A7]/20 rounded-full flex items-center justify-center mx-auto text-[#2E2910]">
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[#2E2910]">কোনো ফলাফল পাওয়া যায়নি</h3>
        <p className="text-slate-500 text-xs sm:text-sm">
          আপনার নির্বাচিত ফিল্টারে কোনো বাসা পাওয়া যায়নি। এলাকা বা প্রপার্টির ধরন পরিবর্তন করে পুনরায় চেষ্টা করুন।
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="px-5 py-2.5 bg-[#2C5745] hover:bg-[#2E2910] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
      >
        সকল ফিল্টার রিসেট করুন
      </button>
    </div>
  );
}