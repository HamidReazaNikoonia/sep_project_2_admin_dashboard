import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './users.api';
import type { UserListResponse, UserResponse } from './types';

// Query keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: {
    page?: number;
    limit?: number;
    search?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    mobile?: string;
    sortBy?: string;
  }) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...usersKeys.details(), id] as const,
};

// Get all users
export const useUsers = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  mobile?: string;
  sortBy?: string;
}) => {
  return useQuery<UserListResponse>({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersApi.getUsers(filters),
  });
};

// Add this new hook for getting user by ID
export const useUserById = (userId: string | number) => {
  return useQuery({
    queryKey: usersKeys.detail(userId.toString()),
    queryFn: () => usersApi.getUserById(userId.toString()),
    enabled: !!userId,
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<UserResponse> }) =>
      usersApi.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch user detail
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
      // Invalidate users lists
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};