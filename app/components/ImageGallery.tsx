"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (fullscreenIndex === null) return;
      if (e.key === "Escape") setFullscreenIndex(null);
      if (e.key === "ArrowRight")
        setFullscreenIndex((prev) =>
          prev !== null ? (prev + 1) % images.length : null
        );
      if (e.key === "ArrowLeft")
        setFullscreenIndex((prev) =>
          prev !== null ? (prev - 1 + images.length) % images.length : null
        );
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenIndex, images.length]);

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (fullscreenIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreenIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goFullscreenNext = useCallback(() => {
    setFullscreenIndex((prev) =>
      prev !== null ? (prev + 1) % images.length : null
    );
  }, [images.length]);

  const goFullscreenPrev = useCallback(() => {
    setFullscreenIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : null
    );
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200 rounded-2xl flex flex-col items-center justify-center mb-6 text-slate-400">
        <svg className="w-12 h-12 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-semibold text-sm text-slate-400">কোনো ছবি আপলোড করা হয়নি</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Image Viewer */}
      <div className="mb-6 space-y-3">
        {/* Hero image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 group shadow-xs">
          <Image
            src={images[activeIndex]}
            alt={`ছবি ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
            className="object-cover cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]"
            onClick={() => setFullscreenIndex(activeIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFullscreenIndex(activeIndex);
              }
            }}
            tabIndex={0}
            role="button"
          />

          {/* Fullscreen hint */}
          <button
            type="button"
            onClick={() => setFullscreenIndex(activeIndex)}
            className="absolute top-3 right-3 bg-slate-900/60 hover:bg-slate-900/80 text-white p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer shadow-xs"
            title="ফুলস্ক্রিনে দেখুন"
            aria-label="Open fullscreen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Image counter badge */}
          <span className="absolute bottom-3 right-3 bg-slate-950/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xs">
            {activeIndex + 1} / {images.length}
          </span>

          {/* Navigation arrows (only if more than 1 image) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/50 hover:bg-slate-900/80 text-white w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/50 hover:bg-slate-900/80 text-white w-9 h-9 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip (only if more than 1 image) */}
        {images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
            {images.map((src, idx) => (
              <button
                type="button"
                key={src}
                onClick={() => setActiveIndex(idx)}
                className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  idx === activeIndex
                    ? "border-blue-600 shadow-sm ring-2 ring-blue-600/20 scale-[1.02]"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <Image
                  src={src}
                  alt={`থাম্বনেইল ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setFullscreenIndex(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFullscreenIndex(null);
            }
          }}
          tabIndex={0}
          role="button"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setFullscreenIndex(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"
            aria-label="Close fullscreen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/80 text-xs font-semibold backdrop-blur-md bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
            {fullscreenIndex + 1} / {images.length}
          </span>

          {/* Image */}
          <div
            className="relative w-[90vw] h-[82vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[fullscreenIndex]}
              alt={`ছবি ${fullscreenIndex + 1}`}
              fill
              className="object-contain select-none rounded-xl"
              draggable={false}
            />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goFullscreenPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"
                aria-label="Previous fullscreen image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goFullscreenNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"
                aria-label="Next fullscreen image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
