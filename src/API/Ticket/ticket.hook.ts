import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ticketApi from './ticket.api';
import type {
  UpdateTicketPayload,
  ReplyToTicketPayload,
  AssignTicketPayload,
  GetTicketsParams,
} from './types';

// Query keys
const TICKETS_KEY = 'tickets';
const TICKET_STATISTICS_KEY = 'ticket-statistics';

// Query hooks
export const useTickets = (params?: GetTicketsParams) => {
  return useQuery({
    queryKey: [TICKETS_KEY, params],
    queryFn: () => ticketApi.getTickets(params),
  });
};

export const useTicketStatistics = () => {
  return useQuery({
    queryKey: [TICKET_STATISTICS_KEY],
    queryFn: () => ticketApi.getStatistics(),
  });
};

export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: [TICKETS_KEY, ticketId],
    queryFn: () => ticketApi.getTicket(ticketId),
    enabled: !!ticketId,
  });
};

// Mutation hooks
export const useUpdateTicket = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTicketPayload) =>
      ticketApi.updateTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => ticketApi.deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useReplyToTicket = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplyToTicketPayload) =>
      ticketApi.replyToTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useAssignTicket = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignTicketPayload) =>
      ticketApi.assignTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useMarkTicketAsRead = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketApi.markTicketAsRead(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

// Convenience hooks for general operations (when ticketId is dynamic)
export const useUpdateTicketGeneral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: UpdateTicketPayload }) =>
      ticketApi.updateTicket(ticketId, payload),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useReplyToTicketGeneral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: ReplyToTicketPayload }) =>
      ticketApi.replyToTicket(ticketId, payload),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useAssignTicketGeneral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: AssignTicketPayload }) =>
      ticketApi.assignTicket(ticketId, payload),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};

export const useMarkTicketAsReadGeneral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => ticketApi.markTicketAsRead(ticketId),
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      queryClient.invalidateQueries({ queryKey: [TICKET_STATISTICS_KEY] });
    },
  });
};