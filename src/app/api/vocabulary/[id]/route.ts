import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { vocabularyInputSchema } from "@/lib/validations/vocabulary";
import {
  deleteVocabulary,
  updateVocabulary,
} from "@/server/services/vocabulary.service";

interface VocabularyRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: VocabularyRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = vocabularyInputSchema.parse(await request.json());
    const vocabulary = await updateVocabulary(id, input);

    return NextResponse.json({
      success: true,
      message: "Vocabulary updated successfully.",
      data: vocabulary,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: VocabularyRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteVocabulary(id);

    return NextResponse.json({
      success: true,
      message: "Vocabulary deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
