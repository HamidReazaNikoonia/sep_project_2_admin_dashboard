import axios from '../axios'
import {
  Course,
  CourseResponse,
  CourseCategory,
  CourseCategoryResponse,
  SampleMedia,
  CourseObject,
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
    const { data } = await axios.get<{ course: Course }>(`course/${courseId}`)
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


  // create or update sample media on the specific course
  createOrUpdateSampleMedia: async (courseId: string, sampleMediaData: Partial<SampleMedia>) => {
    const { data } = await axios.post<{ sampleMedia: SampleMedia }>(
      `course/${courseId}/sample-media`,
      sampleMediaData,
    )
    return data
  },

  /**
   * Update Course Objects on course Document
   *
   *  If on the req.body we have `id` property, it means we should
   * find selected course objects from course which finded by courseId and
   * then update that specific course objects
   */

  // Senario 1  => **  User Want Create New Course Object **
  // Case: updatedData !== id
  // Note: cretae new course_object without lessons
  // ----------------------------------------------------------
  // Senario 2  => **  User Want Update specific course Object data ( exclude lessons ) **
  // Case: (updatedData.id && updatedData.controller === update_course_object)
  // ----------------------------------------------------------
  // Senario 3  => ** User want Add new Lesson to Specific Course Object **
  // Case: (updatedData.id && controller === add_new_lesson)
  // ----------------------------------------------------------
  // Senario 4  => ** User want Delete Lesson from Specific Course Object **
  // Case: (updatedData.id && controller === delete_lesson && lesson_id)
  
  // create or update course object on the specific course
  createOrUpdateCourseObject: async (courseId: string, courseObjectData: Partial<CourseObject>) => {
    const { data } = await axios.post<{ courseObject: CourseObject }>(
      `course/${courseId}/course-objects`,
      courseObjectData,
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
