import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { sentenceInputSchema } from "@/lib/validations/sentence";
import {
  deleteSentence,
  updateSentence,
} from "@/server/services/sentence.service";

interface SentenceRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: SentenceRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = sentenceInputSchema.parse(await request.json());
    const sentence = await updateSentence(id, input);

    return NextResponse.json({
      success: true,
      message: "Sentence updated successfully.",
      data: sentence,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: SentenceRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteSentence(id);

    return NextResponse.json({
      success: true,
      message: "Sentence deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
