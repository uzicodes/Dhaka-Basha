"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  
  // Map pathname to active nav item
  const getActiveId = () => {
    if (pathname === "/") return "home";
    if (pathname === "/listings") return "properties";
    if (pathname === "/post") return "post";
    if (pathname === "/contact") return "contact";
    if (pathname === "/login") return "login";
    return "home";
  };
  
  const active = getActiveId();

  const navItems = [
    { id: "home", label: "হোম", href: "/", icon: true },
    { id: "properties", label: "খুজন", href: "/listings" },
    { id: "post", label: "বিজ্ঞাপন", href: "/post" },
    { id: "contact", label: "যোগাযোগ", href: "/contact" },
  ];

  return (
    <nav className="fixed top-4 w-[calc(100%-2rem)] left-4 md:top-6 md:left-1/2 md:w-auto md:transform md:-translate-x-1/2 z-50">
      <div className={`bg-white/80 backdrop-blur-md shadow-lg border border-slate-100 flex flex-col md:flex-row md:items-center gap-1 transition-all duration-50 ${isMenuOpen ? "rounded-2xl p-4" : "rounded-full px-4 py-3"}`}>
        
        {/* Mobile Header (Logo & Hamburger) */}
        <div className={`relative flex items-center justify-between md:hidden w-full ${isMenuOpen ? "mb-4" : ""}`}>
          <Link href="/" onClick={() => { setIsMenuOpen(false); }} className="flex items-center z-10">
            <div className="scale-150 origin-left ml-2">
              <Image src="/logo.png" alt="Home" width={24} height={24} className="w-auto h-auto" />
            </div>
          </Link>
          
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="text-xl font-bold text-slate-900">
              ঢাকা-<span className="text-blue-600">বাসা</span>
            </span>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-700 hover:text-blue-600 focus:outline-none z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav Items (Desktop visible, Mobile hidden unless open) */}
        <div className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-center gap-2 md:gap-1 w-full md:w-auto`}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                setIsMenuOpen(false);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center w-full md:w-auto ${
                item.id === "home" ? "hidden md:flex" : ""
              } ${
                active === item.id
                  ? "ring-2 ring-blue-600 text-blue-600"
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
              }`}
            >
              {item.icon ? (
                <div className="scale-150 origin-center">
                  <Image
                    src="/logo.png"
                    alt="Home"
                    width={24}
                    height={24}
                    className="w-auto h-auto"
                  />
                </div>
              ) : (
                item.label
              )}
            </Link>
          ))}

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-slate-200 mx-1"></div>
          <div className="md:hidden w-full h-px bg-slate-100 my-2"></div>

          {!isSignedIn && (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="px-6 py-2 rounded-md text-sm font-semibold text-red-600 hover:bg-green-50 transition-colors relative w-full md:w-auto text-center"
              >
                <span className={`inline-block ${
                  active === "login"
                    ? "border-b-2 border-blue-600"
                    : ""
                }`}>
                  লগইন
                </span>
              </Link>
            </>
          )}

          {/* Profile Icon */}
          <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-slate-700 hover:text-blue-600 transition-colors w-full md:w-auto flex justify-center mt-1 md:mt-0">
            <div className="scale-130 origin-center">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
