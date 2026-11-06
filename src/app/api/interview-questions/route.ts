import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePublicationStatus } from "@/lib/publishing";
import { parsePagination } from "@/lib/utils";
import { interviewQuestionInputSchema } from "@/lib/validations/interview-question";
import { parseInterviewDifficulty } from "@/types/interview-question";
import {
  INTERVIEW_QUESTION_PAGE_SIZE,
  createInterviewQuestion,
  listInterviewQuestions,
} from "@/server/services/interview-question.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      INTERVIEW_QUESTION_PAGE_SIZE,
    );
    const data = await listInterviewQuestions({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("category") || undefined,
      topicId: searchParams.get("topic") || undefined,
      difficulty: parseInterviewDifficulty(
        searchParams.get("difficulty") || undefined,
      ),
      status: parsePublicationStatus(searchParams.get("status") || undefined),
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  await connection();

  try {
    const input = interviewQuestionInputSchema.parse(await request.json());
    const question = await createInterviewQuestion(input);

    return NextResponse.json(
      {
        success: true,
        message: "Interview question created successfully.",
        data: question,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
