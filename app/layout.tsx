import type { Metadata } from "next";
import { Hind_Siliguri, Geist_Mono } from "next/font/google"; // Added Hind Siliguri for Bangla
import "./globals.css";
import Navbar from "./components/Navbar";
import { ClerkProvider } from "@clerk/nextjs"; // <-- 1. Imported ClerkProvider

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
  title: "ঢাকা-বাসা",
  description: "সহজেই খুঁজুন আপনার পছন্দের বাসা অথবা পোস্ট করুন আপনার টু-লেট বিজ্ঞাপন।",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/favicon/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/favicon/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Wrapped the entire application in ClerkProvider
    <ClerkProvider>
      <html
        lang="bn"
        className={`${hindSiliguri.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className={`min-h-full flex flex-col font-sans`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}