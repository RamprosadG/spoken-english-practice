import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { resolveSessionUser } from "@/server/services/auth.service";

export async function GET() {
  await connection();

  try {
    const user = await resolveSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You are not logged in." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User is fetched successfully.",
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
