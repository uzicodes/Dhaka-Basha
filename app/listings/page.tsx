"use client";

import { useState, useEffect } from 'react';
import { locations, propertyTypes } from "@/src/lib/constants";
import { getRecentListings } from "@/app/actions/getListings";
import Link from 'next/link';
import { Loader } from "@/app/components/GlobalLoader";

export default function Listings() {
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  const [isTypeSelectOpen, setIsTypeSelectOpen] = useState<boolean>(false);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedSubLocation, setSelectedSubLocation] = useState<string>("");
  const [expandedLoc, setExpandedLoc] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");


  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listings = await getRecentListings();
        setRecentListings(listings);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-32 pb-12">
      <div className="max-w-5xl w-full space-y-10">

        {/* Header & Search Section */}
        <div className="flex flex-col items-center text-center space-y-8 mt-16">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            আপনার পছন্দের বাসা খুঁজুন
          </h1>

          <div className="w-full max-w-3xl flex flex-col md:flex-row shadow-sm rounded-xl overflow-visible border-2 border-[#2d79f3] bg-white transition-all hover:shadow-md">

            {/* Dropdown Dhaka places */}
            <div className="relative w-full md:w-[43%] border-b md:border-b-0 md:border-r border-slate-500 group">
              {/* Location Pin Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-500 z-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              {/* Custom Select Button */}
              <button
                type="button"
                className="w-full h-full pl-11 pr-10 py-3.5 bg-transparent text-[#151717] outline-none cursor-pointer font-medium z-10 relative focus:bg-slate-50 flex items-center text-left rounded-t-[10px] md:rounded-none md:rounded-l-[10px]"
                onClick={() => {
                  setIsSelectOpen(!isSelectOpen);
                  setIsTypeSelectOpen(false);
                }}
                onBlur={() => setTimeout(() => setIsSelectOpen(false), 200)}
              >
                {selectedLocation
                  ? (() => {
                    const loc = locations.find(l => l.value === selectedLocation);
                    if (!loc) return <span className="text-gray-500">এলাকা নির্বাচন করুন</span>;
                    if (selectedSubLocation) {
                      const sub = loc.subLocations?.find(s => s.value === selectedSubLocation);
                      return <span className="truncate pr-4">{loc.label} - {sub?.label}</span>;
                    }
                    return <span className="truncate pr-4">{loc.label}</span>;
                  })()
                  : <span className="text-gray-500">এলাকা নির্বাচন করুন</span>}
              </button>

              {/* Custom Dropdown Menu */}
              {isSelectOpen && (
                <ul
                  className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-none max-h-60 overflow-y-auto z-50 py-1"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {locations.map((loc) => (
                    <div key={loc.value}>
                      <li
                        className={`px-4 py-2 text-slate-900 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors flex justify-between items-center ${expandedLoc === loc.value ? 'bg-slate-100 font-semibold' : ''}`}
                        onClick={(e) => {
                          if (loc.subLocations) {
                            e.stopPropagation();
                            setExpandedLoc(expandedLoc === loc.value ? "" : loc.value);
                          } else {
                            setSelectedLocation(loc.value);
                            setSelectedSubLocation("");
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
                              setSelectedLocation(loc.value);
                              setSelectedSubLocation("");
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
                                setSelectedLocation(loc.value);
                                setSelectedSubLocation(sub.value);
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

              {/* Dropdown Icon */}
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 z-20 transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="relative grow border-b md:border-b-0 group">
              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-600 z-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Custom Property Type Select */}
              <button
                type="button"
                className="w-full h-full pl-11 pr-10 py-3.5 bg-transparent text-[#151717] outline-none cursor-pointer font-medium z-10 relative focus:bg-slate-50 flex items-center text-left"
                onClick={() => {
                  setIsTypeSelectOpen(!isTypeSelectOpen);
                  setIsSelectOpen(false);
                }}
                onBlur={() => setTimeout(() => setIsTypeSelectOpen(false), 200)}
              >
                {selectedType
                  ? propertyTypes.find(t => t.value === selectedType)?.label
                  : <span className="text-gray-500">কি খুঁজছেন?</span>}
              </button>

              {/* Custom Dropdown Menu */}
              {isTypeSelectOpen && (
                <ul className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-none max-h-60 overflow-y-auto z-50 py-1">
                  {propertyTypes.map((type) => (
                    <li
                      key={type.value}
                      className="px-4 py-2 text-slate-900 hover:bg-[#2d79f3] hover:text-white cursor-pointer text-sm transition-colors text-left"
                      onClick={() => {
                        setSelectedType(type.value);
                        setIsTypeSelectOpen(false);
                      }}
                    >
                      {type.label}
                    </li>
                  ))}
                </ul>
              )}

              {/* Dropdown Icon */}
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 z-20 transition-transform duration-200 ${isTypeSelectOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <button className="w-full md:w-auto px-8 py-3.5 bg-[#2d79f3] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shrink-0 z-20 rounded-b-[10px] md:rounded-none md:rounded-r-[10px]">
              খুঁজুন
            </button>

          </div>
        </div>

        {/* Recent Listings Section */}
        <div className="w-full mt-36 pb-8">
          <div className="flex flex-col items-center mb-10 gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2d79f3] mb-1">
              সর্বশেষ প্রকাশিত
            </span>
            <h2 className="text-3xl font-bold text-slate-900">
              সাম্প্রতিক টু-লেট
            </h2>
            <div className="w-12 h-1 bg-[#2d79f3] rounded-full mt-1" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Top Accent */}
                  <div className="h-1.5 w-full bg-linear-to-r from-[#2d79f3] to-[#60a5fa]" />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Badge + Price */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-blue-50 text-[#2d79f3] text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                        {propertyTypes.find(pt => pt.value === listing.propertyType)?.label || listing.propertyType}
                      </span>
                      <div className="text-right">
                        <span className="text-[#2d79f3] font-bold text-lg leading-none">
                          ৳{listing.rentPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-400 text-xs block">/মাস</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base text-slate-900 mb-4 line-clamp-2 group-hover:text-[#2d79f3] transition-colors leading-snug">
                      {listing.title}
                    </h3>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-3" />

                    {/* Meta Info */}
                    <div className="space-y-2.5 mt-auto text-sm text-slate-500">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-50 shrink-0">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                        <span className="line-clamp-1">
                          {locations.find(l => l.value === listing.location)?.label || listing.location}
                          {listing.subLocation && ` — ${listing.subLocation}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 shrink-0">
                          <svg className="w-3.5 h-3.5 text-[#2d79f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span>শুরু: {listing.rentFrom}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-50 shrink-0">
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <span className="line-clamp-1">পোস্ট করেছেন: {listing.user?.name || "ব্যবহারকারী"}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/listings/${listing.id}`}
                      className="w-full mt-5 bg-[#2d79f3] text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors block text-center text-sm shadow-sm shadow-blue-200"
                    >
                      বিস্তারিত দেখুন →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">কোনো সাম্প্রতিক পোস্ট পাওয়া যায়নি</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}