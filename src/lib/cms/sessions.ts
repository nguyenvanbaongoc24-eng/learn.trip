export interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  displayName: string;
  role: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

const initialSessions: ActiveSession[] = [
  {
    id: "sess-adm-01",
    userId: "usr-admin-01",
    userEmail: "admin@learntrip.vn",
    displayName: "Admin Tổng Quản",
    role: "admin",
    device: "Windows Desktop (Chrome 124)",
    browser: "Google Chrome",
    ipAddress: "118.69.182.10",
    location: "Hà Nội, Việt Nam",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastActiveAt: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "sess-adm-02",
    userId: "usr-admin-01",
    userEmail: "admin@learntrip.vn",
    displayName: "Admin Tổng Quản",
    role: "admin",
    device: "Apple iPhone 15 Pro (Safari Mobile)",
    browser: "Mobile Safari",
    ipAddress: "42.115.89.21",
    location: "Đà Nẵng, Việt Nam",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastActiveAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isCurrent: false,
  },
  {
    id: "sess-rev-01",
    userId: "usr-reviewer-01",
    userEmail: "reviewer@learntrip.vn",
    displayName: "Kiểm Định Viên (Reviewer)",
    role: "reviewer",
    device: "MacBook Pro M2 (Arc Browser)",
    browser: "Arc Browser",
    ipAddress: "14.162.145.89",
    location: "TP. Hồ Chí Minh, Việt Nam",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastActiveAt: new Date(Date.now() - 1800000).toISOString(),
    isCurrent: false,
  },
  {
    id: "sess-cre-01",
    userId: "usr-creator-01",
    userEmail: "creator@learntrip.vn",
    displayName: "Biên Tập Viên (Creator)",
    role: "creator",
    device: "Windows Laptop (Edge 123)",
    browser: "Microsoft Edge",
    ipAddress: "113.161.72.44",
    location: "Cần Thơ, Việt Nam",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    lastActiveAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isCurrent: false,
  },
];

let sessionsStore: ActiveSession[] = [...initialSessions];

export function getActiveSessions(): ActiveSession[] {
  return [...sessionsStore];
}

export function revokeSession(sessionId: string): boolean {
  const index = sessionsStore.findIndex((s) => s.id === sessionId);
  if (index !== -1) {
    sessionsStore.splice(index, 1);
    return true;
  }
  return false;
}

export function registerOrTouchSession(
  userId: string,
  userEmail: string,
  displayName: string,
  role: string,
  userAgent: string,
  ipAddress: string
): ActiveSession {
  let existing = sessionsStore.find((s) => s.userId === userId && s.ipAddress === ipAddress);
  if (existing) {
    existing.lastActiveAt = new Date().toISOString();
    return existing;
  }

  const device = userAgent.includes("Mobile")
    ? "Thiết bị di động"
    : userAgent.includes("Mac")
    ? "Apple Mac"
    : "Windows Desktop";

  const newSession: ActiveSession = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    userEmail,
    displayName,
    role,
    device,
    browser: "Web Browser",
    ipAddress: ipAddress || "127.0.0.1",
    location: "Việt Nam",
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isCurrent: true,
  };

  sessionsStore.unshift(newSession);
  return newSession;
}
