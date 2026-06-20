import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { markAllNotificationsRead } from "@/services/notification-service";

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const count = await markAllNotificationsRead(auth.id);
  return NextResponse.json({ success: true, count });
}
