import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi from './blog.api';
import type { GetBlogsParams, CreateBlogDto, UpdateBlogDto } from './types';

// Query keys
export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: GetBlogsParams) => [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
};

// Get all blogs with optional filtering
export const useBlogs = (params?: GetBlogsParams) => {
  return useQuery({
    queryKey: blogKeys.list(params || {}),
    queryFn: () => blogApi.getBlogs(params),
  });
};

// Get a specific blog by ID
export const useBlog = (blogId: string) => {
  return useQuery({
    queryKey: blogKeys.detail(blogId),
    queryFn: () => blogApi.getBlog(blogId),
    enabled: !!blogId,
  });
};

// Create a new blog
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogData: CreateBlogDto) => blogApi.createBlog(blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

// Update an existing blog
export const useUpdateBlog = (blogId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogData: UpdateBlogDto) => blogApi.updateBlog(blogId, blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(blogId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

// Delete a blog
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (blogId: string) => blogApi.deleteBlog(blogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};
