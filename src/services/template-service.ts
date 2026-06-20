import { prisma } from "@/prisma/client";
import type {
  OfferTemplateListResponse,
  TemplateDetail,
  TemplateVersionItem,
  TemplateVersionListResponse,
} from "@/types/template";
import { createActivity } from '@/services/activity-service';
import { notifyTemplateUpdated } from '@/services/notification-service';

export async function getTemplateList(params: {
  search?: string;
  category?: string;
  status?: "active" | "archived" | "draft" | "all";
  page?: number;
  limit?: number;
  sortBy?: "updatedAt" | "createdAt" | "title" | "category";
  sortOrder?: "asc" | "desc";
}): Promise<OfferTemplateListResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 12;
  const skip = (page - 1) * limit;
  const sortBy = params.sortBy ?? "updatedAt";
  const sortOrder = params.sortOrder ?? "desc";

  const orderBy: Record<string, "asc" | "desc"> =
    sortBy === "createdAt"
      ? { createdAt: sortOrder }
      : sortBy === "title"
      ? { title: sortOrder }
      : sortBy === "category"
      ? { category: sortOrder }
      : { updatedAt: sortOrder };

  const conditions: any[] = [];

  if (params.search) {
    conditions.push({
      OR: [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
        { category: { name: { contains: params.search, mode: "insensitive" } } },
      ],
    });
  }

  if (params.category) {
    conditions.push({ category: { name: params.category } });
  }

  if (params.status === "active") {
    conditions.push({ isArchived: false, isActive: true, isDraft: false });
  } else if (params.status === "archived") {
    conditions.push({ isArchived: true });
  } else if (params.status === "draft") {
    conditions.push({ isDraft: true });
  }

  const where = conditions.length ? { AND: conditions } : {};

  const [total, templates] = await prisma.$transaction([
    prisma.offerTemplate.count({ where }),
    prisma.offerTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        createdBy: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  return {
    total,
    data: templates.map((template) => ({
      id: template.id,
      title: template.title,
      category: template.category?.name ?? "Uncategorized",
      description: template.description,
      createdBy: template.createdBy.name,
      updatedAt: template.updatedAt.toISOString(),
      isActive: template.isActive,
      isArchived: template.isArchived,
      isDraft: template.isDraft,
    })),
  };
}

export async function getTemplateById(id: string): Promise<TemplateDetail | null> {
  const template = await prisma.offerTemplate.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      category: { select: { name: true } },
      latestVersion: { select: { id: true } },
    },
  });

  if (!template) {
    return null;
  }

  return {
    id: template.id,
    title: template.title,
    description: template.description,
    content: template.content,
    category: template.category?.name ?? "Uncategorized",
    categoryId: template.categoryId,
    isActive: template.isActive,
    isArchived: template.isArchived,
    isDraft: template.isDraft,
    createdBy: template.createdBy.name,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    latestVersionId: template.latestVersion?.id ?? null,
  };
}

async function getOrCreateCategory(name: string) {
  return prisma.templateCategory.upsert({
    where: { name },
    update: {},
    create: {
      name,
    },
  });
}

export async function createTemplate(data: {
  title: string;
  description?: string | null;
  content: string;
  category: string;
  createdById: string;
  isDraft?: boolean;
}) {
  const category = await getOrCreateCategory(data.category);
  const isDraft = data.isDraft ?? false;
  const template = await prisma.offerTemplate.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      categoryId: category.id,
      createdById: data.createdById,
      isActive: !isDraft,
      isArchived: false,
      isDraft,
    },
  });

  const version = await prisma.templateVersion.create({
    data: {
      versionNumber: 1,
      title: data.title,
      content: data.content,
      templateId: template.id,
      createdById: data.createdById,
    },
  });

  await prisma.offerTemplate.update({
    where: { id: template.id },
    data: { latestVersionId: version.id },
  });

  await createActivity({
    userId: data.createdById,
    action: 'TEMPLATE_CREATED',
    details: `Template ${template.title} created.`,
  });

  await notifyTemplateUpdated(data.createdById, template.id, template.title);

  return template;
}

export async function updateTemplate(id: string, data: {
  title: string;
  description?: string | null;
  content: string;
  category: string;
  isActive: boolean;
  isDraft?: boolean;
  updatedById: string;
}) {
  const category = await getOrCreateCategory(data.category);
  const isDraft = data.isDraft ?? false;
  const template = await prisma.offerTemplate.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      isActive: isDraft ? false : data.isActive,
      isDraft,
      categoryId: category.id,
    },
  });

  const latestVersionNumber = await prisma.templateVersion.aggregate({
    where: { templateId: id },
    _max: { versionNumber: true },
  });

  const nextVersion = (latestVersionNumber._max.versionNumber ?? 0) + 1;
  const version = await prisma.templateVersion.create({
    data: {
      versionNumber: nextVersion,
      title: data.title,
      content: data.content,
      templateId: id,
      createdById: data.updatedById,
    },
  });

  await prisma.offerTemplate.update({
    where: { id },
    data: { latestVersionId: version.id },
  });

  await createActivity({
    userId: data.updatedById,
    action: 'TEMPLATE_UPDATED',
    details: `Template ${template.title} updated to version ${version.versionNumber}.`,
  });

  await notifyTemplateUpdated(data.updatedById, template.id, template.title);

  return template;
}

export async function archiveTemplate(id: string) {
  return prisma.offerTemplate.update({ where: { id }, data: { isArchived: true, isActive: false } });
}

export async function restoreTemplate(id: string) {
  return prisma.offerTemplate.update({ where: { id }, data: { isArchived: false, isActive: true } });
}

export async function duplicateTemplate(id: string, createdById: string) {
  const template = await prisma.offerTemplate.findUnique({
    where: { id },
    include: {
      latestVersion: true,
    },
  });

  if (!template) {
    throw new Error("Template not found.");
  }

  const copy = await prisma.offerTemplate.create({
    data: {
      title: `${template.title} (Copy)`,
      description: template.description,
      content: template.content,
      isActive: template.isActive,
      isArchived: false,
      categoryId: template.categoryId,
      createdById,
    },
  });

  const version = await prisma.templateVersion.create({
    data: {
      versionNumber: 1,
      title: copy.title,
      content: copy.content,
      templateId: copy.id,
      createdById,
    },
  });

  await prisma.offerTemplate.update({ where: { id: copy.id }, data: { latestVersionId: version.id } });

  return copy;
}

export async function getTemplateVersions(templateId: string): Promise<TemplateVersionListResponse> {
  const versions = await prisma.templateVersion.findMany({
    where: { templateId },
    orderBy: { versionNumber: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return {
    total: versions.length,
    data: versions.map((version) => ({
      id: version.id,
      versionNumber: version.versionNumber,
      title: version.title,
      createdBy: version.createdBy.name,
      createdAt: version.createdAt.toISOString(),
      summary: version.summary,
    })),
  };
}

export async function restoreTemplateVersion(templateId: string, versionId: string) {
  const version = await prisma.templateVersion.findUnique({ where: { id: versionId } });

  if (!version || version.templateId !== templateId) {
    throw new Error("Version not found.");
  }

  await prisma.offerTemplate.update({
    where: { id: templateId },
    data: {
      title: version.title,
      content: version.content,
      latestVersionId: version.id,
    },
  });

  return version;
}
