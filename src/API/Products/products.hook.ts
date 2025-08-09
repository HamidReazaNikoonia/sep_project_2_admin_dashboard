import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productsApi from './products.api';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto } from './types';

// Query keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  categories: ['categories'] as const,
};

// Hooks
export const useProducts = (params?: { page?: number; limit?: number; q?: string }) => {
  return useQuery({
    queryKey: productsKeys.list(params || {}),
    queryFn: () => productsApi.getProducts(params),
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: productsKeys.detail(productId),
    queryFn: () => productsApi.getProductById(productId),
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProductDto) => productsApi.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

export const useCategories = (params?: { enabled?: boolean; }) => {
  return useQuery({
    queryKey: productsKeys.categories,
    queryFn: productsApi.getCategories,
    enabled: params?.enabled,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => productsApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.categories });
    },
  });
}; 