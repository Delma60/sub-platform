import { NextResponse } from "next/server";
import { apiSuccess } from "../lib/response";
import { listProducts } from "../lib/data-store";

export async function GET() {
  const products = await listProducts({ activeOnly: true });
  return NextResponse.json(apiSuccess({ products }));
}
