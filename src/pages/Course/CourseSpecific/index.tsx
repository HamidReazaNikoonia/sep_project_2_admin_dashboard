import { Edit as EditIcon } from '@mui/icons-material'
import {
  Box,
  Typography,
  Grid2 as Grid,
  CircularProgress,
  Switch,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { useCourse, useUpdateCourse } from '../../../API/Course/course.hook'
import StyledPaper from '../../../components/StyledPaper'
import { showToast } from '../../../utils/toast'
import FolderIcon from '@mui/icons-material/Folder'
import he from 'he';
import Person3Icon from '@mui/icons-material/Person3';
const label = { inputProps: { 'aria-label': 'Switch Course Status' } }

import useExtensions from '@/components/TextEditor/useExtensions'

import {
  LinkBubbleMenu,
  MenuButton,
  RichTextEditor,
  RichTextReadOnly,
  TableBubbleMenu,
  insertImages,
  type RichTextEditorRef,
} from 'mui-tiptap'

import CategoryTreeChips from '../../../components/CategoryTreeChips'

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const CourseSpecific = () => {
  const [checked, setChecked] = useState(false)
  const { course_id } = useParams()
  const { data, isLoading, isError, error } = useCourse(course_id!)
  const updateCourse = useUpdateCourse(course_id!)

  const extensions = useExtensions({
    placeholder: 'Add your own content here...',
  })

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
      setChecked(data?.course_status)
    }
  }, [data])

  const handleFileDownload = (fileName: string) => {
    const fileUrl = `${SERVER_FILE}/${fileName}`
    window.open(fileUrl, '_blank')
  }

  const course = data

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
        <Link to={`/courses/${course_id}/edit`}>
          <Button endIcon={<EditIcon />} variant="contained" color="warning">
            ویرایش دوره&nbsp;&nbsp;
          </Button>
        </Link>
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

              {/* <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    نوع دوره
                  </Typography>
                  <Typography>
                    {course.course_type === 'HOZORI' ? 'حضوری' : 'آفلاین'}
                  </Typography>
                </Box>
              </Grid> */}

              

              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    مدت دوره
                  </Typography>
                  <Typography>
                    {course.course_duration
                      ? `${course.course_duration} دقیقه`
                      : '-'}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={12}>
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
              قیمت دوره
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                قیمت دوره
              </Typography>
              <Typography>
                {course.price_real.toLocaleString()} تومان
              </Typography>
            </Box>

            {course?.price_discount && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  قیمت با تخفیف
                </Typography>
                <Typography>
                  {course.price_discount.toLocaleString()} تومان
                </Typography>
              </Box>
            )}

          </StyledPaper>
        </Grid>

        {/* Status and Coach */}
        <Grid size={{ xs: 12, md: 3 }}>
          <StyledPaper sx={{ p: 3, minHeight: { xs: 'auto', md: '318px' } }}>
            <div className="flex flex-col gap-4">
              <div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {course?.coach_id?.avatar?.file_name ? (
                      <img
                        src={`${SERVER_FILE}/${course.coach_id.avatar.file_name}`}
                        alt="Coach Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <Person3Icon sx={{ color: '#9ca3af', fontSize: 24 }} />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Typography variant="h6" gutterBottom>
                    مدرس دوره
                  </Typography>
                  {course?.coach_id ? (
                    <Typography>{course.coach_id?.first_name + ' ' + course.coach_id?.last_name}</Typography>
                  ) : (
                    <Typography>نامشخص</Typography>
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

        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              دسته‌بندی
            </Typography>
            <CategoryTreeChips categories={course?.course_category || []} />
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
              {course?.description}
            </div>
          </StyledPaper>
        </Grid>

        {/* Long Description */}
        <Grid size={12}>
          <StyledPaper sx={{ p: { xs: 0, md: 4 } }}>
            <Typography sx={{ paddingTop: '15px' }} variant="h6" gutterBottom>
              توضیحات کامل
            </Typography>

            {course?.description_long && (
              <div
              className="w-full px-2 md:px-4 py-4 flex flex-wrap leading-8"
             
            >
              {/* <div
                dangerouslySetInnerHTML={{ __html: he.decode(course?.description_long || '') }}
                className="text-sm leading-7 text-gray-700"
              /> */}
              <div className="w-full border-3 border-gray-300 border-dashed px-4 py-6 ">
                <RichTextReadOnly
                  content={he.decode(course?.description_long || '')}
                  extensions={extensions}
                />
              </div>
            </div>
            )}

            
          </StyledPaper>
        </Grid>

        {/* Course Objects */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              سرفصل‌های دوره{' '}
              <span className="text-sm text-gray-500">
                ( {course.course_objects?.length} سرفصل ){' '}
              </span>
            </Typography>
            <Grid container spacing={2}>
              {course.course_objects.map((object, index) => (
                <Grid sx={{ borderBottom: '2px solid #e0e0e0'}} key={object._id || index} size={12}>
                  <Box sx={{ mb: 2 }}>
                    {/* Course Object Header */}
                    <Box
                      sx={{ 
                        p: 2, 
                        border: '2px solid #e0e0e0', 
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa'
                      }}
                    >
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex-1">
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {object.subject_title}
                          </Typography>
                          {object.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {object.description}
                            </Typography>
                          )}
                          <Typography variant="body2" color="textSecondary">
                            مدت زمان: {object.duration} دقیقه
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ترتیب: {object.order}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            تعداد درس‌ها: {object.lessons?.length || 0} درس
                          </Typography>
                        </div>

                        {/* Course Object Files */}
                        <div className="flex items-center">
                          {object.files && (
                            <Button
                              endIcon={
                                <FolderIcon className="text-gray-400 mr-2" />
                              }
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleFileDownload(object.files.file_name)
                              }
                            >
                              مشاهده فایل سرفصل
                            </Button>
                          )}
                        </div>
                      </div>
                    </Box>

                    {/* Lessons Accordion */}
                    {object.lessons && object.lessons.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Accordion defaultExpanded>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`lessons-content-${object._id || index}`}
                            id={`lessons-header-${object._id || index}`}
                            sx={{
                              backgroundColor: '#f5f5f5',
                              '&:hover': {
                                backgroundColor: '#eeeeee',
                              },
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              درس‌های این سرفصل ({object.lessons.length} درس)
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <Grid container spacing={1} sx={{ p: 2 }}>
                              {object.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, lessonIndex) => (
                                <Grid key={lesson._id || lessonIndex} size={12}>
                                  <Box
                                    sx={{ 
                                      p: 2, 
                                      border: '1px solid #ddd', 
                                      borderRadius: 1,
                                      backgroundColor: '#ffffff',
                                      '&:hover': {
                                        backgroundColor: '#fafafa',
                                      },
                                    }}
                                  >
                                    <div className="flex flex-row justify-between items-start">
                                      <div className="flex-1">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                          درس {lesson.order}: {lesson.title}
                                        </Typography>
                                        {lesson.description && (
                                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                            {lesson.description}
                                          </Typography>
                                        )}
                                        <div className="flex gap-4 mt-1">
                                          <Typography variant="body2" color="textSecondary">
                                            مدت زمان: {lesson.duration} دقیقه
                                          </Typography>
                                          <Typography variant="body2" color="textSecondary">
                                            وضعیت:{' '}
                                            <span className={lesson.status === 'PUBLIC' ? 'text-green-600' : 'text-orange-600'}>
                                              {lesson.status === 'PUBLIC' ? 'رایگان' : 'پرداختی'}
                                            </span>
                                          </Typography>
                                        </div>
                                      </div>

                                      {/* Lesson Files */}
                                      <div className="flex items-center">
                                        {lesson.file && (
                                          <Button
                                            endIcon={
                                              <FolderIcon className="text-gray-400 mr-2" />
                                            }
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                              handleFileDownload(lesson.file.file_name)
                                            }
                                          >
                                            مشاهده فایل درس
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
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
                    <div className="mt-2">
                      {media.file && (
                        <Button
                          endIcon={
                            <FolderIcon className="text-gray-400 mr-2" />
                          }
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleFileDownload(media.file.file_name)
                          }
                        >
                          مشاهده فایل
                        </Button>
                      )}
                    </div>
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
              src={`${SERVER_FILE}/${course.tumbnail_image?.file_name || ''}`}
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

export default CourseSpecific
