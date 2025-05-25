export interface CoachCourseProgram {
    _id: string;
    name: string;
    description?: string;
    accessLevel: 'free' | 'premium' | 'vip';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CoachCourseProgramResponse {
    programs: CoachCourseProgram[];
    total: number;
    page: number;
    limit: number;
  }

  export interface Coach {
    access_level: string;
    access_level_request: string;
    country: string;
    role: string;
    isEmailVerified: boolean;
    __t: string;
    mobile: string;
    enrolledCourses: Array<{
      is_active: boolean;
      currentSubjectIndex: number;
      _id: string;
      coach_course_program_id: string;
      enrolled_at: string;
      completedSubjects: Array<{
        isCompleted: boolean;
        _id: string;
        subjectId: string;
        order: number;
        expireDate: string;
        examAnswers: Array<{
          _id: string;
          questionId: string;
          selectedOptionId: string;
          isCorrect: boolean;
        }>;
        completedAt?: string;
        examScore?: number;
      }>;
    }>;
    otp?: string;
    id: string;
  }