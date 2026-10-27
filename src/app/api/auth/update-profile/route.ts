import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { updateProfileSchema } from "@/lib/validations/auth";
import {
  requireSessionUser,
  updateProfile,
} from "@/server/services/auth.service";

export async function PATCH(request: Request) {
  await connection();

  try {
    const currentUser = await requireSessionUser();
    const input = updateProfileSchema.parse(await request.json());
    const user = await updateProfile(currentUser.id, input);

    return NextResponse.json({
      success: true,
      message: "Profile is updated successfully.",
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
