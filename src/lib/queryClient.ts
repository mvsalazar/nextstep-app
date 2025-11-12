import { QueryClient } from '@tanstack/react-query';

type ErrorWithCode = {
  code?: string;
};

const hasErrorCode = (error: unknown): error is ErrorWithCode => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry 4xx errors, but retry network errors
        if (hasErrorCode(error) && error.code?.startsWith('HTTP_4')) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
