import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { googleLoginSchema } from "@/lib/validations/auth";
import { loginWithGoogle } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const { googleAccessToken } = googleLoginSchema.parse(
      await request.json(),
    );
    const user = await loginWithGoogle(googleAccessToken);

    return NextResponse.json({
      success: true,
      message: "You are logged in successfully.",
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
