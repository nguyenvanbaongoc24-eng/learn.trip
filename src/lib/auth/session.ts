import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "./roles";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  cefrLevel?: string;
}

export const SESSION_COOKIE_NAME = "learntrip_session";
const SESSION_EXPIRY = "7d"; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "learntrip_secure_jwt_secret_key_minimum_32_characters_long!";
  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT session token containing user details.
 */
export async function signSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(secretKey);
}

/**
 * Verifies a JWT session token and returns the decoded session user.
 */
export async function verifySessionToken(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.id as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
      role: payload.role as UserRole,
      avatarUrl: payload.avatarUrl as string | undefined,
      cefrLevel: payload.cefrLevel as string | undefined,
    };
  } catch {
    return null;
  }
}
