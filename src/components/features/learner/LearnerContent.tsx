import { connection } from "next/server";
import { LEARNER_PAGE_SIZE, listLearners } from "@/server/services/learner.service";
import { parseLearnerRole } from "@/types/learner";
import type { LearnerFilters, LearnerListData } from "@/types/learner";
import { LearnerView } from "./LearnerView";

const emptyData: LearnerListData = {
  learners: [],
  pagination: null,
  filters: { search: "", role: "", page: 1 },
};

export function LearnerLoading() {
  return <LearnerView data={emptyData} isLoading />;
}

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(query: SearchParams, key: string): string {
  const value = Array.isArray(query[key]) ? query[key][0] : query[key];
  return typeof value === "string" ? value : "";
}

function readFilters(query: SearchParams): LearnerFilters {
  const rawPage = Number(readParam(query, "page"));

  return {
    search: readParam(query, "search"),
    role: readParam(query, "role"),
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
  };
}

interface LearnerContentProps {
  searchParams: Promise<SearchParams>;
}

export async function LearnerContent({
  searchParams,
}: LearnerContentProps) {
  // Mark this region as request-time before any URL read, so the list is never
  // served from a prerendered snapshot.
  await connection();

  const filters = readFilters(await searchParams);

  const list = await listLearners({
    search: filters.search || undefined,
    role: parseLearnerRole(filters.role),
    page: filters.page,
    pageSize: LEARNER_PAGE_SIZE,
  });

  const data: LearnerListData = {
    learners: list.items,
    pagination: list.pagination,
    filters: { ...filters, page: list.pagination.page },
  };

  return <LearnerView data={data} />;
}
