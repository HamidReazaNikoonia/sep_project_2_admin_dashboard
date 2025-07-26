import api from '../axios';
import type { UserListResponse, UserResponse } from './types';

export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (filters: {
    page?: number;
    limit?: number;
    search?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    mobile?: string;
    sortBy?: string;
  }): Promise<UserListResponse> => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },

  // Get a specific user by ID
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<UserResponse>): Promise<UserResponse> => {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  },
};