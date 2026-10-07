import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, registerUser, isAdminEmail } from "@/lib/auth/users";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "google.traveler@gmail.com";
    const displayName = body.displayName || "Google Explorer";

    let user = findUserByEmail(email);
    if (!user) {
      // Auto-register user with google
      const reg = registerUser({
        email,
        password: `GoogleOauth_${Date.now()}_Secret!`,
        displayName,
        role: isAdminEmail(email) ? "admin" : "learner",
        cefrLevel: "B1",
      });
      user = reg.user;
    } else if (isAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
    }

    if (!user) {
      return NextResponse.json({ error: "Không thể xác thực qua Google." }, { status: 500 });
    }

    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=GoogleUser",
      cefrLevel: user.cefrLevel,
    });

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập nhanh bằng Google thành công!",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Lỗi máy chủ Google Auth: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
