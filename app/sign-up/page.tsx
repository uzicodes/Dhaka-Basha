"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [clerkError, setClerkError] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const { isLoaded, signUp, setActive } = useSignUp() as any;
  const router = useRouter();

  // --- VALIDATION LOGIC ---
  const validateName = (value: string) => {
    if (!value) return "নাম প্রয়োজন";
    const words = value.trim().split(/\s+/).length;
    if (words > 30) return "নাম ৩০ শব্দের বেশি হতে পারে না";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "নাম শুধুমাত্র অক্ষর এবং স্পেস থাকতে পারে";
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value) return "ইমেইল প্রয়োজন";
    const atCount = (value.match(/@/g) || []).length;
    if (atCount !== 1) return "সঠিক ইমেইল দিন";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "সঠিক ইমেইল ফরম্যাট দিন";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return "ফোন নম্বর প্রয়োজন";
    if (!/^\d+$/.test(value)) return "সঠিক ফোন নম্বর দিন";
    if (value.length !== 11) return "সঠিক ফোন নম্বর (১১ ডিজিট) দিন";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "পাসওয়ার্ড প্রয়োজন";
    if (value.length < 6) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে";
    return "";
  };

  const handleChange = (field: string, value: string) => {
    let filteredValue = value;

    if (field === "name") {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
      const words = filteredValue.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length > 30) {
        filteredValue = words.slice(0, 30).join(" ");
      }
    } else if (field === "email") {
      const atCount = (filteredValue.match(/@/g) || []).length;
      if (atCount > 1) {
        const parts = value.split("@");
        filteredValue = parts[0] + "@" + parts.slice(1).join("");
      }
    } else if (field === "phone") {
      filteredValue = value.replace(/\D/g, "").slice(0, 11);
    }

    setFormData({ ...formData, [field]: filteredValue });

    if (submitted) {
      let error = "";
      if (field === "name") error = validateName(filteredValue);
      else if (field === "email") error = validateEmail(filteredValue);
      else if (field === "phone") error = validatePhone(filteredValue);
      else if (field === "password") error = validatePassword(filteredValue);
      setErrors({ ...errors, [field]: error });
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setClerkError("");

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
    });

    if (!nameError && !emailError && !phoneError && !passwordError) {
      if (!isLoaded || !signUp) return;
      try {
        await signUp.create({
          firstName: formData.name,
          emailAddress: formData.email,
          password: formData.password,
        });

        // FIXED 2: Updated to Clerk v5 prepareVerification method
        await signUp.prepareVerification({ strategy: "email_code" });
        setPendingVerification(true);
      } catch (err: any) {
        setClerkError(err.errors?.[0]?.longMessage || "সাইন আপ ব্যর্থ হয়েছে।");
      }
    }
  };

  // --- OTP VERIFICATION LOGIC ---
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setClerkError("");

    try {
      const completeSignUp = await signUp.attemptVerification({
        strategy: "email_code",
        code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirectUrl') || "/";
        router.push(redirectUrl);
      } else {
        setClerkError("যাচাইকরণ ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setClerkError(err.errors?.[0]?.longMessage || "ভুল কোড দেওয়া হয়েছে।");
    }
  };

  const signUpWithGoogle = async () => {
    if (!signUp) return;

    const signUpResource = signUp as any;
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirectUrl') || "/";

    if (typeof signUpResource.authenticateWithRedirect === "function") {
      await signUpResource.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectUrl,
      });
      return;
    }

    if (typeof signUpResource.sso === "function") {
      await signUpResource.sso({
        strategy: "oauth_google",
        redirectUrl: redirectUrl,
        redirectCallbackUrl: "/sso-callback",
      });
    }
  };

  // --- OTP VERIFICATION SCREEN ---
  if (pendingVerification) {
    return (
      <main className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-32 pb-12">
        <h1 className="text-3xl font-bold text-[#151717] mb-4 text-center">ইমেইল যাচাই করুন</h1>
        <form onSubmit={onPressVerify} className="flex flex-col gap-1.5 bg-white p-5 w-full max-w-112.5 rounded-[20px] shadow-sm border-2 border-[#2d79f3]">
          <p className="text-center text-sm mb-4">আপনার ইমেইলে একটি কোড পাঠানো হয়েছে।</p>
          {clerkError && <div className="text-red-500 text-sm mb-2 text-center bg-red-50 p-2 rounded">{clerkError}</div>}

          <div className="flex flex-col">
            <label className="text-[#151717] font-semibold mb-1.5">ভেরিফিকেশন কোড</label>
          </div>
          <div className="border-[1.5px] border-[#ecedec] rounded-none h-12.5 flex items-center pl-2.5 transition-colors duration-200 focus-within:border-[#2d79f3]">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="কোড দিন"
              className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-sm text-[#151717]"
            />
          </div>

          <button disabled={!isLoaded} type="submit" className="mt-4 my-3 bg-[#151717] text-white text-[15px] font-medium rounded-none h-12.5 w-50 mx-auto cursor-pointer hover:bg-black hover:text-green-500 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50">
            যাচাই করুন
          </button>
        </form>
      </main>
    );
  }

  // --- MAIN SIGN-UP SCREEN ---
  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-32 pb-12">
      <h1 className="text-3xl font-bold text-[#151717] mb-4 text-center">সাইন আপ</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1 bg-white p-4 w-full max-w-112.5 rounded-[20px] shadow-sm border-2 border-[#2d79f3]">
        {clerkError && <div className="text-red-500 text-sm mb-2 text-center bg-red-50 p-2 rounded">{clerkError}</div>}
        <div id="clerk-captcha" />

        {/* Name Input */}
        <div className="flex flex-col">
          <label className="text-[#151717] text-sm font-semibold mb-1">আপনার নাম</label>
        </div>
        <div className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 transition-colors duration-200 ${submitted && errors.name ? "border-red-500" : "border-[#ecedec] focus-within:border-[#2d79f3]"}`}>
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            type="text"
            placeholder="আপনার পুরো নাম দিন"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
          />
        </div>
        {submitted && errors.name && <p className="text-red-500 text-xs mt-1 mb-2">{errors.name}</p>}

        {/* Email Input */}
        <div className="flex flex-col mt-0.5">
          <label className="text-[#151717] text-sm font-semibold mb-1">ইমেইল</label>
        </div>
        <div className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 transition-colors duration-200 ${submitted && errors.email ? "border-red-500" : "border-[#ecedec] focus-within:border-[#2d79f3]"}`}>
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          <input
            type="email"
            placeholder="আপনার ইমেইল দিন"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
          />
        </div>
        {submitted && errors.email && <p className="text-red-500 text-xs mt-1 mb-2">{errors.email}</p>}

        {/* Phone Input */}
        <div className="flex flex-col mt-0.5">
          <label className="text-[#151717] text-sm font-semibold mb-1">ফোন নম্বর</label>
        </div>
        <div className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 transition-colors duration-200 ${submitted && errors.phone ? "border-red-500" : "border-[#ecedec] focus-within:border-[#2d79f3]"}`}>
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <input
            type="text"
            placeholder="আপনার ফোন নম্বর দিন"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
          />
        </div>
        {submitted && errors.phone && <p className="text-red-500 text-xs mt-1 mb-2">{errors.phone}</p>}

        {/* Password Input */}
        <div className="flex flex-col mt-0.5">
          <label className="text-[#151717] text-sm font-semibold mb-1">পাসওয়ার্ড</label>
        </div>
        <div className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 pr-3 transition-colors duration-200 ${submitted && errors.password ? "border-red-500" : "border-[#ecedec] focus-within:border-[#2d79f3]"}`}>
          <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="নতুন পাসওয়ার্ড দিন"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-[#2d79f3] focus:outline-none shrink-0"
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {submitted && errors.password && <p className="text-red-500 text-xs mt-1 mb-2">{errors.password}</p>}

        <button
          disabled={!isLoaded}
          type="submit"
          className="mt-6 mb-2 bg-blue-900 text-white text-[14px] font-medium rounded-none h-11 w-50 mx-auto cursor-pointer hover:bg-blue-900 hover:text-green-400 hover:hover:scale-105 transition-all duration-200"
        >
          সাইন আপ
        </button>

        <p className="text-center text-black text-[13px] my-1">
          অ্যাকাউন্ট আছে?
          <Link href={`/login${typeof window !== 'undefined' && window.location.search ? window.location.search : ''}`} className="text-[13px] ml-1 text-[#2d79f3] font-medium cursor-pointer hover:underline">
            লগইন করুন
          </Link>
        </p>

        <button type="button" onClick={signUpWithGoogle} className="mt-1 w-30 h-11 mx-auto rounded-none flex justify-center items-center font-medium text-[14px] text-black gap-2 border border-[#2d79f3] bg-white cursor-pointer transition-all duration-200 hover:bg-green-200 hover:shadow-lg hover:scale-105">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
      </form>
    </main>
  );
}