import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { getRecruiterById } from '@/services/recruiter-service';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request, ['ADMIN', 'HR', 'RECRUITER', 'FINANCE', 'APPROVER']);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const data = await getRecruiterById(id);
  if (!data) {
    return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}
