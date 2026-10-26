"use client";

import { useRouter } from "next/navigation";
import { FiHome, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center px-4">
      {/* Error Code */}
      <div className="mb-8">
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
      </div>

      {/* Message */}
      <div className="max-w-md text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow hover:shadow-md"
        >
          <FiHome className="w-5 h-5" />
          Go to Home
        </button>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  );
}
