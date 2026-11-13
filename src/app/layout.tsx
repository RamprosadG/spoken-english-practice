import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "animate.css";
import { AppLayoutShell } from "@/components/shared/AppLayoutShell";
import { AuthProvider } from "@/components/features/auth/AuthProvider";
import { GoogleAuthProvider } from "@/components/features/auth/GoogleAuthProvider";
import { SITE_NAME } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description:
    "Learn spoken English with daily presentations, common sentences, vocabulary with Bengali meanings, two-speaker conversations and dictation practice — each with audio and IPA pronunciation.",
  icons: {
    icon: [{ url: "/spoken-english.jpg", type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <GoogleAuthProvider>
          <AuthProvider>
            <AppLayoutShell>{children}</AppLayoutShell>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
