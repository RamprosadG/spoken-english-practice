import { Suspense } from "react";
import {
  ListeningContent,
  ListeningLoading,
} from "@/components/features/listening/ListeningContent";

export default function ListeningsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Suspense fallback={<ListeningLoading />}>
        <ListeningContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
