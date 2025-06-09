import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Grid2 as Grid,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import UploadIcon from '@mui/icons-material/Upload'
import ImageUploader from 'react-images-upload'

import CategorySelection from '@/components/CategorySelection'

// Import hooks for fetching and updating course session
import {
  useCourseSession,
  useUpdateCourseSession,
} from '@/API/CourseSession/courseSession.hook'
import { showToast } from '@/utils/toast'
import Editor from '@/components/TextEditor'
import StyledPaper from '@/components/StyledPaper'

// Types and schema (same as in CreateCourseSession)
interface UploadedFile {
  _id: string
  name: string
  // Add other properties as needed
}

interface FileUploadState {
  [key: string]: {
    file: File
    uploading: boolean
    error: string | null
    uploadedFile: UploadedFile | null
  }
}

interface FormData {
  title: string
  sub_title: string
  description: string
  description_long?: string
  sample_media: {
    media_type: string
    media_title: string
    url_address: string
  }[]
}

const schema = yup.object().shape({
  title: yup.string().required('عنوان جلسه الزامی است'),
  sub_title: yup.string().required('زیرعنوان الزامی است'),
  description: yup.string().required('توضیح کوتاه الزامی است'),
  sample_media: yup.array().of(
    yup.object().shape({
      media_title: yup.string().required('عنوان رسانه الزامی است'),
      media_type: yup.string().required('نوع رسانه الزامی است'),
      url_address: yup.string(),
    }),
  ),
})

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE
const SERVER_URL = process.env.REACT_APP_SERVER_URL

const EditCourseSession: React.FC = () => {
  const navigate = useNavigate()
  const { course_id } = useParams()
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null)
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(
    null,
  )
  const [descriptionLong, setDescriptionLong] = useState('')
  const [fileUploads, setFileUploads] = useState<FileUploadState>({})
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch course session data
  const { data: courseSession, isLoading: isLoadingCourseSession } =
    useCourseSession(course_id || '')

  // API Mutation for updating
  const updateCourseSessionMutation = useUpdateCourseSession(course_id || '')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      sub_title: '',
      description: '',
      sample_media: [],
    },
  })

  const {
    fields: sampleMediaFields,
    append: appendSampleMedia,
    remove: removeSampleMedia,
    replace: replaceSampleMedia,
  } = useFieldArray({
    name: 'sample_media',
    control,
  })

  // Load course session data when it's available
  useEffect(() => {
    if (courseSession && !isLoadingCourseSession) {
      console.log({ courseSession: courseSession.data.results })

      if (courseSession?.data?.results) {
        if (courseSession.data.results[0]) {
          const _courseSessionData = courseSession.data.results[0]

          // ready for update
          // Set form values
          reset({
            title: _courseSessionData.title || '',
            sub_title: _courseSessionData.sub_title || '',
            description: _courseSessionData.description || '',
            sample_media: _courseSessionData.sample_media || [],
          })

          // Set description long
          setDescriptionLong(_courseSessionData.description_long || '')

          // Set categories
          if (_courseSessionData.course_session_category) {
            setCategories(_courseSessionData.course_session_category)
          }

          // Set thumbnail image if available
          if (courseSession.tumbnail) {
            // If the thumbnail is an object with url property
            if (
              typeof _courseSessionData.tumbnail === 'object' &&
              _courseSessionData.tumbnail.url
            ) {
              setThumbnailImageUrl(_courseSessionData.tumbnail.url)
            }
            // If it's just the ID, you might need to construct the URL or handle differently
          }
        }
      }

      setIsLoading(false)
    }
  }, [courseSession, isLoadingCourseSession, reset])

  const submitHandlerForPassData = (data: string) => {
    setDescriptionLong(data)
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
    } catch (error) {
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: 'خطا در آپلود فایل' },
      }))
    }
  }

  const implementCategories = (data: any[]) => {
    setCategories(data)
  }

  const onSubmit = async (data: FormData) => {
    let courseSessionRequestBody: any = {}

    // Form Manual Validation
    if (!descriptionLong) {
      showToast('خطا', ' لطفا توضیحات را کامل کنید', 'error')
      return false
    }

    // add categories
    if (categories && categories.length !== 0) {
      courseSessionRequestBody.course_session_category = categories
    } else {
      showToast('خطا', 'حداقل یک دسته بندی انتخاب کنید', 'error')
      return false
    }

    // Upload new thumbnail if changed
    if (thumbnailImage) {
      const uploadedThumbnailFile = await uploadFile(thumbnailImage)

      if (uploadedThumbnailFile?._id) {
        courseSessionRequestBody.tumbnail = uploadedThumbnailFile?._id
      }
    }

    // Prepare sample media with uploaded file IDs
    const sampleMediaWithFiles = await Promise.all(
      data.sample_media.map(async (media, index) => {
        const uploadKey = `sample_media_${index}`
        const uploadedFile = fileUploads[uploadKey]?.uploadedFile

        // If there's a new file upload for this media
        if (uploadedFile?._id) {
          return {
            media_type: media.media_type,
            media_title: media.media_title,
            url_address: media.url_address,
            file: uploadedFile._id,
          }
        }
        // If using existing file from the course session
        else if (courseSession?.sample_media?.[index]?.file) {
          return {
            media_type: media.media_type,
            media_title: media.media_title,
            url_address: media.url_address,
            file: courseSession.sample_media[index].file,
          }
        }
        // Otherwise throw an error
        else {
          throw new Error(`لطفا فایل نمونه ${index + 1} را آپلود کنید`)
        }
      }),
    )

    courseSessionRequestBody = {
      ...courseSessionRequestBody,
      ...data,
      sample_media: sampleMediaWithFiles,
      description_long: descriptionLong,
    }

    try {
      await updateCourseSessionMutation.mutateAsync(courseSessionRequestBody)
      showToast('موفق', 'جلسه با موفقیت بروزرسانی شد', 'success')
      navigate('/courses-sessions')
    } catch (error) {
      // @ts-expect-error
      if (error instanceof Error && error?.response?.data?.message) {
        // @ts-expect-error
        showToast('خطا', error?.response?.data?.message, 'error')
      } else {
        showToast('خطا', 'خطا در بروزرسانی جلسه', 'error')
      }
      // @ts-expect-error
      console.error('Error submitting form:', error?.response?.data?.message)
    }
  }

  if (isLoading || isLoadingCourseSession) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
      <Typography className="pb-4" variant="h4" gutterBottom>
        ویرایش جلسه دوره
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('title')}
              fullWidth
              label="عنوان جلسه"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          </Grid>
          {/* Sub Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              {...register('sub_title')}
              fullWidth
              label="زیرعنوان"
              error={!!errors.sub_title}
              helperText={errors.sub_title?.message}
            />
          </Grid>
          {/* Description */}
          <Grid size={12}>
            <TextField
              {...register('description')}
              fullWidth
              multiline
              rows={3}
              label="توضیح کوتاه"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>
          {/* Description Long (WYSIWYG) */}
          <Grid size={12}>
            <Typography fontWeight={800} variant="subtitle1" sx={{ mb: 1 }}>
              توضیح کامل
            </Typography>
            <Box sx={{ marginBottom: '60px' }}>
              <Editor
                submitHandlerForPassData={submitHandlerForPassData}
                initialContent={descriptionLong}
              />
            </Box>
          </Grid>
          {/* Thumbnail Image Uploader */}
          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              تصویر جلسه
            </Typography>
            {thumbnailImageUrl && (
              <Box mb={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  تصویر فعلی:
                </Typography>
                <img
                  src={thumbnailImageUrl}
                  alt="thumbnail"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </Box>
            )}
            <ImageUploader
              withIcon={true}
              buttonText="تغییر تصویر جلسه"
              onChange={(files: File[]) => setThumbnailImage(files[0])}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
              singleImage={true}
              withPreview={true}
            />
            {thumbnailImage && (
              <Alert severity="info" sx={{ mt: 1 }}>
                تصویر جدید انتخاب شد: {thumbnailImage.name}
              </Alert>
            )}
          </Grid>

          {/* Categories Selection */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <div className="w-full flex flex-col">
                <div className="w-full">
                  <CategorySelection
                    passSelectedCategories={implementCategories}
                    initialCategories={categories}
                  />
                </div>
              </div>
            </StyledPaper>
          </Grid>

          {/* Sample Media Fields */}
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
                        <MenuItem value="IMAGE">تصویر</MenuItem>
                        <MenuItem value="AUDIO">صوت</MenuItem>
                        <MenuItem value="PDF">PDF</MenuItem>
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
                      {courseSession?.sample_media?.[index]?.file && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          فایل قبلی موجود است
                        </Alert>
                      )}

                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
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
                            {courseSession?.sample_media?.[index]?.file
                              ? 'تغییر فایل'
                              : 'انتخاب فایل'}
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
                                  <CircularProgress
                                    sx={{ marginLeft: '5px' }}
                                    size={20}
                                  />
                                ) : (
                                  <UploadIcon sx={{ marginLeft: '5px' }} />
                                )
                              }
                            >
                              آپلود فایل
                            </Button>
                          )}
                        {fileUploads[`sample_media_${index}`]?.uploadedFile && (
                          <Alert sx={{ marginLeft: '5px' }} severity="success">
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

          {/* Submit Button */}
          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={updateCourseSessionMutation.isPending}
            >
              {updateCourseSessionMutation.isPending ? (
                <CircularProgress size={24} sx={{ marginLeft: '5px' }} />
              ) : null}
              بروزرسانی جلسه
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default EditCourseSession
