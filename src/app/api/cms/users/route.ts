import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getAllUsers, updateUserRole, toggleUserStatus } from "@/lib/auth/users";
import { isStaffRole } from "@/lib/auth/roles";
import { addAuditLog } from "@/lib/cms/audit";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser || !isStaffRole(sessionUser.role)) {
      return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
    }

    const users = getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    // Only Admin can modify roles or suspend users
    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json(
        { error: "Chỉ Quản trị viên (Admin) mới có quyền thay đổi vai trò hoặc trạng thái tài khoản." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, role, action } = body;

    if (!userId) {
      return NextResponse.json({ error: "Thiếu thông tin người dùng (userId)." }, { status: 400 });
    }

    if (action === "toggle_status") {
      const res = toggleUserStatus(userId);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      addAuditLog({
        actorId: sessionUser.id,
        actorName: sessionUser.displayName,
        actorRole: sessionUser.role,
        action: "toggle_user_status",
        actionLabel: res.newStatus === "suspended" ? "Khóa tài khoản" : "Mở khóa tài khoản",
        targetType: "user",
        targetId: userId,
        details: `${res.newStatus === "suspended" ? "Khóa tạm ngưng" : "Kích hoạt lại"} người dùng ${userId}`,
      });

      return NextResponse.json({ success: true, newStatus: res.newStatus });
    }

    if (role) {
      const validRoles = ["learner", "creator", "reviewer", "admin"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Vai trò không hợp lệ." }, { status: 400 });
      }

      const res = updateUserRole(userId, role);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }

      addAuditLog({
        actorId: sessionUser.id,
        actorName: sessionUser.displayName,
        actorRole: sessionUser.role,
        action: "change_user_role",
        actionLabel: "Thay đổi vai trò",
        targetType: "user",
        targetId: userId,
        details: `Cập nhật vai trò người dùng ${userId} thành [${role.toUpperCase()}]`,
      });

      return NextResponse.json({ success: true, role });
    }

    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}
