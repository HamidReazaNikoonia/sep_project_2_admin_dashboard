import axios from '../axios'
import { CourseCategory, CourseCategoryResponse } from '../Course/types'
import {
  Course,
  CourseResponse,
  Category,
  CategoryResponse,
  SubCategoryResponse,
} from './types'

const courseSessionApi = {
  // Get all courses
  getCourseSessions: async (params?: {
    page?: number
    limit?: number
    q?: string
  }) => {
    const { data } = await axios.get<CourseResponse>('course-session/admin', {
      params,
    })
    return data
  },

  // Get specific course by ID
  getCourseSession: async (courseId: string) => {
    const { data } = await axios.get<{ course: Course }>(
      `course-session/admin?_id=${courseId}`,
    )
    return data
  },

  // Create new course
  createCourseSession: async (courseData: Partial<Course>) => {
    const { data } = await axios.post<{ course: Course }>(
      'course-session/admin',
      courseData,
    )
    return data
  },

  // Update course
  updateCourseSession: async (
    courseId: string,
    courseData: Partial<Course>,
  ) => {
    const { data } = await axios.put<{ course: Course }>(
      `course-session/${courseId}`,
      courseData,
    )
    return data
  },

  // Update course
  assignCoachToCourseSession: async (
    courseId: string,
    courseData: Partial<Course>,
  ) => {
    const { data } = await axios.put<{ course: Course }>(
      `course-session/${courseId}/assign-coach`,
      courseData,
    )
    return data
  },

  // Update course
  getAllProgramsOFSpecificCourse: async (courseId: string) => {
    const { data } = await axios.get<{ course: any }>(
      `course-session/${courseId}/program`,
    )
    return data
  },

  // Delete course
  deleteCourseSession: async (courseId: string) => {
    const { data } = await axios.delete(`course-session/${courseId}`)
    return data
  },

  // Get All classes
  getClasses: async () => {
    const { data } = await axios.get<CourseCategoryResponse>('admin/class-no')
    return data
  },

  // Get course categories
  getCategories: async () => {
    const { data } = await axios.get<CourseCategoryResponse>(
      'course-session/category/tree',
    )
    return data
  },

  // Create course category
  createCategory: async (categoryData: Partial<CourseCategory>) => {
    const { data } = await axios.post<{ category: CourseCategory }>(
      'course-session/category',
      categoryData,
    )
    return data
  },

  // Get course sub categories
  getSubCategories: async (courseCategoryId: string) => {
    const { data } = await axios.get<SubCategoryResponse>(
      `course-session/category/${courseCategoryId}/subcategories`,
    )
    return data
  },

  // Create course category
  createSubCategory: async (
    courseCategoryId: string,
    categoryData: Partial<CourseCategory>,
  ) => {
    const { data } = await axios.post<{ category: CourseCategory }>(
      `course-session/category/${courseCategoryId}/subcategories`,
      categoryData,
    )
    return data
  },

  // course session package
  getAllPackages: async () => {
    const { data } = await axios.get(
      `course-session/admin/course-session-package`,
    )
    return data
  },

  createCourseSessionPackage: async (requestData: {
    title: string
    price: number
  }) => {
    const { data } = await axios.post(
      `course-session/admin/course-session-package`,
      requestData,
    )
    return data
  },

  // Class Room
  getAllClassRooms: async () => {
    const { data } = await axios.get(`admin/class-no`)
    return data
  },

  createClassRoom: async (requestData: {
    class_title: string
    class_status: string
    class_max_student_number: number
  }) => {
    const { data } = await axios.post(`admin/class-no`, requestData)
    return data
  },

  // Get all course sessions (Program) of a user
  getAllCourseSessionsOfUser: async (userId: string) => {
    const { data } = await axios.get(`course-session/admin/program/${userId}`)
    return data
  },
}

export default courseSessionApi
