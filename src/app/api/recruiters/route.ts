import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { getRecruiterList } from '@/services/recruiter-service';

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ['ADMIN', 'HR', 'RECRUITER', 'FINANCE', 'APPROVER']);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const data = await getRecruiterList();
  return NextResponse.json({ data });
}
