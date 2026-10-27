import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePagination } from "@/lib/utils";
import { sentenceInputSchema } from "@/lib/validations/sentence";
import {
  SENTENCE_PAGE_SIZE,
  createSentence,
  listSentences,
} from "@/server/services/sentence.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      SENTENCE_PAGE_SIZE,
    );
    const data = await listSentences({
      search: searchParams.get("search") || undefined,
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
    const input = sentenceInputSchema.parse(await request.json());
    const sentence = await createSentence(input);

    return NextResponse.json(
      {
        success: true,
        message: "Sentence created successfully.",
        data: sentence,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
