// Base Types
type ObjectId = string;
type ISOString = string;

export interface Upload {
  _id: string;
  file_name: string;
  original_name?: string;
  size?: number;
  mime_type?: string;
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  mobile?: string;
  avatar?: Upload;
  role?: string;
}

export interface TicketReply {
  _id: string;
  message: string;
  sender: User;
  sender_type: 'user' | 'admin';
  attachments: Upload[];
  is_read: boolean;
  createdAt: ISOString;
  updatedAt: ISOString;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  user: User;
  program_id?: string;
  program_type?: 'course' | 'course_session';
  course_id?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical_support' | 'course_content' | 'payment_issue' | 'access_problem' | 'general_inquiry' | 'bug_report' | 'feature_request' | 'other';
  attachments: Upload[];
  replies: TicketReply[];
  assigned_to?: User;
  is_read_by_admin: boolean;
  is_read_by_user: boolean;
  last_reply_at: ISOString;
  last_reply_by: 'user' | 'admin';
  resolved_at?: ISOString;
  resolved_by?: User;
  resolution_notes?: string;
  is_deleted: boolean;
  deleted_at?: ISOString;
  deleted_by?: User;
  createdAt: ISOString;
  updatedAt: ISOString;
}

export interface TicketResponse {
  results: Ticket[];
  totalResults: number;
  totalPages?: number;
  currentPage?: number;
}

export interface TicketStatistics {
  _id: null;
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  unread_by_admin: number;
  high_priority: number;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  category?: Ticket['category'];
  assigned_to?: string;
  resolution_notes?: string;
}

export interface ReplyToTicketPayload {
  message: string;
  attachments?: string[]; // Upload IDs
}

export interface AssignTicketPayload {
  assignedTo: string; // User ID
}

export interface GetTicketsParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  category?: Ticket['category'];
  is_read_by_admin?: boolean;
  is_read_by_user?: boolean;
  assignedTo?: string;
  sortBy?: string;
}