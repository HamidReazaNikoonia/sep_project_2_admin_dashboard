import axios from '../axios'
import {
  Course,
  CourseResponse,
  CourseCategory,
  CourseCategoryResponse,
} from './types'

const courseApi = {
  // Get all courses
  getCourses: async (params?: {
    page?: number
    limit?: number
    q?: string
  }) => {
    const { data } = await axios.get<CourseResponse>('course/admin', { params })
    return data
  },

  // Get specific course by ID
  getCourse: async (courseId: string) => {
    const { data } = await axios.get<{
      description_long: string course: Course 
}>(`course/${courseId}`)
    return data
  },

  // Create new course
  createCourse: async (courseData: Partial<Course>) => {
    const { data } = await axios.post<{ course: Course }>('course', courseData)
    return data
  },

  // Update course
  updateCourse: async (courseId: string, courseData: Partial<Course>) => {
    const { data } = await axios.put<{ course: Course }>(
      `course/${courseId}`,
      courseData,
    )
    return data
  },

  // Delete course
  deleteCourse: async (courseId: string) => {
    const { data } = await axios.delete(`course/${courseId}`)
    return data
  },

  // Get course categories
  getCategories: async () => {
    const { data } = await axios.get<CourseCategoryResponse>('course/category')
    return data
  },

  // Create course category
  createCategory: async (categoryData: Partial<CourseCategory>) => {
    const { data } = await axios.post<{ category: CourseCategory }>(
      'course/category',
      categoryData,
    )
    return data
  },

  // Get course categories
  // getCategories: async () => {
  //   const { data } = await axios.get<CourseCategoryResponse>('course/category');
  //   return data;
  // },

  // // Create course category
  // createCategory: async (categoryData: Partial<CourseCategory>) => {
  //   const { data } = await axios.post<{ category: CourseCategory }>('course/category', categoryData);
  //   return data;
  // },
}

export default courseApi
