"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex relative bg-white">
      {/* 1. Left Sidebar (Fixed width w-72 on desktop) */}
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>

      {/* 2. Main content area taking all remaining width (pl-72 on desktop, no max-w restriction) */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-72">
        {/* Fixed Top Header */}
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Scrollable Main Viewport (offset by --app-nav-height, the height of the fixed header) */}
        <main className="flex-1 flex flex-col pt-[var(--app-nav-height)]">
          <div className="flex-1 p-6 md:p-8 w-full">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

function SidebarFallback() {
  return (
    <aside
      className="hidden lg:flex flex-col bg-white border-r pl-6 pr-4 border-gray-200 drop-shadow-xl fixed top-0 h-screen z-40 left-0 w-72"
      aria-hidden="true"
    >
      <div className="flex items-center h-16 border-b border-gray-100 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mr-3 shadow-xs">
          SE
        </div>
        <h1 className="text-lg font-bold text-slate-900 text-nowrap tracking-tight">
          Spoken English
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 sidebar-scrollbar" />
    </aside>
  );
}
