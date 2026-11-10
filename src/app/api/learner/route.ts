import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { learnerCreateInputSchema } from "@/lib/validations/learner";
import { createLearner } from "@/server/services/learner.service";

export async function POST(request: Request) {
  await connection();

  try {
    const input = learnerCreateInputSchema.parse(await request.json());
    const learner = await createLearner(input);

    return NextResponse.json(
      {
        success: true,
        message: "Learner created successfully.",
        data: learner,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
