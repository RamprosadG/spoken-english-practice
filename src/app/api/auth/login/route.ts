import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await loginUser(input);

    return NextResponse.json({
      success: true,
      message: "You are logged in successfully.",
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
