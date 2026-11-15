import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { storyInputSchema } from "@/lib/validations/story";
import { deleteStory, updateStory } from "@/server/services/story.service";

interface StoryRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: StoryRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = storyInputSchema.parse(await request.json());
    const story = await updateStory(id, input);

    return NextResponse.json({
      success: true,
      message: "Story updated successfully.",
      data: story,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: StoryRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteStory(id);

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}