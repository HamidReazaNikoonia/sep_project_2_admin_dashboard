// Base Types
type TimeString = `${number}:${number}`; // HH:MM format
type ISOString = string; // ISO date string format
type ObjectId = string; // Assuming MongoDB ObjectId as string in frontend

// Session Types
interface Session {
  _id?: ObjectId;
  coach: ObjectId;
  date: Date | string; // Can be Date object or ISO string
  startTime: TimeString;
  endTime: TimeString;
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Course Types
interface Course {
  _id: ObjectId;
  title: string;
  description: string;
  courseType: 'online' | 'in-person';
  coaches: ObjectId[];
  sessions: Session[];
  category?: ObjectId;
  price?: number;
  isActive?: boolean;
  course_status?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Add other fields from your model as needed
}

// Request/Response Types
interface CreateCourseRequest {
  title: string;
  description: string;
  courseType: 'online' | 'in-person';
  coaches: ObjectId[];
  sessions: Omit<Session, '_id' | 'status'>[]; // _id and status are added server-side
  category?: ObjectId;
  price?: number;
}

interface UpdateCourseRequest {
  title?: string;
  description?: string;
  courseType?: 'online' | 'in-person';
  coaches?: ObjectId[];
  sessions?: (Session | Omit<Session, '_id'>)[]; // Can include existing or new sessions
  category?: ObjectId;
  price?: number;
  isActive?: boolean;
}

interface CourseResponse extends Omit<Course, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  // You might want to add populated fields here
  coachDetails?: {
    _id: ObjectId;
    name: string;
    avatar?: string;
  }[];
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

type CourseApiResponse = ApiResponse<CourseResponse>;
type CourseListApiResponse = ApiResponse<CourseResponse[]>;


/**
 * Categories and subcategories Types
 */

// Frontend Specific Types
interface CourseFormValues extends Omit<CreateCourseRequest, 'sessions' | 'coaches'> {
  sessions: (Session & { tempId?: string })[];
  selectedCoaches: ObjectId[];
}

// For calendar/schedule views
interface ScheduleSession extends Session {
  title: string;
  coachName: string;
  color?: string; // For calendar display
}

// SubCategory Type
interface SubCategory {
    _id: ObjectId;
    name: string;
    parentCategory: ObjectId;
    createdAt: ISOString;
    updatedAt: ISOString;
    __v: number;
    id: ObjectId; // Duplicate of _id for some APIs
  }
  
  // Category Type (with subcategories populated)
  interface Category {
    _id: ObjectId;
    name: string;
    isRoot: boolean;
    subCategories: ObjectId[]; // Array of subcategory IDs
    subCategoriesDetails: SubCategory[]; // Populated subcategories
    createdAt: ISOString;
    updatedAt: ISOString;
    __v: number;
    id: ObjectId; // Duplicate of _id for some APIs
  }
  
  // API Response Types
  interface CategoryResponse extends Omit<Category, 'subCategoriesDetails'> {
    subCategoriesDetails: SubCategoryResponse[];
  }
  
  interface SubCategoryResponse extends SubCategory {}
  
  // For forms and dropdowns
  interface CategoryOption {
    value: ObjectId;
    label: string;
    isRoot?: boolean;
    subOptions?: SubCategoryOption[];
  }
  
  interface SubCategoryOption {
    value: ObjectId;
    label: string;
    parentId: ObjectId;
  }
  
  // For API responses
  interface CategoryListResponse {
    success: boolean;
    data: CategoryResponse[];
    message?: string;
  }
  
  interface SingleCategoryResponse {
    success: boolean;
    data: CategoryResponse;
    message?: string;
  }

export type {
  ObjectId,
  TimeString,
  Session,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseResponse,
  ApiResponse,
  CourseApiResponse,
  CourseListApiResponse,
  CourseFormValues,
  ScheduleSession,
  SubCategory,
  Category,
  CategoryResponse,
  SubCategoryResponse,
  CategoryOption,
  SubCategoryOption,
  CategoryListResponse,
  SingleCategoryResponse
};