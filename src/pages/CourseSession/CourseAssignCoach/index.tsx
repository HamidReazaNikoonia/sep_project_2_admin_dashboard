import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useCourseSession } from "@/API/CourseSession/courseSession.hook";
import { showToast } from "@/utils/toast";
import { useGetAllCoaches } from "@/API/Coach/coach.hook";
import CoachListAndFilter from "@/components/CoachListAndFilter";


const CourseAssignCoach: React.FC = () => {
    // Get course_id from route params
    const { course_id } = useParams<{ course_id: string }>();
    // Store course_id in state
    const [courseId, setCourseId] = useState<string | null>(null);
    const [selectedCurentCoach, setSelectedCurentCoach] = useState<string | null>(null);
    // Fetch course session data
    const { data, isLoading, isError, error } = useCourseSession(course_id!);


    // Fetch All Coaches Data
    const { data: coachesData, isLoading: coachesIsLoading, isError: coachesIsError } = useGetAllCoaches();



    useEffect(() => {
        if (course_id) {
            setCourseId(course_id);
        }

        if (!course_id) {
            showToast('خطا', 'دوره در دسترس نیست', 'error')
        }
    }, [course_id]);

    if (isLoading) {
        return (
            <Box p={3}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>در حال بارگذاری اطلاعات دوره...</Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box p={3}>
                <Alert severity="error">
                    خطا در دریافت اطلاعات دوره: {error?.message || "خطای ناشناخته"}
                </Alert>
            </Box>
        );
    }

    return (
        <div className="py-8 px-4 min-h-screen">
            <Typography variant="h5" gutterBottom>
                انتساب مربی به دوره
            </Typography>
            <Typography>
                Course ID: {courseId}
            </Typography>

            <div className="flex flex-col w-full bg-white rounded-2xl shadow-md py-12">
                {/* Header */}
                <div></div>

                {/* CoachList and coach time-slot */}
                <div className="flex justify-around items-center flex-row md:flex-col" >

                    {/* CoachList on The Left Side*/}
                    <div className="flex-1">
                        {coachesIsLoading && (
                            <div className="w-full p-12">
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>در حال بارگذاری اطلاعات دوره...</Typography>
                            </div>
                        )}
                        <CoachListAndFilter
                            coaches={coachesData}
                            selectedCurentCoach={selectedCurentCoach}
                            changeCurentCoach={setSelectedCurentCoach}
                        />
                    </div>
                </div>
                {/* Next: Add coach/class selection and time slot form here */}
            </div>
        </div>
    );
};

export default CourseAssignCoach; 