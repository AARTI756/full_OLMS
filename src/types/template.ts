export interface TemplateCategoryItem {
  id: string;
  name: string;
  description?: string | null;
}

export interface OfferTemplateItem {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  createdBy: string;
  updatedAt: string;
  isActive: boolean;
  isArchived: boolean;
  isDraft: boolean;
}

export interface TemplateVersionItem {
  id: string;
  versionNumber: number;
  title: string;
  createdBy: string;
  createdAt: string;
  summary?: string | null;
}

export interface TemplateDetail {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  category: string;
  categoryId?: string | null;
  isActive: boolean;
  isArchived: boolean;
  isDraft: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  latestVersionId?: string | null;
}

export interface OfferTemplateListResponse {
  data: OfferTemplateItem[];
  total: number;
}

export interface TemplateVersionListResponse {
  data: TemplateVersionItem[];
  total: number;
}
