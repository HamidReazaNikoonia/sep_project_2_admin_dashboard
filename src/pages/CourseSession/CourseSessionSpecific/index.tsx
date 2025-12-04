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

import { RichTextReadOnly } from 'mui-tiptap'
import he from 'he';
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
import CategoryTreeChips from '@/components/CategoryTreeChips'
import useExtensions from '@/components/TextEditor/useExtensions'
import CourseDetailsPreview from '@/components/CourseDetailsPreview';
const label = { inputProps: { 'aria-label': 'Switch Course Status' } }

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const CourseSessionSpecific = () => {
  const extensions = useExtensions({
    placeholder: 'Add your own content here...',
  })
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
      if (data?.results[0]) {
        setChecked(data?.results[0]?.course_status)
      }
    }
  }, [data])

  const handleFileDownload = (fileName: string) => {
    const fileUrl = `${SERVER_FILE}/${fileName}`
    window.open(fileUrl, '_blank')
  }

  const course = data?.results[0]

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
        <div className="flex flex-col md:flex-row w-auto  justify-around   ">
          {/* <Link to={`/courses/${course_id}/edit`}>
            <Button endIcon={<EditIcon />} variant="contained" color="warning">
              ویرایش دوره&nbsp;&nbsp;
            </Button>
          </Link> */}

          <div className='flex gap-2'>
            <Link to={`/courses-sessions/${course_id}/assign-coach/`}>
              <Button
                endIcon={<AddCircleOutline />}
                variant="contained"
                color="info"
              >
                افزودن کلاس&nbsp;&nbsp;
              </Button>
            </Link>

            <Link to={`/courses-sessions/${course_id}/edit`}>
              <Button
                endIcon={<EditIcon />}
                variant="contained"
                color="warning"
              >
                ویرایش دوره&nbsp;&nbsp;
              </Button>
            </Link>
          </div>
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
                  <Typography fontWeight={600}>{course.title}</Typography>
                </Box>
              </Grid>

              {course.sub_title && (
                <Grid size={12}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      زیرعنوان
                    </Typography>
                    <Typography fontWeight={600}>{course.sub_title}</Typography>
                  </Box>
                </Grid>
              )}

              {/* <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    نوع دوره
                  </Typography>
                  <Typography fontWeight={600}>
                    {course.course_type === 'HOZORI' ? 'حضوری' : 'آنلاین'}
                  </Typography>
                </Box>
              </Grid> */}

              {/* <Grid size={6}>
                <Box sx={{ maxWidth: '100px' }}>
                  <Typography
                    sx={{ paddingBottom: '8px' }}
                    variant="subtitle2"
                    color="textSecondary"
                  >
                    دسته‌بندی
                  </Typography>

                  {Array.isArray(course?.course_session_category) &&
                    course.course_session_category?.length !== 0 &&
                    course.course_session_category.map((category) => (
                      <div className="bg-yellow-300 px-4 rounded-3xl mb-1.5 py-1 font-semibold">
                        {category.name || '-'}
                      </div>
                    ))}
                </Box>
              </Grid> */}

              {/* <Grid size={6}>
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
              </Grid> */}

              {/* <Grid size={3}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    زبان دوره
                  </Typography>
                  <Typography>{course.course_language || '-'}</Typography>
                </Box>
              </Grid> */}

              {/* <Grid size={3}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    زمان دوره
                  </Typography>
                  <Typography>{course.course_duration || '-'}</Typography>
                </Box>
              </Grid> */}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Status and Coach */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledPaper sx={{ p: 3, minHeight: { xs: 'auto', md: '318px' } }}>
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="h6" gutterBottom>
                  مدرس دوره
                </Typography>
                <div className="flex w-full">
                  <div className="flex mr-2">
                    {Array.isArray(course.coaches) &&
                      course.coaches?.length === 0 && (
                        <div className="p-4">مدرس ثبت نشده است</div>
                      )}
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

        {/* Category */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              دسته‌بندی
            </Typography>
            <CategoryTreeChips categories={course?.course_session_category || []} />
          </StyledPaper>
        </Grid>

        {/* Description */}
        <Grid size={12}>
          <StyledPaper sx={{ p: { xs: 0, md: 4 } }}>
            <Typography sx={{ paddingTop: '15px' }} variant="h6" gutterBottom>
              توضیحات
            </Typography>

            <div
              className="w-full px-2 md:px-4 py-4 flex flex-wrap leading-8"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {course.description}
            </div>
          </StyledPaper>
        </Grid>

        {/* Long Description */}
        {/* <Grid size={12}>
          <StyledPaper sx={{ p: { xs: 0, md: 4 } }}>
            <Typography sx={{ paddingTop: '15px' }} variant="h6" gutterBottom>
              توضیحات کامل
            </Typography>

            {course?.description_long && (
              <div
                className="w-full px-2 md:px-4 py-4 flex flex-wrap leading-8"

              >

                <div className="w-full border-3 border-gray-300 border-dashed px-4 py-6 ">
                  <RichTextReadOnly
                    content={he.decode(course?.description_long || '')}
                    extensions={extensions}
                  />
                </div>
              </div>
            )}


          </StyledPaper>
        </Grid> */}


        {/* Course Details */}
        <Grid size={12}>
          <StyledPaper sx={{ p: { xs: 0, md: 4 } }}>
            <Typography sx={{ paddingTop: '15px' }} variant="h6" gutterBottom>
              جزئیات دوره
            </Typography>

            <div className="w-full px-2 md:px-4 py-4 flex flex-wrap leading-8"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >

              <Grid size={12}>
                <CourseDetailsPreview
                  details={course.details}
                  isPreview={true}
                />
              </Grid>

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
              {course ? (
                <ScheduleCoachTimeView courseId={course._id} />
              ) : (
                <div>اطلاعاتی وجود ندارد</div>
              )}
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Preview Media */}
        {/* Preview Media */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              ویدیو و تصاویر پیش‌نمایش دوره
            </Typography>

            {course.preview_media ? (
              <Grid container spacing={3}>
                {/* Video Preview */}
                {course.preview_media.video_file && (
                  <Grid size={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        ویدیو پیش‌نمایش
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <video
                          src={`${SERVER_FILE}/${course.preview_media.video_file.file_name}`}
                          controls
                          style={{
                            width: '100%',
                            maxWidth: '800px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          فایل: {course.preview_media.video_file.file_name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Desktop Image Preview */}
                {course.preview_media.preview_image_desktop && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        تصویر پیش‌نمایش دسکتاپ
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <Box
                          component="img"
                          src={`${SERVER_FILE}/${course.preview_media.preview_image_desktop.file_name}`}
                          alt="Desktop Preview"
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '400px',
                            objectFit: 'contain',
                            borderRadius: 1,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          فایل: {course.preview_media.preview_image_desktop.file_name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Mobile Image Preview */}
                {course.preview_media.preview_image_mobile && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        تصویر پیش‌نمایش موبایل
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          component="img"
                          src={`${SERVER_FILE}/${course.preview_media.preview_image_mobile.file_name}`}
                          alt="Mobile Preview"
                          sx={{
                            maxWidth: '300px',
                            width: '100%',
                            height: 'auto',
                            maxHeight: '500px',
                            objectFit: 'contain',
                            borderRadius: 1,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                      >
                        فایل: {course.preview_media.preview_image_mobile.file_name}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* No Preview Media Message */}
                {!course.preview_media.video_file &&
                  !course.preview_media.preview_image_desktop &&
                  !course.preview_media.preview_image_mobile && (
                    <Grid size={12}>
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: '#f9f9f9',
                          borderRadius: 1,
                          border: '1px dashed #ccc',
                        }}
                      >
                        <Typography color="text.secondary">
                          هیچ رسانه پیش‌نمایشی برای این دوره ثبت نشده است
                        </Typography>
                      </Box>
                    </Grid>
                  )}
              </Grid>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#f9f9f9',
                  borderRadius: 1,
                  border: '1px dashed #ccc',
                }}
              >
                <Typography color="text.secondary">
                  هیچ رسانه پیش‌نمایشی برای این دوره ثبت نشده است
                </Typography>
              </Box>
            )}
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
