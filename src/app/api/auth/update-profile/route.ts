import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import bcrypt from "bcryptjs";

/**
 * PATCH /api/auth/update-profile
 * Update user profile: displayName, avatarUrl, cefrLevel, currentPassword + newPassword
 */
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await verifySessionToken(token);

  if (!sessionUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { displayName, avatarUrl, cefrLevel, currentPassword, newPassword } = body;

    // Find the actual user record in store
    const userRecord = findUserById(sessionUser.id);
    if (!userRecord) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    // Update basic fields
    if (displayName && typeof displayName === "string" && displayName.trim().length >= 2) {
      userRecord.displayName = displayName.trim();
    }

    if (avatarUrl && typeof avatarUrl === "string") {
      userRecord.avatarUrl = avatarUrl.trim();
    }

    if (cefrLevel && ["A1", "A2", "B1", "B2", "C1"].includes(cefrLevel)) {
      userRecord.cefrLevel = cefrLevel;
    }

    // Password change
    if (currentPassword && newPassword) {
      const isMatch = bcrypt.compareSync(currentPassword, userRecord.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải có tối thiểu 6 ký tự." }, { status: 400 });
      }

      userRecord.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    // Re-sign session with updated info
    const updatedSessionUser = {
      id: userRecord.id,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: userRecord.role,
      avatarUrl: userRecord.avatarUrl,
      cefrLevel: userRecord.cefrLevel,
    };

    const newToken = await signSessionToken(updatedSessionUser);

    const res = NextResponse.json({
      success: true,
      user: updatedSessionUser,
      message: "Cập nhật hồ sơ thành công!",
    });

    res.cookies.set(SESSION_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
}
