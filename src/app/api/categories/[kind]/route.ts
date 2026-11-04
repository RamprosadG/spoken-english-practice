import { NextResponse, connection } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { categoryInputSchema, categoryKindSchema } from "@/lib/validations/category";
import { createCategory, getCategoryOptions } from "@/server/services/category.service";

interface CategoryKindRouteContext {
  params: Promise<{ kind: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: CategoryKindRouteContext,
) {
  await connection();

  try {
    const kind = categoryKindSchema.parse((await params).kind);
    const categories = await getCategoryOptions(kind);

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: CategoryKindRouteContext,
) {
  await connection();

  try {
    const kind = categoryKindSchema.parse((await params).kind);
    const input = categoryInputSchema.parse(await request.json());
    const category = await createCategory(kind, input);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
