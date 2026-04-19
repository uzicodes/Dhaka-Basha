"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [active, setActive] = useState("home");

  const navItems = [
    { id: "home", label: "হোম", href: "/" },
    { id: "properties", label: "খুজন", href: "/listings" },
    { id: "post", label: "বিজ্ঞাপন দিন", href: "/post" },
    { id: "about", label: "সম্পর্কে", href: "/about" },
    { id: "contact", label: "যোগাযোগ", href: "/contact" },
  ];

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-100 px-2 py-3 flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActive(item.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              active === item.id
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-700 hover:text-blue-600 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
