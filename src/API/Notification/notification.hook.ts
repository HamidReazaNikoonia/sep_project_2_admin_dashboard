import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from './notification.api';
import type { 
  NotificationListResponse, 
  NotificationResponse, 
  NotificationFilters, 
  NotificationStatistics,
  NotificationReply,
  UpdateNotificationData
} from './types';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  statistics: () => [...notificationKeys.all, 'statistics'] as const,
};

// 1. Get all notifications with filters
export const useNotifications = (filters: NotificationFilters) => {
  return useQuery<NotificationListResponse>({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationApi.getAllNotifications(filters),
  });
};

// 2. Get notification statistics
export const useNotificationStatistics = () => {
  return useQuery<NotificationStatistics>({
    queryKey: notificationKeys.statistics(),
    queryFn: () => notificationApi.getStatistics(),
  });
};

// 3. Get specific notification by ID
export const useNotificationById = (ticketId: string) => {
  return useQuery<NotificationResponse>({
    queryKey: notificationKeys.detail(ticketId),
    queryFn: () => notificationApi.getNotificationById(ticketId),
    enabled: !!ticketId,
  });
};

// 4. Update notification mutation
export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      ticketId, 
      updateData 
    }: { 
      ticketId: string; 
      updateData: UpdateNotificationData 
    }) => notificationApi.updateNotification(ticketId, updateData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch notification detail
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.detail(variables.ticketId) 
      });
      // Invalidate notifications lists
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.lists() 
      });
      // Invalidate statistics
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.statistics() 
      });
    },
  });
};

// 5. Delete notification mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId: string) => notificationApi.deleteNotification(ticketId),
    onSuccess: (data, ticketId) => {
      // Remove the notification from cache
      queryClient.removeQueries({ 
        queryKey: notificationKeys.detail(ticketId) 
      });
      // Invalidate notifications lists
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.lists() 
      });
      // Invalidate statistics
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.statistics() 
      });
    },
  });
};

// 6. Reply to notification mutation
export const useReplyToNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      ticketId, 
      replyData 
    }: { 
      ticketId: string; 
      replyData: NotificationReply 
    }) => notificationApi.replyToNotification(ticketId, replyData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch notification detail
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.detail(variables.ticketId) 
      });
      // Invalidate notifications lists
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.lists() 
      });
    },
  });
};

// 7. Mark as read mutation
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId: string) => notificationApi.markAsRead(ticketId),
    onSuccess: (data, ticketId) => {
      // Invalidate and refetch notification detail
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.detail(ticketId) 
      });
      // Invalidate notifications lists
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.lists() 
      });
      // Invalidate statistics
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.statistics() 
      });
    },
  });
};

// Bulk operations hooks (bonus utilities)
export const useMarkMultipleAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketIds: string[]) => {
      return Promise.all(
        ticketIds.map(id => notificationApi.markAsRead(id))
      );
    },
    onSuccess: () => {
      // Invalidate all notification-related queries
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.all 
      });
    },
  });
};

export const useDeleteMultipleNotifications = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketIds: string[]) => {
      return Promise.all(
        ticketIds.map(id => notificationApi.deleteNotification(id))
      );
    },
    onSuccess: () => {
      // Invalidate all notification-related queries
      queryClient.invalidateQueries({ 
        queryKey: notificationKeys.all 
      });
    },
  });
};