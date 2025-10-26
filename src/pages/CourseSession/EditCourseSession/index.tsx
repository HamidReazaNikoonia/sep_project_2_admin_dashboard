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

  // Fetch course session data
  const { data: courseSession, isLoading: isLoadingCourseSession } =
    useCourseSession(course_id || '')

  // API Mutation for updating
  const updateCourseSessionMutation = useUpdateCourseSession(course_id || '')

  // Load course session data when it's available
  useEffect(() => {
    if (courseSession && !isLoadingCourseSession) {
      console.log({ courseSession: courseSession?.results })

      if (courseSession?.results?.[0]) {
        const _courseSessionData = courseSession.results[0]

        // Set form values
        setFormData({
          title: _courseSessionData.title || '',
          sub_title: _courseSessionData.sub_title || '',
          description: _courseSessionData.description || '',
        })

        // Set description long
        setDescriptionLong(_courseSessionData.description_long || '')

        // Set sample media
        setSampleMedia(_courseSessionData.sample_media || [])

        // Set categories
        if (_courseSessionData.course_session_category) {
          console.log({ _courseSessionData: _courseSessionData.course_session_category })
          setCategories(_courseSessionData.course_session_category)
        }

        // Set thumbnail image if available
        if (_courseSessionData.tumbnail?.file_name) {
          setThumbnailImageUrl(`${SERVER_FILE}/${_courseSessionData.tumbnail.file_name}`)
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
    if (newMediaErrors[field]) {
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

  // Update onSubmit to handle new media structure
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      showToast('خطا', 'لطفا خطاهای فرم را برطرف کنید', 'error')
      return
    }

    // Form Manual Validation
    if (!descriptionLong) {
      showToast('خطا', 'لطفا توضیحات را کامل کنید', 'error')
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


      if (categories.length > 0) {
        courseSessionRequestBody.course_session_category = categories
      }

      await updateCourseSessionMutation.mutateAsync(courseSessionRequestBody)
      showToast('موفق', 'جلسه با موفقیت بروزرسانی شد', 'success')
      navigate('/courses-sessions')
    } catch (error: any) {
      if (error instanceof Error && error?.response?.data?.message) {
        showToast('خطا', error?.response?.data?.message, 'error')
      } else {
        showToast('خطا', error.message || 'خطا در بروزرسانی جلسه', 'error')
      }
      console.error('Error submitting form:', error?.response?.data?.message || error.message)
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

          {/* Categories Selection */}
          <Grid size={12}>
            <StyledPaper sx={{ p: 3 }}>
              <div className="w-full flex flex-col">
                <div className="w-full">
                  {courseSession?.results?.[0] && (
                    <CategorySelection
                    passSelectedCategories={implementCategories}
                    defaultCategories={courseSession?.results?.[0]?.course_session_category}
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
                    startIcon={isUploadingNewMedia ? <CircularProgress sx={{pl: 2, textAlign: 'center'}} className='ml-2' size={20} /> : <AddIcon className='ml-2' />}
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
