"use client";

import { FiMenu } from "react-icons/fi";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  return (
    <header className="fixed top-0 z-30 bg-white shadow-md hover:shadow-lg left-0 right-0 transition-all duration-300">
      <div className="flex items-center h-[var(--app-nav-height)] lg:pl-64">
        <div className="flex items-center justify-between w-full px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
