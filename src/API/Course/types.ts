// Base Types
type TimeString = `${number}:${number}` // HH:MM format
type ISOString = string // ISO date string format
type ObjectId = string // Assuming MongoDB ObjectId as string in frontend

interface Upload {
  _id: string
  file_name: string
}

export interface CourseCategory {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface SampleMedia {
  _id?: string
  delete_id?: string
  media_type: string
  media_title: string
  url_address: string
  file?: Upload
  controller?: string //
}

export interface CourseMember {
  user: string
}

export interface CourseObject {
  _id?: string
  id?: string
  title?: string
  controller?: string
  order?: number
  status?: 'PUBLIC' | 'PRIVATE'
  duration?: number
  description?: string
  files?: Upload[] | string
  file?: Upload[] | string
  delete_id?: string
  lesson_id?: string
}

export interface Course {
  _id: string
  title: string
  sub_title?: string
  tumbnail_image: Upload
  sample_media: SampleMedia[]
  price: number
  member: CourseMember[]
  max_member_accept: number
  course_language?: string
  course_duration?: number
  course_type: 'HOZORI' | 'OFFLINE'
  course_subject_header?: number
  educational_level?: number
  is_have_licence: boolean
  course_views?: number
  score?: number
  course_category?: CourseCategory
  coach_id: string
  course_objects: CourseObject[]
  course_status: boolean
  slug?: string
  course_expire: boolean
  createdAt: string
  updatedAt: string
}

export interface CourseResponse {
  courses: Course[]
  count: number
}

export interface CourseCategoryResponse {
  categories: CourseCategory[]
  count: number
}

// Category Type (with subcategories populated)
interface Category {
  _id: ObjectId
  name: string
  isRoot: boolean
  subCategories: ObjectId[] // Array of subcategory IDs
  subCategoriesDetails: any // Populated subcategories
  createdAt: ISOString
  updatedAt: ISOString
  __v: number
  id: ObjectId // Duplicate of _id for some APIs
}
