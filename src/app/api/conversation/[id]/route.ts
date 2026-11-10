import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { conversationInputSchema } from "@/lib/validations/conversation";
import {
  deleteConversation,
  getConversationDetail,
  updateConversation,
} from "@/server/services/conversation.service";

interface ConversationRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: ConversationRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const data = await getConversationDetail(id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: ConversationRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    const input = conversationInputSchema.parse(await request.json());
    const conversation = await updateConversation(id, input);

    return NextResponse.json({
      success: true,
      message: "Conversation updated successfully.",
      data: conversation,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: ConversationRouteContext,
) {
  await connection();

  try {
    const { id } = await params;
    await deleteConversation(id);

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
