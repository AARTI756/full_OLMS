import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { prisma } from '@/prisma/client';

function escapeCsv(value: string | number | null | undefined) {
  if (value == null) {
    return '';
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ['ADMIN', 'HR', 'RECRUITER', 'FINANCE', 'APPROVER']);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'offers';

  if (type === 'offers') {
    const offers = await prisma.offer.findMany({
      orderBy: { offerDate: 'desc' },
      include: {
        candidate: { select: { fullName: true, email: true } },
        department: { select: { name: true } },
        creator: { select: { name: true, email: true } },
      },
      take: 200,
    });

    const headers = [
      'Offer ID',
      'Title',
      'Candidate',
      'Candidate Email',
      'Department',
      'Status',
      'Total CTC',
      'Offer Date',
      'Valid Until',
      'Created By',
    ];

    const rows = offers.map((offer) => [
      offer.id,
      offer.title,
      offer.candidate.fullName,
      offer.candidate.email,
      offer.department?.name ?? 'Unknown',
      offer.status,
      offer.totalCtc,
      offer.offerDate.toISOString(),
      offer.validUntil.toISOString(),
      offer.creator.name,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="olms-offers-export.csv"',
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported export type' }, { status: 400 });
}
