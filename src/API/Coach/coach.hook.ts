import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coachAPI } from './coach.api';
import { showToast } from '../../utils/toast';

// Query keys
export const coachKeys = {
  all: ['coach'] as const,
  lists: () => [...coachKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...coachKeys.lists(), filters] as const,
};


// Hooks
export const useGetAllCoaches = (params?: { page?: number; limit?: number; q?: string }) => {
  return useQuery({
    queryKey: coachKeys.list(params || {}),
    queryFn: () => coachAPI.getAllCoaches(params),
  });
};

export const useGetCoachById = (id: string) => {
  return useQuery({
    queryKey: ['coach', id],
    queryFn: () => coachAPI.getCoachById(id),
    enabled: !!id,
  });
};

export const useCoachCoursePrograms = (params?: {
  page?: number;
  limit?: number;
  accessLevel?: string;
  _id?: string
}) => {
  return useQuery({
    queryKey: ['coach-course-programs', params],
    queryFn: () => coachAPI.getCoachCoursePrograms(params),
  });
};


export const useCreateCoachCourseProgram = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (data: { courseId: string; programId: string }) =>
        coachAPI.createCoachCourseProgram(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['coach-course-programs'] });
        showToast('موفق', 'برنامه با موفقیت ایجاد شد', 'success');
      },
      onError: () => {
        showToast('خطا', 'خطا در ایجاد برنامه', 'error');
      },
    });
  };

export const useUpdateCoachCourseProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, accessLevel }: { id: string; accessLevel: string }) =>
      coachAPI.updateCoachCourseProgram(id, accessLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-course-programs'] });
      showToast('موفق', 'سطح دسترسی برنامه با موفقیت بروزرسانی شد', 'success');
    },
    onError: () => {
      showToast('خطا', 'خطا در بروزرسانی سطح دسترسی برنامه', 'error');
    },
  });
};



export const useDeleteCoachCourseProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coachAPI.deleteCoachCourseProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-course-programs'] });
      showToast('موفق', 'برنامه با موفقیت حذف شد', 'success');
    },
    onError: () => {
      showToast('خطا', 'خطا در حذف برنامه', 'error');
    },
  });
};