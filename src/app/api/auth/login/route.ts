import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/users";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Simple In-memory Rate Limiting (Chống Brute-force)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 10 * 60 * 1000; // 10 minutes

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

    const key = email.trim().toLowerCase();
    const now = Date.now();
    const attempt = loginAttempts.get(key);

    if (attempt && attempt.lockedUntil > now) {
      const waitMinutes = Math.ceil((attempt.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          error: `Tài khoản tạm thời bị tạm dừng do nhập sai mật khẩu quá ${MAX_ATTEMPTS} lần. Vui lòng thử lại sau ${waitMinutes} phút.`,
        },
        { status: 429 }
      );
    }

    const authResult = authenticateUser(email, password);
    if (!authResult.success || !authResult.user) {
      const curCount = (attempt?.count || 0) + 1;
      if (curCount >= MAX_ATTEMPTS) {
        loginAttempts.set(key, { count: curCount, lockedUntil: now + LOCK_TIME_MS });
        return NextResponse.json(
          {
            error: `Bạn đã nhập sai mật khẩu ${MAX_ATTEMPTS} lần. Tài khoản bị tạm khóa 10 phút để bảo vệ an toàn.`,
          },
          { status: 429 }
        );
      } else {
        loginAttempts.set(key, { count: curCount, lockedUntil: 0 });
        return NextResponse.json(
          {
            error: `${authResult.error || "Email hoặc mật khẩu không chính xác."} (Còn ${MAX_ATTEMPTS - curCount} lần thử)`,
          },
          { status: 401 }
        );
      }
    }

    // Reset failed attempts on success
    loginAttempts.delete(key);

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
