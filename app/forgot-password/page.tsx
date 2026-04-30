"use client";

import { useState } from "react";
import Link from "next/link";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { client, session, loaded: clerkLoaded, setActive } = useClerk() as any;
  const signIn = client?.signIn;
  const isLoaded = clerkLoaded && !!signIn;
  const router = useRouter();

  // Request password reset code
  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset request initiated for:", email);
    setIsProcessing(true);
    setError("");

    if (!email) {
      setError("আপনার ইমেইল প্রদান করুন।");
      setIsProcessing(false);
      return;
    }

    if (session) {
      toast.error("আপনি বর্তমানে লগইন অবস্থায় আছেন। পাসওয়ার্ড রিসেট করতে আগে লগ আউট করুন।");
      setIsProcessing(false);
      return;
    }

    if (!isLoaded || !signIn) {
      console.log("Clerk not loaded or signIn not available");
      toast.error("সিস্টেম লোড হচ্ছে, দয়া করে একটু অপেক্ষা করুন...");
      setIsProcessing(false);
      return;
    }

    try {
      console.log("Calling signIn.create...");
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      console.log("signIn.create result:", result);

      setSuccessfulCreation(true);
      toast.success("আপনার ইমেইলে একটি কোড পাঠানো হয়েছে (Code sent)");
    } catch (err: any) {
      console.error("Error in handlePasswordResetRequest:", err);
      const message =
        err.errors?.[0]?.longMessage ||
        "কোড পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify the code and reset password
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");

    if (!code || !password) {
      setError("কোড এবং নতুন পাসওয়ার্ড প্রদান করুন।");
      setIsProcessing(false);
      return;
    }

    if (!isLoaded || !signIn) {
      toast.error("সিস্টেম লোড হচ্ছে, দয়া করে একটু অপেক্ষা করুন...");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success(
          "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে (Password reset successful)"
        );
        router.push("/");
      } else {
        setError("পাসওয়ার্ড রিসেট অসম্পূর্ণ। আবার চেষ্টা করুন।");
      }
    } catch (err: any) {
      const message =
        err.errors?.[0]?.longMessage ||
        "ভুল কোড বা পাসওয়ার্ড (Invalid code or password)";
      setError(message);
      toast.error("ভুল কোড বা পাসওয়ার্ড (Invalid code or password)");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="grow flex flex-col items-center justify-center px-4 bg-[#daf2e0] pt-32 pb-12">
      <h1 className="text-3xl font-bold text-[#151717] mb-4 text-center">
        পাসওয়ার্ড রিসেট
      </h1>

      {!successfulCreation ? (
        /* ─── Enter Email ─── */
        <form
          onSubmit={handlePasswordResetRequest}
          className="flex flex-col gap-1 bg-white p-5 w-full max-w-112.5 rounded-[20px] shadow-sm border-2 border-[#2d79f3]"
        >
          <p className="text-slate-500 text-sm text-center mb-4">
            আপনার অ্যাকাউন্টের ইমেইল দিন। আমরা একটি রিসেট কোড পাঠাবো।
          </p>

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col mt-0.5">
            <label className="text-[#151717] text-sm font-semibold mb-1">
              ইমেইল
            </label>
          </div>
          <div
            className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 transition-colors duration-200 ${error && !email
                ? "border-red-500"
                : "border-[#ecedec] focus-within:border-[#2d79f3]"
              }`}
          >
            <svg
              className="w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
            <input
              type="email"
              placeholder="আপনার ইমেইল দিন"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
            />
          </div>

          <button
            disabled={isProcessing}
            type="submit"
            className="mt-6 mb-2 bg-blue-900 text-white text-[14px] font-medium rounded-none h-11 w-full max-w-56 mx-auto cursor-pointer hover:bg-blue-900 hover:text-green-400 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                পাঠানো হচ্ছে...
              </>
            ) : (
              "পাসওয়ার্ড রিসেট কোড পাঠান"
            )}
          </button>

          <p className="text-center text-black text-[13px] my-2">
            মনে পড়েছে?
            <Link
              href="/login"
              className="text-[13px] ml-1 text-[#2d79f3] font-medium cursor-pointer hover:underline"
            >
              লগইন করুন
            </Link>
          </p>
        </form>
      ) : (
        /* ─── Enter Code & New Password ─── */
        <form
          onSubmit={handlePasswordReset}
          className="flex flex-col gap-1 bg-white p-5 w-full max-w-112.5 rounded-[20px] shadow-sm border-2 border-[#2d79f3]"
        >
          <p className="text-slate-500 text-sm text-center mb-4">
            <span className="font-semibold text-[#151717]">{email}</span> এ
            পাঠানো কোডটি এবং আপনার নতুন পাসওয়ার্ড দিন।
          </p>

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Code Input */}
          <div className="flex flex-col mt-0.5">
            <label className="text-[#151717] text-sm font-semibold mb-1">
              রিসেট কোড
            </label>
          </div>
          <div
            className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 transition-colors duration-200 ${error && !code
                ? "border-red-500"
                : "border-[#ecedec] focus-within:border-[#2d79f3]"
              }`}
          >
            <svg
              className="w-4 h-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            <input
              type="text"
              inputMode="numeric"
              placeholder="ইমেইলে পাঠানো কোডটি দিন"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
            />
          </div>

          {/* New Password Input */}
          <div className="flex flex-col mt-3">
            <label className="text-[#151717] text-sm font-semibold mb-1">
              নতুন পাসওয়ার্ড
            </label>
          </div>
          <div
            className={`border-[1.5px] rounded-none h-11 flex items-center pl-2.5 pr-3 transition-colors duration-200 ${error && !password
                ? "border-red-500"
                : "border-[#ecedec] focus-within:border-[#2d79f3]"
              }`}
          >
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="নতুন পাসওয়ার্ড দিন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-2.5 rounded-none border-none w-full h-full focus:outline-none placeholder:text-slate-400 placeholder:text-xs text-[#151717]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-[#2d79f3] focus:outline-none shrink-0"
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            disabled={isProcessing}
            type="submit"
            className="mt-6 mb-2 bg-blue-900 text-white text-[14px] font-medium rounded-none h-11 w-full max-w-56 mx-auto cursor-pointer hover:bg-blue-900 hover:text-green-400 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                প্রসেসিং...
              </>
            ) : (
              "নতুন পাসওয়ার্ড সেট করুন"
            )}
          </button>

          <p className="text-center text-black text-[13px] my-2">
            কোড পাননি?
            <button
              type="button"
              onClick={() => {
                setSuccessfulCreation(false);
                setCode("");
                setPassword("");
                setError("");
              }}
              className="text-[13px] ml-1 text-[#2d79f3] font-medium cursor-pointer hover:underline"
            >
              আবার পাঠান
            </button>
          </p>

          <p className="text-center text-black text-[13px] mb-1">
            মনে পড়েছে?
            <Link
              href="/login"
              className="text-[13px] ml-1 text-[#2d79f3] font-medium cursor-pointer hover:underline"
            >
              লগইন করুন
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
