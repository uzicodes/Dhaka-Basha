"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("home");

  const navItems = [
    { id: "home", label: "হোম", href: "/", icon: true },
    { id: "properties", label: "খুজন", href: "/listings" },
    { id: "post", label: "বিজ্ঞাপন দিন", href: "/post" },
    { id: "contact", label: "যোগাযোগ", href: "/contact" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActive(item.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              active === item.id
                ? "border-2 border-blue-600 text-blue-600"
                : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
            }`}
          >
            {item.icon ? (
              <Image
                src="/logo.png"
                alt="Home"
                width={24}
                height={24}
              />
            ) : (
              item.label
            )}
          </Link>
        ))}

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile Icon */}
        <Link href="/profile" className="px-3 py-2 text-slate-700 hover:text-blue-600 transition-colors">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </Link>

        {/* Login Button */}
        <Link
          href="/login"
          className="px-6 py-2 rounded-full text-sm font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors"
        >
          লগইন
        </Link>
      </div>
    </nav>
  );
}
