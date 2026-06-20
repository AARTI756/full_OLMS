import { NextRequest } from "next/server";
import { signupSchema } from "@/validators/auth";
import { createAuthResponse } from "@/lib/auth";
import { createUserTokens, registerUser } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 422 });
  }

  try {
    const user = await registerUser(parsed.data);
    const tokens = await createUserTokens(user);

    return createAuthResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
      },
      accessToken: tokens.accessToken,
    }, tokens.refreshToken);
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 409 });
  }
}
