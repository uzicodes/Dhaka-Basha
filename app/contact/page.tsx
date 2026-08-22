import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50/80 via-emerald-50/30 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-12">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            সহায়তা ও যোগাযোগ কেন্দ্র
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            আমরা আছি <span className="text-blue-600">আপনার পাশে</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-normal">
            ঢাকা-বাসা প্ল্যাটফর্ম সম্পর্কে যে কোনো জিজ্ঞাসা, মতামত বা কারিগরি সহায়তার জন্য আমাদের টিমের সাথে নির্দ্বিধায় যোগাযোগ করুন।
          </p>
        </section>

        {/* 3-GRID QUICK CONTACT CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">হেড অফিস</h3>
            <p className="text-xs text-slate-500">ঢাকা শহর, বাংলাদেশ</p>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              সারা ঢাকা জুড়ে কার্যক্রম
            </span>
          </div>

          {/* Card 2: Phone */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">ফোন সাপোর্ট</h3>
            <p className="text-xs text-slate-500">সকাল ৯টা থেকে রাত ১০টা পর্যন্ত</p>
            <a
              href="tel:+8801700000000"
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1 rounded-full transition-colors"
            >
              +৮৮০ ১৭০০-০০০০০০
            </a>
          </div>

          {/* Card 3: Email */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">ইমেইল সাপোর্ট</h3>
            <p className="text-xs text-slate-500">যে কোনো প্রশ্ন বা অফিসিয়াল যোগাযোগ</p>
            <a
              href="mailto:support@dhakabasha.com"
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3.5 py-1 rounded-full transition-colors"
            >
              support@dhakabasha.com
            </a>
          </div>

        </section>

        {/* ABOUT & DEVELOPER SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: About Platform */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Story Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2">
                <span className="w-6 h-0.5 bg-blue-600 rounded-full" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">আমাদের লক্ষ্য ও উদ্দেশ্য</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                ঢাকা শহরে বাসা খোঁজার অভিজ্ঞতাকে <span className="text-blue-600">সহজ ও বিশ্বস্ত</span> করা
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">ঢাকা-বাসা</strong> হলো রাজধানী ঢাকায় বাসা, মেস, ফ্ল্যাট এবং অফিস স্পেস খোঁজার আধুনিক ডিজিটাল সমাধান। কোনো মধ্যস্বত্বভোগী বা ব্রোকার ছাড়া সরাসরি বাড়ির মালিক ও ভাড়াটিয়ার মাঝে সংযোগ ঘটিয়ে দিতে আমাদের এই প্ল্যাটফর্ম তৈরি।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "শতভাগ ভেরিফায়েড বিজ্ঞাপন ও সরাসরি মালিকের সাথে যোগাযোগ",
                  "এলাকা ও বাজেট অনুযায়ী তাৎক্ষণিক ফিল্টারিং সুবিধা",
                  "সরাসরি মেসেজিং ও কল করার আধুনিক ব্যবস্থা",
                  "ভাড়াটিয়া ও বাড়িওয়ালা উভয়ের জন্য সম্পূর্ণ উন্মুক্ত প্ল্যাটফর্ম",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">✓</span>
                    <span className="text-xs font-semibold text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900">সাধারণ কিছু প্রশ্নোত্তর (FAQ)</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">বিজ্ঞাপন দিতে কি কোনো ফি লাগে?</h4>
                  <p className="text-xs text-slate-500">না, ঢাকা-বাসা প্ল্যাটফর্মে যে কেউ ফ্রিতে নিজের বাসা বা মেসের টু-লেট বিজ্ঞাপন দিতে পারেন।</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">মালিকের সাথে কীভাবে কথা বলব?</h4>
                  <p className="text-xs text-slate-500">প্রতিটি পোস্টের সাথে দেওয়া ফোন নম্বরে সরাসরি কল করতে পারেন অথবা ইন-অ্যাপ চ্যাট অপশন ব্যবহার করে মেসেজ পাঠাতে পারেন।</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: DEVELOPER & TEAM CARD */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-7 rounded-3xl shadow-xl space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">ডেভেলপমেন্ট ও ক্রিয়েটর</span>
                <h3 className="text-xl font-extrabold text-white">ঢাকা-বাসা প্ল্যাটফর্ম</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আধুনিক ওয়েব প্রযুক্তি দিয়ে তৈরি যা ব্যবহারে দ্রুত ও অত্যন্ত নিরাপদ।
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700/80 space-y-4">
                <span className="text-xs font-semibold text-slate-400 block">কানেক্ট করুন:</span>
                
                <div className="flex items-center gap-3">
                  {/* GitHub */}
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors border border-slate-700"
                    aria-label="GitHub"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 22v-4a4.8 4.8 0 0 0-1-3.06c3-.36 6-2.08 6-6.38 0-1.36-.5-2.6-1.3-3.5.14-.3.6-1.6-.1-3.4 0 0-1.05-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.25 2.5 5.2 2.8 5.2 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 4.3 3 6 6 6.38a4.8 4.8 0 0 0-1 3.06v4"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors border border-slate-700"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:contact@dhakabasha.com"
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-colors border border-slate-700"
                    aria-label="Email"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/80">
                <Link
                  href="/listings"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  সব টু-লেট পোস্ট দেখুন →
                </Link>
              </div>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
