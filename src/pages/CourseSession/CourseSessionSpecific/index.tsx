import { Edit as EditIcon, AddCircleOutline } from '@mui/icons-material'
import {
  Box,
  Typography,
  Grid2 as Grid,
  CircularProgress,
  Switch,
  Button,
  Avatar,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
// import { useCourse, useUpdateCourse } from '../../../API/Course/course.hook';
import StyledPaper from '../../../components/StyledPaper'
import { showToast } from '../../../utils/toast'
import FolderIcon from '@mui/icons-material/Folder'
import {
  useCourseSession,
  useUpdateCourseSession,
} from '@/API/CourseSession/courseSession.hook'
import ScheduleCoachTimeView from '@/components/ScheduleCoachTimeView'
const label = { inputProps: { 'aria-label': 'Switch Course Status' } }

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const CourseSessionSpecific = () => {
  const [checked, setChecked] = useState(false)
  const { course_id } = useParams()
  const { data, isLoading, isError, error } = useCourseSession(course_id!)
  const updateCourse = useUpdateCourseSession(course_id!)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.checked
    setChecked(newStatus)

    try {
      await updateCourse.mutateAsync({
        course_status: newStatus,
      })
      showToast('بروزرسانی موفق', 'وضعیت دوره با موفقیت تغییر کرد', 'success')
    } catch (error) {
      setChecked(!newStatus)
      showToast('خطا', 'خطا در بروزرسانی وضعیت دوره', 'error')
      console.error('Error updating course status:', error)
    }
  }

  useEffect(() => {
    if (data) {
      if (data?.data?.results[0]) {
        setChecked(data?.data?.results[0]?.course_status)
      }
    }
  }, [data])

  const handleFileDownload = (fileName: string) => {
    const fileUrl = `${SERVER_FILE}/${fileName}`
    window.open(fileUrl, '_blank')
  }

  const course = data?.data?.results[0]

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading course details: {error?.message || 'Unknown error'}
        </Typography>
      </Box>
    )
  }

  if (!course) {
    return (
      <Box p={3}>
        <Typography>دوره یافت نشد</Typography>
      </Box>
    )
  }

  return (
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
      <div className="flex justify-between items-center mb-4">
        <Typography className="text-right" variant="h4" gutterBottom>
          جزئیات دوره
        </Typography>
        <div className="flex flex-col md:flex-row w-auto md:w-80 justify-around space-y-3 md:space-y-0  ">
          <Link to={`/courses/${course_id}/edit`}>
            <Button endIcon={<EditIcon />} variant="contained" color="warning">
              ویرایش دوره&nbsp;&nbsp;
            </Button>
          </Link>

          <Link to={`/courses-sessions/${course_id}/assign-coach/`}>
            <Button
              endIcon={<AddCircleOutline />}
              variant="contained"
              color="info"
            >
              افزودن استاد&nbsp;&nbsp;
            </Button>
          </Link>
        </div>
      </div>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              اطلاعات اصلی
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    عنوان دوره
                  </Typography>
                  <Typography>{course.title}</Typography>
                </Box>
              </Grid>

              {course.sub_title && (
                <Grid size={12}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      زیرعنوان
                    </Typography>
                    <Typography>{course.sub_title}</Typography>
                  </Box>
                </Grid>
              )}

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    نوع دوره
                  </Typography>
                  <Typography>
                    {course.course_type === 'HOZORI' ? 'حضوری' : 'آنلاین'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    دسته‌بندی
                  </Typography>
                  <Typography>
                    {course.course_session_category?.name || '-'}
                  </Typography>

                  <Typography>
                    {course.course_session_sub_category?.name || '-'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    مدت دوره
                  </Typography>
                  <Typography>
                    {course.course_duration
                      ? `${course.course_duration} ساعت`
                      : '-'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    زبان دوره
                  </Typography>
                  <Typography>{course.course_language || '-'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Price and Capacity */}
        <Grid size={{ xs: 12, md: 3 }}>
          <StyledPaper sx={{ p: 3, minHeight: { xs: 'auto', md: '318px' } }}>
            <Typography variant="h6" gutterBottom>
              قیمت و ظرفیت
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                قیمت دوره
              </Typography>
              <Typography>{course.price.toLocaleString()} تومان</Typography>
            </Box>
            {/* Course Max Student No */}
            {/* <Box mt={2}>
                            <Typography variant="subtitle2" color="textSecondary">
                                ظرفیت دوره
                            </Typography>
                            <Typography>
                                {course.member.length} / {course.max_member_accept} نفر
                            </Typography>
                        </Box> */}
          </StyledPaper>
        </Grid>

        {/* Status and Coach */}
        <Grid size={{ xs: 12, md: 3 }}>
          <StyledPaper sx={{ p: 3, minHeight: { xs: 'auto', md: '318px' } }}>
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="h6" gutterBottom>
                  مدرس دوره
                </Typography>
                <div className="flex w-full">
                  <div className="flex mr-2">
                    {Array.isArray(course.coaches) &&
                      course.coaches.length !== 0 &&
                      course.coaches.map((coach) => (
                        <div className="pb-5">
                          {coach?.avatar_img ? (
                            <img
                              className="border-2 border-white rounded-full h-12 w-12 -mr-4"
                              src={`${SERVER_FILE}/${course.avatar_img?.file_name || ''}`}
                              alt={course.avatar_img?.file_name}
                            />
                          ) : (
                            <Avatar
                              alt={`${coach.first_name} ${coach.last_name}`}
                              sx={{
                                bgcolor: stringToColor(
                                  coach.first_name + ' ' + coach.last_name,
                                ),
                                fontSize: '14px',
                                marginRight: '-8px',
                                border: '2px solid white',
                                width: '48px',
                                height: '48px',
                              }}
                            >
                              {coach.first_name && coach.first_name.charAt(0)}
                              {coach.last_name && coach.last_name.charAt(0)}
                            </Avatar>
                          )}
                        </div>
                      ))}
                    {/* <img className="border-2 border-white rounded-full h-12 w-12 -mr-4" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                                        <img className="border-2 border-white rounded-full h-12 w-12 -mr-4" src="https://randomuser.me/api/portraits/women/31.jpg" alt="" />
                                        <img className="border-2 border-white rounded-full h-12 w-12 -mr-4" src="https://randomuser.me/api/portraits/men/33.jpg" alt="" />
                                        <img className="border-2 border-white rounded-full h-12 w-12 -mr-4" src="https://randomuser.me/api/portraits/women/32.jpg" alt="" /> */}

                    {/* <span className="flex items-center justify-center bg-white text-sm text-gray-800 font-semibold border-2 border-gray-200 rounded-full h-12 w-12">+999</span> */}
                  </div>
                </div>
                <div>
                  {Array.isArray(course.coaches) &&
                    course.coaches.length !== 0 && (
                      <ul>
                        {course.coaches.map((coach) => (
                          <li>
                            {' '}
                            {coach.first_name} - {coach.last_name}{' '}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between gap-2">
                <Typography variant="h6" gutterBottom>
                  وضعیت
                </Typography>
                <div className="flex items-center gap-2">
                  <div className="text-sm">{checked ? 'فعال' : 'غیر فعال'}</div>
                  <Switch
                    {...label}
                    size="medium"
                    color="warning"
                    checked={checked}
                    onChange={handleChange}
                    disabled={updateCourse.isPending}
                  />
                </div>
              </div>
            </div>
          </StyledPaper>
        </Grid>

        {/* Course Schedule Coaches */}
        <Grid size={12}>
          <StyledPaper sx={{ p: { xs: 0, md: 4 } }}>
            <Typography variant="h6" gutterBottom>
              اساتید و زمان کلاس ها
            </Typography>
            <Grid container spacing={2}>
              {course.coaches && course.sessions ? (
                <ScheduleCoachTimeView
                  sessions={course.sessions}
                  coaches={course.coaches}
                />
              ) : (
                <div>اطلاعاتی وجود ندارد</div>
              )}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Sample Media */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              نمونه‌های آموزشی
            </Typography>
            <Grid container spacing={2}>
              {course.sample_media.map((media, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1">
                      {media.media_title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      نوع: {media.media_type}
                    </Typography>
                    {media.url_address && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={media.url_address}
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        مشاهده
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Thumbnail Image */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              تصویر شاخص
            </Typography>
            <Box
              component="img"
              src={`${SERVER_FILE}/${course.tumbnail?.file_name || ''}`}
              alt="Course thumbnail"
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 'auto',
                borderRadius: 1,
                objectFit: 'cover',
              }}
            />
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  )
}

// Helper function to generate avatar color from name
function stringToColor(string: string) {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

export default CourseSessionSpecific
