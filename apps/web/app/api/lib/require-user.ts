import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./auth";
import { findUserById } from "./store";

export async function requireUser(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(bearer ?? cookie);
  if (!session) return null;
  return await findUserById(session.sub);
}
