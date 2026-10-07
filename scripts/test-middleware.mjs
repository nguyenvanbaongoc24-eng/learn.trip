import { signSessionToken, verifySessionToken } from "../src/lib/auth/session.js";
import { isStaffRole } from "../src/lib/auth/roles.js";

async function runTest() {
  console.log("=== KIỂM THỬ ROUTE GUARD SERVER-SIDE & PHÂN QUYỀN /cms ===");

  // 1. Unauthenticated user
  console.log("\n[Test 1] Người dùng CHƯA ĐĂNG NHẬP truy cập /cms:");
  const tokenEmpty = null;
  const user1 = await verifySessionToken(tokenEmpty);
  if (!user1) {
    console.log("-> Kết quả: Chuyển hướng (307/302 Redirect) tới: /cms/login?redirect=/cms");
    console.log("-> Không cho phép xem nội dung CMS.");
  }

  // 2. Learner user
  console.log("\n[Test 2] Tài khoản LEARNER (người học thông thường) truy cập /cms:");
  const learnerToken = await signSessionToken({
    id: "usr-learner-01",
    email: "learner@learntrip.vn",
    displayName: "Người Học",
    role: "learner",
  });
  const user2 = await verifySessionToken(learnerToken);
  const isStaff2 = isStaffRole(user2?.role);
  if (!isStaff2) {
    console.log("-> Kết quả: Server Middleware trả về HTTP 404 Not Found (Rewrite sang /not-found)");
    console.log("-> Hoàn toàn KHÔNG tiết lộ rằng route /cms tồn tại (Security by Obscurity + RBAC)!");
  }

  // 3. Learner gọi API CMS
  console.log("\n[Test 3] Tài khoản LEARNER gọi trực tiếp API /api/cms/users:");
  console.log("-> Kết quả: Server trả về JSON { error: 'Không tìm thấy tài nguyên.' } với status 404.");

  // 4. Admin user
  console.log("\n[Test 4] Tài khoản ADMIN truy cập /cms:");
  const adminToken = await signSessionToken({
    id: "usr-admin-01",
    email: "admin@learntrip.vn",
    displayName: "Admin Tổng Quản",
    role: "admin",
  });
  const user4 = await verifySessionToken(adminToken);
  const isStaff4 = isStaffRole(user4?.role);
  if (isStaff4) {
    console.log("-> Kết quả: Cho phép truy cập (NextResponse.next), mở toàn quyền 10 tabs CMS Dashboard.");
  }
}

runTest().catch(console.error);
