'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTemplate,
  duplicateTemplate,
  getTemplate,
  getTemplates,
  getTemplateVersions,
  restoreTemplate,
  restoreTemplateVersion,
  archiveTemplate,
  updateTemplate,
  autosaveTemplate,
} from '@/services/template-api';
import type { OfferTemplateListResponse, TemplateDetail, TemplateVersionListResponse } from '@/types/template';

export function useTemplateList(searchParams: URLSearchParams) {
  return useQuery<OfferTemplateListResponse, Error>({
    queryKey: ['templates', Object.fromEntries(searchParams.entries())],
    queryFn: () => getTemplates(searchParams),
    staleTime: 1000 * 60,
  });
}

export function useTemplate(templateId: string) {
  return useQuery<TemplateDetail, Error>({
    queryKey: ['templates', templateId],
    queryFn: () => getTemplate(templateId),
    staleTime: 1000 * 60,
    enabled: Boolean(templateId),
  });
}

export function useTemplateVersions(templateId: string) {
  return useQuery<TemplateVersionListResponse, Error>({
    queryKey: ['templates', templateId, 'versions'],
    queryFn: () => getTemplateVersions(templateId),
    staleTime: 1000 * 60,
    enabled: Boolean(templateId),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useUpdateTemplate(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateTemplate>[1]) => updateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', templateId] });
    },
  });
}

export function useAutosaveTemplate(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof autosaveTemplate>[1]) => autosaveTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', templateId] });
    },
  });
}

export function useArchiveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => archiveTemplate(templateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useRestoreTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => restoreTemplate(templateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => duplicateTemplate(templateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });
}

export function useRestoreTemplateVersion(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => restoreTemplateVersion(templateId, versionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates', templateId, 'versions'] }),
  });
}
