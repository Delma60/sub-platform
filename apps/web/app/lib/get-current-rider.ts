import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../api/lib/auth";
import { findUserById } from "../api/lib/store";

export async function getCurrentRider() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session || (session.role !== "rider" && session.role !== "admin")) return null;
  return await findUserById(session.sub);
}
