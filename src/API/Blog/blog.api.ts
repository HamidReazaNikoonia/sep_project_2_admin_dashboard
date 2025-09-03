import api from '../axios';
import type { Blog, BlogListResponse, CreateBlogDto, UpdateBlogDto, GetBlogsParams } from './types';

export const blogApi = {
  // Get all blogs for admin with optional filtering
  getBlogs: async (params?: GetBlogsParams) => {
    const { data } = await api.get<BlogListResponse>('/blog/admin', { params });
    return data;
  },

  // Get specific blog by ID
  getBlog: async (blogId: string) => {
    const { data } = await api.get<{
        thumbnail: any;
        tags: never[];
        content: string;
        sub_title: string;
        title: string; blog: Blog 
}>(`/blog/admin/${blogId}`);
    return data;
  },

  // Create new blog
  createBlog: async (blogData: CreateBlogDto) => {
    const { data } = await api.post<{ blog: Blog }>('/blog/admin', blogData);
    return data;
  },

  // Update blog by ID
  updateBlog: async (blogId: string, blogData: UpdateBlogDto) => {
    const { data } = await api.put<{ blog: Blog }>(`/blog/admin/${blogId}`, blogData);
    return data;
  },

  // Delete blog by ID
  deleteBlog: async (blogId: string) => {
    const { data } = await api.delete<{ success: boolean }>(`/blog/admin/${blogId}`);
    return data;
  },
};

export default blogApi;
