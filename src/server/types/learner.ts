import type { PaginationMeta } from "./pagination";
import type { LearnerRole } from "@/types/learner";

export interface LearnerFilterParams {
  search?: string;
  role?: LearnerRole;
  page: number;
  pageSize: number;
}

export interface LearnerRow {
  id: string;
  name: string;
  email: string;
  role: LearnerRole;
}

export interface LearnerListResult {
  items: LearnerRow[];
  pagination: PaginationMeta;
}
