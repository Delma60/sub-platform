import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from "../../lib/response";
import { requireUser } from "../../lib/require-user";
import { requireAdmin } from "../../lib/require-admin";
import { uploadSignSchema } from "../../lib/validation";
import { createSignedUploadUrl } from "../../lib/s3";

export async function POST(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json(apiError("Not authenticated", 401), { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = uploadSignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422),
      { status: 422 }
    );
  }

  if (parsed.data.folder === "products") {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json(apiError("Admin access required", 403), { status: 403 });
    if (!parsed.data.contentType.startsWith("image/")) {
      return NextResponse.json(apiError("Product uploads must be images", 422), { status: 422 });
    }
  }

  try {
    const upload = createSignedUploadUrl(parsed.data);
    return NextResponse.json(apiSuccess({ upload }));
  } catch (error) {
    return NextResponse.json(
      apiError(error instanceof Error ? error.message : "Could not sign upload", 500),
      { status: 500 }
    );
  }
}
