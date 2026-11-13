import type { Metadata } from "next";
import { Suspense } from "react";
import {
  HomeContent,
  HomeLoading,
} from "@/components/features/home/HomeContent";
import { HomeHeader } from "@/components/features/home/HomeHeader";
import { JsonLd } from "@/components/shared/JsonLd";
import { websiteJsonLd } from "@/lib/structured-data";

// The canonical lives here rather than in the root layout, which every route
// shares: a layout-level one would also be inherited by the 404 page and by the
// noindex admin pages, pointing them all at the homepage. The title, description
// and social card are the root defaults, which already describe the homepage.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <JsonLd data={websiteJsonLd()} />
      <HomeHeader />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
