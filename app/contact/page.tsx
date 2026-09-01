"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "সাধারণ জিজ্ঞাসা",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Helper to count words
  const countWords = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "name") {
      if (!value.trim()) {
        error = "আপনার নাম আবশ্যক";
      } else if (!/^[a-zA-Z\u0980-\u09FF\s]+$/.test(value)) {
        error = "নামে শুধু ইংরেজি ও বাংলা অক্ষর ব্যবহার করুন (কোনো সংখ্যা বা বিশেষ চিহ্ন গ্রহণযোগ্য নয়)";
      } else if (countWords(value) > 100) {
        error = "নাম সর্বোচ্চ ১০০ শব্দের মধ্যে হতে হবে";
      }
    }

    if (name === "email") {
      const atCount = (value.match(/@/g) || []).length;
      if (!value.trim()) {
        error = "ইমেইল ঠিকানা আবশ্যক";
      } else if (atCount !== 1) {
        error = "ইমেইলে শুধুমাত্র একটি '@' চিহ্ন থাকতে হবে";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        error = "সঠিক ইমেইল ঠিকানা প্রদান করুন (যেমন: example@domain.com)";
      }
    }

    if (name === "phone") {
      if (value.trim()) {
        if (!/^\d+$/.test(value)) {
          error = "ফোন নম্বরে শুধু ইংরেজি সংখ্যা হতে হবে (কোনো অক্ষর বা বিশেষ চিহ্ন নয়)";
        } else if (value.length !== 11) {
          error = `ফোন নম্বর অবশ্যই ঠিক ১১ ডিজিটের হতে হবে (বর্তমানে ${value.length} ডিজিট)`;
        }
      }
    }

    if (name === "message") {
      if (!value.trim()) {
        error = "মেসেজ আবশ্যক";
      } else if (countWords(value) > 500) {
        error = "মেসেজ সর্বোচ্চ ৫০০ শব্দের মধ্যে হতে হবে";
      }
    }

    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Phone input restriction: allow only digits, max 11 digits
    if (name === "phone") {
      const cleanedPhone = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, [name]: cleanedPhone }));
      const err = validateField(name, cleanedPhone);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const nameErr = validateField("name", formData.name);
    const emailErr = validateField("email", formData.email);
    const phoneErr = validateField("phone", formData.phone);
    const messageErr = validateField("message", formData.message);

    const errors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      message: messageErr,
    };

    setFieldErrors(errors);

    if (nameErr || emailErr || phoneErr || messageErr) {
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "a648aa15-1561-4a04-a5e7-327b33777587",
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "দেওয়া হয়নি",
          subject: `[ঢাকা-বাসা মেসেজ] ${formData.subject} - ${formData.name}`,
          message: formData.message,
          from_name: "ঢাকা-বাসা প্ল্যাটফর্ম",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "সাধারণ জিজ্ঞাসা",
          message: "",
        });
        setFieldErrors({});
      } else {
        setStatus("error");
        setErrorMessage(result.message || "মেসেজ পাঠানো সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
      }
    } catch {
      setStatus("error");
      setErrorMessage("সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন।");
    }
  };

  const messageWordCount = countWords(formData.message);
  const nameWordCount = countWords(formData.name);

  return (
    <main className="min-h-screen bg-[#EBE3A7] flex flex-col items-center">
      {/* Background Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#EBE3A7]/15 via-[#2C5745]/5 to-transparent pointer-events-none -z-10" />

      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-20 space-y-12">
        
        {/* HERO HEADER */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200/80 text-[#2E2910] text-sm font-bold shadow-2xs">
            সহায়তা ও যোগাযোগ কেন্দ্র
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2E2910] tracking-tight leading-tight">
            আমাদের সাথে <span className="text-[#2C5745]">যোগাযোগ করুন</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg max-w-xl mx-auto font-normal leading-relaxed">
            ঢাকা-বাসা প্ল্যাটফর্ম সম্পর্কে যে কোনো জিজ্ঞাসা, মতামত বা কারিগরি সহায়তার জন্য নিচের ফর্মটি পূরণ করুন। আমরা দ্রুত আপনার সাথে যোগাযোগ করব।
          </p>
        </section>

        {/* MAIN CONTACT SECTION: 2 EQUAL-SIZED RESPONSIVE CARDS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* CARD 1: সরাসরি যোগাযোগ (Equal 50% width & matching height) */}
          <div className="bg-white p-6 sm:p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[#2E2910]">সরাসরি যোগাযোগ</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  জরুরি প্রয়োজনে আমাদের সাথে সরাসরি ফোন বা ইমেইলের মাধ্যমে যোগাযোগ করতে পারেন।
                </p>
              </div>

              {/* Info Items */}
              <div className="space-y-3.5">
                {/* Phone */}
                <a
                  href="tel:+8801700000000"
                  className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#EBE3A7]/30 hover:bg-[#EBE3A7]/50 border border-[#EBE3A7]/60 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2C5745] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 block">ফোন সাপোর্ট</span>
                    <span className="text-sm sm:text-base font-bold text-[#2E2910] group-hover:text-[#2C5745] transition-colors">+৮৮০ ১৭০০-০০০০০০</span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:support@dhakabasha.com"
                  className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#EBE3A7]/30 hover:bg-[#EBE3A7]/50 border border-[#EBE3A7]/60 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2C5745] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 block">ইমেইল সহায়তা</span>
                    <span className="text-sm sm:text-base font-bold text-[#2E2910] group-hover:text-[#2C5745] transition-colors truncate block">support@dhakabasha.com</span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-[#EBE3A7]/30 border border-[#EBE3A7]/60">
                  <div className="w-12 h-12 rounded-xl bg-[#2C5745] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 block">অফিস লোকেশন</span>
                    <span className="text-sm sm:text-base font-bold text-[#2E2910]">ঢাকা শহর, বাংলাদেশ</span>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#2C5745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  সাপোর্ট সময়সূচি:
                </span>
                <span className="text-[#ce1609] font-bold">সকাল ৯টা – রাত ১০টা</span>
              </div>
            </div>

          </div>

          {/* CARD 2: মেসেজ পাঠান (Equal 50% width & matching height) */}
          <div className="bg-white p-6 sm:p-7 md:p-8 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between space-y-4">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#2E2910]">মেসেজ পাঠান</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                আপনার বার্তাটি লিখুন, আমরা সরাসরি আপনার ইমেইলে উত্তর জানাব।
              </p>
            </div>

            {/* Success Alert */}
            {status === "success" && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>ধন্যবাদ! আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে।</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-700 font-normal pl-7">
                  আমাদের টিম শীঘ্রই আপনার দেওয়া ইমেইল ঠিকানায় যোগাযোগ করবে।
                </p>
              </div>
            )}

            {/* Error Alert */}
            {status === "error" && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="name" className="text-xs font-bold text-[#2E2910]">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[10px] ${nameWordCount > 100 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                      {nameWordCount}/১০০ শব্দ
                    </span>
                  </div>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="যেমন: মোঃ সাকিব রহমান"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-xs ${
                      fieldErrors.name
                        ? "border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/30"
                        : "border-slate-200 focus:ring-2 focus:ring-[#2C5745] focus:bg-white"
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="text-[11px] text-red-600 font-semibold leading-tight">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-[#2E2910] block">
                    ইমেইল ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-xs ${
                      fieldErrors.email
                        ? "border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/30"
                        : "border-slate-200 focus:ring-2 focus:ring-[#2C5745] focus:bg-white"
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-red-600 font-semibold leading-tight">{fieldErrors.email}</p>
                  )}
                </div>

              </div>

              {/* Row 2: Phone & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Phone */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="phone" className="text-xs font-bold text-[#2E2910]">
                      ফোন নম্বর <span className="text-[10px] font-normal text-slate-400">(১১ ডিজিট)</span>
                    </label>
                    <span className={`text-[10px] ${formData.phone.length === 11 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                      {formData.phone.length}/১১
                    </span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    maxLength={11}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="০১৭xxxxxxxx"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-xs ${
                      fieldErrors.phone
                        ? "border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/30"
                        : "border-slate-200 focus:ring-2 focus:ring-[#2C5745] focus:bg-white"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-red-600 font-semibold leading-tight">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label htmlFor="subject" className="text-xs font-bold text-[#2E2910] block">
                    বিষয়
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2C5745] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="সাধারণ জিজ্ঞাসা">সাধারণ জিজ্ঞাসা</option>
                    <option value="বিজ্ঞাপন সংক্রান্ত">বিজ্ঞাপন বা পোস্ট সংক্রান্ত</option>
                    <option value="কারিগরি সমস্যা">কারিগরি বা লগইন সমস্যা</option>
                    <option value="অভিযোগ বা মতামত">অভিযোগ বা পরামর্শ</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

              </div>

              {/* Message */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="message" className="text-xs font-bold text-[#2E2910]">
                    আপনার মেসেজ <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] ${messageWordCount > 500 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                    {messageWordCount}/৫০০ শব্দ
                  </span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="আপনার জিজ্ঞাসা বা বিস্তারিত তথ্য এখানে লিখুন..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm font-medium text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 placeholder:text-xs resize-y ${
                    fieldErrors.message
                      ? "border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/30"
                      : "border-slate-200 focus:ring-2 focus:ring-[#2C5745] focus:bg-white"
                  }`}
                />
                {fieldErrors.message && (
                  <p className="text-[11px] text-red-600 font-semibold leading-tight">{fieldErrors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 px-6 rounded-xl bg-[#2C5745] hover:bg-[#203f32] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:scale-101 active:scale-98"
              >
                {status === "loading" ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>মেসেজ পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>মেসেজ পাঠান</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

            </form>

          </div>

        </section>

        {/* ABOUT PLATFORM & FAQS SECTION */}
        <section className="space-y-6 pt-4">
          
          {/* Story Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#2C5745] rounded-full" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#2C5745]">আমাদের লক্ষ্য ও উদ্দেশ্য</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E2910] leading-snug">
              ঢাকা শহরে বাসা খোঁজার অভিজ্ঞতাকে <span className="text-[#2C5745]">সহজ ও বিশ্বস্ত</span> করা
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                "শতভাগ ভেরিফায়েড বিজ্ঞাপন ও সরাসরি মালিকের সাথে যোগাযোগ",
                "এলাকা ও বাজেট অনুযায়ী তাৎক্ষণিক ফিল্টারিং সুবিধা",
                "সরাসরি মেসেজিং ও কল করার আধুনিক ব্যবস্থা",
                "ভাড়াটিয়া ও বাড়িওয়ালা উভয়ের জন্য সম্পূর্ণ উন্মুক্ত প্ল্যাটফর্ম",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#EBE3A7]/30 border border-[#EBE3A7]/60">
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
              <div className="p-4 sm:p-5 rounded-2xl bg-[#EBE3A7]/30 border border-[#EBE3A7]/60 space-y-1.5">
                <h4 className="text-sm sm:text-base font-bold text-[#2E2910]">বিজ্ঞাপন দিতে কি কোনো ফি লাগে?</h4>
                <p className="text-sm text-slate-700">না, ঢাকা-বাসা প্ল্যাটফর্মে যে কেউ ফ্রিতে নিজের বাসা বা মেসের টু-লেট বিজ্ঞাপন দিতে পারেন।</p>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-[#EBE3A7]/30 border border-[#EBE3A7]/60 space-y-1.5">
                <h4 className="text-sm sm:text-base font-bold text-[#2E2910]">মালিকের সাথে কীভাবে কথা বলব?</h4>
                <p className="text-sm text-slate-700">প্রতিটি পোস্টের সাথে দেওয়া ফোন নম্বরে সরাসরি কল করতে পারেন অথবা ইন-অ্যাপ চ্যাট অপশন ব্যবহার করে মেসেজ পাঠাতে পারেন।</p>
              </div>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
