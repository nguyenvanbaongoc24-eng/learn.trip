import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/users";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, agreedTerms, cefrLevel } = body;

    if (!agreedTerms) {
      return NextResponse.json(
        { error: "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư." },
        { status: 400 }
      );
    }

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Địa chỉ email không đúng định dạng." },
        { status: 400 }
      );
    }

    // Password strength check (min 6 characters, must contain letters and numbers)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có độ dài tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    const regResult = registerUser({
      email,
      password,
      displayName,
      role: "learner",
      cefrLevel: cefrLevel || "A1",
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { error: regResult.error || "Đăng ký không thành công." },
        { status: 400 }
      );
    }

    const user = regResult.user;

    // Issue session token
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
      message: "Đăng ký tài khoản thành công!",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        cefrLevel: user.cefrLevel,
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
      { error: "Lỗi máy chủ khi đăng ký: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
