import { compare } from "bcrypt";
import { NextRequest } from "next/server";
import { prisma } from "@/prisma/client";
import { clearAuthCookies, createAuthResponse, verifyRefreshToken } from "@/lib/auth";
import { createUserTokens } from "@/services/auth-service";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("refreshToken")?.value;
  if (!cookie) {
    return new Response(JSON.stringify({ error: "Refresh token missing" }), { status: 401 });
  }

  try {
    const payload = verifyRefreshToken(cookie);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        departmentId: true,
        refreshToken: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user || !user.refreshToken) {
      return clearAuthCookies();
    }

    const valid = await compare(cookie, user.refreshToken);
    if (!valid) {
      return clearAuthCookies();
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      departmentId: user.departmentId,
    };

    const tokens = await createUserTokens(sessionUser);

    return createAuthResponse({ user: sessionUser, accessToken: tokens.accessToken }, tokens.refreshToken);
  } catch {
    return clearAuthCookies();
  }
}
