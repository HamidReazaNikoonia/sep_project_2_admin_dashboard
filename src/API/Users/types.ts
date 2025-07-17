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