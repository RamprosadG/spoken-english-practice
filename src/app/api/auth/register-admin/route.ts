import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { registerAdminSchema } from "@/lib/validations/auth";
import { registerAdminUser } from "@/server/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = registerAdminSchema.parse(await request.json());
    const user = await registerAdminUser(input);

    return NextResponse.json(
      {
        success: true,
        message: "Admin registered successfully.",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
