import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/users";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    const authResult = authenticateUser(email, password);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    const user = authResult.user;
    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      cefrLevel: user.cefrLevel,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Lỗi máy chủ khi xác thực: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
