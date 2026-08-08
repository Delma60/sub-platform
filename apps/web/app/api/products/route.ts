import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "prod_001",
        name: "Starter Pantry Box",
        slug: "starter-pantry-box",
        price: 2500,
        description: "A sample subscription box for early setup.",
      },
    ],
  });
}
