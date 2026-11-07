import type { PaginationMeta } from "@/server/types/pagination";
import type { UserRole } from "@/generated/prisma/client";

/**
 * The two roles a learner account can hold. `public` is what the app calls a
 * learner — the person who practises — and `admin` is the person who curates
 * the libraries, so the labels live here rather than leaking the enum value.
 */
export const LEARNER_ROLES = ["admin", "public"] as const;

export type LearnerRole = UserRole;

export const LEARNER_ROLE_LABELS: Record<LearnerRole, string> = {
  admin: "Admin",
  public: "Learner",
};

export const LEARNER_ROLE_BADGE_VARIANTS: Record<
  LearnerRole,
  "info" | "neutral"
> = {
  admin: "info",
  public: "neutral",
};

export const LEARNER_ROLE_OPTIONS = LEARNER_ROLES.map((role) => ({
  value: role,
  label: LEARNER_ROLE_LABELS[role],
}));

export const LEARNER_ROLE_FILTER_OPTIONS = [
  { value: "", label: "All roles" },
  ...LEARNER_ROLE_OPTIONS,
];

/** The only place a URL string becomes the union, so a junk `?role=` is ignored. */
export function parseLearnerRole(
  value: string | undefined,
): LearnerRole | undefined {
  return LEARNER_ROLES.find((role) => role === value);
}

export interface LearnerItem {
  id: string;
  name: string;
  email: string;
  role: LearnerRole;
}

export interface LearnerFilters {
  search: string;
  role: string;
  page: number;
}

export interface LearnerListData {
  learners: LearnerItem[];
  pagination: PaginationMeta | null;
  filters: LearnerFilters;
}
