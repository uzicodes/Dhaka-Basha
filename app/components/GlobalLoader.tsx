"use client";

import { useSyncExternalStore } from "react";

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

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("load", onStoreChange);
  return () => window.removeEventListener("load", onStoreChange);
}

function getSnapshot() {
  return document.readyState !== "complete";
}

function getServerSnapshot() {
  return false;
}

export default function GlobalLoader() {
  const isLoading = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <Loader />
    </div>
  );
}
