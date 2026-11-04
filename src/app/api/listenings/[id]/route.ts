import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { listeningInputSchema } from "@/lib/validations/listening";
import {
  deleteListening,
  getListeningDetail,
  updateListening,
} from "@/server/services/listening.service";

interface ListeningRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: ListeningRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const data = await getListeningDetail(id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: ListeningRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = listeningInputSchema.parse(await request.json());
    const listening = await updateListening(id, input);

    return NextResponse.json({
      success: true,
      message: "Listening updated successfully.",
      data: listening,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: ListeningRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteListening(id);

    return NextResponse.json({
      success: true,
      message: "Listening deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
