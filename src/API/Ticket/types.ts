// Base Types
type ObjectId = string;
type ISOString = string;

export interface Upload {
  _id: string;
  file_name: string;
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  mobile?: string;
  avatar?: Upload;
}

export interface TicketReply {
  _id: string;
  message: string;
  author: User;
  isAdmin: boolean;
  createdAt: ISOString;
  updatedAt: ISOString;
}

export interface Ticket {
  id: any;
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical_support' | 'course_content' | 'payment_issue' | 'access_problem' | 'general_inquiry' | 'bug_report' | 'feature_request' | 'other';
  user: User;
  assignedTo?: User;
  replies: TicketReply[];
  is_read_by_admin: boolean;
  is_read_by_user: boolean;
  program_id?: string;
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
}

export interface ReplyToTicketPayload {
  message: string;
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