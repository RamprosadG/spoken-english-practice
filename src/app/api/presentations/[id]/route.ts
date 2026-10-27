import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { presentationInputSchema } from "@/lib/validations/presentation";
import {
  deletePresentation,
  updatePresentation,
} from "@/server/services/presentation.service";

interface PresentationRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: PresentationRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = presentationInputSchema.parse(await request.json());
    const presentation = await updatePresentation(id, input);

    return NextResponse.json({
      success: true,
      message: "Presentation updated successfully.",
      data: presentation,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: PresentationRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deletePresentation(id);

    return NextResponse.json({
      success: true,
      message: "Presentation deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
