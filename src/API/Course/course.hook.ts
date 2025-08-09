import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import courseApi from './course.api'
import { Course, CourseCategory } from './types'

// Query keys
const COURSES_KEY = 'courses'
const COURSE_CATEGORIES_KEY = 'course-categories'
const COURSE_FILM_CATEGORIES_KEY = 'course-film-categories'
// Hooks for courses
export const useCourses = (params?: {
  page?: number
  limit?: number
  q?: string
}) => {
  return useQuery({
    queryKey: [COURSES_KEY, params],
    queryFn: () => courseApi.getCourses(params),
  })
}

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: [COURSES_KEY, courseId],
    queryFn: () => courseApi.getCourse(courseId),
    enabled: !!courseId,
  })
}

export const useCreateCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseData: Partial<Course>) =>
      courseApi.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] })
    },
  })
}

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseData: Partial<Course>) =>
      courseApi.updateCourse(courseId, courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] })
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY, courseId] })
    },
  })
}

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => courseApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSES_KEY] })
    },
  })
}

// Hooks for course categories

// Hooks for course categories
export const useCourseCategories = (params?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [COURSE_CATEGORIES_KEY],
    queryFn: () => courseApi.getCategories(),
    enabled: params?.enabled,
  })
}

export const useCreateCourseCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: any) => courseApi.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COURSE_FILM_CATEGORIES_KEY] })
    },
  })
}

// export const useCourseCategories = () => {
//   return useQuery({
//     queryKey: [COURSE_CATEGORIES_KEY],
//     queryFn: () => courseApi.getCategories(),
//   });
// };

// export const useCreateCourseCategory = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (categoryData: Partial<CourseCategory>) => courseApi.createCategory(categoryData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [COURSE_CATEGORIES_KEY] });
//     },
//   });
// };
