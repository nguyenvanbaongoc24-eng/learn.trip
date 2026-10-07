export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action:
    | "create_quest"
    | "update_quest"
    | "delete_quest"
    | "publish_version"
    | "rollback_version"
    | "change_user_role"
    | "toggle_user_status"
    | "revoke_session"
    | "login"
    | "other";
  actionLabel: string;
  targetType: "quest" | "user" | "version" | "session" | "system";
  targetId: string;
  details: string;
  ipAddress?: string;
}

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: "log-101",
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    actorId: "usr-admin-01",
    actorName: "Admin Tổng Quản",
    actorRole: "admin",
    action: "publish_version",
    actionLabel: "Xuất bản phiên bản nội dung",
    targetType: "version",
    targetId: "v1.2.0",
    details: "Phát hành bản đồ 3D Hà Nội và Sapa có thêm 8 bài tập tương tác.",
    ipAddress: "118.69.182.10",
  },
  {
    id: "log-102",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    actorId: "usr-creator-01",
    actorName: "Biên Tập Viên (Creator)",
    actorRole: "creator",
    action: "create_quest",
    actionLabel: "Tạo nhiệm vụ học tập mới",
    targetType: "quest",
    targetId: "quest-hn-03",
    details: "Thêm câu đố nghe phát âm từ vựng 'Kem Tràng Tiền' tại Hà Nội.",
    ipAddress: "113.161.72.44",
  },
  {
    id: "log-103",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    actorId: "usr-reviewer-01",
    actorName: "Kiểm Định Viên (Reviewer)",
    actorRole: "reviewer",
    action: "update_quest",
    actionLabel: "Duyệt nội dung",
    targetType: "quest",
    targetId: "quest-hn-03",
    details: "Chuyển trạng thái sang 'ready_to_publish' sau khi hiệu đính ngữ pháp.",
    ipAddress: "14.162.145.89",
  },
  {
    id: "log-104",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorId: "usr-admin-01",
    actorName: "Admin Tổng Quản",
    actorRole: "admin",
    action: "change_user_role",
    actionLabel: "Nâng cấp quyền tài khoản",
    targetType: "user",
    targetId: "usr-creator-01",
    details: "Xác nhận quyền Creator cho tài khoản creator@learntrip.vn.",
    ipAddress: "118.69.182.10",
  },
];

let auditLogsStore: AuditLogEntry[] = [...initialAuditLogs];

export function getAuditLogs(limit = 100): AuditLogEntry[] {
  return [...auditLogsStore]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  auditLogsStore.unshift(newEntry);
  if (auditLogsStore.length > 500) {
    auditLogsStore = auditLogsStore.slice(0, 500);
  }
  return newEntry;
}
