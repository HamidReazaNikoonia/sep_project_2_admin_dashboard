import axios from '../axios';
import { Order, OrdersResponse } from './types';

export const orderAPI = {
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
  }): Promise<OrdersResponse> => {
    const { data } = await axios.get('/admin/order', { params });
    return data;
  },

  getOrder: async (id: string): Promise<{ order: Order }> => {
    const { data } = await axios.get(`/admin/order/${id}`);
    return data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<{ order: Order }> => {
    const { data } = await axios.patch(`/admin/orders/${id}/status`, { status });
    return data;
  },
};