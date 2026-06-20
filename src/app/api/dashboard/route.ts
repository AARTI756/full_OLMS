import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getDashboardStats } from "@/services/dashboard-service";
import { createExpiringOfferNotifications } from "@/services/notification-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  await createExpiringOfferNotifications();
  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
