import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const user = await registerUser(input);

    return NextResponse.json(
      {
        success: true,
        message: "You are registered successfully.",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
