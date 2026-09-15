"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  score?: number;
  max?: number;
  interactive?: boolean;
  onRate?: (score: number) => void;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  score = 0,
  max = 5,
  interactive = false,
  onRate,
  size = "md",
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const activeScore = hovered !== null ? hovered : score;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeScore;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={cn(
              "transition-transform",
              interactive ? "cursor-pointer hover:scale-110 focus:outline-none" : "cursor-default"
            )}
            aria-label={`${starValue} stars`}
          >
            <Star
              className={cn(
                starSizes[size],
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-100 text-slate-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
