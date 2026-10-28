"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiX } from "react-icons/fi";
import {
  HiOutlineHome,
  HiOutlinePresentationChartBar,
  HiOutlineChatAlt2,
  HiOutlineBookOpen,
  HiOutlineMicrophone,
} from "react-icons/hi";
import { IconType } from "react-icons";

interface NavItem {
  name: string;
  href: string;
  icon: IconType;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: HiOutlineHome },
  { name: "Important Vocabularies", href: "/vocabulary", icon: HiOutlineBookOpen },
  { name: "Common sentences", href: "/sentences", icon: HiOutlineChatAlt2 },
  { name: "Daily Presentations", href: "/presentation", icon: HiOutlinePresentationChartBar },
  { name: "Live practice", href: "/practice", icon: HiOutlineMicrophone },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navList = (onNavigate?: () => void) => (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center px-4 h-12 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-indigo-600" : "text-gray-600"
                }`}
              />
              <span className="ml-3 font-medium text-sm text-nowrap">
                {item.name}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed left, w-72 so the long labels fit, no minimize/maximize toggle button) */}
      <aside className="hidden lg:flex flex-col bg-white border-r pl-6 pr-4 border-gray-200 drop-shadow-xl hover:drop-shadow-2xl fixed top-0 h-screen z-40 left-0 w-72">
        {/* Brand / Title Header */}
        <div className="flex items-center h-16 border-b border-gray-100 shrink-0">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/spoken-english.jpg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover mr-3 shadow-xs"
            />
            <h1 className="text-lg font-bold text-slate-900 text-nowrap tracking-tight">
              Spoken English
            </h1>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-3 sidebar-scrollbar">
          {navList()}
        </nav>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-35 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 px-4 bg-white border-r border-gray-200 drop-shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-100 shrink-0">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <Image
              src="/spoken-english.jpg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover mr-3 shadow-xs"
            />
            <h1 className="text-lg font-bold text-slate-900">Spoken English</h1>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 sidebar-scrollbar">
          {navList(onClose)}
        </nav>
      </aside>
    </>
  );
}
