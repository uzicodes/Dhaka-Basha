
export default function Contact() {
  return (
    <main className="grow flex flex-col items-center px-4 bg-[#daf2e0] pt-32 pb-16">
      <div className="max-w-5xl w-full">

        {/* About & Contact Section — editorial split layout */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start">

          {/* Left Column: Headings & Contact Info Card */}
          <div className="md:pt-1 flex flex-col gap-10 md:sticky md:top-24">

            {/* Original Heading */}
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-6 h-px bg-[#2d79f3]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d79f3]">আমাদের সম্পর্কে</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                <span className="font-ekush">ঢাকা-বাসা</span><br />
                <span className="text-[#2d79f3]">কেন?</span>
              </h2>
            </div>

            {/* Contact Info Panel */}
            <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between gap-10 shadow-xl">
              <div>
                <h2 className="text-2xl md:text-3xl text-center font-black leading-tight">
                  <span className="text-[#2d79f3]">যোগাযোগ</span>
                </h2>
                <p className="mt-4 text-slate-400 text-center text-sm leading-relaxed">
                  আমরা সবসময় আপনার পাশে আছি।
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

                {/* Developer Info */}
                <div className="pt-5 mt-2 border-t border-slate-700/50 flex items-start gap-4">
                  <div className="w-9 h-9 bg-slate-800 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#2d79f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">ডেভেলপার</p>
                    <div className="flex items-center gap-4">
                      {/* GitHub */}
                      <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#2d79f3] transition-colors" aria-label="GitHub">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.06c3-.36 6-2.08 6-6.38 0-1.36-.5-2.6-1.3-3.5.14-.3.6-1.6-.1-3.4 0 0-1.05-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.25 2.5 5.2 2.8 5.2 2.8c-.7 1.8-.2 3.1-.1 3.4-.8.9-1.3 2.1-1.3 3.5 0 4.3 3 6 6 6.38a4.8 4.8 0 0 0-1 3.06v4"/>
                        </svg>
                      </a>
                      {/* LinkedIn */}
                      <a href="#" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#2d79f3] transition-colors" aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect width="4" height="12" x="2" y="9"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                      </a>
                      {/* Email */}
                      <a href="mailto:your_email@example.com" className="text-white hover:text-[#2d79f3] transition-colors" aria-label="Email">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="16" x="2" y="4" rx="2"/>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="space-y-10 text-slate-700 leading-relaxed">
            <p className="text-lg text-slate-600 border-l-4 border-[#2d79f3] pl-5">
              <span className="font-ekush">ঢাকা-বাসা</span> হল ঢাকা শহরে ভাড়া বাড়ি খুঁজে পাওয়ার জন্য একটি আধুনিক এবং নির্ভরযোগ্য প্ল্যাটফর্ম। আমরা বিশ্বাস করি যে প্রতিটি ব্যক্তি তাদের স্বপ্নের বাড়ি খুঁজে পাওয়ার অধিকার রাখে।
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
      </div>
    </main>
  );
}
