import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { api } from '../services/api';
import { AxiosError } from 'axios';

interface UseApiOptions {
  queryKey?: QueryKey;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useApiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  options?: UseApiOptions
) {
  return useQuery<T>({
    queryKey: options?.queryKey || [url, params],
    queryFn: () => api.get<T>(url, params),
    enabled: !!url,
  });
}

export function useApiMutation<T>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options?: UseApiOptions
) {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError, unknown>({
    mutationFn: (data?: unknown) => {
      switch (method) {
        case 'post':
          return api.post<T>(url, data);
        case 'put':
          return api.put<T>(url, data);
        case 'patch':
          return api.patch<T>(url, data);
        case 'delete':
          return api.delete<T>(url);
        default:
          throw new Error('Invalid method');
      }
    },
    onSuccess: (data) => {
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
      if (options?.queryKey) {
        queryClient.invalidateQueries({ queryKey: options.queryKey });
      }
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}

export function useApiPost<T>(url: string, options?: UseApiOptions) {
  return useApiMutation<T>('post', url, options);
}

export function useApiPut<T>(url: string, options?: UseApiOptions) {
  return useApiMutation<T>('put', url, options);
}

export function useApiPatch<T>(url: string, options?: UseApiOptions) {
  return useApiMutation<T>('patch', url, options);
}

export function useApiDelete<T>(url: string, options?: UseApiOptions) {
  return useApiMutation<T>('delete', url, options);
}