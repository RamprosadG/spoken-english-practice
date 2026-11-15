import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePublicationStatus } from "@/lib/publishing";
import { parsePagination } from "@/lib/utils";
import { storyInputSchema } from "@/lib/validations/story";
import {
  STORY_PAGE_SIZE,
  createStory,
  listStories,
} from "@/server/services/story.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams, STORY_PAGE_SIZE);
    const data = await listStories({
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
    const input = storyInputSchema.parse(await request.json());
    const story = await createStory(input);

    return NextResponse.json(
      {
        success: true,
        message: "Story created successfully.",
        data: story,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}