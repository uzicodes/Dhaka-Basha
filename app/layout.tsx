import type { Metadata } from "next";
import { Hind_Siliguri, Geist_Mono } from "next/font/google"; // Added Hind Siliguri for Bangla
import "./globals.css";

// Modern Bangla font
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-bengali",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ঢাকা-বাসা | ঢাকার সেরা টু-লেট প্ল্যাটফর্ম",
  description: "সহজেই খুঁজুন আপনার পছন্দের বাসা অথবা পোস্ট করুন আপনার টু-লেট বিজ্ঞাপন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn" // Changed from "en" to "bn"
      className={`${hindSiliguri.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`min-h-full flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}