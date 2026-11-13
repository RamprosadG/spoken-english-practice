import type { Metadata } from "next";
import { AdminRegisterHeader } from "@/components/features/auth/AdminRegisterHeader";
import { AdminRegisterForm } from "@/components/features/auth/AdminRegisterForm";

export const metadata: Metadata = {
  title: "Admin Registration",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <AdminRegisterHeader />
      <AdminRegisterForm />
    </div>
  );
}
