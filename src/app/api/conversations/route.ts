import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { parsePublicationStatus } from "@/lib/publishing";
import { parsePagination } from "@/lib/utils";
import { conversationInputSchema } from "@/lib/validations/conversation";
import {
  CONVERSATION_PAGE_SIZE,
  createConversation,
  listConversations,
} from "@/server/services/conversation.service";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(
      searchParams,
      CONVERSATION_PAGE_SIZE,
    );
    const data = await listConversations({
      search: searchParams.get("search") || undefined,
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
    const input = conversationInputSchema.parse(await request.json());
    const conversation = await createConversation(input);

    return NextResponse.json(
      {
        success: true,
        message: "Conversation created successfully.",
        data: conversation,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
