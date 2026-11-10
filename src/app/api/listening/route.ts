import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePublicationStatus } from "@/lib/publishing";
import { parsePagination } from "@/lib/utils";
import { listeningInputSchema } from "@/lib/validations/listening";
import {
  LISTENING_PAGE_SIZE,
  createListening,
  listListenings,
} from "@/server/services/listening.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      LISTENING_PAGE_SIZE,
    );
    const data = await listListenings({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("category") || undefined,
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
    const input = listeningInputSchema.parse(await request.json());
    const listening = await createListening(input);

    return NextResponse.json(
      {
        success: true,
        message: "Listening created successfully.",
        data: listening,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
