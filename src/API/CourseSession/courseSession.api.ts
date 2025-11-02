import { Avatar } from '@mui/material';
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

  getAllCourseSessionPrograms: async (filters: {
    page?: number;
    limit?: number;
    search?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    mobile?: string;
    sortBy?: string;
  }): Promise<any> => {
    const response = await axios.get('/course-session/admin/program', { params: filters });
    return response?.data;
  },


  getCourseSessionProgramById: async (id: string): Promise<any> => {
    const response = await axios.get(`/course-session/admin/program/${id}`);
    return response?.data;
  },


  getProgramMembers: async (id: string): Promise<any> => {
    const response = await axios.get(`/course-session/admin/program/${id}/members`);
    return response?.data;
  },

  completeProgram: async ({ programId, sessionId, presentUsers, description }: { programId: string, sessionId: string, presentUsers: any[], description: string }): Promise<any> => {
    const response = await axios.post(`/course-session/admin/program/${programId}/complete-session/${sessionId}`, { present_users: presentUsers, report_description: description });
    return response?.data;
  },

  // Cancel program
  cancelProgram: async ({ programId, sessionId }: { programId: string, sessionId: string }): Promise<any> => {
    const response = await axios.post(`/course-session/admin/program/${programId}/cancel-session/${sessionId}`);
    return response?.data;
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
    avatar: string
  }) => {
    const { data } = await axios.post(
      `course-session/admin/course-session-package`,
      requestData,
    )
    return data
  },

  updateCourseSessionPackage: async (packageId: string, requestData: {
    title: string
    price: number
    avatar: string
  }) => {
    const { data } = await axios.put(`course-session/admin/course-session-package/${packageId}`, requestData);
    return data;
  },

  deleteCourseSessionPackage: async (packageId: string) => {
    const { data } = await axios.delete(`course-session/admin/course-session-package/${packageId}`);
    return data;
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
    const { data } = await axios.get(`course-session/admin/user-program/${userId}`)
    return data
  },

  // Course Session Program Order
  getAllCourseSessionProgramOrders: async (filters: {
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
    const { data } = await axios.get(`course-session/admin/program-orders`, { params: filters });
    return data;
  },

  getCourseSessionProgramOrderById: async (orderId: string) => {
    const { data } = await axios.get(`course-session/admin/program-orders/${orderId}`);
    return data;
  },

  updateCourseSessionProgramOrderStatus: async (orderId: string, status: string) => {
    const { data } = await axios.patch(`course-session/admin/program-orders/${orderId}`, { order_status: status });
    return data;
  },

  addNewSessionToProgram: async (programId: string, requestData: any) => {
    const { data } = await axios.post(`course-session/admin/program/update-session/${programId}`, requestData);
    return data;
  },
}

export default courseSessionApi
