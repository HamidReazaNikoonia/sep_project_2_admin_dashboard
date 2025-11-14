import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from './order.api';
import { showToast } from '../../utils/toast';

export const useOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderAPI.getOrders(params),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOrder(id),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('موفق', 'وضعیت سفارش با موفقیت بروزرسانی شد', 'success');
    },
    onError: () => {
      showToast('خطا', 'خطا در بروزرسانی وضعیت سفارش', 'error');
    },
  });
};

export const useCalculateOrderSummary = (params: {
  couponCodes: string[];
  items: Array<{ productId?: string; courseId?: string; quantity: number }>;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['order-summary', params],
    queryFn: () => orderAPI.calculateOrderSummary(params),
    enabled: params.enabled && params.items.length > 0,
  });
};



export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: {
      customer: string;
      products?: { product?: string; course?: string; quantity: number }[];
      couponCodes?: string[];
    }) => orderAPI.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      showToast('موفق', 'سفارش با موفقیت ثبت شد', 'success');
    },
    onError: () => {
      showToast('خطا', 'خطا در ثبت سفارش', 'error');
    },
  });
};