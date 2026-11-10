import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePublicationStatus } from "@/lib/publishing";
import { parsePagination } from "@/lib/utils";
import { questionInputSchema } from "@/lib/validations/question";
import { parseQuestionDifficulty } from "@/types/question";
import {
  QUESTION_PAGE_SIZE,
  createQuestion,
  listQuestions,
} from "@/server/services/question.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      QUESTION_PAGE_SIZE,
    );
    const data = await listQuestions({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("category") || undefined,
      topicId: searchParams.get("topic") || undefined,
      difficulty: parseQuestionDifficulty(
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
    const input = questionInputSchema.parse(await request.json());
    const question = await createQuestion(input);

    return NextResponse.json(
      {
        success: true,
        message: "Question created successfully.",
        data: question,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
