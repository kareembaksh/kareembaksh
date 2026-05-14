"use client";

import { useState } from "react";
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

export default function ImageGallery({ images, name, badge }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-96 lg:h-[540px] rounded-3xl overflow-hidden bg-zinc-100">
        {badge && (
          <span className={`absolute top-4 left-4 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full ${BADGE_COLORS[badge] ?? "bg-zinc-500"}`}>
            {badge}
          </span>
        )}
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-cover transition-opacity duration-200"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border-2 transition-colors ${
                i === selected ? "border-rose-500" : "border-transparent hover:border-zinc-300"
              }`}
            >
              <Image src={src} alt={`${name} view ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
