"use client";

import { FiVolume2 } from "react-icons/fi";

interface PlayTextButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  ariaLabel: string;
  label?: string;
  className?: string;
}

export function PlayTextButton({
  isPlaying,
  onClick,
  ariaLabel,
  label = "Listen",
  className = "",
}: PlayTextButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isPlaying}
      title={ariaLabel}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        isPlaying
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
      } ${className}`}
    >
      <FiVolume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
      {isPlaying ? "Playing" : label}
    </button>
  );
}
