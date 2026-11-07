import { LearnerActions } from "@/features/learner/LearnerActions";
import { LearnerSection } from "@/features/learner/LearnerSection";
import type { LearnerListData } from "@/types/learner";
import { LearnerHeader } from "./LearnerHeader";

interface LearnerViewProps {
  data: LearnerListData;
  isLoading?: boolean;
}

export function LearnerView({ data, isLoading = false }: LearnerViewProps) {
  return (
    <>
      <LearnerHeader actions={<LearnerActions />} />
      <LearnerSection
        learners={data.learners}
        pagination={data.pagination}
        filters={data.filters}
        isLoading={isLoading}
      />
    </>
  );
}
