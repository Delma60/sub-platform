import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../../lib/response";
import { requireAdmin } from "../../../lib/require-admin";
import { productSchema } from "../../../lib/validation";
import { deleteProduct, updateProduct } from "../../../lib/data-store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  try {
    const product = await updateProduct(params.id, parsed.data);
    if (!product) {
      return NextResponse.json(apiError("Product not found", 404), { status: 404 });
    }
    return NextResponse.json(apiSuccess({ product }));
  } catch (error) {
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : "Could not update product", 400),
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const ok = await deleteProduct(params.id);
  if (!ok) {
    return NextResponse.json(apiError("Product not found", 404), { status: 404 });
  }
  return NextResponse.json(apiSuccess({ deleted: true }));
}
