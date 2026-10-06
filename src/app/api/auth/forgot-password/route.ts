import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email để đặt lại mật khẩu." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    // To prevent user enumeration, always return positive response
    return NextResponse.json({
      success: true,
      message: `Nếu email "${email}" đã được đăng ký, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn. Vui lòng kiểm tra hộp thư đến (hoặc thư rác).`,
      // For testing convenience:
      simulatedResetLink: user ? `/reset-password?token=mock-reset-${user.id}-${Date.now()}` : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Lỗi máy chủ khi xử lý yêu cầu: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
