"use client";

import { useState } from 'react';

export default function Listings() {
  // State to track if the dropdown menus are open, explicitly typed as booleans
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  const [isTypeSelectOpen, setIsTypeSelectOpen] = useState<boolean>(false);

  return (
    <main className="grow flex flex-col items-center px-4 bg-white pt-32 pb-12">
      <div className="max-w-5xl w-full space-y-10">
        
        {/* Header & Search Section */}
        <div className="flex flex-col items-center text-center space-y-8 mt-16">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
            আপনার পছন্দের বাসা খুঁজুন
          </h1>
          
          <div className="w-full max-w-3xl flex flex-col md:flex-row shadow-sm rounded-xl overflow-hidden border-2 border-[#2d79f3] bg-white transition-all hover:shadow-md">
            
            {/* Dropdown Dhaka places */}
            <div className="relative w-full md:w-[43%] border-b md:border-b-0 md:border-r border-slate-500 group">
              {/* Location Pin Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-500 z-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              {/* Select Input with State Handlers */}
              <select 
                className="w-full h-full pl-11 pr-10 py-3.5 bg-transparent text-[#151717] outline-none cursor-pointer font-medium appearance-none z-10 relative focus:bg-slate-50" 
                defaultValue=""
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                onBlur={() => setIsSelectOpen(false)}
                onChange={() => setIsSelectOpen(false)}
              >
                <option value="" disabled>এলাকা নির্বাচন করুন</option>
                <option value="gulshan">গুলশান (Gulshan)</option>
                <option value="banani">বনানী (Banani)</option>
                <option value="dhanmondi">ধানমন্ডি (Dhanmondi)</option>
                <option value="mirpur">মিরপুর (Mirpur)</option>
                <option value="uttara">উত্তরা (Uttara)</option>
                <option value="mohammadpur">মোহাম্মদপুর (Mohammadpur)</option>
                <option value="bashundhara">বসুন্ধরা (Bashundhara)</option>
                <option value="badda">বাড্ডা (Badda)</option>
                <option value="motijheel">মতিঝিল (Motijheel)</option>
                <option value="khilgaon">খিলগাঁও (Khilgaon)</option>
              </select>
              
              {/* Dropdown Icon */}
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 z-20 transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Property Type Dropdown - Stays as 'grow' to take up the remaining space, making it naturally smaller now */}
            <div className="relative grow border-b md:border-b-0 group">
              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-600 z-20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Property Type Select */}
              <select 
                className="w-full h-full pl-11 pr-10 py-3.5 bg-transparent text-[#151717] outline-none cursor-pointer font-medium appearance-none z-10 relative focus:bg-slate-50" 
                defaultValue=""
                onClick={() => setIsTypeSelectOpen(!isTypeSelectOpen)}
                onBlur={() => setIsTypeSelectOpen(false)}
                onChange={() => setIsTypeSelectOpen(false)}
              >
                <option value="" disabled>কি খুঁজছেন?</option>
                <option value="single-room">Single room</option>
                <option value="single-room-attached">Single room (washroom attached)</option>
                <option value="flat">Flat</option>
                <option value="master-bedroom">Master Bedroom</option>
                <option value="office">Office / Corporate</option>
                <option value="bachelors-male">Bachelors (male)</option>
                <option value="bachelors-female">Bachelors (Female)</option>
              </select>

              {/* Dropdown Icon */}
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 z-20 transition-transform duration-200 ${isTypeSelectOpen ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Search Button */}
            <button className="w-full md:w-auto px-8 py-3.5 bg-[#2d79f3] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shrink-0 z-20">
              খুঁজুন
            </button>
            
          </div>
        </div>
      </div>
    </main>
  );
}