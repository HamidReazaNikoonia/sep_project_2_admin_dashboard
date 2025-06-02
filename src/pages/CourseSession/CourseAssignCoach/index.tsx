import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid2 as Grid,
  TextField,
  MenuItem,
} from '@mui/material'
import {
  useCourseSession,
  useCourseSessionClasses,
} from '@/API/CourseSession/courseSession.hook'
import { showToast } from '@/utils/toast'
import { useGetAllCoaches } from '@/API/Coach/coach.hook'
import CoachListAndFilter from '@/components/CoachListAndFilter'
import CustomDataPickerCalendar from '@/components/CustomDataPickerCalendar'
import momentJalaali from 'moment-jalaali'
import clsx from 'clsx'
// import * as momentJalaali from 'moment-jalaali';

const CourseAssignCoach: React.FC = () => {
  // Get course_id from route params
  const { course_id } = useParams<{ course_id: string }>()
  // Store course_id in state
  const [courseId, setCourseId] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [selectedCurentCoach, setSelectedCurentCoach] = useState<string | null>(
    null,
  )

  // Errors State
  const [errors, setErrors] = useState({
    course_type: false,
  })
  // Reservation time state
  const [selectedDateState, setSelectedDateState] = useState(
    momentJalaali().locale('fa').format('jYYYY/jM/jD'),
  )
  const [timeSlotItem, settimeSlotItem] = useState(null)
  // Fetch course session data
  const { data, isLoading, isError, error } = useCourseSession(course_id!)

  // Fetch All Coaches Data
  const {
    data: coachesData,
    isLoading: coachesIsLoading,
    isError: coachesIsError,
  } = useGetAllCoaches()

  // fetch All Classes
  const {
    data: ClassesData,
    isLoading: ClassesIsLoading,
    isError: ClassesIsError,
  } = useCourseSessionClasses()

  const dateChangeHandler = (date) => {
    setSelectedDateState(date)
    console.log('date', date)
  }

  const timeSlotChangeHandler = (slot) => {
    settimeSlotItem(slot)
    console.log('slot', slot)
  }

  useEffect(() => {
    if (course_id) {
      setCourseId(course_id)
    }

    if (!course_id) {
      showToast('خطا', 'دوره در دسترس نیست', 'error')
    }
  }, [course_id])

  if (isLoading) {
    return (
      <Box p={3}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>در حال بارگذاری اطلاعات دوره...</Typography>
      </Box>
    )
  }

  if (isError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          خطا در دریافت اطلاعات دوره: {error?.message || 'خطای ناشناخته'}
        </Alert>
      </Box>
    )
  }

  return (
    <div dir="rtl" className="py-8 px-4 min-h-screen">
      <Typography fontWeight={600} variant="h5" gutterBottom>
        انتساب مربی به دوره
      </Typography>
      <Typography dir="ltr">Course ID: {courseId}</Typography>

      <div className="flex flex-col w-full bg-white rounded-2xl shadow-md py-12">
        {/* Header */}
        <div></div>

        {/* CoachList and coach time-slot */}
        <div className="flex justify-around items-center flex-col">
          {/* CoachList*/}
          <div dir="rtl" className="w-full px-8 md:px-12">
            {coachesIsLoading && (
              <div className="w-full p-12">
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>
                  در حال بارگذاری اطلاعات دوره...
                </Typography>
              </div>
            )}
            <CoachListAndFilter
              coaches={coachesData}
              selectedCurentCoach={selectedCurentCoach}
              changeCurentCoach={setSelectedCurentCoach}
            />
          </div>

          {/* Select Specific Class */}
          {/* Select Specific Class */}
          <div className="w-full px-8 md:px-12 my-8 border-t py-8">
            <h2 className="font-semibold text-lg mb-4">انتخاب کلاس</h2>
            <div className="flex flex-wrap gap-4">
              {ClassesIsLoading && (
                <div className="w-full p-8 flex justify-center">
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>
                    در حال بارگذاری کلاس‌ها...
                  </Typography>
                </div>
              )}
              {ClassesIsError && (
                <Alert severity="error" className="w-full">
                  خطا در دریافت اطلاعات کلاس‌ها
                </Alert>
              )}
              {ClassesData && ClassesData.length > 0
                ? ClassesData.map((cls) => (
                    <div
                      key={cls._id}
                      className={`cursor-pointer border rounded-lg p-4 flex-1 min-w-[200px] max-w-xs transition-all
                                        ${
                                          selectedClassId === cls._id
                                            ? 'border-blue-600 bg-blue-50 shadow-lg'
                                            : 'border-gray-200 bg-white hover:border-blue-400'
                                        }
                                    `}
                      onClick={() => setSelectedClassId(cls._id)}
                    >
                      <h3
                        className={clsx(
                          'font-bold text-base mb-2',
                          cls.class_status === 'ACTIVE'
                            ? 'text-green-800'
                            : 'text-red-600',
                        )}
                      >
                        وضعیت کلاس :{' '}
                        {cls.class_status === 'ACTIVE' ? 'فعال' : 'غیر فعال'}
                      </h3>
                      <h3 className="font-semibold text-sm mb-2">
                        {' '}
                        کلاس : {cls.class_title}
                      </h3>
                      <h3 className="font-semibold text-sm mb-2">
                        ظرفیت : {cls.class_max_student_number} نفر
                      </h3>

                      {/* Add more class info here if needed */}
                      <p className="text-sm text-gray-600">
                        کد کلاس: {cls._id}
                      </p>
                    </div>
                  ))
                : !ClassesIsLoading && <Typography>کلاسی یافت نشد.</Typography>}
            </div>
          </div>

          {/* Coach Time Slot Calendar */}
          {/* Select Time/Date Section */}
          <div
            dir="ltr"
            className="flex w-full flex-col border-y-2 px-8 pt-16 pb-12"
          >
            <h2 className="text-center font-semibold text-lg">
              لطفا تاریخ و ساعت مورد نظر خود را انتخاب کنید
            </h2>

            {/* Calendar Wrapper */}
            <div className="py-14">
              <CustomDataPickerCalendar
                timeSlotChangeHandler={timeSlotChangeHandler}
                dateChangeHandler={dateChangeHandler}
              />
            </div>
          </div>

          {/* Program Form Section */}
          <div
            dir="rtl"
            className="flex flex-col items-start w-full px-12 py-12"
          >
            <h2 className="text-center font-semibold text-lg">
              اطلاعات تکمیلی
            </h2>

            <div className="flex justify-center items-center pt-8">
              {/* Course Type */}
              <div style={{ width: '280px' }}>
                <TextField
                  select
                  fullWidth
                  label="نوع جلسه"
                  error={!!errors.course_type}
                >
                  <MenuItem value="HOZORI">حضوری</MenuItem>
                  <MenuItem value="ONLINE">آنلاین</MenuItem>
                </TextField>
              </div>

              {/* Course Max Member */}
              <div className=""></div>
            </div>
          </div>
        </div>
        {/* Next: Add coach/class selection and time slot form here */}
      </div>
    </div>
  )
}

export default CourseAssignCoach
