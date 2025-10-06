//@ts-nocheck
import React, { useState, useEffect } from 'react'
import { useFieldArray } from 'react-hook-form'
import Editor from '@/components/TextEditor'
import CoachListAndFilter from '@/components/CoachListAndFilter'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Person2 as Person2Icon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router'
import { useGetAllCoaches } from '@/API/Coach/coach.hook'
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCreateCourse } from '../../../API/Course/course.hook'
import StyledPaper from '../../../components/StyledPaper'
import { showToast } from '../../../utils/toast'
import ImageUploader from 'react-images-upload'

import CourseCategorySelection from '../../../components/CourseCategorySelection'

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

// Remove course_objects from validation schema
const schema = yup.object({
  title: yup.string().required('عنوان دوره الزامی است'),
  sub_title: yup.string().required('زیرعنوان دوره الزامی است'),
  description: yup.string().required('توضیحات دوره الزامی است'),
  price_real: yup
    .number()
    .required('قیمت دوره الزامی است')
    .min(10000, 'حداقل قیمت ۱۰,۰۰۰ تومان است'),
  price_discount: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? null : value,
    )
    .optional()
    .min(10000, 'حداقل قیمت ۱۰,۰۰۰ تومان است'),
  course_language: yup.string(),
  course_duration: yup.number().required('مدت دوره الزامی است'),
  slug: yup.string(),
  is_have_licence: yup.boolean().default(false),
  course_status: yup.boolean().default(true),
  sample_media: yup
    .array()
    .of(
      yup.object({
        media_type: yup.string().required('نوع رسانه الزامی است'),
        media_title: yup.string().required('عنوان رسانه الزامی است'),
        url_address: yup.string(),
        file: yup.mixed(),
      }),
    )
    .min(1, 'حداقل یک نمونه رسانه الزامی است'),
})

type FormData = yup.InferType<typeof schema>

interface UploadedFile {
  _id: string
  file_name: string
}

interface FileUploadState {
  [key: string]: {
    uploading: boolean
    error: string | null
    file: File | null
    uploadedFile: UploadedFile | null
  }
}

// Define types for course objects
interface Lesson {
  title: string
  description: string
  order: number
  status: 'PUBLIC' | 'PRIVATE'
  duration: number
  file?: File | null
}

interface CourseObject {
  subject_title: string
  description: string
  order: number
  duration: number
  files?: File | null
  lessons: Lesson[]
}

const NewCourse = () => {
  const navigate = useNavigate()
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [thumbnailUploadedFile, setThumbnailUploadedFile] =
    useState<UploadedFile | null>(null)
  const [fileUploads, setFileUploads] = useState<FileUploadState>({})
  const [categories, setCategories] = useState<any>([])
  const [descriptionLong, setDescriptionLong] = useState('')
  const createCourse = useCreateCourse()

  // coach State
  const [selectedCurentCoach, setSelectedCurentCoach] = useState<string | null>(
    null,
  )

  // Add useState for course_objects
  const [courseObjects, setCourseObjects] = useState<CourseObject[]>([])
  const [courseObjectErrors, setCourseObjectErrors] = useState<{[key: string]: string}>({})



  useEffect(() => {
    if (selectedCurentCoach) {
      showToast('موفق', 'استاد مورد نظر با موفقیت انتخاب شد', 'success')
    }
  }, [selectedCurentCoach])

    // Fetch All Coaches Data
    const {
      data: coachesData,
      isLoading: coachesIsLoading,
      isError: coachesIsError,
    } = useGetAllCoaches()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    control,
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      is_have_licence: false,
      course_status: true,
      sample_media: [{ media_type: '', media_title: '', url_address: '' }],
      price_discount: null,
      price_real: 0,
      description: '',
      course_duration: 0,
      course_language: 'FA',
    },
    mode: 'onChange',
  })

  const {
    fields: sampleMediaFields,
    append: appendSampleMedia,
    remove: removeSampleMedia,
  } = useFieldArray({
    name: 'sample_media',
    control,
  })

  // Course objects management functions
  const addCourseObject = () => {
    const newCourseObject: CourseObject = {
      subject_title: '',
      description: '',
      order: courseObjects.length + 1,
      duration: 0,
      lessons: [],
    }
    setCourseObjects([...courseObjects, newCourseObject])
  }

  const removeCourseObject = (index: number) => {
    const newCourseObjects = courseObjects.filter((_, i) => i !== index)
    setCourseObjects(newCourseObjects)
    
    // Remove related file uploads
    const keysToRemove = Object.keys(fileUploads).filter(key => 
      key.startsWith(`course_object_${index}`) || key.startsWith(`lesson_${index}_`)
    )
    const newFileUploads = { ...fileUploads }
    keysToRemove.forEach(key => delete newFileUploads[key])
    setFileUploads(newFileUploads)
  }

  const updateCourseObject = (index: number, field: keyof CourseObject, value: any) => {
    const newCourseObjects = [...courseObjects]
    newCourseObjects[index] = { ...newCourseObjects[index], [field]: value }
    setCourseObjects(newCourseObjects)
    
    // Clear error for this field
    const errorKey = `courseObject_${index}_${field}`
    if (courseObjectErrors[errorKey]) {
      const newErrors = { ...courseObjectErrors }
      delete newErrors[errorKey]
      setCourseObjectErrors(newErrors)
    }
  }

  const addLesson = (courseObjectIndex: number) => {
    const newLesson: Lesson = {
      title: '',
      description: '',
      order: courseObjects[courseObjectIndex].lessons.length + 1,
      status: 'PRIVATE',
      duration: 0,
    }
    
    const newCourseObjects = [...courseObjects]
    newCourseObjects[courseObjectIndex].lessons.push(newLesson)
    setCourseObjects(newCourseObjects)
  }

  const removeLesson = (courseObjectIndex: number, lessonIndex: number) => {
    const newCourseObjects = [...courseObjects]
    newCourseObjects[courseObjectIndex].lessons = newCourseObjects[courseObjectIndex].lessons.filter((_, i) => i !== lessonIndex)
    setCourseObjects(newCourseObjects)
    
    // Remove related file uploads
    const uploadKey = `lesson_${courseObjectIndex}_${lessonIndex}`
    if (fileUploads[uploadKey]) {
      const newFileUploads = { ...fileUploads }
      delete newFileUploads[uploadKey]
      setFileUploads(newFileUploads)
    }
  }

  const updateLesson = (courseObjectIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const newCourseObjects = [...courseObjects]
    newCourseObjects[courseObjectIndex].lessons[lessonIndex] = {
      ...newCourseObjects[courseObjectIndex].lessons[lessonIndex],
      [field]: value
    }
    setCourseObjects(newCourseObjects)
    
    // Clear error for this field
    const errorKey = `lesson_${courseObjectIndex}_${lessonIndex}_${field}`
    if (courseObjectErrors[errorKey]) {
      const newErrors = { ...courseObjectErrors }
      delete newErrors[errorKey]
      setCourseObjectErrors(newErrors)
    }
  }

  // Validation function for course objects
  const validateCourseObjects = (): boolean => {
    const errors: {[key: string]: string} = {}
    let isValid = true

    if (courseObjects.length === 0) {
      errors['courseObjects_general'] = 'حداقل یک سرفصل الزامی است'
      isValid = false
    }

    courseObjects.forEach((courseObject, index) => {
      if (!courseObject.subject_title.trim()) {
        errors[`courseObject_${index}_subject_title`] = 'عنوان سرفصل الزامی است'
        isValid = false
      }
      if (!courseObject.description.trim()) {
        errors[`courseObject_${index}_description`] = 'توضیحات سرفصل الزامی است'
        isValid = false
      }
      if (!courseObject.order || courseObject.order <= 0) {
        errors[`courseObject_${index}_order`] = 'ترتیب سرفصل الزامی است'
        isValid = false
      }
      if (!courseObject.duration || courseObject.duration <= 0) {
        errors[`courseObject_${index}_duration`] = 'مدت زمان الزامی است'
        isValid = false
      }

      // Check if file is uploaded
      const uploadKey = `course_object_${index}`
      // if (!fileUploads[uploadKey]?.uploadedFile?._id) {
      //   errors[`courseObject_${index}_file`] = `لطفا فایل سرفصل ${index + 1} را آپلود کنید`
      //   isValid = false
      // }

      // Validate lessons
      courseObject.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title.trim()) {
          errors[`lesson_${index}_${lessonIndex}_title`] = 'عنوان درس الزامی است'
          isValid = false
        }
        if (!lesson.description.trim()) {
          errors[`lesson_${index}_${lessonIndex}_description`] = 'توضیحات درس الزامی است'
          isValid = false
        }
        if (!lesson.order || lesson.order <= 0) {
          errors[`lesson_${index}_${lessonIndex}_order`] = 'ترتیب درس الزامی است'
          isValid = false
        }
        if (!lesson.duration || lesson.duration <= 0) {
          errors[`lesson_${index}_${lessonIndex}_duration`] = 'مدت زمان الزامی است'
          isValid = false
        }

        // Check if lesson file is uploaded
        const lessonUploadKey = `lesson_${index}_${lessonIndex}`
        if (!fileUploads[lessonUploadKey]?.uploadedFile?._id) {
          errors[`lesson_${index}_${lessonIndex}_file`] = `لطفا فایل درس ${lessonIndex + 1} را آپلود کنید`
          isValid = false
        }
      })
    })

    setCourseObjectErrors(errors)
    return isValid
  }

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${SERVER_URL}/admin/setting/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.uploadedFile
  }

  const handleThumbnailUpload = async () => {
    if (!thumbnailImage) return

    setThumbnailUploading(true)
    try {
      const uploadedFile = await uploadFile(thumbnailImage)
      setThumbnailUploadedFile(uploadedFile)
      showToast('موفق', 'تصویر دوره با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر دوره', 'error')
    } finally {
      setThumbnailUploading(false)
    }
  }

  const handleFileUpload = async (key: string) => {
    const fileState = fileUploads[key]
    if (!fileState?.file) return

    setFileUploads((prev) => ({
      ...prev,
      [key]: { ...prev[key], uploading: true, error: null },
    }))

    try {
      const uploadedFile = await uploadFile(fileState.file)
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, uploadedFile },
      }))
      showToast('موفق', 'فایل با موفقیت آپلود شد', 'success')
    } catch (error) {
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: 'خطا در آپلود فایل' },
      }))
      showToast('خطا', 'خطا در آپلود فایل', 'error')
    }
  }

  const submitHandlerForPassData = (data) => {
    console.log({ data })
    setDescriptionLong(data)
  }

  const onSubmit = async (data: FormData) => {
    console.log({ k: data })
    console.log('Form is valid:', isValid)
    console.log('Form has errors:', Object.keys(errors).length > 0)

    try {
      console.log('validateCourseObjects', validateCourseObjects())
      // Validate course objects
      if (!validateCourseObjects()) {
        showToast('خطا', 'لطفا خطاهای سرفصل‌ها را برطرف کنید', 'error')
        return
      }

      // Check if thumbnail is uploaded
      if (!thumbnailUploadedFile?._id) {
        showToast('خطا', 'لطفا تصویر دوره را آپلود کنید', 'error')
        return
      }

      // Prepare sample media with uploaded file IDs
      const sampleMediaWithFiles = data.sample_media.map((media, index) => {
        const uploadKey = `sample_media_${index}`
        const uploadedFile = fileUploads[uploadKey]?.uploadedFile
        if (!uploadedFile?._id) {
          throw new Error(`لطفا فایل نمونه ${index + 1} را آپلود کنید`)
        }
        return {
          media_type: media.media_type,
          media_title: media.media_title,
          url_address: media.url_address,
          file: uploadedFile._id,
        }
      })

      // Prepare course objects with uploaded file IDs
      const courseObjectsWithFiles = courseObjects.map((object, index) => {
        const uploadKey = `course_object_${index}`
        const uploadedFile = fileUploads[uploadKey]?.uploadedFile
        // if (!uploadedFile?._id) {
        //   throw new Error(`لطفا فایل سرفصل ${index + 1} را آپلود کنید`)
        // }

        // Process lessons with their files
        const lessonsWithFiles = object.lessons.map((lesson, lessonIndex) => {
          const lessonUploadKey = `lesson_${index}_${lessonIndex}`
          const lessonUploadedFile = fileUploads[lessonUploadKey]?.uploadedFile
          if (!lessonUploadedFile?._id) {
            throw new Error(`لطفا فایل درس ${lessonIndex + 1} از سرفصل ${index + 1} را آپلود کنید`)
          }
          return {
            title: lesson.title,
            description: lesson.description,
            order: lesson.order,
            status: lesson.status,
            duration: lesson.duration,
            file: lessonUploadedFile._id,
          }
        })

        return {
          subject_title: object.subject_title,
          description: object.description,
          order: object.order,
          duration: object.duration,
          files: uploadedFile?._id,
          lessons: lessonsWithFiles,
        }
      })

      // add categories
      if (!categories || categories.length === 0) {
        showToast('خطا', 'حداقل یک دسته بندی انتخاب کنید', 'error')
        return false
      }

      const courseData = {
        ...data,
        ...(categories &&
          categories.length !== 0 && { course_category: categories }),
        ...(selectedCurentCoach && { coach_id: selectedCurentCoach }),
        tumbnail_image: thumbnailUploadedFile._id,
        sample_media: sampleMediaWithFiles,
        course_objects: courseObjectsWithFiles,
        description_long: descriptionLong,
      }

      console.log('Submitting course data:', courseData)

      await createCourse.mutateAsync(courseData)

      showToast('موفق', 'دوره با موفقیت ایجاد شد', 'success')
      navigate('/courses')
    } catch (error) {
      if (error instanceof Error) {
        showToast('خطا', error.message, 'error')
      } else {
        showToast('خطا', 'خطا در ایجاد دوره', 'error')
      }
      console.error('Error submitting form:', error)
    }
  }

  const checkFormErrors = () => {
    console.log('Current errors:', errors)
    console.log('Error fields:', Object.keys(errors))
    console.log('Is form valid:', isValid)

    if (Object.keys(errors).length > 0) {
      showToast('خطا', 'لطفا خطاهای فرم را برطرف کنید', 'error')
    }
  }

  const implementCategories = (data: [string] | any) => {
    setCategories(data)
  }

  return (
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
      <Typography className="pb-4" variant="h4" gutterBottom>
        ایجاد دوره جدید
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                اطلاعات اصلی
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    {...register('title')}
                    fullWidth
                    label="عنوان دوره"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    {...register('sub_title')}
                    fullWidth
                    label="زیرعنوان"
                    error={!!errors.sub_title}
                    helperText={errors.sub_title?.message}
                  />
                </Grid>

                {/* <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('course_type')}
                    select
                    fullWidth
                    label="نوع دوره"
                    error={!!errors.course_type}
                    helperText={errors.course_type?.message}
                  >
                    <MenuItem value="HOZORI">حضوری</MenuItem>
                    <MenuItem value="OFFLINE">آفلاین</MenuItem>
                  </TextField>
                </Grid> */}

                {/* <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('course_category')}
                    select
                    fullWidth
                    label="دسته‌بندی"
                    error={!!errors.course_category}
                    helperText={errors.course_category?.message}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid> */}

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('price_real')}
                    fullWidth
                    type="number"
                    label="قیمت دوره (ریال)"
                    error={!!errors.price_real}
                    helperText={errors.price_real?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('price_discount')}
                    fullWidth
                    type="number"
                    label="قیمت با تخفیف (ریال)"
                    error={!!errors.price_discount}
                    helperText={errors.price_discount?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    {...register('slug')}
                    fullWidth
                    label="کلمه کلیدی"
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                  />
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          {/* Course Details */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                جزئیات دوره
              </Typography>
              <Grid container spacing={2}>
                {/* <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    {...register('max_member_accept')}
                    fullWidth
                    type="number"
                    label="حداکثر ظرفیت"
                    error={!!errors.max_member_accept}
                    helperText={errors.max_member_accept?.message}
                  />
                </Grid> */}

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    {...register('course_duration')}
                    fullWidth
                    type="number"
                    label="مدت دوره (دقیقه)"
                    error={!!errors.course_duration}
                    helperText={errors.course_duration?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    {...register('course_language')}
                    fullWidth
                    label="زبان دوره"
                    error={!!errors.course_language}
                    helperText={errors.course_language?.message}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControlLabel
                    control={<Switch {...register('is_have_licence')} />}
                    label="دارای گواهینامه"
                  />
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>

          {/* Categories Selection */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <div className="w-full flex flex-col">
                <div className="w-full">
                  <CourseCategorySelection
                    passSelectedCategories={implementCategories}
                  />
                </div>
              </div>
            </StyledPaper>
          </Grid>

          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                توضیحات
              </Typography>
              <TextField
                {...register('description')}
                fullWidth
                multiline
                rows={3}
                label="توضیح کوتاه"
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            </StyledPaper>
          </Grid>

          {/* Description Long (WYSIWYG) */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography fontWeight={800} variant="subtitle1" sx={{ mb: 1 }}>
                توضیح کامل
              </Typography>
              <Box sx={{ marginBottom: '60px' }}>
                <Editor submitHandlerForPassData={submitHandlerForPassData} />
              </Box>
            </StyledPaper>
          </Grid>

          {/* Thumbnail Image */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                تصویر دوره
              </Typography>
              <Box>
                <ImageUploader
                  withIcon={true}
                  buttonText="انتخاب تصویر دوره"
                  onChange={(files) => {
                    setThumbnailImage(files[0])
                    setThumbnailUploadedFile(null)
                  }}
                  imgExtension={['.jpg', '.jpeg', '.png']}
                  maxFileSize={5242880}
                  singleImage={true}
                  withPreview={true}
                />
                {thumbnailImage && !thumbnailUploadedFile && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleThumbnailUpload}
                    disabled={thumbnailUploading}
                    startIcon={
                      thumbnailUploading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <UploadIcon className="ml-2" />
                      )
                    }
                    sx={{ mt: 2 }}
                  >
                    آپلود تصویر دوره
                  </Button>
                )}
                {thumbnailUploadedFile && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    تصویر با موفقیت آپلود شد
                  </Alert>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
            <div dir="rtl" className="w-full px-8 md:px-12">
            <div className='mb-1 text-base font-semibold md:text-xl flex items-center gap-2'>
              <Person2Icon className='' />
              <div className='mt-0.5'>انتخاب استاد</div>
            </div>
            <div className='mb-4 text-sm text-gray-500'>
              لطفا استاد مورد نظر خود را انتخاب کنید
            </div>
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
            </StyledPaper>
          </Grid>

          {/* Uploader Sample Media */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">نمونه‌های آموزشی</Typography>
                <Button
                  startIcon={<AddIcon className="ml-2" />}
                  onClick={() =>
                    appendSampleMedia({
                      media_type: '',
                      media_title: '',
                      url_address: '',
                    })
                  }
                >
                  افزودن نمونه
                </Button>
              </Box>

              {sampleMediaFields.map((field, index) => (
                <Box
                  key={field.id}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid #eee',
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        {...register(`sample_media.${index}.media_title`)}
                        fullWidth
                        label="عنوان"
                        error={!!errors.sample_media?.[index]?.media_title}
                        helperText={
                          errors.sample_media?.[index]?.media_title?.message
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        {...register(`sample_media.${index}.media_type`)}
                        select
                        fullWidth
                        label="نوع رسانه"
                        error={!!errors.sample_media?.[index]?.media_type}
                        helperText={
                          errors.sample_media?.[index]?.media_type?.message
                        }
                      >
                        <MenuItem value="VIDEO">ویدیو</MenuItem>
                        <MenuItem value="AUDIO">صوت</MenuItem>
                        <MenuItem value="PDF">PDF</MenuItem>
                        <MenuItem value="IMAGE">تصویر</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        {...register(`sample_media.${index}.url_address`)}
                        fullWidth
                        label="آدرس URL"
                        error={!!errors.sample_media?.[index]?.url_address}
                        helperText={
                          errors.sample_media?.[index]?.url_address?.message
                        }
                      />
                    </Grid>

                    <Grid size={12}>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setValue(`sample_media.${index}.file`, file)

                            setFileUploads((prev) => ({
                              ...prev,
                              [`sample_media_${index}`]: {
                                file,
                                uploading: false,
                                error: null,
                                uploadedFile: null,
                              },
                            }))
                          }
                        }}
                        style={{ display: 'none' }}
                        id={`sample-media-file-${index}`}
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <label htmlFor={`sample-media-file-${index}`}>
                          <Button variant="outlined" component="span">
                            انتخاب فایل
                          </Button>
                        </label>
                        {fileUploads[`sample_media_${index}`]?.file &&
                          !fileUploads[`sample_media_${index}`]
                            ?.uploadedFile && (
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleFileUpload(`sample_media_${index}`)
                              }
                              disabled={
                                fileUploads[`sample_media_${index}`]?.uploading
                              }
                              startIcon={
                                fileUploads[`sample_media_${index}`]
                                  ?.uploading ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <UploadIcon className="ml-2" />
                                )
                              }
                            >
                              آپلود فایل
                            </Button>
                          )}
                        {fileUploads[`sample_media_${index}`]?.uploadedFile && (
                          <Alert severity="success">
                            فایل با موفقیت آپلود شد
                          </Alert>
                        )}
                      </Box>
                    </Grid>

                    <Grid size={12} display="flex" justifyContent="flex-end">
                      <Button
                        color="error"
                        startIcon={<DeleteIcon className="ml-2" />}
                        onClick={() => removeSampleMedia(index)}
                      >
                        حذف
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </StyledPaper>
          </Grid>

          {/* Course Objects Section - Updated with useState */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">سرفصل‌های دوره</Typography>
                <Button
                  startIcon={<AddIcon className="ml-2" />}
                  onClick={addCourseObject}
                >
                  افزودن سرفصل
                </Button>
              </Box>

              {courseObjectErrors['courseObjects_general'] && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {courseObjectErrors['courseObjects_general']}
                </Alert>
              )}

              {courseObjects.map((courseObject, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    px: 4,
                    py: 6,
                    border: '4px solid #b0aabd',
                    borderRadius: 4,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="عنوان سرفصل"
                        value={courseObject.subject_title}
                        onChange={(e) => updateCourseObject(index, 'subject_title', e.target.value)}
                        error={!!courseObjectErrors[`courseObject_${index}_subject_title`]}
                        helperText={courseObjectErrors[`courseObject_${index}_subject_title`]}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="توضیحات سرفصل"
                        value={courseObject.description}
                        onChange={(e) => updateCourseObject(index, 'description', e.target.value)}
                        error={!!courseObjectErrors[`courseObject_${index}_description`]}
                        helperText={courseObjectErrors[`courseObject_${index}_description`]}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="ترتیب"
                        value={courseObject.order}
                        onChange={(e) => updateCourseObject(index, 'order', parseInt(e.target.value) || 0)}
                        error={!!courseObjectErrors[`courseObject_${index}_order`]}
                        helperText={courseObjectErrors[`courseObject_${index}_order`]}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="مدت زمان (دقیقه)"
                        value={courseObject.duration}
                        onChange={(e) => updateCourseObject(index, 'duration', parseInt(e.target.value) || 0)}
                        error={!!courseObjectErrors[`courseObject_${index}_duration`]}
                        helperText={courseObjectErrors[`courseObject_${index}_duration`]}
                      />
                    </Grid>

                    <Grid size={12}>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            updateCourseObject(index, 'files', file)

                            setFileUploads((prev) => ({
                              ...prev,
                              [`course_object_${index}`]: {
                                file,
                                uploading: false,
                                error: null,
                                uploadedFile: null,
                              },
                            }))
                          }
                        }}
                        style={{ display: 'none' }}
                        id={`course-object-file-${index}`}
                      />
                      <Box display="flex" alignItems="center" gap={2}>
                        <label htmlFor={`course-object-file-${index}`}>
                          <Button variant="outlined" component="span">
                            انتخاب فایل
                          </Button>
                        </label>
                        {fileUploads[`course_object_${index}`]?.file &&
                          !fileUploads[`course_object_${index}`]
                            ?.uploadedFile && (
                            <Button
                              variant="contained"
                              onClick={() =>
                                handleFileUpload(`course_object_${index}`)
                              }
                              disabled={
                                fileUploads[`course_object_${index}`]?.uploading
                              }
                              startIcon={
                                fileUploads[`course_object_${index}`]
                                  ?.uploading ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <UploadIcon className="ml-2" />
                                )
                              }
                            >
                              آپلود فایل
                            </Button>
                          )}
                        {fileUploads[`course_object_${index}`]
                          ?.uploadedFile && (
                          <Alert severity="success">
                            فایل با موفقیت آپلود شد
                          </Alert>
                        )}
                        {courseObjectErrors[`courseObject_${index}_file`] && (
                          <Alert severity="error">
                            {courseObjectErrors[`courseObject_${index}_file`]}
                          </Alert>
                        )}
                      </Box>
                    </Grid>

                    {/* Lessons Section */}
                    <Grid size={12} sx={{ mt: 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="subtitle1">درس‌های این سرفصل</Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon className="ml-2" />}
                          onClick={() => addLesson(index)}
                        >
                          افزودن درس
                        </Button>
                      </Box>

                      {courseObject.lessons.map((lesson, lessonIndex) => (
                        <Box
                          key={lessonIndex}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: '1px dashed #ccc',
                            borderRadius: 1,
                            bgcolor: '#f9f9f9',
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="عنوان درس"
                                value={lesson.title}
                                onChange={(e) => updateLesson(index, lessonIndex, 'title', e.target.value)}
                                error={!!courseObjectErrors[`lesson_${index}_${lessonIndex}_title`]}
                                helperText={courseObjectErrors[`lesson_${index}_${lessonIndex}_title`]}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="توضیحات درس"
                                value={lesson.description}
                                onChange={(e) => updateLesson(index, lessonIndex, 'description', e.target.value)}
                                error={!!courseObjectErrors[`lesson_${index}_${lessonIndex}_description`]}
                                helperText={courseObjectErrors[`lesson_${index}_${lessonIndex}_description`]}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                type="number"
                                label="ترتیب"
                                value={lesson.order}
                                onChange={(e) => updateLesson(index, lessonIndex, 'order', parseInt(e.target.value) || 0)}
                                error={!!courseObjectErrors[`lesson_${index}_${lessonIndex}_order`]}
                                helperText={courseObjectErrors[`lesson_${index}_${lessonIndex}_order`]}
                              />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                              <TextField
                                select
                                fullWidth
                                label="وضعیت"
                                value={lesson.status}
                                onChange={(e) => updateLesson(index, lessonIndex, 'status', e.target.value as 'PUBLIC' | 'PRIVATE')}
                                error={!!courseObjectErrors[`lesson_${index}_${lessonIndex}_status`]}
                                helperText={courseObjectErrors[`lesson_${index}_${lessonIndex}_status`]}
                              >
                                <MenuItem value="PUBLIC">عمومی</MenuItem>
                                <MenuItem value="PRIVATE">خصوصی</MenuItem>
                              </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                type="number"
                                label="مدت زمان (دقیقه)"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(index, lessonIndex, 'duration', parseInt(e.target.value) || 0)}
                                error={!!courseObjectErrors[`lesson_${index}_${lessonIndex}_duration`]}
                                helperText={courseObjectErrors[`lesson_${index}_${lessonIndex}_duration`]}
                              />
                            </Grid>

                            <Grid size={12}>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    updateLesson(index, lessonIndex, 'file', file)

                                    setFileUploads((prev) => ({
                                      ...prev,
                                      [`lesson_${index}_${lessonIndex}`]: {
                                        file,
                                        uploading: false,
                                        error: null,
                                        uploadedFile: null,
                                      },
                                    }))
                                  }
                                }}
                                style={{ display: 'none' }}
                                id={`lesson-file-${index}-${lessonIndex}`}
                              />
                              <Box display="flex" alignItems="center" gap={2}>
                                <label htmlFor={`lesson-file-${index}-${lessonIndex}`}>
                                  <Button variant="outlined" component="span" size="small">
                                    انتخاب فایل
                                  </Button>
                                </label>
                                {fileUploads[`lesson_${index}_${lessonIndex}`]?.file &&
                                  !fileUploads[`lesson_${index}_${lessonIndex}`]
                                    ?.uploadedFile && (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() =>
                                        handleFileUpload(`lesson_${index}_${lessonIndex}`)
                                      }
                                      disabled={
                                        fileUploads[`lesson_${index}_${lessonIndex}`]?.uploading
                                      }
                                      startIcon={
                                        fileUploads[`lesson_${index}_${lessonIndex}`]
                                          ?.uploading ? (
                                          <CircularProgress size={16} />
                                        ) : (
                                          <UploadIcon className="ml-2" />
                                        )
                                      }
                                    >
                                      آپلود فایل
                                    </Button>
                                  )}
                                {fileUploads[`lesson_${index}_${lessonIndex}`]
                                  ?.uploadedFile && (
                                  <Alert severity="success" sx={{ py: 0 }}>
                                    فایل با موفقیت آپلود شد
                                  </Alert>
                                )}
                                {courseObjectErrors[`lesson_${index}_${lessonIndex}_file`] && (
                                  <Alert severity="error" sx={{ py: 0 }}>
                                    {courseObjectErrors[`lesson_${index}_${lessonIndex}_file`]}
                                  </Alert>
                                )}
                              </Box>
                            </Grid>

                            <Grid size={12} display="flex" justifyContent="center" sx={{ mt: 2, borderRadius: 1 }}>
                              <Button
                                color="error"
                                sx={{ border: '1px solid #ccc', borderRadius: 1, width: '200px' }}
                                size="small"
                                startIcon={<DeleteIcon className="ml-2" />}
                                onClick={() => removeLesson(index, lessonIndex)}
                              >
                                حذف درس
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Grid>

                    <Grid size={12} display="flex" justifyContent="flex-start" sx={{ mt: 2, borderRadius: 1 }}>
                      <Button
                        color="error"
                        sx={{ border: '1px solid #ccc', borderRadius: 1, width: '200px' }}
                        startIcon={<DeleteIcon className="ml-2" />}
                        onClick={() => removeCourseObject(index)}
                      >
                        حذف سرفصل
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </StyledPaper>
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          ایجاد دوره
        </Button>

        {/* Debug section - you can remove this in production */}
        {/* <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2">وضعیت فرم:</Typography>
          <Typography variant="body2">معتبر: {isValid ? 'بله' : 'خیر'}</Typography>
          <Typography variant="body2">تغییر یافته: {isDirty ? 'بله' : 'خیر'}</Typography>
          <Typography variant="body2">تعداد خطاها: {Object.keys(errors).length}</Typography>
          {Object.keys(errors).length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">خطاها:</Typography>
              <pre>{JSON.stringify(errors, null, 2)}</pre>
            </Box>
          )}
        </Box> */}
      </form>

      <Button onClick={checkFormErrors}>بررسی خطاهای فرم</Button>
    </Box>
  )
}

export default NewCourse
