import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ user: null, isAuthenticated: false });
  }

  return NextResponse.json({ user, isAuthenticated: true });
}
