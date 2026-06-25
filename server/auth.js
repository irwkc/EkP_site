import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const COOKIE = "sergievskaya_admin";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function getAuthConfig() {
  const login = process.env.ADMIN_LOGIN || "sergievskaya";
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET || "dev-only-change-me";
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required in environment");
  }
  return { login, password, secret, cookie: COOKIE, maxAge: MAX_AGE_MS };
}

export async function verifyLogin(username, password) {
  const { login, password: expected } = getAuthConfig();
  if (username !== login) return false;
  return password === expected;
}

export function signToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const { secret } = getAuthConfig();
  const token = req.cookies?.[COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const payload = verifyToken(token, secret);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.admin = payload;
  next();
}

export function setAuthCookie(res, token, maxAge) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE, { path: "/" });
}

export { COOKIE };
