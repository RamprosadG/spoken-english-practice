import { InterviewQuestionActions } from "@/features/interview-question/InterviewQuestionActions";
import { InterviewQuestionSection } from "@/features/interview-question/InterviewQuestionSection";
import type { InterviewQuestionListData } from "@/types/interview-question";
import { InterviewQuestionHeader } from "./InterviewQuestionHeader";

interface InterviewQuestionViewProps {
  data: InterviewQuestionListData;
  isLoading?: boolean;
}

export function InterviewQuestionView({
  data,
  isLoading = false,
}: InterviewQuestionViewProps) {
  return (
    <>
      <InterviewQuestionHeader
        actions={
          <InterviewQuestionActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
            topics={data.topics}
            topicRows={data.topicRows}
          />
        }
      />
      <InterviewQuestionSection
        questions={data.questions}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        topics={data.topics}
        isLoading={isLoading}
      />
    </>
  );
}
