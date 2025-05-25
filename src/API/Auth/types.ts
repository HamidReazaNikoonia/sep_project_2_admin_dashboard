export interface LoginPayload {
    mobile: string;
    password: string;
  }

  export interface LoginWithOtpCodePayload {
    mobile: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
  }