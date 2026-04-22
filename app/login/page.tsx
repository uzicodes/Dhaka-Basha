"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
        setError("অপ্রত্যাশিত একটি সমস্যা হয়েছে।");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "লগইন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    }
  };

  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-slate-50 pt-32 pb-12">
      <h1 className="text-3xl font-bold text-[#151717] mb-4 text-center">লগইন</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 bg-white p-5 w-full max-w-112.5 rounded-[20px] shadow-sm border-2 border-[#2d79f3]">
        {error && <div className="text-red-500 text-sm mb-2 text-center bg-red-50 p-2 rounded">{error}</div>}
        <div className="flex flex-col">
          <label className="text-[#151717] font-semibold mb-1.5">ইমেইল</label>
        </div>
        <div className="border-[1.5px] border-[#ecedec] rounded-[10px] h-12.5 flex items-center pl-2.5 transition-colors duration-200 focus-within:border-[#2d79f3]">
          <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="আপনার ইমেইল দিন"
            className="ml-2.5 rounded-[10px] border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-sm text-[#151717]"
          />
        </div>

        <div className="flex flex-col mt-1">
          <label className="text-[#151717] font-semibold mb-1.5">পাসওয়ার্ড</label>
        </div>
        <div className="border-[1.5px] border-[#ecedec] rounded-[10px] h-12.5 flex items-center pl-2.5 pr-3 transition-colors duration-200 focus-within:border-[#2d79f3]">
          <svg className="w-5 h-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            svg>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="আপনার পাসওয়ার্ড দিন"
            className="ml-2.5 rounded-[10px] border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-sm text-[#151717]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-[#2d79f3] focus:outline-none shrink-0"
            aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-row items-center justify-end mt-1">
          <span className="text-[12px] text-[#2d79f3] font-medium cursor-pointer hover:underline">
            পাসওয়ার্ড ভুলে গেছেন?
          </spandisabled={!isLoaded} type="submit" className="my-3 bg-[#151717] text-white text-[15px] font-medium rounded-[10px] h-12.5 w-50 mx-auto cursor-pointer hover:bg-black hover:text-green-500 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-5
        </div>

        <button className="my-3 bg-[#151717] text-white text-[15px] font-medium rounded-[10px] h-12.5 w-50 mx-auto cursor-pointer hover:bg-black hover:text-green-500 hover:shadow-lg hover:scale-105 transition-all duration-200">
          লগইন 
        </button>

        <p className="text-center text-black text-[14px] my-2">
          অ্যাকাউন্ট নেই? 
          <Link href="/sign-up" className="text-[14px] ml-1 text-[#2d79f3] font-medium cursor-pointer hover:underline">
            সাইন আপ
          </Link>
        </p>

        <button type="button" className="mt-2 w-30 h-12.5 mx-auto rounded-[10px] flex justify-center items-center font-medium text-black gap-2 border border-[#2d79f3] bg-white cursor-pointer transition-all duration-200 hover:bg-green-200 hover:shadow-lg hover:scale-105">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </form>
    </main>
  );
}
