import { prisma } from '@/prisma/client';
import type { CandidateListResponse } from '@/types/candidate';
import { CandidateStatus } from '@prisma/client';
import type { CandidateSortBy, SortOrder } from '@/types/candidate';
import { createActivity } from '@/services/activity-service';
import { notifyCandidateCreated } from '@/services/notification-service';

export async function getCandidateList(params: {
  search?: string;
  status?: string;
  department?: string;
  recruiter?: string;
  page?: number;
  limit?: number;
  sortBy?: CandidateSortBy;
  sortOrder?: SortOrder;
}): Promise<CandidateListResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 12;
  const skip = (page - 1) * limit;
  const sortBy = params.sortBy ?? 'createdAt';
  const sortOrder = params.sortOrder ?? 'desc';

  const orderBy =
    sortBy === 'fullName'
      ? { fullName: sortOrder }
      : sortBy === 'expectedCtc'
      ? { expectedCtc: sortOrder }
      : sortBy === 'status'
      ? { status: sortOrder }
      : { createdAt: sortOrder };

  const conditions: Record<string, unknown>[] = [];
  if (params.status) {
    conditions.push({ status: params.status as CandidateStatus });
  }

  if (params.department) {
    conditions.push({ department: { name: params.department } });
  }

  if (params.recruiter) {
    conditions.push({ recruiter: { name: { contains: params.recruiter, mode: 'insensitive' } } });
  }

  if (params.search) {
    conditions.push({
      OR: [
        { fullName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { role: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
        { department: { name: { contains: params.search, mode: 'insensitive' } } },
      ],
    });
  }

  const where = conditions.length ? { AND: conditions } : {};

  const [total, candidates] = await prisma.$transaction([
    prisma.candidate.count({ where }),
    prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        recruiter: { select: { name: true } },
        department: { select: { name: true } },
        candidateResumes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { fileUrl: true },
        },
      },
    }),
  ]);

  return {
    total,
    data: candidates.map((candidate) => ({
      id: candidate.id,
      fullName: candidate.fullName,
      email: candidate.email,
      phone: candidate.phone,
      role: candidate.role,
      department: candidate.department?.name ?? 'Unknown',
      experienceYears: candidate.experienceYears,
      expectedCtc: candidate.expectedCtc,
      currentCtc: candidate.currentCtc,
      noticePeriodDays: candidate.noticePeriodDays,
      status: candidate.status,
      recruiterName: candidate.recruiter?.name ?? null,
      location: candidate.location,
      skills: candidate.skills,
      latestResumeUrl: candidate.candidateResumes[0]?.fileUrl ?? candidate.resumeUrl ?? null,
    })),
  };
}

export async function getCandidateById(id: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      recruiter: { select: { name: true } },
      department: { select: { name: true } },
      offerHistory: {
        orderBy: { offerDate: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          version: true,
          offerDate: true,
        },
        take: 5,
      },
      candidateResumes: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          size: true,
          uploadedBy: { select: { name: true } },
          createdAt: true,
        },
      },
    },
  });

  if (!candidate) {
    return null;
  }

  return {
    id: candidate.id,
    fullName: candidate.fullName,
    email: candidate.email,
    phone: candidate.phone,
    role: candidate.role,
    department: candidate.department?.name ?? 'Unknown',
    experienceYears: candidate.experienceYears,
    expectedCtc: candidate.expectedCtc,
    currentCtc: candidate.currentCtc,
    noticePeriodDays: candidate.noticePeriodDays,
    status: candidate.status,
    recruiterName: candidate.recruiter?.name ?? null,
    location: candidate.location,
    skills: candidate.skills,
    resumeUrl: candidate.resumeUrl,
    notes: candidate.notes,
    resumes: candidate.candidateResumes.map((resume) => ({
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      mimeType: resume.mimeType,
      size: resume.size,
      uploadedBy: resume.uploadedBy.name,
      uploadedAt: resume.createdAt.toISOString(),
    })),
    offerHistory: candidate.offerHistory.map((offer) => ({
      id: offer.id,
      title: offer.title,
      status: offer.status,
      version: offer.version,
      offerDate: offer.offerDate.toISOString(),
    })),
  };
}

export async function createCandidate(data: {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  status: string;
  experienceYears: number;
  expectedCtc: number;
  currentCtc: number;
  noticePeriodDays: number;
  skills: string[];
  resumeUrl?: string | null;
  notes?: string | null;
  recruiterId?: string | null;
  createdById: string;
}) {
  const departmentCode = data.department.trim().slice(0, 3).toUpperCase().padEnd(3, 'X');

  const department = await prisma.department.upsert({
    where: { name: data.department },
    update: {},
    create: {
      name: data.department,
      code: departmentCode,
      description: `${data.department} department`,
    },
  });

  const candidate = await prisma.candidate.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      departmentId: department.id,
      location: data.location,
      status: data.status as CandidateStatus,
      experienceYears: data.experienceYears,
      expectedCtc: data.expectedCtc,
      currentCtc: data.currentCtc,
      noticePeriodDays: data.noticePeriodDays,
      skills: data.skills,
      resumeUrl: data.resumeUrl,
      notes: data.notes,
      recruiterId: data.recruiterId ?? undefined,
    },
  });

  await createActivity({
    userId: data.createdById,
    action: 'CANDIDATE_CREATED',
    details: `${data.fullName} was added to the hiring pipeline`,
    candidateId: candidate.id,
  });

  if (candidate.recruiterId) {
    await notifyCandidateCreated(candidate.recruiterId, candidate.id, candidate.fullName);
  }

  return candidate;
}

export async function updateCandidate(id: string, data: {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  status: string;
  experienceYears: number;
  expectedCtc: number;
  currentCtc: number;
  noticePeriodDays: number;
  skills: string[];
  resumeUrl?: string | null;
  notes?: string | null;
  recruiterId?: string | null;
  updatedById: string;
}) {
  const departmentCode = data.department.trim().slice(0, 3).toUpperCase().padEnd(3, 'X');

  const department = await prisma.department.upsert({
    where: { name: data.department },
    update: {},
    create: {
      name: data.department,
      code: departmentCode,
      description: `${data.department} department`,
    },
  });

  const candidate = await prisma.candidate.update({
    where: { id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      departmentId: department.id,
      location: data.location,
      status: data.status as CandidateStatus,
      experienceYears: data.experienceYears,
      expectedCtc: data.expectedCtc,
      currentCtc: data.currentCtc,
      noticePeriodDays: data.noticePeriodDays,
      skills: data.skills,
      resumeUrl: data.resumeUrl,
      notes: data.notes,
      recruiterId: data.recruiterId ?? undefined,
    },
  });

  await createActivity({
    userId: data.updatedById,
    action: 'CANDIDATE_UPDATED',
    details: `${candidate.fullName}'s profile was updated`,
    candidateId: candidate.id,
  });

  return candidate;
}

export async function deleteCandidate(id: string) {
  return prisma.candidate.delete({ where: { id } });
}

export async function deleteCandidates(ids: string[]) {
  return prisma.candidate.deleteMany({ where: { id: { in: ids } } });
}
