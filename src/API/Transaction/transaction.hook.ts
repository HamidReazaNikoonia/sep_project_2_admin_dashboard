import { useQuery } from '@tanstack/react-query';
import transactionApi from './transaction.api';
import { Transaction } from './types';

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...transactionKeys.lists(), filters] as const,
};

// Hooks
export const useTransactions = (params?: { page?: number; limit?: number; q?: string; id?: string }) => {
  return useQuery({
    queryKey: transactionKeys.list(params || {}),
    queryFn: () => transactionApi.getTransactions(params),
  });
};