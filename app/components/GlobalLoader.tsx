"use client";

import { useEffect, useState } from "react";

export function Loader() {
  return (
    <div className="loader">
      <div className="loader-square bg-green-500"></div>
      <div className="loader-square bg-red-500"></div>
      <div className="loader-square bg-green-600"></div>
      <div className="loader-square bg-red-600"></div>
      <div className="loader-square bg-green-400"></div>
      <div className="loader-square bg-red-400"></div>
      <div className="loader-square bg-green-700"></div>
    </div>
  );
}

export default function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);

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

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <Loader />
    </div>
  );
}
