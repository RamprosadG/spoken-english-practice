import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePagination } from "@/lib/utils";
import { vocabularyInputSchema } from "@/lib/validations/vocabulary";
import {
  VOCABULARY_PAGE_SIZE,
  createVocabulary,
  listVocabulary,
} from "@/server/services/vocabulary.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      VOCABULARY_PAGE_SIZE,
    );
    const data = await listVocabulary({
      search: searchParams.get("search") || undefined,
      letter: searchParams.get("letter") || undefined,
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
    const input = vocabularyInputSchema.parse(await request.json());
    const vocabulary = await createVocabulary(input);

    return NextResponse.json(
      {
        success: true,
        message: "Vocabulary created successfully.",
        data: vocabulary,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
