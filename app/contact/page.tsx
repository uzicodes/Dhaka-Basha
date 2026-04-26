export default function Contact() {
  return (
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-32 pb-16">
      <div className="max-w-5xl w-full space-y-16">

        {/* About Section — editorial split layout */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start">

          {/* Sticky left label */}
          <div className="md:pt-1">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#2d79f3]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d79f3]">আমাদের সম্পর্কে</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">
              ঢাকা-বাসা<br />
              <span className="text-[#2d79f3]">কেন?</span>
            </h2>
          </div>

          {/* Right content */}
          <div className="space-y-10 text-slate-700 leading-relaxed">
            <p className="text-lg text-slate-600 border-l-4 border-[#2d79f3] pl-5">
              ঢাকা-বাসা হল ঢাকা শহরে ভাড়া বাড়ি খুঁজে পাওয়ার জন্য একটি আধুনিক এবং নির্ভরযোগ্য প্ল্যাটফর্ম। আমরা বিশ্বাস করি যে প্রতিটি ব্যক্তি তাদের স্বপ্নের বাড়ি খুঁজে পাওয়ার অধিকার রাখে।
            </p>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">আমাদের মিশন</h3>
              <p className="text-slate-700">
                আমাদের মিশন হল বাড়ি খোঁজার প্রক্রিয়াটিকে সহজ, স্বচ্ছ এবং দ্রুত করা। আমরা ভাড়াটেদের এবং সম্পত্তি মালিকদের মধ্যে একটি সেতু তৈরি করি।
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">কেন আমাদের বেছে নিন?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "হাজারো যাচাইকৃত সম্পত্তি তালিকা",
                  "নিরাপদ এবং স্বচ্ছ লেনদেন",
                  "২৪/৭ গ্রাহক সহায়তা",
                  "দ্রুত এবং সহজ যোগাযোগ",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 bg-white border border-slate-100 px-4 py-3 shadow-sm">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#2d79f3] text-white text-xs flex items-center justify-center shrink-0 font-bold">✓</span>
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">আমাদের টিম</h3>
              <p className="text-slate-700">
                আমাদের টিম অভিজ্ঞ পেশাদারদের নিয়ে গঠিত যারা রিয়েল এস্টেট এবং প্রযুক্তিতে বিশেষজ্ঞ। আমরা প্রতিদিন কাজ করি আপনার অভিজ্ঞতা আরও ভাল করতে।
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-300" />
          <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">যোগাযোগ</span>
          <div className="flex-1 h-px bg-slate-300" />
        </div>

        {/* Contact Section — dark left panel + white form */}
        <section className="grid grid-cols-1 md:grid-cols-2 shadow-xl overflow-hidden">

          {/* Dark Info Panel */}
          <div className="bg-slate-900 text-white p-10 flex flex-col justify-between gap-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#60a5fa] block mb-4">যোগাযোগ</span>
              <h1 className="text-3xl md:text-4xl font-black leading-tight">
                আমাদের সাথে<br />
                <span className="text-[#2d79f3]">কথা বলুন</span>
              </h1>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                যেকোনো প্রশ্ন বা সমস্যায় আমরা সবসময় আপনার পাশে আছি।
              </p>
            </div>

            <div className="space-y-7">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-slate-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#2d79f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">ঠিকানা</p>
                  <p className="text-white text-sm">ঢাকা শহর, বাংলাদেশ</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-slate-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#2d79f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">ফোন</p>
                  <p className="text-white text-sm">+৮৮০ ১X XXX XXXXX</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-slate-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#2d79f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">ইমেইল</p>
                  <p className="text-white text-sm">info@dhakabasha.com</p>
                </div>
              </div>

              {/* Social */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-slate-800 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#2d79f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">সোশ্যাল মিডিয়া</p>
                  <div className="flex gap-3">
                    <a href="#" className="text-sm text-[#60a5fa] hover:text-white transition-colors">Facebook</a>
                    <span className="text-slate-600">·</span>
                    <a href="#" className="text-sm text-[#60a5fa] hover:text-white transition-colors">Instagram</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom accent bar */}
            <div className="h-1 w-16 bg-[#2d79f3]" />
          </div>

          {/* Contact Form */}
          <form className="bg-white p-10 flex flex-col gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">বার্তা পাঠান</h2>
              <p className="text-sm text-slate-400">আমরা ২৪ ঘণ্টার মধ্যে সাড়া দেব।</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                নাম
              </label>
              <input
                type="text"
                placeholder="আপনার নাম"
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-none bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#2d79f3] focus:bg-white transition-colors"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                ইমেইল
              </label>
              <input
                type="email"
                placeholder="আপনার ইমেইল"
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-none bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#2d79f3] focus:bg-white transition-colors"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5 flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                বার্তা
              </label>
              <textarea
                placeholder="আপনার বার্তা লিখুন..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-none bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#2d79f3] focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-none font-bold text-sm uppercase tracking-widest hover:bg-[#2d79f3] active:scale-[0.99] transition-all duration-200"
            >
              পাঠান →
            </button>
          </form>

        </section>
      </div>
    </main>
  );
}