import { NextResponse } from "next/server";
import { apiSuccess } from "../../lib/response";
import { SESSION_COOKIE_NAME } from "../../lib/auth";

export async function POST() {
  const response = NextResponse.json(apiSuccess({ loggedOut: true }));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
