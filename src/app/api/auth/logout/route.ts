import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { logoutUser } from "@/server/services/auth.service";

export async function POST() {
  try {
    await logoutUser();

    return NextResponse.json({
      success: true,
      message: "You are logged out successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
