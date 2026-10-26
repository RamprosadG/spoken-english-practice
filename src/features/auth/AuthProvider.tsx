"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser } from "@/types/auth";
import { authRequest } from "./auth-client";

type AuthModal = "login" | "register" | "complete-profile" | null;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthLoading: boolean;
  activeModal: AuthModal;
  openLogin: () => void;
  openRegister: () => void;
  openCompleteProfile: () => void;
  closeModal: () => void;
  setAuthenticatedUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<AuthModal>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) return;

        const payload = (await response.json()) as { data?: AuthUser };
        if (!isCancelled && payload.data) {
          setUser(payload.data);
        }
      } catch {
        // A network failure simply leaves the visitor signed out.
      } finally {
        if (!isCancelled) {
          setIsAuthLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, []);

  const openLogin = useCallback(() => setActiveModal("login"), []);
  const openRegister = useCallback(() => setActiveModal("register"), []);
  const openCompleteProfile = useCallback(
    () => setActiveModal("complete-profile"),
    [],
  );
  const closeModal = useCallback(() => setActiveModal(null), []);

  const setAuthenticatedUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    setActiveModal(nextUser.isComplete ? null : "complete-profile");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authRequest<null>("/api/auth/logout", { method: "POST" });
    } catch {
      // Clear the local session even if the request cannot reach the server.
    }
    setUser(null);
    setActiveModal(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      activeModal,
      openLogin,
      openRegister,
      openCompleteProfile,
      closeModal,
      setAuthenticatedUser,
      logout,
    }),
    [
      user,
      isAuthLoading,
      activeModal,
      openLogin,
      openRegister,
      openCompleteProfile,
      closeModal,
      setAuthenticatedUser,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
