import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import courseSessionApi from './courseSession.api'
import { Course, Category } from './types'

// Query keys
const COURSES_KEY = 'courses-session'
const COURSE_CATEGORIES_KEY = 'course-session-categories'
const CLASS_PROGRAM_SPECIFIC_COURSE_KEY =
  'class-program-specific-course-session'
const COURSE_SESSION_PACKAGES = 'course-session-packages'

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

// Hooks for course categories
export const useCourseSessionCategories = () => {
  return useQuery({
    queryKey: [COURSE_CATEGORIES_KEY],
    queryFn: () => courseSessionApi.getCategories(),
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
    mutationFn: (requestData: { title: string; price: number }) =>
      courseSessionApi.createCourseSessionPackage(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_SESSION_PACKAGES] })
    },
  })
}
