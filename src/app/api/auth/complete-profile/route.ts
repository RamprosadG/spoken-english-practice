import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { completeProfileSchema } from "@/lib/validations/auth";
import {
  completeProfile,
  requireSessionUser,
} from "@/server/services/auth.service";

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const input = completeProfileSchema.parse(await request.json());
    const user = await completeProfile(currentUser.id, input);

    return NextResponse.json({
      success: true,
      message: "Profile is completed successfully.",
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
