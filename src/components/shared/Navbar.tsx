"use client";

import { FiMenu } from "react-icons/fi";
import Button from "@/components/ui/buttons/Button";
import { AuthModals } from "@/components/features/auth/AuthModals";
import { useAuth } from "@/components/features/auth/AuthProvider";
import { UserMenu } from "./UserMenu";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  onOpenSidebar: () => void;
  onClose: () => void;
}

export function Navbar({ onOpenSidebar, onClose }: NavbarProps) {
  const { user, isAuthLoading, openLogin, openRegister } = useAuth();

  return (
    <>
      <header className="fixed top-0 z-30 bg-white shadow-md hover:shadow-lg left-0 right-0 transition-all duration-300">
        <div className="flex items-center h-[var(--app-nav-height)] lg:pl-72">
          <div className="flex items-center justify-between w-full px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSidebar}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Open Menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <Link href="/" className="lg:hidden flex items-center" onClick={onClose}>
                <Image
                  src="/spoken-english.jpg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover mr-3 shadow-xs"
                />
                <h1 className="text-lg font-bold text-slate-900">Spoken English</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {isAuthLoading ? (
                <span
                  className="h-8 w-28 animate-pulse rounded-lg bg-slate-100"
                  aria-hidden="true"
                />
              ) : user ? (
                <UserMenu />
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={openLogin}
                  >
                    Login
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={openRegister}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModals />
    </>
  );
}
