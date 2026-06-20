import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/prisma/client";

export type AppRole = "ADMIN" | "HR" | "RECRUITER" | "FINANCE" | "APPROVER";

export interface AuthenticatedApiUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  departmentId?: string | null;
}

export async function requireApiAuth(
  request: NextRequest,
  allowedRoles?: AppRole[]
): Promise<AuthenticatedApiUser | NextResponse> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser: AuthenticatedApiUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
    };

    if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return sessionUser;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}