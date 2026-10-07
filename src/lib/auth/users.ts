import bcrypt from "bcryptjs";
import { UserRole } from "./roles";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  status?: "active" | "suspended";
  avatarUrl?: string;
  cefrLevel?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Pre-seeded accounts with hashed passwords for testing:
// Admin: admin@learntrip.vn / Admin@123
// Reviewer: reviewer@learntrip.vn / Reviewer@123
// Creator: creator@learntrip.vn / Creator@123
// Learner: learner@learntrip.vn / Learner@123
const initialUsers: UserRecord[] = [
  {
    id: "usr-admin-01",
    email: "admin@learntrip.vn",
    passwordHash: bcrypt.hashSync("Admin@123", 10),
    displayName: "Admin Tổng Quản",
    role: "admin",
    status: "active",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminBoss",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: "usr-reviewer-01",
    email: "reviewer@learntrip.vn",
    passwordHash: bcrypt.hashSync("Reviewer@123", 10),
    displayName: "Kiểm Định Viên (Reviewer)",
    role: "reviewer",
    status: "active",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ContentReviewer",
    createdAt: "2026-01-15T00:00:00.000Z",
    lastLoginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "usr-creator-01",
    email: "creator@learntrip.vn",
    passwordHash: bcrypt.hashSync("Creator@123", 10),
    displayName: "Biên Tập Viên (Creator)",
    role: "creator",
    status: "active",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ContentCreator",
    createdAt: "2026-02-01T00:00:00.000Z",
    lastLoginAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "usr-learner-01",
    email: "learner@learntrip.vn",
    passwordHash: bcrypt.hashSync("Learner@123", 10),
    displayName: "Nguyễn Văn Người Học",
    role: "learner",
    status: "active",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=TravelLearner",
    cefrLevel: "A2",
    createdAt: "2026-03-01T00:00:00.000Z",
    lastLoginAt: new Date().toISOString(),
  },
];

// In-memory persistent state (shared across requests in Node process)
let usersStore: UserRecord[] = [...initialUsers];

/**
 * Checks whether an email is designated as an Admin via environment variables (ADMIN_EMAILS or ADMIN_EMAIL)
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminEnv = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "").trim();
  const list = adminEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  list.push("admin@learntrip.vn");
  return list.includes(email.trim().toLowerCase());
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const normalized = email.trim().toLowerCase();
  return usersStore.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): UserRecord | undefined {
  return usersStore.find((u) => u.id === id);
}

export function authenticateUser(
  email: string,
  plainPassword: string
): { success: boolean; user?: UserRecord; error?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: "Email hoặc mật khẩu không chính xác." };
  }

  if (user.status === "suspended") {
    return {
      success: false,
      error: "Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động bởi Quản trị viên.",
    };
  }

  const isMatch = bcrypt.compareSync(plainPassword, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Email hoặc mật khẩu không chính xác." };
  }

  // Auto-promote to admin if email matches ADMIN_EMAILS environment variable
  if (isAdminEmail(user.email) && user.role !== "admin") {
    user.role = "admin";
  }

  user.lastLoginAt = new Date().toISOString();
  return { success: true, user };
}

export function registerUser(params: {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
  cefrLevel?: string;
}): { success: boolean; user?: UserRecord; error?: string } {
  const existing = findUserByEmail(params.email);
  if (existing) {
    return { success: false, error: "Email này đã được đăng ký tài khoản." };
  }

  // Automatically assign "admin" role if email matches ADMIN_EMAILS
  const assignedRole: UserRole = isAdminEmail(params.email)
    ? "admin"
    : params.role || "learner";

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    email: params.email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(params.password, 10),
    displayName: params.displayName.trim(),
    role: assignedRole,
    status: "active",
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(params.displayName)}`,
    cefrLevel: params.cefrLevel || "A1",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  return { success: true, user: newUser };
}

/**
 * Programmatically seed or promote an admin account
 */
export function seedOrPromoteAdmin(
  email: string,
  plainPassword = "AdminPassword@123",
  displayName = "Quản Trị Viên"
): UserRecord {
  const existing = findUserByEmail(email);
  if (existing) {
    existing.role = "admin";
    existing.status = "active";
    existing.passwordHash = bcrypt.hashSync(plainPassword, 10);
    return existing;
  }

  const admin: UserRecord = {
    id: `usr-admin-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(plainPassword, 10),
    displayName,
    role: "admin",
    status: "active",
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  usersStore.unshift(admin);
  return admin;
}

export function getAllUsers(): UserRecord[] {
  return usersStore.map(({ passwordHash, ...rest }) => rest as UserRecord);
}

export function updateUserRole(userId: string, newRole: UserRole): { success: boolean; error?: string } {
  const user = findUserById(userId);
  if (!user) return { success: false, error: "Không tìm thấy người dùng." };
  user.role = newRole;
  return { success: true };
}

export function toggleUserStatus(userId: string): { success: boolean; newStatus?: "active" | "suspended"; error?: string } {
  const user = findUserById(userId);
  if (!user) return { success: false, error: "Không tìm thấy người dùng." };
  user.status = user.status === "suspended" ? "active" : "suspended";
  return { success: true, newStatus: user.status };
}

export function deleteUserAccount(userId: string): boolean {
  const index = usersStore.findIndex((u) => u.id === userId);
  if (index !== -1) {
    usersStore.splice(index, 1);
    return true;
  }
  return false;
}
