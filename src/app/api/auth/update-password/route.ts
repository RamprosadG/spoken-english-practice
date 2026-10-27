import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { updatePasswordSchema } from "@/lib/validations/auth";
import {
  requireSessionUser,
  updatePassword,
} from "@/server/services/auth.service";

export async function PATCH(request: Request) {
  await connection();

  try {
    const currentUser = await requireSessionUser();
    const input = updatePasswordSchema.parse(await request.json());
    await updatePassword(currentUser.id, input);

    return NextResponse.json({
      success: true,
      message: "Password is updated successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
