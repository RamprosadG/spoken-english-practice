"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex relative bg-white">
      {/* 1. Left Sidebar (Fixed width w-64 on desktop) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 2. Main content area taking all remaining width (pl-64 on desktop, no max-w restriction) */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
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
