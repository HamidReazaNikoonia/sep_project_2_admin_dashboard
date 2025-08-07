import api from '../axios';
import type { 
  NotificationListResponse, 
  NotificationResponse, 
  NotificationFilters, 
  NotificationStatistics,
  NotificationReply,
  UpdateNotificationData
} from './types';

export const notificationApi = {
  // 1. Get all notifications with filters
  getAllNotifications: async (filters: NotificationFilters): Promise<NotificationListResponse> => {
    const response = await api.get('/notification/admin/all', { params: filters });
    return response.data;
  },

  // 2. Get notification statistics
  getStatistics: async (): Promise<NotificationStatistics> => {
    const response = await api.get('/notification/admin/analytics');
    return response.data;
  },

  // 3. Get specific notification by ID
  getNotificationById: async (ticketId: string): Promise<NotificationResponse> => {
    const response = await api.get(`/notification/admin/${ticketId}`);
    return response.data;
  },

  // 4. Update notification
  updateNotification: async (
    ticketId: string, 
    updateData: UpdateNotificationData
  ): Promise<NotificationResponse> => {
    const response = await api.patch(`/notification/admin/${ticketId}`, updateData);
    return response.data;
  },

  // 5. Delete notification
  deleteNotification: async (ticketId: string): Promise<void> => {
    const response = await api.delete(`/notification/admin/${ticketId}`);
    return response.data;
  },

  // 6. Reply to notification
  replyToNotification: async (
    ticketId: string, 
    replyData: NotificationReply
  ): Promise<NotificationResponse> => {
    const formData = new FormData();
    formData.append('message', replyData.message);
    
    // Add attachments if provided
    if (replyData.attachments) {
      replyData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await api.post(`/notification/admin/${ticketId}/reply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 7. Mark notification as read
  markAsRead: async (ticketId: string): Promise<NotificationResponse> => {
    const response = await api.patch(`/notification/admin/${ticketId}/mark-read`);
    return response.data;
  },
};