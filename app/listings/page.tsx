"use client";

import { useState } from 'react';

export default function Listings() {
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  const [isTypeSelectOpen, setIsTypeSelectOpen] = useState<boolean>(false);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedSubLocation, setSelectedSubLocation] = useState<string>("");
  const [expandedLoc, setExpandedLoc] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");


  const locations = [
    { 
      value: "gulshan", 
      label: "গুলশান (Gulshan)",
      subLocations: [
        { value: "1", label: "১ (1)" },
        { value: "2", label: "২ (2)" }
      ]
    },
    { value: "banani", label: "বনানী (Banani)" },
    { 
      value: "baridhara", 
      label: "বারিধারা (Baridhara)",
      subLocations: [
        { value: "block-j", label: "ব্লক জে (Block J)" },
        { value: "block-k", label: "ব্লক কে (Block K)" },
        { value: "block-h", label: "ব্লক এইচ (Block H)" }
      ]
    },
    { 
      value: "dhanmondi", 
      label: "ধানমন্ডি (Dhanmondi)",
      subLocations: [
        { value: "road-27", label: "রোড ২৭ (Road 27)" },
        { value: "road-8", label: "রোড ৮ (Road 8)" },
        { value: "road-32", label: "রোড ৩২ (Road 32)" }
      ]
    },
    { 
      value: "mirpur", 
      label: "মিরপুর (Mirpur)",
      subLocations: [
        { value: "1", label: "১ (1)" },
        { value: "2", label: "২ (2)" },
        { value: "10", label: "১০ (10)" },
        { value: "11", label: "১১ (11)" },
        { value: "12", label: "১২ (12)" }
      ]
    },
    { 
      value: "uttara", 
      label: "উত্তরা (Uttara)",
      subLocations: [
        { value: "sectors-1-10", label: "সেক্টর ১-১০ (Sectors 1-10)" },
        { value: "sectors-11-14", label: "সেক্টর ১১-১৪ (Sectors 11-14)" },
        { value: "sectors-15-18", label: "সেক্টর ১৫-১৮ (Sectors 15-18)" }
      ]
    },
    { value: "mohammadpur", label: "মোহাম্মদপুর (Mohammadpur)" },
    { value: "mohakhali", label: "মহাখালী (Mohakhali)" },
    { 
      value: "bashundhara", 
      label: "বসুন্ধরা (Bashundhara)",
      subLocations: [
        { value: "block-a", label: "ব্লক এ (Block A)" },
        { value: "block-b", label: "ব্লক বি (Block B)" },
        { value: "block-c", label: "ব্লক সি (Block C)" },
        { value: "block-d", label: "ব্লক ডি (Block D)" },
        { value: "block-e", label: "ব্লক ই (Block E)" },
        { value: "block-f", label: "ব্লক এফ (Block F)" },
        { value: "block-g", label: "ব্লক জি (Block G)" },
        { value: "block-h", label: "ব্লক এইচ (Block H)" },
        { value: "block-i", label: "ব্লক আই (Block I)" },
        { value: "block-j", label: "ব্লক জে (Block J)" }
      ]
    },
    { 
      value: "badda", 
      label: "বাড্ডা (Badda)",
      subLocations: [
        { value: "moddho-badda", label: "মধ্য বাড্ডা (Moddho Badda)" },
        { value: "uttar-badda", label: "উত্তর বাড্ডা (Uttar Badda)" },
        { value: "merul-badda", label: "মেরুল বাড্ডা (Merul Badda)" }
      ]
    },
    { value: "niketon", label: "নিকেতন (Niketon)" },
    { value: "motijheel", label: "মতিঝিল (Motijheel)" },
    { value: "aftabnagar", label: "আফতাবনগর (Aftabnagar)" },
    { value: "khilgaon", label: "খিলগাঁও (Khilgaon)" },
    { value: "tejgaon", label: "তেজগাঁও (Tejgaon)" },
    { value: "jigatola", label: "জিগাতলা (Jigatola)" },
    { value: "pilkhana", label: "পিলখানা (Pilkhana)" },
    { value: "hazaribagh", label: "হাজারীবাগ (Hazaribagh)" },
    { value: "malibagh", label: "মালিবাগ (Malibagh)" },
    { value: "rampura", label: "রামপুরা (Rampura)" },
    { value: "banasree", label: "বনশ্রী (Banasree)" },
    { value: "shantinagar", label: "শান্তিনগর (Shantinagar)" },
    { value: "demra", label: "ডেমরা (Demra)" },
    { value: "shyamoli", label: "শ্যামলী (Shyamoli)" },
    { value: "kallyanpur", label: "কল্যাণপুর (Kallyanpur)" },
    { value: "agargaon", label: "আগারগাঁও (Agargaon)" },
    { value: "kuril", label: "কুড়িল (Kuril)" },
    { value: "azimpur", label: "আজিমপুর (Azimpur)" },
    { value: "gulistan", label: "গুলিস্তান (Gulistan)" },
    { value: "farmgate", label: "ফার্মগেট (Farmgate)" },
    { value: "karwan bazar", label: "কারওয়ান বাজার (Karwan Bazar)" },
    { value: "shiddheswari", label: "সিদ্ধেশ্বরী (Shiddheswari)" },
    { value: "new eskaton", label: "নিউ ইস্কাটন (New Eskaton)" },
    { value: "old dhaka", label: "পুরান ঢাকা (Old Dhaka)" },
    { value: "rajarbagh", label: "রাজারবাগ (Rajarbagh)" },
    { value: "jatrabari", label: "যাত্রাবাড়ী (Jatrabari)" },
    { value: "sadarghat", label: "সদরঘাট (Sadarghat)" }
  ];

  const propertyTypes = [
    { value: "single-room", label: "সিঙ্গেল রুম (Single room)" },
    { value: "single-room-attached", label: "সিঙ্গেল রুম - (ওয়াশরুম) (Single Room - Washroom)" },
    { value: "flat", label: "ফ্ল্যাট (Flat)" },
    { value: "master-bedroom", label: "মাস্টার বেডরুম (Master Bedroom)" },
    { value: "office", label: "অফিস / করপোরেট (Office / Corporate)" },
    { value: "bachelors-male", label: "ব্যাচেলর - পুরুষ (Bachelors - Male)" },
    { value: "bachelors-female", label: "ব্যাচেলর - মহিলা (Bachelors - Female)" }
  ];

  return (
    <main className="grow flex flex-col items-center px-4 bg-white pt-32 pb-12">
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
                  className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto z-50 py-1"
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
                <ul className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto z-50 py-1">
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
      </div>
    </main>
  );
}