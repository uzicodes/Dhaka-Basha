"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle initial page load
  useEffect(() => {
    const handleLoad = () => setIsLoading(false);

    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  // Removed artificial timeout on route changes to prevent annoying flashes.
  // Next.js handles SPA navigations instantly, and Next.js `loading.tsx` can be used if data fetching takes time.
  useEffect(() => {
    // If you want to show it on route changes, you can toggle state here, 
    // but for SPA it's generally better to only show full-screen overlays on initial load.
    setIsLoading(false);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="loader">
        <div className="loader-square bg-green-500"></div>
        <div className="loader-square bg-red-500"></div>
        <div className="loader-square bg-green-600"></div>
        <div className="loader-square bg-red-600"></div>
        <div className="loader-square bg-green-400"></div>
        <div className="loader-square bg-red-400"></div>
        <div className="loader-square bg-green-700"></div>
      </div>
    </div>
  );
}
