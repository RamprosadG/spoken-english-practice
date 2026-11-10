import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { learnerUpdateInputSchema } from "@/lib/validations/learner";
import {
  deleteLearner,
  updateLearner,
} from "@/server/services/learner.service";

interface LearnerRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: LearnerRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = learnerUpdateInputSchema.parse(await request.json());
    const learner = await updateLearner(id, input);

    return NextResponse.json({
      success: true,
      message: "Learner updated successfully.",
      data: learner,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: LearnerRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteLearner(id);

    return NextResponse.json({
      success: true,
      message: "Learner deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
