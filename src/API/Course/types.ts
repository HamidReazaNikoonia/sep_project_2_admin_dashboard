

interface Upload {
  _id: string;
  file_name: string;
}

export interface CourseCategory {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SampleMedia {
  media_type: string;
  media_title: string;
  url_address: string;
  file?: Upload;
}

export interface CourseMember {
  user: string;
}

export interface CourseObject {
  subject_title: string;
  status: 'PUBLIC' | 'PRIVATE';
  duration: number;
  files: Upload;
}

export interface Course {
  _id: string;
  title: string;
  sub_title?: string;
  tumbnail_image: Upload;
  sample_media: SampleMedia[];
  price: number;
  member: CourseMember[];
  max_member_accept: number;
  course_language?: string;
  course_duration?: number;
  course_type: 'HOZORI' | 'OFFLINE';
  course_subject_header?: number;
  educational_level?: number;
  is_have_licence: boolean;
  course_views?: number;
  score?: number;
  course_category?: CourseCategory;
  coach_id: string;
  course_objects: CourseObject[];
  course_status: boolean;
  slug?: string;
  course_expire: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  courses: Course[];
  count: number;
}

export interface CourseCategoryResponse {
  categories: CourseCategory[];
  count: number;
}