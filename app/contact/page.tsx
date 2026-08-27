export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#EBE3A7]/15 via-[#2C5745]/5 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-12">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EBE3A7]/25 border border-[#EBE3A7]/40 text-[#2E2910] text-sm font-bold shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2C5745] animate-pulse" />
            সহায়তা ও যোগাযোগ কেন্দ্র
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2E2910] tracking-tight leading-tight">
            আমরা আছি <span className="text-[#2C5745]">আপনার পাশে</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            ঢাকা-বাসা প্ল্যাটফর্ম সম্পর্কে যে কোনো জিজ্ঞাসা, মতামত বা কারিগরি সহায়তার জন্য আমাদের টিমের সাথে নির্দ্বিধায় যোগাযোগ করুন।
          </p>
        </section>

        {/* 3-GRID QUICK CONTACT CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Address */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EBE3A7]/20 text-[#2E2910] flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-sans text-lg font-bold text-[#2E2910]">হেড অফিস</h3>
            <p className="text-sm text-slate-600">ঢাকা শহর, বাংলাদেশ</p>
            <span className="text-xs sm:text-sm font-semibold text-[#2E2910] bg-[#EBE3A7]/20 px-3.5 py-1.5 rounded-full">
              সারা ঢাকা জুড়ে কার্যক্রম
            </span>
          </div>

          {/* Card 2: Phone */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#2C5745]/15 text-[#2C5745] flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-sans text-lg font-bold text-[#2E2910]">ফোন সাপোর্ট</h3>
            <p className="text-sm text-slate-600">সকাল ৯টা থেকে রাত ১০টা পর্যন্ত</p>
            <a
              href="tel:+8801700000000"
              className="text-sm font-bold text-[#2E2910] bg-[#EBE3A7]/20 hover:bg-[#EBE3A7]/30 px-4 py-1.5 rounded-full transition-colors"
            >
              +৮৮০ ১৭০০-০০০০০০
            </a>
          </div>

          {/* Card 3: Email */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#2E2910]/10 text-[#2E2910] flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-sans text-lg font-bold text-[#2E2910]">ইমেইল সাপোর্ট</h3>
            <p className="text-sm text-slate-600">যে কোনো প্রশ্ন বা অফিসিয়াল যোগাযোগ</p>
            <a
              href="mailto:support@dhakabasha.com"
              className="text-sm font-bold text-[#2E2910] bg-[#EBE3A7]/20 hover:bg-[#EBE3A7]/30 px-4 py-1.5 rounded-full transition-colors"
            >
              support@dhakabasha.com
            </a>
          </div>

        </section>

        {/* ABOUT PLATFORM SECTION */}
        <section>
          
          <div className="space-y-6">
            
            {/* Story Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#2C5745] rounded-full" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#2C5745]">আমাদের লক্ষ্য ও উদ্দেশ্য</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E2910] leading-snug">
                ঢাকা শহরে বাসা খোঁজার অভিজ্ঞতাকে <span className="text-[#2C5745]">সহজ ও বিশ্বস্ত</span> করা
              </h2>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                <strong className="text-[#2E2910]">ঢাকা-বাসা</strong> হলো রাজধানী ঢাকায় বাসা, মেস, ফ্ল্যাট এবং অফিস স্পেস খোঁজার আধুনিক ডিজিটাল সমাধান। কোনো মধ্যস্বত্বভোগী বা ব্রোকার ছাড়া সরাসরি বাড়ির মালিক ও ভাড়াটিয়ার মাঝে সংযোগ ঘটিয়ে দিতে আমাদের এই প্ল্যাটফর্ম তৈরি।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  "শতভাগ ভেরিফায়েড বিজ্ঞাপন ও সরাসরি মালিকের সাথে যোগাযোগ",
                  "এলাকা ও বাজেট অনুযায়ী তাৎক্ষণিক ফিল্টারিং সুবিধা",
                  "সরাসরি মেসেজিং ও কল করার আধুনিক ব্যবস্থা",
                  "ভাড়াটিয়া ও বাড়িওয়ালা উভয়ের জন্য সম্পূর্ণ উন্মুক্ত প্ল্যাটফর্ম",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#EBE3A7] border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#2C5745] text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">✓</span>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xl font-bold text-[#2E2910]">সাধারণ কিছু প্রশ্নোত্তর (FAQ)</h3>
              
              <div className="space-y-3">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#EBE3A7] border border-slate-100 space-y-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-[#2E2910]">বিজ্ঞাপন দিতে কি কোনো ফি লাগে?</h4>
                  <p className="text-sm text-slate-700">না, ঢাকা-বাসা প্ল্যাটফর্মে যে কেউ ফ্রিতে নিজের বাসা বা মেসের টু-লেট বিজ্ঞাপন দিতে পারেন।</p>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#EBE3A7] border border-slate-100 space-y-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-[#2E2910]">মালিকের সাথে কীভাবে কথা বলব?</h4>
                  <p className="text-sm text-slate-700">প্রতিটি পোস্টের সাথে দেওয়া ফোন নম্বরে সরাসরি কল করতে পারেন অথবা ইন-অ্যাপ চ্যাট অপশন ব্যবহার করে মেসেজ পাঠাতে পারেন।</p>
                </div>
              </div>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
