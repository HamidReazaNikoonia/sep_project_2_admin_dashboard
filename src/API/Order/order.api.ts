import axios from '../axios';
import { Order, OrdersResponse, OrderSummaryResponse } from './types';

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
    const { data } = await axios.put(`/admin/order/${id}`, { status });
    return data;
  },

  calculateOrderSummary: async (data: {
    couponCodes: string[];
    items: Array<{ productId?: string; courseId?: string; quantity: number }>;
  }): Promise<OrderSummaryResponse> => {
    const { data: response } = await axios.post('/admin/order/calculate-order-summary-admin', data);
    return response;
  },

  createOrder: async (orderData: {
    customer: string;
    products?: { product?: string; course?: string; quantity: number }[];
    couponCodes?: string[];
  }): Promise<{ order: Order }> => {
    const { data } = await axios.post('/admin/order', orderData);
    return data;
  },
};