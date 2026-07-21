import crypto from 'crypto';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET ?? 'grad360mba-default-secret-change-in-production';

export type AppRole =
  | 'admin'
  | 'institution_admin'
  | 'contributor'
  | 'faculty'
  | 'student';

export interface AppTokenPayload {
  role: AppRole;
  id?: string;
  username: string;
  institutionId?: string;
  exp: number;
  iat: number;
}

export type AdminTokenPayload = AppTokenPayload & { role: 'admin' };
export type ContributorTokenPayload = AppTokenPayload & {
  role: 'contributor';
  id: string;
};
export type InstitutionAdminTokenPayload = AppTokenPayload & {
  role: 'institution_admin';
  id: string;
  institutionId: string;
};
export type FacultyTokenPayload = AppTokenPayload & {
  role: 'faculty';
  id: string;
  institutionId: string;
};
export type StudentTokenPayload = AppTokenPayload & {
  role: 'student';
  id: string;
  institutionId: string;
};

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

export function signToken(payloadInput: {
  role: AppRole;
  id?: string;
  username: string;
  institutionId?: string;
  expiresInSeconds: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AppTokenPayload = {
    role: payloadInput.role,
    ...(payloadInput.id ? { id: payloadInput.id } : {}),
    username: payloadInput.username,
    ...(payloadInput.institutionId ? { institutionId: payloadInput.institutionId } : {}),
    iat: now,
    exp: now + payloadInput.expiresInSeconds,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): AppTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  let payload: AppTokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(body));
  } catch {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function getUserFromAuthHeader(authHeader: string | null): AppTokenPayload | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

export function signAdminToken(username: string): string {
  return signToken({
    role: 'admin',
    username,
    expiresInSeconds: 86400,
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload as AdminTokenPayload;
}

export function getAdminFromAuthHeader(authHeader: string | null): AdminTokenPayload | null {
  const payload = getUserFromAuthHeader(authHeader);
  if (!payload || payload.role !== 'admin') return null;
  return payload as AdminTokenPayload;
}

export function signContributorToken(id: string, username: string): string {
  return signToken({
    role: 'contributor',
    id,
    username,
    expiresInSeconds: 28800,
  });
}

export function verifyContributorToken(token: string): ContributorTokenPayload | null {
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'contributor' || !payload.id) return null;
  return payload as ContributorTokenPayload;
}

export function getContributorFromAuthHeader(
  authHeader: string | null
): ContributorTokenPayload | null {
  const payload = getUserFromAuthHeader(authHeader);
  if (!payload || payload.role !== 'contributor' || !payload.id) return null;
  return payload as ContributorTokenPayload;
}

export function signInstitutionAdminToken(
  id: string,
  username: string,
  institutionId: string
): string {
  return signToken({
    role: 'institution_admin',
    id,
    username,
    institutionId,
    expiresInSeconds: 28800,
  });
}

export function getInstitutionAdminFromAuthHeader(
  authHeader: string | null
): InstitutionAdminTokenPayload | null {
  const payload = getUserFromAuthHeader(authHeader);
  if (!payload || payload.role !== 'institution_admin' || !payload.id || !payload.institutionId) {
    return null;
  }
  return payload as InstitutionAdminTokenPayload;
}

export function signFacultyToken(id: string, username: string, institutionId: string): string {
  return signToken({
    role: 'faculty',
    id,
    username,
    institutionId,
    expiresInSeconds: 28800,
  });
}

export function getFacultyFromAuthHeader(authHeader: string | null): FacultyTokenPayload | null {
  const payload = getUserFromAuthHeader(authHeader);
  if (!payload || payload.role !== 'faculty' || !payload.id || !payload.institutionId) {
    return null;
  }
  return payload as FacultyTokenPayload;
}

export function signStudentToken(id: string, username: string, institutionId: string): string {
  return signToken({
    role: 'student',
    id,
    username,
    institutionId,
    expiresInSeconds: 28800,
  });
}

export function getStudentFromAuthHeader(authHeader: string | null): StudentTokenPayload | null {
  const payload = getUserFromAuthHeader(authHeader);
  if (!payload || payload.role !== 'student' || !payload.id || !payload.institutionId) {
    return null;
  }
  return payload as StudentTokenPayload;
}

export async function getUserFromRequest(
  request: NextRequest
): Promise<AppTokenPayload | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Checks if the request comes from the same origin or has a valid referer.
 * This helps restrict access to 'this website only'.
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // We check if the origin/referer starts with the same protocol and host.
  const checkUrl = (url: string | null) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.host === host;
    } catch {
      return false;
    }
  };

  // If it's a browser navigation or direct access without origin (like GET), 
  // check the referer. 
  // For cross-origin POST/PUT/DELETE, the browser sends an Origin header.
  if (origin) {
    return checkUrl(origin);
  }

  if (referer) {
    return checkUrl(referer);
  }

  // If no origin and no referer, it might be a direct API call from elsewhere
  return false;
}
