import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/validators/auth";
import { resetPassword, verifyPasswordResetToken } from "@/services/auth-service";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return Response.json({ valid: false, error: "Reset token is required" }, { status: 400 });
  }

  const user = await verifyPasswordResetToken(token);

  if (!user) {
    return Response.json({ valid: false, error: "Invalid or expired reset token" }, { status: 400 });
  }

  return Response.json({ valid: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    await resetPassword(parsed.data.token, parsed.data.password);

    return Response.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset password";
    
    return Response.json({ error: message }, { status: 400 });
  }
}
