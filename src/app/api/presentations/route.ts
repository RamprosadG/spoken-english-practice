import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePagination } from "@/lib/utils";
import { presentationInputSchema } from "@/lib/validations/presentation";
import {
  PRESENTATION_PAGE_SIZE,
  createPresentation,
  listPresentations,
} from "@/server/services/presentation.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      PRESENTATION_PAGE_SIZE,
    );
    const data = await listPresentations({
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
    const input = presentationInputSchema.parse(await request.json());
    const presentation = await createPresentation(input);

    return NextResponse.json(
      {
        success: true,
        message: "Presentation created successfully.",
        data: presentation,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
