"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clerkError, setClerkError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoaded, signIn, setActive } = useSignIn() as any;
  const router = useRouter();

  useEffect(() => {
    setSearchQuery(window.location.search);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setClerkError("");

    if (!email || !password) {
      setClerkError("ইমেইল এবং পাসওয়ার্ড প্রদান করুন।");
      return;
    }

    if (!isLoaded || !signIn) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirectUrl') || "/";
        router.push(redirectUrl);
      } else {
        console.log(result);
        setClerkError("লগইন অসম্পূর্ণ। যাচাইকরণ প্রয়োজন।");
      }
    } catch (err: any) {
      setClerkError(err.errors?.[0]?.longMessage || "লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড ভুল।");
    }
  };

  const loginWithGoogle = async () => {
    if (!signIn) return;

    const signInResource = signIn as any;
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirectUrl') || "/";

    if (typeof signInResource.authenticateWithRedirect === "function") {
      await signInResource.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectUrl,
      });
      return;
    }

    if (typeof signInResource.sso === "function") {
      await signInResource.sso({
        strategy: "oauth_google",
        redirectUrl: redirectUrl,
        redirectCallbackUrl: "/sso-callback",
      });
    }
  };

  return (
    <main className="grow min-h-screen flex flex-col items-center justify-center px-4 bg-[#EBE3A7] pt-28 pb-16 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#EB7D00]/10 via-[#EBE3A7]/20 to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#2E2910] mt-3">লগইন</h1>
          <p className="text-sm text-slate-500 mt-1">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 bg-white/95 p-6 sm:p-8 w-full rounded-3xl shadow-xl shadow-[#2E2910]/10 border border-[#2C5745]/20">
        {clerkError && (
          <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
            {clerkError}
          </div>
        )}

        <div className="flex flex-col mt-0.5">
          <label htmlFor="email" className="text-[#2E2910] text-sm font-semibold mb-1">ইমেইল</label>
        </div>
        <div className={`border rounded-xl h-12 flex items-center pl-3 transition-colors duration-200 focus-within:ring-2 focus-within:ring-[#EB7D00]/20 ${submitted && !email ? "border-red-500" : "border-[#2C5745]/20 focus-within:border-[#EB7D00]"}`}>
          <svg className="w-4 h-4 text-[#2C5745]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          <input
            id="email"
            type="email"
            placeholder="আপনার ইমেইল দিন"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ml-2.5 border-none bg-transparent w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#2E2910]"
          />
        </div>

        <div className="flex flex-col mt-3">
          <label htmlFor="password" className="text-[#2E2910] text-sm font-semibold mb-1">পাসওয়ার্ড</label>
        </div>
        <div className={`border rounded-xl h-12 flex items-center pl-3 pr-3 transition-colors duration-200 focus-within:ring-2 focus-within:ring-[#EB7D00]/20 ${submitted && !password ? "border-red-500" : "border-[#2C5745]/20 focus-within:border-[#EB7D00]"}`}>
          <svg className="w-4 h-4 text-[#2C5745] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="আপনার পাসওয়ার্ড দিন"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ml-2.5 border-none bg-transparent w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#2E2910]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-[#EB7D00] focus:outline-none shrink-0"
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

        <div className="flex justify-end mt-1.5">
          <Link
            href="/forgot-password"
            className="text-xs text-[#EB7D00] font-semibold hover:underline"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <button
          disabled={!isLoaded}
          type="submit"
          className="mt-6 mb-2 bg-[#2C5745] text-white text-[14px] font-bold rounded-xl h-12 w-full cursor-pointer hover:bg-[#2E2910] hover:shadow-lg hover:shadow-[#2C5745]/20 transition-all duration-200 disabled:opacity-50"
        >
          লগইন
        </button>

        <p className="text-center text-slate-600 text-[13px] my-2">
          অ্যাকাউন্ট নেই?
          <Link href={`/sign-up${searchQuery}`} className="text-[13px] ml-1 text-[#EB7D00] font-semibold cursor-pointer hover:underline">
            সাইন আপ করুন
          </Link>
        </p>

        <button type="button" onClick={loginWithGoogle} className="mt-3 w-full h-12 mx-auto rounded-xl flex justify-center items-center font-semibold text-[14px] text-[#2E2910] gap-2 border border-[#2C5745]/25 bg-white cursor-pointer transition-all duration-200 hover:bg-[#EBE3A7] hover:border-[#EB7D00] hover:shadow-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
      </form>
      </div>
    </main>
  );
}