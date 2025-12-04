import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
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
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import UploadIcon from '@mui/icons-material/Upload'
import ImageUploader from 'react-images-upload'

import CategorySelection from '@/components/CategorySelection'
import CourseDetailsFormEditable, { DetailItem } from '@/components/CourseDetailsFormEditable'

// Import hooks for fetching and updating course session
import {
  useCourseSession,
  useUpdateCourseSession,
} from '@/API/CourseSession/courseSession.hook'
import { showToast } from '@/utils/toast'
import Editor from '@/components/TextEditor'
import StyledPaper from '@/components/StyledPaper'

// Types
interface UploadedFile {
  _id: string
  name: string
  file_name: string
}

interface FileUploadState {
  [key: string]: {
    file: File
    uploading: boolean
    error: string | null
    uploadedFile: UploadedFile | null
  }
}

interface SampleMedia {
  _id: string
  file: { file_name: string; _id: string }
  media_title: string
  media_type: 'IMAGE' | 'VIDEO' | 'FILE' | 'AUDIO'
  url_address: string
}

interface FormErrors {
  title?: string
  sub_title?: string
  description?: string
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

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE
const SERVER_URL = process.env.REACT_APP_SERVER_URL

const MEDIA_TYPE_OPTIONS = [
  { value: 'VIDEO', label: 'ویدیو' },
  { value: 'IMAGE', label: 'تصویر' },
  { value: 'AUDIO', label: 'صوت' },
  { value: 'FILE', label: 'فایل' },
]

const EditCourseSession: React.FC = () => {
  const navigate = useNavigate()
  const { course_id } = useParams()

  // Form state using useState
  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Other state
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null)
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null)
  const [descriptionLong, setDescriptionLong] = useState('')
  const [sampleMedia, setSampleMedia] = useState<SampleMedia[]>([])
  const [details, setDetails] = useState<DetailItem[]>([])
  // Remove editing states since we don't need them anymore
  // const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null)
  // const [editingMediaData, setEditingMediaData] = useState<{...}>({...})

  // Add state for new sample media form
  const [newSampleMedia, setNewSampleMedia] = useState({
    media_title: '',
    media_type: 'IMAGE',
    url_address: '',
  })
  const [newSampleMediaFile, setNewSampleMediaFile] = useState<File | null>(null)
  const [isUploadingNewMedia, setIsUploadingNewMedia] = useState(false)
  const [newMediaErrors, setNewMediaErrors] = useState<{
    media_title?: string
    media_type?: string
    file?: string
  }>({})

  const [fileUploads, setFileUploads] = useState<FileUploadState>({})
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState({
    sampleMedia: false,
    thumbnail: false,
    descriptionLong: false,
    categories: false,
  })

  // Preview Media State
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

  // Fetch course session data
  const { data: courseSession, isLoading: isLoadingCourseSession } =
    useCourseSession(course_id || '')

  // API Mutation for updating
  const updateCourseSessionMutation = useUpdateCourseSession(course_id || '')

  // Load course session data when it's available
  useEffect(() => {
    if (courseSession && !isLoadingCourseSession) {
      // console.log({ courseSession: courseSession })

      if (courseSession?.results[0]) {
        const _courseSessionData = courseSession.results[0] as any

        // Set form values
        setFormData({
          title: _courseSessionData.title || '',
          sub_title: _courseSessionData.sub_title || '',
          description: _courseSessionData.description || '',
        })

        // Set description long
        // setDescriptionLong(_courseSessionData.description_long || '')

        // Set sample media
        setSampleMedia(_courseSessionData.sample_media || [])

        // Set details
        setDetails(_courseSessionData.details || [])

        // Set categories
        if (_courseSessionData.course_session_category) {
          console.log({ _courseSessionData: _courseSessionData.course_session_category })
          setCategories(_courseSessionData.course_session_category)
        }

        // Set thumbnail image if available
        if (_courseSessionData.tumbnail?.file_name) {
          setThumbnailImageUrl(`${SERVER_FILE}/${_courseSessionData.tumbnail.file_name}`)
        }

        // Set preview_media
        if (_courseSessionData.preview_media) {
          setPreviewMedia({
            video_file: _courseSessionData.preview_media.video_file || null,
            preview_image_desktop: _courseSessionData.preview_media.preview_image_desktop || null,
            preview_image_mobile: _courseSessionData.preview_media.preview_image_mobile || null,
          })
        }
      }

      setIsLoading(false)
    }
  }, [courseSession, isLoadingCourseSession])

  // Form validation
  const validateForm = () => {
    const errors: FormErrors = {}

    if (!formData.title.trim()) {
      errors.title = 'عنوان جلسه الزامی است'
    }
    if (!formData.sub_title.trim()) {
      errors.sub_title = 'زیرعنوان الزامی است'
    }
    if (!formData.description.trim()) {
      errors.description = 'توضیح کوتاه الزامی است'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

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

  const implementCategories = (data: [string] | any) => {
    console.log({ data })
    setCategories(data)
  }

  const handleDetailsChange = (updatedDetails: DetailItem[]) => {
    setDetails(updatedDetails)
  }

  // Remove the editing functions and replace with simpler ones
  const deleteSampleMedia = (index: number) => {
    setSampleMedia(prev => prev.filter((_, i) => i !== index))
    // Track sample media changes
    setHasChanges(prev => ({ ...prev, sampleMedia: true }))
  }

  // New sample media form functions
  const validateNewSampleMedia = () => {
    const errors: typeof newMediaErrors = {}

    if (!newSampleMedia.media_title.trim()) {
      errors.media_title = 'عنوان رسانه الزامی است'
    }
    if (!newSampleMedia.media_type) {
      errors.media_type = 'نوع رسانه الزامی است'
    }
    if (!newSampleMediaFile) {
      errors.file = 'انتخاب فایل الزامی است'
    }

    setNewMediaErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNewSampleMediaChange = (field: keyof typeof newSampleMedia, value: string) => {
    setNewSampleMedia(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (field !== 'url_address' && newMediaErrors[field as keyof typeof newMediaErrors]) {
      setNewMediaErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleNewSampleMediaFileChange = (file: File | null) => {
    setNewSampleMediaFile(file)
    if (newMediaErrors.file) {
      setNewMediaErrors(prev => ({ ...prev, file: undefined }))
    }
  }

  const addNewSampleMedia = async () => {
    if (!validateNewSampleMedia()) {
      showToast('خطا', 'لطفا تمام فیلدها را پر کنید', 'error')
      return
    }

    if (!newSampleMediaFile) {
      showToast('خطا', 'لطفا فایل را انتخاب کنید', 'error')
      return
    }

    setIsUploadingNewMedia(true)

    try {
      // Upload the file first
      const uploadedFile = await uploadFile(newSampleMediaFile)

      if (uploadedFile?._id) {
        // Create unique ID for this media item
        const uniqueMediaId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Create new sample media object with reference to uploaded file
        const newMedia: SampleMedia = {
          _id: uniqueMediaId,
          file: { file_name: uploadedFile.name || '', _id: uploadedFile._id },
          media_title: newSampleMedia.media_title,
          media_type: newSampleMedia.media_type as any,
          url_address: newSampleMedia.url_address,
        }

        // Add to sample media list
        setSampleMedia(prev => [...prev, newMedia])

        // Store the uploaded file info with the same unique ID for mapping
        setFileUploads(prev => ({
          ...prev,
          [uniqueMediaId]: {
            file: newSampleMediaFile,
            uploading: false,
            error: null,
            uploadedFile: uploadedFile,
          },
        }))

        // Reset form
        setNewSampleMedia({
          media_title: '',
          media_type: 'IMAGE',
          url_address: '',
        })
        setNewSampleMediaFile(null)
        setNewMediaErrors({})

        // Track changes
        setHasChanges(prev => ({ ...prev, sampleMedia: true }))

        showToast('موفق', 'نمونه آموزشی با موفقیت اضافه شد', 'success')
      }
    } catch (error) {
      showToast('خطا', 'خطا در آپلود فایل', 'error')
      console.error('Upload error:', error)
    } finally {
      setIsUploadingNewMedia(false)
    }
  }

  const renderMediaPreview = (media: SampleMedia) => {
    const mediaUrl = media.url_address || (media.file?.file_name ? `${SERVER_FILE}/${media.file.file_name}` : '')

    if (!mediaUrl) return <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">بدون فایل</div>

    switch (media.media_type) {
      case 'IMAGE':
        return <img src={mediaUrl} alt={media.media_title} className="w-full h-32 object-cover rounded" />
      case 'VIDEO':
        return <video src={mediaUrl} className="w-full h-32 object-cover rounded" controls />
      case 'AUDIO':
        return (
          <div className="w-full h-32 bg-blue-100 rounded flex items-center justify-center">
            <audio src={mediaUrl} controls className="w-full" />
          </div>
        )
      default:
        return (
          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-600">📄 {media.file?.file_name || 'فایل'}</span>
          </div>
        )
    }
  }

  // Preview Media Handlers
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
      setPreviewVideoFile(null) // Clear the file input
      showToast('موفق', 'ویدیو با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود ویدیو', 'error')
      console.error('Video upload error:', error)
    } finally {
      setUploadingPreviewVideo(false)
    }
  }

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
      setPreviewDesktopImage(null) // Clear the file input
      showToast('موفق', 'تصویر دسکتاپ با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر دسکتاپ', 'error')
      console.error('Desktop image upload error:', error)
    } finally {
      setUploadingDesktopImage(false)
    }
  }

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
      setPreviewMobileImage(null) // Clear the file input
      showToast('موفق', 'تصویر موبایل با موفقیت آپلود شد', 'success')
    } catch (error) {
      showToast('خطا', 'خطا در آپلود تصویر موبایل', 'error')
      console.error('Mobile image upload error:', error)
    } finally {
      setUploadingMobileImage(false)
    }
  }

  // Delete handlers
  const handleDeletePreviewVideo = () => {
    setPreviewMedia(prev => ({ ...prev, video_file: null }))
    setPreviewVideoFile(null)
    showToast('موفق', 'ویدیو حذف شد', 'success')
  }

  const handleDeletePreviewDesktopImage = () => {
    setPreviewMedia(prev => ({ ...prev, preview_image_desktop: null }))
    setPreviewDesktopImage(null)
    showToast('موفق', 'تصویر دسکتاپ حذف شد', 'success')
  }

  const handleDeletePreviewMobileImage = () => {
    setPreviewMedia(prev => ({ ...prev, preview_image_mobile: null }))
    setPreviewMobileImage(null)
    showToast('موفق', 'تصویر موبایل حذف شد', 'success')
  }

  // Update onSubmit to handle new media structure
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      showToast('خطا', 'لطفا خطاهای فرم را برطرف کنید', 'error')
      return
    }

    // Form Manual Validation
    // if (!descriptionLong) {
    //   showToast('خطا', 'لطفا توضیحات را کامل کنید', 'error')
    //   return
    // }

    if (details.length === 0) {
      showToast('خطا', 'حداقل یک جزئیات وارد کنید', 'error')
      return
    }

    // Check categories
    if (!categories || categories.length === 0) {
      showToast('خطا', 'حداقل یک دسته بندی انتخاب کنید', 'error')
      return
    }

    // Build payload with only changed fields
    let courseSessionRequestBody: any = {}

    try {
      // Upload new thumbnail if changed
      if (thumbnailImage) {
        const uploadedThumbnailFile = await uploadFile(thumbnailImage)
        if (uploadedThumbnailFile?._id) {
          courseSessionRequestBody.tumbnail = uploadedThumbnailFile._id
        }
      }

      // Prepare sample media with uploaded file IDs
      const sampleMediaWithFiles = sampleMedia.map(media => {
        // For new media (temp IDs), find the specific uploaded file using the media ID
        if (media._id.startsWith('temp_')) {
          const uploadedFile = fileUploads[media._id]?.uploadedFile

          if (uploadedFile?._id) {
            return {
              media_type: media.media_type,
              media_title: media.media_title,
              url_address: media.url_address,
              file: uploadedFile._id,
            }
          }
        }

        // For existing media, use the existing file ID
        return {
          media_type: media.media_type,
          media_title: media.media_title,
          url_address: media.url_address,
          file: media.file?._id,
        }
      }).filter(media => media.file) // Only include media with valid file IDs

      courseSessionRequestBody.sample_media = sampleMediaWithFiles

      // Add details to request body
      if (details.length > 0) {
        courseSessionRequestBody.details = details
      }

      if (categories.length > 0) {
        courseSessionRequestBody.course_session_category = categories
      }

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

      // Add preview_media to request body if any field is set
      if (Object.keys(previewMediaPayload).length > 0) {
        courseSessionRequestBody.preview_media = previewMediaPayload
      }

      await updateCourseSessionMutation.mutateAsync(courseSessionRequestBody)
      showToast('موفق', 'جلسه با موفقیت بروزرسانی شد', 'success')
      navigate('/courses-sessions')
    } catch (error: any) {
      if (error?.response?.data?.message) {
        showToast('خطا', error?.response?.data?.message, 'error')
      } else {
        showToast('خطا', error?.message || 'خطا در بروزرسانی جلسه', 'error')
      }
      console.error('Error submitting form:', error?.response?.data?.message || error?.message)
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

  console.log({ courseSession })

  return (
    <Box dir="rtl" p={{ xs: 0, md: 4 }}>
      <Typography className="pb-4" variant="h4" gutterBottom>
        ویرایش جلسه دوره
      </Typography>
      <form onSubmit={onSubmit}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
              label="عنوان جلسه"
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
          </Grid>

          {/* Sub Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              value={formData.sub_title}
              onChange={(e) => handleInputChange('sub_title', e.target.value)}
              fullWidth
              label="زیرعنوان"
              error={!!formErrors.sub_title}
              helperText={formErrors.sub_title}
            />
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <TextField
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              label="توضیح کوتاه"
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
          </Grid>

          {/* Description Long (WYSIWYG) */}
          {/* <Grid size={12}>
            <Typography fontWeight={800} variant="subtitle1" sx={{ mb: 1 }}>
              توضیح کامل
            </Typography>
            <Box sx={{ marginBottom: '60px' }}>
              <Editor
                submitHandlerForPassData={submitHandlerForPassData}
                initialContent={descriptionLong}
              />
            </Box>
          </Grid> */}

          {/* Course Details Form Editable */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <CourseDetailsFormEditable
                initialDetails={details}
                onDetailsChange={handleDetailsChange}
              />
            </StyledPaper>
          </Grid>

          {/* Thumbnail Image Uploader */}
          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              تصویر جلسه
            </Typography>
            {thumbnailImageUrl && (
              <div className="mb-2">
                <div className="text-sm mb-4">
                  تصویر فعلی:
                </div>
                <img
                  src={thumbnailImageUrl}
                  alt="thumbnail"
                  className='border-4 max-w-xl border-gray-200 rounded-lg shadow-2xl'

                />
              </div>
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

          {/* Preview Media Section */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                ویدیو و تصاویر پیش‌نمایش دوره
              </Typography>

              {/* Video Upload Section */}
              <Box sx={{ mb: 4, pb: 4, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  ویدیو پیش‌نمایش (اختیاری)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  حداکثر حجم مجاز برای ویدیو: 20 مگابایت
                </Alert>

                {/* Show existing video */}
                {previewMedia.video_file && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                      ویدیوی فعلی:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <video
                        src={`${SERVER_FILE}/${previewMedia.video_file.file_name}`}
                        controls
                        className="w-full max-w-2xl rounded border border-gray-300"
                        style={{ maxHeight: '400px' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      فایل: {previewMedia.video_file.file_name}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeletePreviewVideo}
                    >
                      حذف ویدیو
                    </Button>
                  </Box>
                )}

                {/* Upload new video */}
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
                    id="preview-video-upload-edit"
                  />

                  <Box display="flex" alignItems="center" gap={2}>
                    <label htmlFor="preview-video-upload-edit">
                      <Button variant="outlined" component="span">
                        {previewMedia.video_file ? 'تغییر ویدیو' : 'انتخاب ویدیو'}
                      </Button>
                    </label>

                    {previewVideoFile && (
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
                </Box>
              </Box>

              {/* Desktop Image Upload Section */}
              <Box sx={{ mb: 4, pb: 4, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  تصویر پیش‌نمایش دسکتاپ (اختیاری)
                </Typography>

                {/* Show existing desktop image */}
                {previewMedia.preview_image_desktop && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                      تصویر فعلی:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={`${SERVER_FILE}/${previewMedia.preview_image_desktop.file_name}`}
                        alt="Desktop Preview"
                        className="max-w-2xl rounded border-4 border-gray-200 shadow-lg"
                        style={{ maxHeight: '400px', width: 'auto' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      فایل: {previewMedia.preview_image_desktop.file_name}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeletePreviewDesktopImage}
                    >
                      حذف تصویر
                    </Button>
                  </Box>
                )}

                {/* Upload new desktop image */}
                <Box display="flex" flexDirection="column" gap={2}>
                  <ImageUploader
                    withIcon={true}
                    buttonText={previewMedia.preview_image_desktop ? 'تغییر تصویر دسکتاپ' : 'انتخاب تصویر دسکتاپ'}
                    onChange={(files: File[]) => setPreviewDesktopImage(files[0])}
                    imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                    maxFileSize={5242880}
                    singleImage={true}
                    withPreview={true}
                  />

                  {previewDesktopImage && (
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
                </Box>
              </Box>

              {/* Mobile Image Upload Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  تصویر پیش‌نمایش موبایل (اختیاری)
                </Typography>

                {/* Show existing mobile image */}
                {previewMedia.preview_image_mobile && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
                      تصویر فعلی:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={`${SERVER_FILE}/${previewMedia.preview_image_mobile.file_name}`}
                        alt="Mobile Preview"
                        className="max-w-md rounded border-4 border-gray-200 shadow-lg"
                        style={{ maxHeight: '400px', width: 'auto' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      فایل: {previewMedia.preview_image_mobile.file_name}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeletePreviewMobileImage}
                    >
                      حذف تصویر
                    </Button>
                  </Box>
                )}

                {/* Upload new mobile image */}
                <Box display="flex" flexDirection="column" gap={2}>
                  <ImageUploader
                    withIcon={true}
                    buttonText={previewMedia.preview_image_mobile ? 'تغییر تصویر موبایل' : 'انتخاب تصویر موبایل'}
                    onChange={(files: File[]) => setPreviewMobileImage(files[0])}
                    imgExtension={['.jpg', '.jpeg', '.png', '.webp']}
                    maxFileSize={5242880}
                    singleImage={true}
                    withPreview={true}
                  />

                  {previewMobileImage && (
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
                </Box>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Categories Selection */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <div className="w-full flex flex-col">
                <div className="w-full">
                  {courseSession?.results?.[0] && (
                    <CategorySelection
                      passSelectedCategories={implementCategories}
                      defaultCategories={(courseSession.results?.[0] as any)?.course_session_category}
                    />
                  )}

                </div>
              </div>
            </StyledPaper>
          </Grid>

          {/* Sample Media Section */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <Typography variant="h6" className="mb-6">نمونه‌های آموزشی</Typography>

              {/* 1. Current Sample Media List */}
              {sampleMedia.length > 0 && (
                <div className="mb-8">
                  <div className="mb-4 text-sm">
                    نمونه‌های موجود ({sampleMedia.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleMedia.map((media, index) => (
                      <div key={media._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        {/* Media Preview */}
                        <div className="mb-4">
                          {renderMediaPreview(media)}
                        </div>

                        {/* Media Info */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">{media.media_title || 'بدون عنوان'}</h4>
                          <p className="text-sm text-gray-600">
                            نوع: {MEDIA_TYPE_OPTIONS.find(opt => opt.value === media.media_type)?.label || media.media_type}
                          </p>
                          {media.url_address && (
                            <p className="text-xs text-gray-500 truncate">URL: {media.url_address}</p>
                          )}

                          {/* Delete Button */}
                          <div className="pt-2">
                            <Button
                              onClick={() => deleteSampleMedia(index)}
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<DeleteIcon />}
                              fullWidth
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Add New Sample Media Form */}
              <div className="border-t pt-6 bg-amber-200 py-8 px-4 md:px-8 rounded-lg">
                <div className="mb-4 font-medium">
                  افزودن نمونه آموزشی جدید
                </div>

                <div className="flex flex-col gap-y-4">
                  {/* Media Title */}
                  <TextField
                    value={newSampleMedia.media_title}
                    onChange={(e) => handleNewSampleMediaChange('media_title', e.target.value)}
                    fullWidth
                    label="عنوان نمونه"
                    error={!!newMediaErrors.media_title}
                    helperText={newMediaErrors.media_title}
                    size="small"
                  />


                  {/* Media Type */}
                  <TextField
                    value={newSampleMedia.media_type}
                    onChange={(e) => handleNewSampleMediaChange('media_type', e.target.value)}
                    select
                    fullWidth
                    label="نوع رسانه"
                    error={!!newMediaErrors.media_type}
                    helperText={newMediaErrors.media_type}
                    size="small"
                  >
                    {MEDIA_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* URL Address (Optional) */}
                  <TextField
                    value={newSampleMedia.url_address}
                    onChange={(e) => handleNewSampleMediaChange('url_address', e.target.value)}
                    fullWidth
                    label="آدرس URL (اختیاری)"
                    size="small"
                  />

                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      onChange={(e) => handleNewSampleMediaFileChange(e.target.files?.[0] || null)}
                      style={{ display: 'none' }}
                      id="new-sample-media-file"
                    />
                    <label htmlFor="new-sample-media-file">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        className={newMediaErrors.file ? 'border-red-500 text-red-500' : ''}
                      >
                        {newSampleMediaFile ? newSampleMediaFile.name : 'انتخاب فایل'}
                      </Button>
                    </label>
                    {newMediaErrors.file && (
                      <Typography color="error" variant="caption" className="mt-1 block">
                        {newMediaErrors.file}
                      </Typography>
                    )}
                  </div>

                  {/* Add Button */}
                  <Button
                    onClick={addNewSampleMedia}
                    variant="contained"
                    startIcon={isUploadingNewMedia ? <CircularProgress sx={{ pl: 2, textAlign: 'center' }} className='ml-2' size={20} /> : <AddIcon className='ml-2' />}
                    disabled={isUploadingNewMedia}
                    fullWidth
                  >
                    {isUploadingNewMedia ? 'در حال آپلود...' : 'افزودن نمونه'}
                  </Button>
                </div>
              </div>
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
