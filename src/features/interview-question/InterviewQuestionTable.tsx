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

export function InterviewQuestionTable({
  questions,
  isLoading,
  deletingId,
  onEdit,
  onDelete,
}: InterviewQuestionTableProps) {
  const { user } = useAuth();
  const canManage = user?.role === "admin";

  const columns: Column<InterviewQuestionItem>[] = [
    {
      key: "question",
      header: "Question",
      headerClassName: "max-sm:px-2",
      className: "whitespace-normal max-sm:px-2",
      render: (question) => (
        <div className="max-w-[240px] whitespace-normal break-words sm:max-w-md">
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
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (question) => (
        <Badge variant="neutral" size="sm">
          {question.categoryName}
        </Badge>
      ),
    },
    {
      key: "topic",
      header: "Topic",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (question) => (
        <Badge variant="neutral" size="sm">
          {question.topicName}
        </Badge>
      ),
    },
    {
      key: "difficulty",
      header: "Difficulty",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (question) => (
        <Badge
          variant={INTERVIEW_DIFFICULTY_BADGE_VARIANTS[question.difficulty]}
          size="sm"
        >
          {question.difficulty}
        </Badge>
      ),
    },
    {
      key: "practice",
      header: "Practice",
      headerClassName: "max-sm:px-2",
      className: "max-sm:px-2",
      render: (question) => (
        <Link
          href={`/interview-questions/${question.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
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
      headerClassName: "text-right max-sm:px-2",
      className: "text-right max-sm:px-2",
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
            <FiTrash2 className="h-4 w-4" />
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
    />
  );
}
