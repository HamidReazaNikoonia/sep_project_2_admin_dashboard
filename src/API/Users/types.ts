export interface User {
    id: string;
    first_name: string;
    last_name: string;
    mobile: string;
    role: string;
  }
  
  export interface UserListResponse {
    results: User[];
    totalResults: number;
    page: number;
    limit: number;
  }
  
  export interface UserResponse {
    avatar: any;
    personal_img: any;
    address: string;
    job_title: string;
    tel: string;
    description: string;
    description_long: string;
    tags: any;
    featured: any;
    _id: any;
    isVerified: string;
    student_id: string;
    wallet_amount: any;
    id: any;
    referral_code: string;
    student_code: string;
    courseSessionsProgram: boolean;
    mariage_status: any;
    birth_date: string;
    province: string;
    father_name: string;
    age: string;
    gender: string;
    city: string;
    country: string;
    state: string;
    nationalId: string;
    isNationalIdVerified: any;
    national_card_images: boolean;
    first_name?: string;
    last_name?: string;
    email?: string;
    mobile: string;
    role: string;
    user: User;
  }