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