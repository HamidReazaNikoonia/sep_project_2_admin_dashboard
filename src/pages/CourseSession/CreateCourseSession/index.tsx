import React, { useState, useRef } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import ImageUploader from 'react-images-upload'
// @ts-ignore
// import StarterKit from "@tiptap/starter-kit";
// import {
//   MenuButtonBold,
//   MenuButtonItalic,
//   MenuControlsContainer,
//   MenuDivider,
//   MenuSelectHeading,
//   RichTextEditor,
//   type RichTextEditorRef,
// } from "mui-tiptap";
import Editor from '@/components/TextEditor'
import CircularProgress from '@mui/material/CircularProgress'
import UploadIcon from '@mui/icons-material/Upload'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { showToast } from '@/utils/toast'
import { useCreateCourseSession } from '@/API/CourseSession/courseSession.hook'
import { useNavigate } from 'react-router'
import CategorySelection from '@/components/CategorySelection'
import CourseDetailsForm from '@/components/CourseDetailsForm'
import CourseDetailsPreview from '@/components/CourseDetailsPreview'

const SERVER_URL = process.env.REACT_APP_SERVER_URL
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

// Validation schema
yup.setLocale({
  mixed: {
    required: 'این فیلد الزامی است',
  },
  number: {
    min: 'عدد وارد شده معتبر نیست',
  },
})

const schema = yup.object().shape({
  title: yup.string().required(),
  sub_title: yup.string().required(),
  description: yup.string().required(),
  description_long: yup.string(),
  // price: yup.number().required(),
  // course_language: yup.string(),
  // course_duration: yup.number(),
  // course_type: yup.string().oneOf(['HOZORI', 'ONLINE']).required(),
  // educational_level: yup.number(),
  // is_have_licence: yup.boolean().required(),
})

interface DetailItem {
  header_title: string
  description: string
}

interface PreviewMedia {
  video_file: {
    _id: string
    file_name: string
  } | null
  preview_image_desktop: {
    _id: string
    file_name: string
  } | null
  preview_image_mobile: {
    _id: string
    file_name: string
  } | null
}

interface FormData {
  title: string
  sub_title: string
  description: string
  description_long: string
  price: number
  course_language: string
  course_duration: number
  course_type: 'HOZORI' | 'ONLINE'
  educational_level: number
  is_have_licence: boolean
  sample_media: {
    media_type: string
    media_title: string
    url_address: string
  }[]
}

// Add this type for file upload state
type FileUploadState = {
  [key: string]: {
    file: File | null
    uploading: boolean
    error: string | null
    uploadedFile: any | null
  }
}

interface UploadedFile {
  _id: string
  file_name: string
}

const CreateCourseSession: React.FC = () => {
  const navigate = useNavigate()
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null)
  const [sampleMediaImage, setSampleMediaImage] = useState<string | null>(null)
  const [descriptionLong, setDescriptionLong] = useState('')
  const [fileUploads, setFileUploads] = useState<FileUploadState>({})
  const [categories, setcategories] = useState([])
  const [details, setDetails] = useState<DetailItem[]>([])


  // Preview Media state
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia>({
    video_file: null,
    preview_image_desktop: null,
    preview_image_mobile: null,
  })
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null)
  const [previewDesktopImage, setPreviewDesktopImage] = useState<File | null>(null)
  const [previewMobileImage, setPreviewMobileImage] = useState<File | null>(null)
  const [uploadingPreviewVideo, setUploadingPreviewVideo] = useState(false)
  const [uploadingDesktopImage, setUploadingDesktopImage] = useState(false)
  const [uploadingMobileImage, setUploadingMobileImage] = useState(false)

  // API Mutation
  const createCourseSessionMutation = useCreateCourseSession()

  //   const rteRef = useRef<RichTextEditorRef>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      // is_have_licence: false,
      // course_type: 'HOZORI',
      title: '',
      sub_title: '',
      description: '',
      //   description_long: 'sdsd',
      // price: 0,
      // course_language: '',
      // course_duration: 0,
      // educational_level: 0,
      sample_media: [],
    },
  })

  const {
    fields: sampleMediaFields,
    append: appendSampleMedia,
    remove: removeSampleMedia,
  } = useFieldArray({
    name: 'sample_media',
    control,
  })

  // Preview Media functions
  // Preview Video Upload Handler
  const handlePreviewVideoUpload = async () => {
    if (!previewVideoFile) {
      showToast('خطا', 'لطفا ابتدا فایل ویدیو را انتخاب کنید', 'error')
      return
    }

    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024 // 20MB in bytes
    if (previewVideoFile.size > maxSize) {
      showToast('خطا', 'حجم فایل ویدیو نباید بیشتر از 20 مگابایت باشد', 'error')
      return
    }

    setUploadingPreviewVideo(true)
    try {
      const uploadedFile = await uploadFile(previewVideoFile)
      setPreviewMedia(prev => ({
        ...prev,
        video_file: {
          _id: uploadedFile._id,
          file_name: uploadedFile.file_name,
        },
      }))
      showToast('موفق', 'ویدیو با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود ویدیو', 'error')
      console.error('Video upload error:', error)
    } finally {
      setUploadingPreviewVideo(false)
    }
  }

  // Preview Desktop Image Upload Handler
  const handlePreviewDesktopImageUpload = async () => {
    if (!previewDesktopImage) {
      showToast('خطا', 'لطفا ابتدا تصویر دسکتاپ را انتخاب کنید', 'error')
      return
    }

    setUploadingDesktopImage(true)
    try {
      const uploadedFile = await uploadFile(previewDesktopImage)
      setPreviewMedia(prev => ({
        ...prev,
        preview_image_desktop: {
          _id: uploadedFile._id,
          file_name: uploadedFile.file_name,
        },
      }))
      showToast('موفق', 'تصویر دسکتاپ با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر دسکتاپ', 'error')
      console.error('Desktop image upload error:', error)
    } finally {
      setUploadingDesktopImage(false)
    }
  }

  // Preview Mobile Image Upload Handler
  const handlePreviewMobileImageUpload = async () => {
    if (!previewMobileImage) {
      showToast('خطا', 'لطفا ابتدا تصویر موبایل را انتخاب کنید', 'error')
      return
    }

    setUploadingMobileImage(true)
    try {
      const uploadedFile = await uploadFile(previewMobileImage)
      setPreviewMedia(prev => ({
        ...prev,
        preview_image_mobile: {
          _id: uploadedFile._id,
          file_name: uploadedFile.file_name,
        },
      }))
      showToast('موفق', 'تصویر موبایل با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر موبایل', 'error')
      console.error('Mobile image upload error:', error)
    } finally {
      setUploadingMobileImage(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    let courseSessionRequestBody: any = {}

    // Form Manual Validation
    // if (!descriptionLong) {
    //   showToast('خطا', ' لطفا توضیحات را کامل کنید', 'error')
    // }

    // add categories
    // course_session_category
    if (categories && categories.length !== 0) {
      courseSessionRequestBody.course_session_category = categories
    } else {
      showToast('خطا', 'حداقل یک دسته بندی انتخاب کنید', 'error')
      return false
    }

    if (!thumbnailImage) {
      showToast('خطا', ' لطفا تصویر جلسه را انتخاب کنید ', 'error')
      return false
    }

    // For now, just log the data

    // Upload Thumbnail Image
    const uploadedthumbnailImageFile = await uploadFile(thumbnailImage)

    // validate Thumbnail Image
    if (uploadedthumbnailImageFile?._id) {
      courseSessionRequestBody.tumbnail = uploadedthumbnailImageFile?._id
    }

    console.log({ uploadedthumbnailImageFile })

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


    // Prepare preview media with uploaded file IDs
    // Prepare preview_media object
    const previewMediaPayload: any = {}
    if (previewMedia.video_file?._id) {
      previewMediaPayload.video_file = previewMedia.video_file._id
    }
    if (previewMedia.preview_image_desktop?._id) {
      previewMediaPayload.preview_image_desktop = previewMedia.preview_image_desktop._id
    }
    if (previewMedia.preview_image_mobile?._id) {
      previewMediaPayload.preview_image_mobile = previewMedia.preview_image_mobile._id
    }

    // omit => thumbnailImage, sampleMediaImage,
    courseSessionRequestBody = {
      ...courseSessionRequestBody,
      ...data,
      sample_media: sampleMediaWithFiles,
      // description_long: descriptionLong,
      details: details, // Add details array to request body
      ...(Object.keys(previewMediaPayload).length > 0 && { preview_media: previewMediaPayload }),
    }
    console.log({ courseSessionRequestBody })

    try {
      await createCourseSessionMutation.mutateAsync(courseSessionRequestBody)

      showToast('موفق', 'دوره با موفقیت ایجاد شد', 'success')
      navigate('/courses-sessions')
    } catch (error) {
      // @ts-expect-error
      if (error instanceof Error && error?.response?.data?.message) {
        // @ts-expect-error
        showToast('خطا', error?.response?.data?.message, 'error')
      }
      showToast('خطا', 'خطا در ایجاد دوره', 'error')
      // @ts-expect-error
      console.error('Error submitting form:', error?.response?.data?.message)
    }

    // Attach Long Description

    // const logDesc = rteRef.current?.editor?.getHTML();
    // console.log({text_editor:logDesc })
  }

  // const mainFormSubmitHandler = (e) => {
  //   e.preventDefault();

  //   // const logDesc = rteRef.current?.editor?.getHTML();
  //   // console.log({text_editor:logDesc })
  // }

  const submitHandlerForPassData = (data: string) => {
    console.log({ data })
    setDescriptionLong(data)
  }

  // Dummy upload function (replace with your real upload logic)
  // const uploadFile = async (file: File) => {
  //   // Simulate upload delay
  //   await new Promise((res) => setTimeout(res, 1000));
  //   // Return a fake uploaded file object
  //   return { _id: "fake_id", name: file.name };
  // };

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
    console.log({ key })
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
      // Optionally show a toast here
    } catch (error) {
      setFileUploads((prev) => ({
        ...prev,
        [key]: { ...prev[key], uploading: false, error: 'خطا در آپلود فایل' },
      }))
    }
  }

  const implementCategories = (data: [string] | any) => {
    setcategories(data)
  }

  const handleDetailsChange = (updatedDetails: DetailItem[]) => {
    setDetails(updatedDetails)
  }

  const handleDeleteDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index)
    setDetails(updatedDetails)
  }

  return (
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
      <Typography className="pb-4" variant="h4" gutterBottom>
        ایجاد جلسه جدید دوره
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


          {/* Course Details Form */}
          <Grid size={12}>
            <CourseDetailsForm onDetailsChange={handleDetailsChange} />
          </Grid>


           {/* Course Details Preview */}
           {details.length > 0 && (
            <Grid size={12}>
              <CourseDetailsPreview
                details={details}
                onDelete={handleDeleteDetail}
              />
            </Grid>
          )}

          {/* Preview Media Section */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                ویدیو و تصاویر پیش‌نمایش دوره
              </Typography>

              {/* Video Upload Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  ویدیو پیش‌نمایش (اختیاری)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  حداکثر حجم مجاز برای ویدیو: 20 مگابایت
                </Alert>

                <Box display="flex" flexDirection="column" gap={2}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Check file size
                        const maxSize = 20 * 1024 * 1024 // 20MB
                        if (file.size > maxSize) {
                          showToast('خطا', 'حجم فایل ویدیو نباید بیشتر از 20 مگابایت باشد', 'error')
                          return
                        }
                        setPreviewVideoFile(file)
                      }
                    }}
                    style={{ display: 'none' }}
                    id="preview-video-upload"
                  />

                  <Box display="flex" alignItems="center" gap={2}>
                    <label htmlFor="preview-video-upload">
                      <Button variant="outlined" component="span">
                        انتخاب ویدیو
                      </Button>
                    </label>

                    {previewVideoFile && !previewMedia.video_file && (
                      <Button
                        variant="contained"
                        onClick={handlePreviewVideoUpload}
                        disabled={uploadingPreviewVideo}
                        startIcon={
                          uploadingPreviewVideo ? (
                            <CircularProgress size={20} sx={{ marginLeft: '5px' }} />
                          ) : (
                            <UploadIcon sx={{ marginLeft: '5px' }} />
                          )
                        }
                      >
                        {uploadingPreviewVideo ? 'در حال آپلود...' : 'آپلود ویدیو'}
                      </Button>
                    )}
                  </Box>

                  {previewVideoFile && (
                    <Typography variant="body2" color="text.secondary">
                      فایل انتخاب شده: {previewVideoFile.name} ({(previewVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </Typography>
                  )}

                  {previewMedia.video_file && (
                    <Alert severity="success">
                      ویدیو با موفقیت آپلود شد: {previewMedia.video_file.file_name}
                    </Alert>
                  )}
                </Box>
              </Box>

              {/* Desktop Image Upload Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  تصویر پیش‌نمایش دسکتاپ (اختیاری)
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <ImageUploader
                    withIcon={true}
                    buttonText="انتخاب تصویر دسکتاپ"
                    onChange={(files: File[]) => setPreviewDesktopImage(files[0])}
                    imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                    maxFileSize={5242880}
                    singleImage={true}
                    withPreview={true}
                  />

                  {previewDesktopImage && !previewMedia.preview_image_desktop && (
                    <Button
                      variant="contained"
                      onClick={handlePreviewDesktopImageUpload}
                      disabled={uploadingDesktopImage}
                      startIcon={
                        uploadingDesktopImage ? (
                          <CircularProgress size={20} sx={{ marginLeft: '5px' }} />
                        ) : (
                          <UploadIcon sx={{ marginLeft: '5px' }} />
                        )
                      }
                      sx={{ maxWidth: '200px' }}
                    >
                      {uploadingDesktopImage ? 'در حال آپلود...' : 'آپلود تصویر'}
                    </Button>
                  )}

                  {previewMedia.preview_image_desktop && (
                    <Alert severity="success">
                      تصویر دسکتاپ با موفقیت آپلود شد: {previewMedia.preview_image_desktop.file_name}
                    </Alert>
                  )}
                </Box>
              </Box>

              {/* Mobile Image Upload Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  تصویر پیش‌نمایش موبایل (اختیاری)
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <ImageUploader
                    withIcon={true}
                    buttonText="انتخاب تصویر موبایل"
                    onChange={(files: File[]) => setPreviewMobileImage(files[0])}
                    imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                    maxFileSize={5242880}
                    singleImage={true}
                    withPreview={true}
                  />

                  {previewMobileImage && !previewMedia.preview_image_mobile && (
                    <Button
                      variant="contained"
                      onClick={handlePreviewMobileImageUpload}
                      disabled={uploadingMobileImage}
                      startIcon={
                        uploadingMobileImage ? (
                          <CircularProgress size={20} sx={{ marginLeft: '5px' }} />
                        ) : (
                          <UploadIcon sx={{ marginLeft: '5px' }} />
                        )
                      }
                      sx={{ maxWidth: '200px' }}
                    >
                      {uploadingMobileImage ? 'در حال آپلود...' : 'آپلود تصویر'}
                    </Button>
                  )}

                  {previewMedia.preview_image_mobile && (
                    <Alert severity="success">
                      تصویر موبایل با موفقیت آپلود شد: {previewMedia.preview_image_mobile.file_name}
                    </Alert>
                  )}
                </Box>
              </Box>
            </StyledPaper>
          </Grid>

         
          {/* Thumbnail Image Uploader */}
          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              تصویر جلسه
            </Typography>
            <ImageUploader
              withIcon={true}
              buttonText="انتخاب تصویر جلسه"
              onChange={(files: File[]) => setThumbnailImage(files[0])}
              imgExtension={['.jpg', '.jpeg', '.png']}
              maxFileSize={5242880}
              singleImage={true}
              withPreview={true}
            />
            {thumbnailImage && (
              <Alert severity="info" sx={{ mt: 1 }}>
                تصویر انتخاب شد: {thumbnailImage.name}
              </Alert>
            )}
          </Grid>
          {/* Sample Media Image Uploader */}


          {/* Categories Selection */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <div className="w-full flex flex-col">
                <div className="w-full">
                  <CategorySelection
                    passSelectedCategories={implementCategories}
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
            >
              ثبت جلسه
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default CreateCourseSession
