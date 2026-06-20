import { NextRequest } from "next/server";
import { loginSchema } from "@/validators/auth";
import { createAuthResponse } from "@/lib/auth";
import { authenticateUser, createUserTokens } from "@/services/auth-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 422 });
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
  }

  const tokens = await createUserTokens(user);

  return createAuthResponse({
    user,
    accessToken: tokens.accessToken,
  }, tokens.refreshToken);
}
