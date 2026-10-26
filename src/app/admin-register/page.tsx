import type { Metadata } from "next";
import { AdminRegisterHeader } from "@/components/features/auth/AdminRegisterHeader";
import { AdminRegisterForm } from "@/features/auth/AdminRegisterForm";

export const metadata: Metadata = {
  title: "Admin Registration | Spoken English Practice",
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
