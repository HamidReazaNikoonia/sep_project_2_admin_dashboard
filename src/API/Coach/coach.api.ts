import  axios from '../axios';
import { CoachCourseProgram, CoachCourseProgramResponse, Coach } from './types';


interface GetCoachesParams {
  page?: number;
  limit?: number;
  q?: string;
}

export const coachAPI = {
  getAllCoaches: async (params?: GetCoachesParams): Promise<Coach[]> => {
    const response = await axios.get('/coach', { params });
    return response.data;
  },
  getCoachById: async (id: string): Promise<Coach> => {
    const response = await axios.get(`/coach/admin/${id}`);
    return response.data;
  },
  getCoachCoursePrograms: async (params?: {
    page?: number;
    limit?: number;
    accessLevel?: string;
  }): Promise<CoachCourseProgramResponse> => {
    const { data } = await axios.get('/admin/setting/set/coach-course-program/set-access-level', { params });
    return data;
  },

  createCoachCourseProgram: async (programData: Partial<CoachCourseProgram>): Promise<{ program: CoachCourseProgram }> => {
    const { data } = await axios.post('/admin/setting/set/coach-course-program/set-access-level', programData);
    return data;
  },


  updateCoachCourseProgram: async (id: string, accessLevel: string): Promise<{ program: CoachCourseProgram }> => {
    const { data } = await axios.patch(`/admin/setting/set/coach-course-program/${id}/access-level`, { accessLevel });
    return data;
  },

  deleteCoachCourseProgram: async (id: string): Promise<void> => {
    await axios.delete(`/admin/setting/set/coach-course-program/set-access-level/${id}`);
  },
};