import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/api-auth';
import { prisma } from '@/prisma/client';

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ['ADMIN', 'HR', 'RECRUITER', 'FINANCE', 'APPROVER']);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('query')?.trim() ?? '';
  if (!query) {
    return NextResponse.json({ query: '', results: [], totals: { candidates: 0, offers: 0, templates: 0 } });
  }

  const [candidates, offers, templates] = await Promise.all([
    prisma.candidate.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { role: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, fullName: true, role: true, location: true, status: true },
      take: 4,
    }),
    prisma.offer.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { designation: { contains: query, mode: 'insensitive' } },
          { department: { name: { contains: query, mode: 'insensitive' } } },
          { candidate: { fullName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      select: { id: true, title: true, designation: true, status: true, candidate: { select: { fullName: true } } },
      take: 4,
    }),
    prisma.offerTemplate.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      select: { id: true, title: true, description: true, isDraft: true },
      take: 4,
    }),
  ]);

  const results = [
    ...candidates.map((candidate) => ({
      id: candidate.id,
      type: 'candidate',
      title: candidate.fullName,
      subtitle: `${candidate.role} • ${candidate.location} • ${candidate.status}`,
      href: `/candidates/${candidate.id}`,
      group: 'Candidates',
    })),
    ...offers.map((offer) => ({
      id: offer.id,
      type: 'offer',
      title: offer.title,
      subtitle: `${offer.designation} • ${offer.candidate.fullName} • ${offer.status}`,
      href: `/offers/${offer.id}`,
      group: 'Offers',
    })),
    ...templates.map((template) => ({
      id: template.id,
      type: 'template',
      title: template.title,
      subtitle: `${template.description ?? 'Template'}${template.isDraft ? ' • Draft' : ''}`,
      href: `/templates/${template.id}`,
      group: 'Templates',
    })),
  ];

  return NextResponse.json({ query, results, totals: { candidates: candidates.length, offers: offers.length, templates: templates.length } });
}
