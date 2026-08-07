"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MediaCarouselProps {
  media: string[];
  alt?: string;
  interval?: number; // Time in ms between transitions
  className?: string; // Container classes
  imgClassName?: string; // Image/video specific classes
  sizes?: string;
  fill?: boolean;
}

const isVideo = (url: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith("data:video");
};

export default function MediaCarousel({
  media,
  alt = "Media",
  interval = 4000,
  className = "relative overflow-hidden w-full h-full",
  imgClassName = "object-cover",
  sizes = "(max-width: 768px) 100vw, 50vw",
  fill = true,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = media && media.length > 0 ? media : [];

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (items.length === 0) {
    return (
      <div className={`${className} bg-zinc-100 flex items-center justify-center`}>
        <span className="text-zinc-400 text-xs">No media</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((src, idx) => {
        const active = idx === currentIndex;
        const video = isVideo(src);

        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              active ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {video ? (
              <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full ${imgClassName}`}
              />
            ) : (
              fill ? (
                <Image
                  src={src}
                  alt={`${alt} ${idx + 1}`}
                  fill
                  sizes={sizes}
                  className={imgClassName}
                />
              ) : (
                <img src={src} alt={`${alt} ${idx + 1}`} className={`w-full h-full ${imgClassName}`} />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
