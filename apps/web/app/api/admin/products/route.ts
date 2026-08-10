import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireAdmin } from "../../lib/require-admin";
import { productSchema } from "../../lib/validation";
import { createProduct, listProducts } from "../../lib/data-store";

export async function GET() {
  const products = await listProducts();
  return NextResponse.json(apiSuccess({ products }));
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(apiSuccess({ product }), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : "Could not create product", 400),
      { status: 400 }
    );
  }
}
