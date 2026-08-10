import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./auth";
import { findUserById } from "./store";

export async function requireRider(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);
  if (!session || (session.role !== "rider" && session.role !== "admin")) return null;
  return await findUserById(session.sub);
}
