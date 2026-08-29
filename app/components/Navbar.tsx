"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { getUserProfile } from "@/app/actions/user";

const navItems = [
  { id: "home", label: "হোম", href: "/", icon: true },
  { id: "properties", label: "খুঁজুন", href: "/listings" },
  { id: "post", label: "বিজ্ঞাপন", href: "/post" },
  { id: "contact", label: "যোগাযোগ", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const userId = user?.id;
  const userImageUrl = user?.imageUrl;

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setAvatarUrl(null);
      return;
    }

    let isMounted = true;
    const cacheKey = `dhaka_basha_avatar_${userId}`;

    // Read cached avatar to avoid visual jump on page load
    const cachedAvatar = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cachedAvatar) {
      setAvatarUrl(cachedAvatar);
    }

    // Fetch custom profile picture from database
    getUserProfile()
      .then((profile) => {
        if (!isMounted) return;
        if (profile?.profileImage) {
          // Custom profile image takes priority
          setAvatarUrl(profile.profileImage);
          localStorage.setItem(cacheKey, profile.profileImage);
        } else if (userImageUrl) {
          // Fallback to Google / Clerk OAuth image only if no custom image is set
          setAvatarUrl(userImageUrl);
          localStorage.setItem(cacheKey, userImageUrl);
        }
      })
      .catch(() => {
        if (isMounted && !cachedAvatar && userImageUrl) {
          setAvatarUrl(userImageUrl);
        }
      });

    // Listen for live profile updates
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ profileImage: string }>;
      if (customEvent.detail?.profileImage && isMounted) {
        setAvatarUrl(customEvent.detail.profileImage);
        localStorage.setItem(cacheKey, customEvent.detail.profileImage);
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [isSignedIn, userId, userImageUrl]);
  
  // Map pathname to active nav item
  const getActiveId = () => {
    if (pathname === "/") return null;
    if (pathname === "/listings") return "properties";
    if (pathname === "/post") return "post";
    if (pathname === "/profile") return "profile";
    if (pathname.startsWith("/inbox")) return "profile";
    return null;
  };
  
  const active = getActiveId();

  return (
    <nav className="fixed top-4 w-[calc(100%-2rem)] left-4 md:top-6 md:left-1/2 md:w-auto md:transform md:-translate-x-1/2 z-50">
      <div className={`bg-white/85 backdrop-blur-md shadow-lg border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-center md:min-w-[430px] gap-1 ${isMenuOpen ? "rounded-2xl p-4" : "rounded-full px-4 py-2.5"}`}>
        
        {/* Mobile Header (Logo & Hamburger) */}
        <div className={`relative flex items-center justify-between md:hidden w-full ${isMenuOpen ? "mb-4" : ""}`}>
          <Link href="/" onClick={() => { setIsMenuOpen(false); }} className="flex items-center z-10">
            <div className="scale-150 origin-left ml-2">
              <Image src="/logo.png" alt="Home" width={24} height={24} className="w-auto h-auto" />
            </div>
          </Link>
          
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="text-xl font-bold text-[#2E2910] font-ekush mt-1 inline-block">
              ঢাকা-<span className="text-[#2C5745]">বাসা</span>
            </span>
          </div>

          <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-700 hover:text-[#2C5745] focus:outline-none z-10">
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
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center w-full md:w-auto ${
                item.id === "home" ? "hidden md:flex" : ""
              } ${
                active === item.id
                  ? "bg-[#2C5745] text-white shadow-xs"
                  : "text-slate-700 hover:text-[#2E2910] hover:bg-[#EBE3A7]/15"
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

          {/* Profile Icon */}
          <Link
            href={isSignedIn ? "/profile" : pathname === "/" ? "/login" : `/login?redirectUrl=${encodeURIComponent(pathname)}`}
            onClick={() => setIsMenuOpen(false)}
            className="px-3 py-2 text-slate-700 hover:text-[#2C5745] transition-colors w-full md:w-auto flex justify-center mt-1 md:mt-0"
            aria-label={isSignedIn ? "প্রোফাইল" : "লগইন"}
          >
            <div className={`scale-120 origin-center rounded-full p-0.5 ${
              active === "profile" ? "ring-2 ring-[#2C5745] bg-[#EBE3A7]/20" : ""
            }`}>
              {isSignedIn && avatarUrl ? (
                <div className="relative w-[22px] h-[22px] rounded-full overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    fill
                    sizes="22px"
                    className="rounded-full object-cover"
                    unoptimized={avatarUrl.startsWith("blob:")}
                  />
                </div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
