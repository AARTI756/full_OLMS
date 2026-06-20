import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { approvalListSchema } from "@/validators/approvals";
import { getApprovalList } from "@/services/approval-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "FINANCE", "APPROVER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request.url);
  const parsed = approvalListSchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = await getApprovalList(parsed.data);
  return NextResponse.json(data);
}