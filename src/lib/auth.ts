import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const accessTokenSecret = env.JWT_SECRET;
const refreshTokenSecret = env.REFRESH_TOKEN_SECRET;

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
}

export async function hashToken(token: string) {
  return bcrypt.hash(token, 10);
}

export async function verifyHashedToken(token: string, hashedToken: string) {
  return bcrypt.compare(token, hashedToken);
}

export function createAccessToken(user: SessionUser) {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: "15m",
  });
}

export function createRefreshToken(user: SessionUser) {
  const payload: AuthTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "30d",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, accessTokenSecret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshTokenSecret) as AuthTokenPayload;
}

export function createAuthResponse(data: Record<string, unknown>, refreshToken: string) {
  const response = NextResponse.json(data, { status: 200 });

  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "strict",
  });

  return response;
}

export function clearAuthCookies() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "refreshToken",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    sameSite: "strict",
  });
  return response;
}
