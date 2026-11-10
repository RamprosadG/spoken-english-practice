import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { questionInputSchema } from "@/lib/validations/question";
import {
  deleteQuestion,
  updateQuestion,
} from "@/server/services/question.service";

interface QuestionRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: QuestionRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = questionInputSchema.parse(await request.json());
    const question = await updateQuestion(id, input);

    return NextResponse.json({
      success: true,
      message: "Question updated successfully.",
      data: question,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: QuestionRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteQuestion(id);

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
