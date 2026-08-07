"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  name: string;
  badge?: string;
}

const BADGE_COLORS: Record<string, string> = {
  New: "bg-blue-500",
  Sale: "bg-rose-500",
  Popular: "bg-amber-500",
  Hot: "bg-orange-500",
};

const isVideo = (url: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith("data:video");
};

export default function ImageGallery({ images, name, badge }: Props) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const currentMedia = images[selected];
  const currentIsVideo = isVideo(currentMedia);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div
          className="relative h-96 lg:h-[540px] rounded-3xl overflow-hidden bg-zinc-100 cursor-zoom-in group"
          onClick={() => !currentIsVideo && setLightboxOpen(true)}
        >
          {badge && (
            <span className={`absolute top-4 left-4 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full ${BADGE_COLORS[badge] ?? "bg-zinc-500"}`}>
              {badge}
            </span>
          )}
          {currentIsVideo ? (
            <video
              src={currentMedia}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-contain bg-black transition-opacity duration-200"
            />
          ) : (
            <>
              <Image
                src={currentMedia}
                alt={name}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
                Click to zoom
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 flex-wrap">
            {images.map((src, i) => {
              const thumbIsVideo = isVideo(src);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border-2 transition-colors ${
                    i === selected ? "border-rose-500" : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  {thumbIsVideo ? (
                    <video src={src} className="w-full h-full object-cover pointer-events-none" muted playsInline />
                  ) : (
                    <Image src={src} alt={`${name} view ${i + 1}`} fill className="object-cover pointer-events-none" sizes="80px" />
                  )}
                  {thumbIsVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white pointer-events-none">
                      <svg className="w-6 h-6 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && !currentIsVideo && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors text-xl"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>

          {/* Prev / Next arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelected((selected - 1 + images.length) % images.length); }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button
                className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelected((selected + 1) % images.length); }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentMedia}
              alt={name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
              {selected + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
