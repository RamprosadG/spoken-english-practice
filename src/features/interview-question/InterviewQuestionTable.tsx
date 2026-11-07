"use client";

import Link from "next/link";
import { FiEdit, FiPlayCircle, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/ui/badges/Badge";
import { TableActionButton } from "@/components/ui/buttons/TableActionButton";
import DataTable, { type Column } from "@/components/ui/tables/DataTable";
import { useAuth } from "@/features/auth/AuthProvider";
import type { InterviewQuestionItem } from "@/types/interview-question";
import { INTERVIEW_DIFFICULTY_BADGE_VARIANTS } from "./difficultyStyles";

const ANSWER_PREVIEW_LENGTH = 60;

function truncateAnswer(answer: string) {
  return answer.length > ANSWER_PREVIEW_LENGTH
    ? `${answer.slice(0, ANSWER_PREVIEW_LENGTH)}...`
    : answer;
}

interface InterviewQuestionTableProps {
  questions: InterviewQuestionItem[];
  isLoading: boolean;
  deletingId: string | null;
  onEdit: (question: InterviewQuestionItem) => void;
  onDelete: (question: InterviewQuestionItem) => void;
}

interface InterviewQuestionCardProps {
  question: InterviewQuestionItem;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: (question: InterviewQuestionItem) => void;
  onDelete: (question: InterviewQuestionItem) => void;
}

/**
 * The saved sequence as an entry number, the same quiet `#N` line vocabulary,
 * sentence, conversation and presentation use. It rides the first line of the
 * Question cell instead of a column of its own because it is the admin's
 * ordering, not a fact about the question.
 */
function SequenceLabel({
  sequence,
  className = "",
}: {
  sequence: number;
  className?: string;
}) {
  return (
    <span
      className={`text-[11px] font-semibold tracking-wider text-slate-400 tabular-nums ${className}`}
    >
      {`#${sequence}`}
    </span>
  );
}

/** One row of the interview list, redrawn as a card for the phone width. */
function InterviewQuestionCard({
  question,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: InterviewQuestionCardProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <SequenceLabel sequence={question.sequence} />
          <span aria-hidden="true" className="shrink-0 text-slate-300">
            ·
          </span>
          <span className="truncate">{question.categoryName}</span>
        </p>
        {canManage && !question.isPublished && (
          <Badge variant="warning" size="sm" className="shrink-0">
            Draft
          </Badge>
        )}
      </div>

      <p className="mt-2 break-words text-base font-semibold leading-6 text-slate-900">
        {question.question}
      </p>

      {/* The card has the width for two lines of the model answer itself, so it
          does not repeat the table's sixty-character cut. */}
      <p className="mt-1.5 line-clamp-2 break-words whitespace-pre-line text-sm leading-6 text-slate-600">
        {question.answer}
      </p>

      {/* Category travelled in the caption, so the card names the other two
          groupings here rather than leaving them out. */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant="neutral" size="sm">
          {question.topicName}
        </Badge>
        <Badge
          variant={INTERVIEW_DIFFICULTY_BADGE_VARIANTS[question.difficulty]}
          size="sm"
        >
          {question.difficulty}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <Link
          href={`/interview-questions/${question.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-3.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice now
        </Link>
        {canManage && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
            <TableActionButton
              tooltip="Update question"
              color="blue"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              onClick={() => onEdit(question)}
            >
              <FiEdit className="h-4 w-4" />
              Update
            </TableActionButton>
            <TableActionButton
              tooltip="Delete question"
              color="rose"
              className="h-11 flex-1 gap-1.5 text-xs font-semibold"
              isLoading={isDeleting}
              onClick={() => onDelete(question)}
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </TableActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function InterviewQuestionTable({
  questions,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: InterviewQuestionTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  // renderCard moves the phone width to the card list, so this table only ever
  // renders from sm up and carries no max-sm overrides.
  const columns: Column<InterviewQuestionItem>[] = [
    {
      key: "question",
      header: "Question",
      className: "whitespace-normal",
      render: (question) => (
        <div className="min-w-[140px] max-w-md whitespace-normal break-words">
          <SequenceLabel sequence={question.sequence} className="mb-1 block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-slate-900">{question.question}</p>
            {canManage && !question.isPublished && (
              <Badge variant="warning" size="sm">
                Draft
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {truncateAnswer(question.answer)}
          </p>

          {/* Topic and difficulty travel with the question they describe, so the
              cell carries them on one row and the table keeps only a Category
              column. The card already put these two below its answer, so both
              faces now read the same. */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="neutral" size="sm">
              {question.topicName}
            </Badge>
            <Badge
              variant={INTERVIEW_DIFFICULTY_BADGE_VARIANTS[question.difficulty]}
              size="sm"
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (question) => (
        <Badge variant="neutral" size="sm">
          {question.categoryName}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      render: (question) => (
        <Link
          href={`/interview-questions/${question.id}`}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
        >
          <FiPlayCircle className="h-4 w-4" />
          Practice now
        </Link>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (question) => (
        <div className="flex items-center justify-end gap-1">
          <TableActionButton
            tooltip="Edit question"
            color="blue"
            onClick={() => onEdit(question)}
          >
            <FiEdit className="w-4 h-4" />
          </TableActionButton>
          <TableActionButton
            tooltip="Delete question"
            color="rose"
            isLoading={deletingId === question.id}
            onClick={() => onDelete(question)}
          >
            <FiTrash2 className="w-4 h-4" />
          </TableActionButton>
        </div>
      ),
    });
  }

  return (
    <DataTable
      data={questions}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No interview questions found matching your search."
      renderCard={(question) => (
        <InterviewQuestionCard
          question={question}
          canManage={canManage}
          isDeleting={deletingId === question.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}
