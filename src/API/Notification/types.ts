export interface Notification {
    id: string;
    user: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    category: string;
    program_id?: string;
    program_type?: string;
    course_id?: string;
    assigned_to?: string;
    is_read_by_admin: boolean;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface NotificationListResponse {
    results: Notification[];
    totalResults: number;
    page: number;
    limit: number;
  }
  
  export interface NotificationResponse extends Notification {}
  
  export interface NotificationFilters {
    page?: number;
    limit?: number;
    user?: string;
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    program_id?: string;
    program_type?: string;
    course_id?: string;
    assigned_to?: string;
    is_read_by_admin?: boolean;
    created_from_date?: string;
    created_to_date?: string;
  }
  
  export interface NotificationStatistics {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    unread_by_admin: number;
    high_priority: number;
  }
  
  export interface NotificationReply {
    message: string;
    attachments?: File[];
  }
  
  export interface UpdateNotificationData {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    assigned_to?: string;
    title?: string;
    description?: string;
  }