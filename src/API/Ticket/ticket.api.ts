import api from '../axios';
import type {
  Ticket,
  TicketResponse,
  TicketStatistics,
  UpdateTicketPayload,
  ReplyToTicketPayload,
  AssignTicketPayload,
  GetTicketsParams,
} from './types';

export const ticketApi = {
  // Get all tickets with optional filtering
  getTickets: async (params?: GetTicketsParams) => {
    const { data } = await api.get<TicketResponse>('ticket/admin/all', { params });
    return data;
  },

  // Get ticket statistics
  getStatistics: async () => {
    const { data } = await api.get<TicketStatistics>('ticket/admin/statistics');
    return data;
  },

  // Get specific ticket by ID
  getTicket: async (ticketId: string) => {
    const { data } = await api.get<{ ticket: Ticket }>(`ticket/admin/${ticketId}`);
    return data;
  },

  // Update specific ticket by ID
  updateTicket: async (ticketId: string, payload: UpdateTicketPayload) => {
    const { data } = await api.patch<{ ticket: Ticket }>(`ticket/admin/${ticketId}`, payload);
    return data;
  },

  // Delete specific ticket by ID
  deleteTicket: async (ticketId: string) => {
    const { data } = await api.delete(`ticket/admin/${ticketId}`);
    return data;
  },

  // Reply to specific ticket by ID
  replyToTicket: async (ticketId: string, payload: ReplyToTicketPayload) => {
    const { data } = await api.post<{ ticket: Ticket }>(`ticket/admin/${ticketId}/reply`, payload);
    return data;
  },

  // Assign specific ticket
  assignTicket: async (ticketId: string, payload: AssignTicketPayload) => {
    const { data } = await api.patch<{ ticket: Ticket }>(`ticket/admin/${ticketId}/assign`, payload);
    return data;
  },

  // Mark ticket as read
  markTicketAsRead: async (ticketId: string) => {
    const { data } = await api.patch<{ ticket: Ticket }>(`ticket/admin/${ticketId}/mark-read`);
    return data;
  },
};

export default ticketApi;