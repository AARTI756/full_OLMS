import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { restoreTemplateVersion } from "@/services/template-service";

export async function POST(
  request: NextRequest,
  context: { params: { id: string; versionId: string } | Promise<{ id: string; versionId: string }> }
) {
  const auth = await requireApiAuth(request, ["ADMIN", "HR", "RECRUITER"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id, versionId } = await context.params;
  await restoreTemplateVersion(id, versionId);
  return NextResponse.json({ id: versionId });
}
