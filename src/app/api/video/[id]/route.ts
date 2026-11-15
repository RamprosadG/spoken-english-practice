import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { videoInputSchema } from "@/lib/validations/video";
import {
  deleteVideo,
  updateVideo,
} from "@/server/services/video.service";

interface VideoRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: VideoRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = videoInputSchema.parse(await request.json());
    const video = await updateVideo(id, input);

    return NextResponse.json({
      success: true,
      message: "Video updated successfully.",
      data: video,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: VideoRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteVideo(id);

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
