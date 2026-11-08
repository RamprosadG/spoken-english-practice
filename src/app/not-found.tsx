"use client";

import { useRouter } from "next/navigation";
import { FiHome, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
      {/* Error Code */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-6xl font-bold tracking-tight text-slate-300 sm:text-7xl">
          404
        </h1>
      </div>

      {/* Message */}
      <div className="max-w-md mb-6 sm:mb-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 active:bg-indigo-800 hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:px-4 sm:py-2 sm:text-sm"
        >
          <FiHome className="h-4 w-4" />
          Go To Home
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 active:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 sm:px-4 sm:py-2 sm:text-sm"
        >
          <FiArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}

