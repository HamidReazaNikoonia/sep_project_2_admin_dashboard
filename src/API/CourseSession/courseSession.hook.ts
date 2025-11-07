import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import courseSessionApi from './courseSession.api'
import { Course, Category } from './types'

// Query keys
const COURSES_KEY = 'courses-session'
const COURSE_CATEGORIES_KEY = 'course-session-categories'
const CLASS_PROGRAM_SPECIFIC_COURSE_KEY =
  'class-program-specific-course-session'
const COURSE_SESSION_PACKAGES = 'course-session-packages'


// Query keys
export const programsKeys = {
  all: ['course-session-programs'] as const,
  lists: () => [...programsKeys.all, 'list'] as const,
  list: (filters: {
    page?: number;
    limit?: number;
    search?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    mobile?: string;
    sortBy?: string;
  }) => [...programsKeys.lists(), filters] as const,
  details: () => [...programsKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...programsKeys.details(), id] as const,
};

// Hooks for courses
export const useCourseSessions = (params?: {
  page?: number
  limit?: number
  q?: string
}) => {
  return useQuery({
    queryKey: [COURSES_KEY, params],
    queryFn: () => courseSessionApi.getCourseSessions(params),
  })
}

export const useCourseSession = (courseId: string) => {
  return useQuery({
    queryKey: [COURSES_KEY, courseId],
    queryFn: () => courseSessionApi.getCourseSession(courseId),
    enabled: !!courseId,
  })
}

export const useCreateCourseSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseData: Partial<Course>) =>
      courseSessionApi.createCourseSession(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] })
    },
  })
}

export const useUpdateCourseSession = (courseId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseData: Partial<Course>) =>
      courseSessionApi.updateCourseSession(courseId, courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] })
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] })
    },
  })
}

export const useAssignCoachToCourseSession = (courseId: string) => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestBody: any) =>
      courseSessionApi.assignCoachToCourseSession(courseId, requestBody),
    onSuccess: (response) => {
      console.log('log from useAssignCoachToCourseSession')
      console.log(response)
    },
    onError: (err) => {
      console.log('log from useAssignCoachToCourseSession')
      console.log(err)
      console.log(err?.response)
    },
  })
}

// Get all Programs
export const useGetAllCourseSessionPrograms = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  mobile?: string;
  sortBy?: string;
}, options?: { enabled?: boolean }) => {
  return useQuery<any>({
    queryKey: programsKeys.list(filters),
    queryFn: () => courseSessionApi.getAllCourseSessionPrograms(filters),
    enabled: options?.enabled,
  });
};

export const useGetCourseSessionProgramById = (id: string) => {
  return useQuery({
    queryKey: ['COURSE_SESSION_PROGRAM', id],
    queryFn: () => courseSessionApi.getCourseSessionProgramById(id),
    enabled: !!id,
  })
}

export const useUpdateCourseSessionProgramById = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestData: any) => courseSessionApi.updateCourseSessionProgramById(id, requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['COURSE_SESSION_PROGRAM', id] })
    },
    onError: (err) => {
      console.log('log from useUpdateCourseSessionProgramById')
      console.log(err)
      console.log(err?.response)
    },
  })
}

export const useGetProgramMembers = (id: string) => {
  return useQuery({
    queryKey: ['COURSE_SESSION_PROGRAM_MEMBERS', id],
    queryFn: () => courseSessionApi.getProgramMembers(id),
    enabled: !!id,
  })
}

export const useCompleteProgramSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { programId: string, sessionId: string, presentUsers: any[], description: string }) => courseSessionApi.completeProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['COURSE_SESSION_PROGRAM'] })
    },
  })
}

export const useCancelProgramSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { programId: string, sessionId: string }) => courseSessionApi.cancelProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['COURSE_SESSION_PROGRAM'] })
    },
  })
}


export const useGetAllProgramsOFSpecificCourse = (courseId: string) => {
  // const queryClient = useQueryClient();

  return useQuery({
    queryKey: [CLASS_PROGRAM_SPECIFIC_COURSE_KEY, courseId],
    queryFn: () => courseSessionApi.getAllProgramsOFSpecificCourse(courseId),
    enabled: !!courseId,
  })
}

export const useDeleteCourseSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) =>
      courseSessionApi.deleteCourseSession(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] })
    },
  })
}

// Course Session Program Orders
export const useGetAllCourseSessionProgramOrders = (filters: {
  coach_id?: string,
  course_id?: string,
  program_id?: string,
  class_id?: string,
  user_id?: string,
  order_status?: string,
  payment_status?: string,
  transaction_id?: string,
  reference?: string,
  is_have_package?: string,
  with_coupon?: string,
  with_discound?: string,
  program_discounted?: string,
  user_search?: string,
  program_search?: string,
  created_from_date?: string,
  created_to_date?: string,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string,
  q?: string,
}) => {
  return useQuery({
    queryKey: ['course-session-program-orders', filters],
    queryFn: () => courseSessionApi.getAllCourseSessionProgramOrders(filters),
  })
}


export const useGetCourseSessionProgramOrderById = (orderId: string) => {
  return useQuery({
    queryKey: ['course-session-program-order', orderId],
    queryFn: () => courseSessionApi.getCourseSessionProgramOrderById(orderId),
    enabled: !!orderId,
  })
}

export const useUpdateCourseSessionProgramOrderStatus = (orderId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: string) => courseSessionApi.updateCourseSessionProgramOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-session-program-order', orderId] })
    },
  })
}

// Add new session to program
export const useAddNewSessionToProgram = (programId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestData: any) => courseSessionApi.addNewSessionToProgram(programId, requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['COURSE_SESSION_PROGRAM', programId] })
    },
  })
}

// Hooks for course categories
export const useCourseSessionCategories = (params?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [COURSE_CATEGORIES_KEY],
    queryFn: () => courseSessionApi.getCategories(),
    enabled: params?.enabled,
  })
}

export const useCreateCourseSessionCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: Partial<Category>) =>
      courseSessionApi.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_CATEGORIES_KEY] })
    },
  })
}

// classes
export const useCourseSessionClasses = () => {
  return useQuery({
    queryKey: ['course-session-classes'],
    queryFn: () => courseSessionApi.getClasses(),
  })
}

// sub category
export const useCourseSessionSubCategories = (courseCategoryId: string) => {
  return useQuery({
    queryKey: [COURSE_CATEGORIES_KEY],
    queryFn: () => courseSessionApi.getSubCategories(courseCategoryId),
  })
}

export const useCreateCourseSessionSubCategory = (courseCategoryId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: Partial<Category>) =>
      courseSessionApi.createSubCategory(courseCategoryId, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_CATEGORIES_KEY] })
    },
  })
}

// course session packages
export const useGetAllPackages = () => {
  return useQuery({
    queryKey: [COURSE_SESSION_PACKAGES],
    queryFn: () => courseSessionApi.getAllPackages(),
  })
}

export const useCreateCourseSessionPackage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestData: { title: string; price: number; avatar: string }) =>
      courseSessionApi.createCourseSessionPackage(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_SESSION_PACKAGES] })
    },
  })
}

export const useUpdateCourseSessionPackage = (packageId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestData: { title: string; price: number; avatar: string }) =>
      courseSessionApi.updateCourseSessionPackage(packageId, requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_SESSION_PACKAGES] })
    },
  })
}

export const useDeleteCourseSessionPackage = (packageId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => courseSessionApi.deleteCourseSessionPackage(packageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_SESSION_PACKAGES] })
    },
  })
}
// Class Room
export const useGetAllClassRooms = () => {
  return useQuery({
    queryKey: ['class-rooms'],
    queryFn: () => courseSessionApi.getAllClassRooms(),
  })
}

export const useCreateClassRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestData: {
      class_title: string
      class_status: string
      class_max_student_number: number
    }) => courseSessionApi.createClassRoom(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-rooms'] })
    },
  })
}

export const useGetAllCourseSessionsOfUser = (userId: string, options: { enabled: any }) => {
  return useQuery({
    queryKey: ['course-sessions-of-user', userId],
    queryFn: () => courseSessionApi.getAllCourseSessionsOfUser(userId),
    enabled: options?.enabled,
  })
}