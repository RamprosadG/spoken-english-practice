import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { interviewQuestionInputSchema } from "@/lib/validations/interview-question";
import {
  deleteInterviewQuestion,
  updateInterviewQuestion,
} from "@/server/services/interview-question.service";

interface InterviewQuestionRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: InterviewQuestionRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = interviewQuestionInputSchema.parse(await request.json());
    const question = await updateInterviewQuestion(id, input);

    return NextResponse.json({
      success: true,
      message: "Interview question updated successfully.",
      data: question,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: InterviewQuestionRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteInterviewQuestion(id);

    return NextResponse.json({
      success: true,
      message: "Interview question deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
