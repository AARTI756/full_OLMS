import { NextRequest } from "next/server";
import { prisma } from "@/prisma/client";
import { clearAuthCookies, verifyRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get("refreshToken")?.value;
  if (!cookie) {
    return clearAuthCookies();
  }

  try {
    const payload = verifyRefreshToken(cookie);
    await prisma.user.updateMany({
      where: { id: payload.sub, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  } catch {
    // ignore invalid token and clear cookies anyway
  }

  return clearAuthCookies();
}
