import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePublicationStatus } from "@/lib/publishing";
import { parsePagination } from "@/lib/utils";
import { videoInputSchema } from "@/lib/validations/video";
import {
  VIDEO_PAGE_SIZE,
  createVideo,
  listVideos,
} from "@/server/services/video.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      VIDEO_PAGE_SIZE,
    );
    const data = await listVideos({
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
    const input = videoInputSchema.parse(await request.json());
    const video = await createVideo(input);

    return NextResponse.json(
      {
        success: true,
        message: "Video created successfully.",
        data: video,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
