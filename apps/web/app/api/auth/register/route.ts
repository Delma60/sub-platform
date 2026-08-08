import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: {
      message: "Registration endpoint ready",
      received: body,
    },
  });
}
