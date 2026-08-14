import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./auth";
import { findUserById } from "./store";

export async function requireRider(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(bearer ?? cookie);
  if (!session || (session.role !== "rider" && session.role !== "admin")) return null;
  const user = await findUserById(session.sub);
  return user?.active && (user.role === "rider" || user.role === "admin") ? user : null;
}
