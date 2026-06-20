'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, patchSettings } from '@/services/settings-api';
import type { SettingsResponse, SettingsUpdateInput } from '@/types/settings';

export function useSettings() {
  return useQuery<SettingsResponse, Error>({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<SettingsResponse, Error, SettingsUpdateInput>({
    mutationFn: patchSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
