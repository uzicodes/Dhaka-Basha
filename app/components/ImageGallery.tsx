"use client";

import { useState, useCallback, useEffect } from "react";

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
      <div className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[15px] flex flex-col items-center justify-center mb-6 text-slate-400">
        <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium text-sm md:text-base">কোনো ছবি আপলোড করা হয়নি</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Image Viewer */}
      <div className="mb-6">
        {/* Hero image */}
        <div className="relative w-full aspect-video rounded-[15px] overflow-hidden bg-slate-100 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex]}
            alt={`ছবি ${activeIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
            onClick={() => setFullscreenIndex(activeIndex)}
          />

          {/* Fullscreen hint */}
          <button
            onClick={() => setFullscreenIndex(activeIndex)}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            title="ফুলস্ক্রিনে দেখুন"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Image counter badge */}
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>

          {/* Navigation arrows (only if more than 1 image) */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip (only if more than 1 image) */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  idx === activeIndex
                    ? "border-[#2d79f3] shadow-md ring-2 ring-[#2d79f3]/30"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`থাম্বনেইল ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreenIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreenIndex(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium backdrop-blur-sm bg-white/10 px-4 py-1.5 rounded-full">
            {fullscreenIndex + 1} / {images.length}
          </span>

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[fullscreenIndex]}
              alt={`ছবি ${fullscreenIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goFullscreenPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goFullscreenNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
