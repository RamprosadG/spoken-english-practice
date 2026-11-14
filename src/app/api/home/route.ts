import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { getHomeSummary } from "@/server/services/home.service";

export async function GET() {
  await connection();

  try {
    const summary = await getHomeSummary();

    return NextResponse.json({
      success: true,
      message: "Home summary is fetched successfully.",
      data: summary,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
