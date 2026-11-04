import { NextResponse, connection } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { categoryInputSchema, categoryKindSchema } from "@/lib/validations/category";
import { deleteCategory, updateCategory } from "@/server/services/category.service";

interface CategoryRouteContext {
  params: Promise<{ kind: string; id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: CategoryRouteContext,
) {
  await connection();

  try {
    const { kind, id } = await params;
    const input = categoryInputSchema.parse(await request.json());
    const category = await updateCategory(
      categoryKindSchema.parse(kind),
      id,
      input,
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: CategoryRouteContext,
) {
  await connection();

  try {
    const { kind, id } = await params;
    await deleteCategory(categoryKindSchema.parse(kind), id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
      data: null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
