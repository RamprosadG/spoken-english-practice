import { QuestionActions } from "@/components/features/question/QuestionActions";
import { QuestionSection } from "@/components/features/question/QuestionSection";
import type { QuestionListData } from "@/types/question";
import { QuestionHeader } from "./QuestionHeader";

interface QuestionViewProps {
  data: QuestionListData;
  isLoading?: boolean;
}

export function QuestionView({
  data,
  isLoading = false,
}: QuestionViewProps) {
  return (
    <>
      <QuestionHeader
        actions={
          <QuestionActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
            topics={data.topics}
            topicRows={data.topicRows}
          />
        }
      />
      <QuestionSection
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
