import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/validators/auth";
import { generatePasswordResetToken } from "@/services/auth-service";
import { sendPasswordResetEmail } from "@/services/email-service";
import { getSettings } from "@/services/settings-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const token = await generatePasswordResetToken(parsed.data.email);

    if (token) {
      const settings = await getSettings();
      // Keep the link token-only so email addresses are not exposed in URLs.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

      await sendPasswordResetEmail({
        recipientEmail: parsed.data.email,
        recipientName: parsed.data.email.split("@")[0],
        companyName: settings.companyName,
        resetLink,
      });
    }

    // Always return success to prevent email enumeration
    return Response.json(
      {
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Still return success to prevent email enumeration
    return Response.json(
      {
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  }
}
