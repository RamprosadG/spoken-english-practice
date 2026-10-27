import { Suspense } from "react";
import {
  HomeContent,
  HomeLoading,
} from "@/components/features/home/HomeContent";
import { HomeHeader } from "@/components/features/home/HomeHeader";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <HomeHeader />
      <Suspense fallback={<HomeLoading />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
