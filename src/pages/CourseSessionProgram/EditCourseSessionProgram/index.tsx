import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { useGetCourseSessionProgramById, useUpdateCourseSessionProgramById, useCourseSessionClasses, useGetAllPackages } from '../../../API/CourseSession/courseSession.hook'
import { useGetAllCoaches } from '../../../API/Coach/coach.hook'
import { showToast } from '../../../utils/toast'
import moment from 'moment-jalaali'
import { convertToPersianDigits } from '../../../utils/helper'
import { formatPrice } from '@/utils/price'

// Single Coach Selector Component
interface SingleCoachSelectorProps {
  selectedCoachId: string | null
  onCoachSelect: (coachId: string | null) => void
  defaultCoach?: any
}

const SingleCoachSelector: React.FC<SingleCoachSelectorProps> = ({
  selectedCoachId,
  onCoachSelect,
  defaultCoach,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const itemsPerPage = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on new search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Set default coach if provided
  useEffect(() => {
    if (defaultCoach && !selectedCoachId) {
      const coachId = defaultCoach.id || defaultCoach._id
      onCoachSelect(coachId)
    }
  }, [defaultCoach, selectedCoachId, onCoachSelect])

  const { data: coachesData, isLoading } = useGetAllCoaches({
    page,
    limit: itemsPerPage,
    q: debouncedSearch,
  })

  const coaches = coachesData?.results || []
  const totalPages = coachesData?.totalPages || 1

  const selectedCoach = coaches.find((c: any) => (c.id || c._id) === selectedCoachId)

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        انتخاب مربی
      </Typography>

      {/* Selected Coach Display */}
      {selectedCoach && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            مربی انتخاب شده
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {`${selectedCoach.first_name || ''} ${selectedCoach.last_name || ''}`.trim() || 'بدون نام'}
            </Typography>
            <Button
              size="small"
              onClick={() => onCoachSelect(null)}
              color="error"
            >
              حذف
            </Button>
          </Box>
        </Paper>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="جستجو..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Coaches List */}
      <Paper
        variant="outlined"
        sx={{
          maxHeight: '400px',
          overflow: 'auto',
          mb: 2,
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : coaches.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">موردی یافت نشد</Typography>
          </Box>
        ) : (
          <List>
            {coaches.map((coach: any) => {
              const coachId = coach.id || coach._id
              const isSelected = selectedCoachId === coachId
              const fullName = `${coach.first_name || ''} ${coach.last_name || ''}`.trim()
              const createdAt = moment(coach.createdAt).format('jYYYY/jMM/jDD')
              
              return (
                <ListItem
                  key={coachId}
                  button
                  onClick={() => onCoachSelect(coachId)}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' },
                    backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                  }}
                >
                  <Radio
                    checked={isSelected}
                    sx={{ ml: 1 }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold">
                        {fullName || 'بدون نام'}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {coach.mobile && (
                          <Typography variant="caption" display="block">
                            موبایل: {coach.mobile}
                          </Typography>
                        )}
                        {coach.email && (
                          <Typography variant="caption" display="block">
                            ایمیل: {coach.email}
                          </Typography>
                        )}
                        {coach.specialization && (
                          <Typography variant="caption" display="block">
                            تخصص: {coach.specialization}
                          </Typography>
                        )}
                        {coach.createdAt && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            تاریخ ایجاد: {createdAt && convertToPersianDigits(createdAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ textAlign: 'right' }}
                  />
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {/* You can add pagination component here if needed */}
        </Box>
      )}
    </Box>
  )
}

// Subject Dialog Component
interface SubjectDialogProps {
  open: boolean
  onClose: () => void
  onSave: (subject: { title: string; sub_title: string }) => void
  initialData?: { title: string; sub_title: string }
}

const SubjectDialog: React.FC<SubjectDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '')
  const [subTitle, setSubTitle] = useState(initialData?.sub_title || '')

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title: title.trim(), sub_title: subTitle.trim() })
      onClose()
      setTitle('')
      setSubTitle('')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ویرایش موضوع</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="عنوان"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="زیر عنوان"
          value={subTitle}
          onChange={(e) => setSubTitle(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSave} variant="contained">ذخیره</Button>
      </DialogActions>
    </Dialog>
  )
}

// Sample Media Dialog Component
// Sample Media Dialog Component
interface SampleMediaDialogProps {
    open: boolean
    editingSampleMediaIndex: number | null
    onClose: () => void
    onSave: (media: { _id?: string; media_type: string; media_title: string; file: any | null }) => void
    initialData?: { _id?: string; media_type: string; media_title: string; file: any | null }[]
  }
  
  const SampleMediaDialog: React.FC<SampleMediaDialogProps> = ({
    open,
    onClose,
    onSave,
    initialData,
    editingSampleMediaIndex,
  }) => {
    const [mediaType, setMediaType] = useState('')
    const [mediaTitle, setMediaTitle] = useState('')
    const [uploadedFile, setUploadedFile] = useState<any | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
      if (initialData && editingSampleMediaIndex !== null) {
        let item
        if (typeof editingSampleMediaIndex === 'number') {
          // Use as array index
          item = initialData[editingSampleMediaIndex]
        } else if (
          typeof editingSampleMediaIndex === 'string' &&
          Array.isArray(initialData)
        ) {
          // Use as _id to find in array
          item = initialData.find((m) => m._id === editingSampleMediaIndex)
        }
        if (item) {
            setMediaType(item.media_type)
            setMediaTitle(item.media_title)
            setUploadedFile(item.file)
        }
      } else if (editingSampleMediaIndex === null) {
        setMediaType('')
        setMediaTitle('')
        setUploadedFile(null)
      }
    }, [initialData, editingSampleMediaIndex])

    const uploadFile = async (file: File): Promise<any> => {
        const formData = new FormData()
        formData.append('file', file)
    
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/admin/setting/upload`, {
          method: 'POST',
          body: formData,
        })
    
        if (!response.ok) {
          throw new Error('Upload failed')
        }
    
        const data = await response.json()
        return data.uploadedFile
      }
  
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
  
      setIsUploading(true)
      try {
        const uploaded = await uploadFile(file)
        setUploadedFile(uploaded)
        showToast('موفق', 'فایل با موفقیت آپلود شد', 'success')
      } catch (error) {
        showToast('خطا', 'خطا در آپلود فایل', 'error')
      } finally {
        setIsUploading(false)
      }
    }
  
    const handleSave = () => {
      if (mediaType && mediaTitle && uploadedFile) {

        let item = null;

        // the editingSampleMediaIndex is Index of the initial Array of sample_media
        if(initialData && typeof editingSampleMediaIndex === 'number') {
          item = initialData[editingSampleMediaIndex]
        } else if(initialData && typeof editingSampleMediaIndex === 'string') {
          item = initialData.find((m) => m._id === editingSampleMediaIndex)
        }

        console.log({ item, editingSampleMediaIndex, initialData })
        
        onSave({
          _id: item?._id,
          media_type: mediaType,
          media_title: mediaTitle,
          file: uploadedFile,
        })
        onClose()
        // Reset form
        setMediaType('')
        setMediaTitle('')
        setUploadedFile(null)
      } else {
        showToast('خطا', 'لطفا همه فیلدها را پر کنید', 'error')
      }
    }
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle dir="rtl">ویرایش رسانه نمونه</DialogTitle>
        <DialogContent dir="rtl">
        <TextField
            fullWidth
            label="عنوان رسانه"
            value={mediaTitle}
            onChange={(e) => setMediaTitle(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="media-type-select-label">نوع رسانه</InputLabel>
            <Select
              labelId="media-type-select-label"
              value={mediaType}
              label="نوع رسانه"
              dir="rtl"
              sx={{ textAlign: 'right' }}
              className="text-right"
              onChange={(e) => setMediaType(e.target.value)}
            >
              <MenuItem dir="rtl" value="IMAGE">تصویر</MenuItem>
              <MenuItem dir="rtl" value="VIDEO">ویدیو</MenuItem>
              <MenuItem dir="rtl" value="FILE">فایل</MenuItem>
            </Select>
          </FormControl>
          
          
          {/* File Upload Section */}
          <Box dir="rtl" sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              فایل رسانه
            </Typography>
            <input
              accept="*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                disabled={isUploading}
                sx={{ mt: 1 }}
              >
                {isUploading ? <CircularProgress size={20} /> : 'انتخاب فایل'}
              </Button>
            </label>
            
            {uploadedFile && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="success.main">
                  فایل آپلود شده: {uploadedFile.file_name}
                </Typography>
                <a 
                  href={`${process.env.REACT_APP_SERVER_FILE}/${uploadedFile.file_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#1976d2', textDecoration: 'underline' }}
                >
                  مشاهده فایل
                </a>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>لغو</Button>
          <Button onClick={handleSave} variant="contained">ذخیره</Button>
        </DialogActions>
      </Dialog>
    )
  }

const EditCourseSessionProgram: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    coach: '',
    class_id: '',
    subjects: [] as { title: string; sub_title: string }[],
    sample_media: [] as { media_type: string; media_title: string; url_address: string; file: any }[],
    packages: [] as string[],
    price_real: '',
    price_discounted: '',
    is_fire_sale: false,
    program_type: 'ONLINE',
    max_member_accept: '',
    course_duration: '',
    is_have_licence: false,
    status: 'active',
  })

  // UI state
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null)
  const [sampleMediaDialogOpen, setSampleMediaDialogOpen] = useState(false)
  const [editingSampleMediaIndex, setEditingSampleMediaIndex] = useState<number | null>(null)

  // API hooks
  const { data: programData, isLoading: isLoadingProgram } = useGetCourseSessionProgramById(id!)
  const updateMutation = useUpdateCourseSessionProgramById(id!)
  const { data: classesData } = useCourseSessionClasses()
  const { data: packagesData } = useGetAllPackages()

  const classes = classesData || []
  const packages = packagesData || []


  console.log({ classes })

  // Set initial data when program data is loaded
  useEffect(() => {
    if (programData) {
      setFormData({
        coach: programData.coach?._id || programData.coach || '',
        class_id: programData.class_id?._id || programData.class_id || '',
        subjects: programData.subjects || [],
        sample_media: programData.sample_media || [],
        packages: programData.packages?.map((pkg: any) => pkg._id || pkg) || [],
        price_real: programData.price_real?.toString() || '',
        price_discounted: programData.price_discounted?.toString() || '',
        is_fire_sale: programData.is_fire_sale || false,
        program_type: programData.program_type || 'ONLINE',
        max_member_accept: programData.max_member_accept?.toString() || '',
        course_duration: programData.course_duration?.toString() || '',
        is_have_licence: programData.is_have_licence || false,
        status: programData.status || 'active',
      })
    }
  }, [programData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Subject handlers
  const handleAddSubject = () => {
    setEditingSubjectIndex(null)
    setSubjectDialogOpen(true)
  }

  const handleEditSubject = (index: number) => {
    setEditingSubjectIndex(index)
    setSubjectDialogOpen(true)
  }

  const handleDeleteSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }))
  }

  const handleSaveSubject = (subject: { title: string; sub_title: string }) => {
    setFormData(prev => {
      const newSubjects = [...prev.subjects]
      if (editingSubjectIndex !== null) {
        newSubjects[editingSubjectIndex] = subject
      } else {
        newSubjects.push(subject)
      }
      return {
        ...prev,
        subjects: newSubjects
      }
    })
  }

  // Sample media handlers
  const handleAddSampleMedia = () => {
    setEditingSampleMediaIndex(null)
    setSampleMediaDialogOpen(true)
  }

  const handleEditSampleMedia = (index: number) => {
    setEditingSampleMediaIndex(index)
    setSampleMediaDialogOpen(true)
  }

  const handleDeleteSampleMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sample_media: prev.sample_media.filter((_, i) => i !== index)
    }))
  }

  const handleSaveSampleMedia = (media: { _id?: string; media_type: string; media_title: string; file: any | null }) => {
    setFormData(prev => {
      const newMedia = [...prev.sample_media]
      if (editingSampleMediaIndex !== null) {

        // the editingSampleMediaIndex is Index of the initial Array of sample_media
        if(typeof editingSampleMediaIndex === 'number') {
          newMedia[editingSampleMediaIndex] = media
        } else if(typeof editingSampleMediaIndex === 'string') {
          let item = newMedia.find((m) => m._id === editingSampleMediaIndex);
          if(item) {
            item.media_type = media.media_type
            item.media_title = media.media_title
            item.file = media.file
          }
        }


        // newMedia[editingSampleMediaIndex] = media
      } else {
        newMedia.push(media)
      }
      return {
        ...prev,
        sample_media: newMedia
      }
    })
  }

  // Package handlers
  const handlePackageToggle = (packageId: string) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.includes(packageId)
        ? prev.packages.filter(id => id !== packageId)
        : [...prev.packages, packageId]
    }))
  }

  const handleSubmit = async () => {
    try {
      const requestData = {
        coach: formData.coach,
        class_id: formData.class_id,
        subjects: formData.subjects,
        sample_media: formData.sample_media,
        packages: formData.packages,
        price_real: parseFloat(formData.price_real),
        price_discounted: parseFloat(formData.price_discounted),
        is_fire_sale: formData.is_fire_sale,
        program_type: formData.program_type,
        max_member_accept: parseInt(formData.max_member_accept),
        course_duration: parseInt(formData.course_duration),
        is_have_licence: formData.is_have_licence,
        status: formData.status,
      }

      await updateMutation.mutateAsync(requestData)
      showToast('موفق', 'برنامه دوره با موفقیت بروزرسانی شد', 'success')
      navigate(`/course-session-program/${id}`)
    } catch (error) {
      showToast('خطا', 'خطا در بروزرسانی برنامه دوره', 'error')
    }
  }

  if (isLoadingProgram) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ویرایش برنامه دوره
      </Typography>

      <Grid container spacing={3}>
        {/* Coach Selection */}
        <Grid size={12} size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <SingleCoachSelector
              selectedCoachId={formData.coach}
              onCoachSelect={(coachId) => handleInputChange('coach', coachId)}
              defaultCoach={programData?.coach}
            />
          </Paper>
        </Grid>

           {/* Class Selection */}
           <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, minHeight: '660px' }}>
            <Typography variant="h6" gutterBottom>
              انتخاب کلاس
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {classes.map((cls: any) => (
                <Paper
                  key={cls._id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: formData.class_id === cls._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    backgroundColor: formData.class_id === cls._id ? '#f3f9ff' : 'transparent',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f9f9f9',
                    },
                  }}
                  onClick={() => handleInputChange('class_id', cls._id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio
                      checked={formData.class_id === cls._id}
                      sx={{ ml: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {cls.class_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        حداکثر تعداد دانش‌آموز: {cls.class_max_student_number}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: cls.class_status === 'ACTIVE' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        وضعیت: {cls.class_status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
            {classes.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">کلاسی یافت نشد</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Subjects */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">موضوعات</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon className="ml-2" />}
                onClick={handleAddSubject}
              >
                افزودن موضوع
              </Button>
            </Box>
            <List>
              {formData.subjects.map((subject, index) => (
                <ListItem className="w-full" dir="rtl" component="div" key={index} divider>
                  <ListItemText
                    dir="rtl"
                    className="w-full text-right"
                    primary={subject.title}
                    secondary={subject.sub_title}
                  />
                  <IconButton onClick={() => handleEditSubject(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteSubject(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sample Media */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">رسانه‌های نمونه</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon className="ml-2" />}
                onClick={handleAddSampleMedia}
              >
                افزودن رسانه
              </Button>
            </Box>
            <List>
              {formData.sample_media.map((media, index) => (
                <ListItem className="w-full" dir="rtl" component="div" key={index} divider>
                  <ListItemText
                    dir="rtl"
                    className="w-full text-right"
                    primary={media.media_title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          نوع: {media.media_type}
                        </Typography>
                        {media.file?.file_name && (
                          <Typography variant="body2" color="text.secondary">
                            فایل: 
                            <a 
                              href={`${process.env.REACT_APP_SERVER_FILE}/${media.file.file_name}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#1976d2', textDecoration: 'underline', marginRight: '4px' }}
                            >
                              مشاهده فایل
                            </a>
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <IconButton onClick={() => handleEditSampleMedia((media?._id || index))}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteSampleMedia(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Packages */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              پکیج‌ها
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {packages.map((pkg: any) => (
                <Chip
                  key={pkg._id}
                  label={`${pkg?.title} ||  ${formatPrice(pkg?.price)}`}
                  onClick={() => handlePackageToggle(pkg?._id)}
                  color={formData.packages.includes(pkg?._id) ? 'primary' : 'default'}
                  variant={formData.packages.includes(pkg?._id) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Price Fields */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              قیمت‌ها
            </Typography>
            <TextField
              fullWidth
              label="قیمت واقعی"
              type="number"
              value={formData.price_real}
              onChange={(e) => handleInputChange('price_real', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="قیمت تخفیف خورده"
              type="number"
              value={formData.price_discounted}
              onChange={(e) => handleInputChange('price_discounted', e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_fire_sale}
                  onChange={(e) => handleInputChange('is_fire_sale', e.target.checked)}
                />
              }
              label="فروش ویژه (فعال باشد دوره با تخفیف فروش خواهد شد)"
            />
          </Paper>
        </Grid>

        {/* Program Settings */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              تنظیمات برنامه
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>نوع برنامه</InputLabel>
              <Select
                value={formData.program_type}
                onChange={(e) => handleInputChange('program_type', e.target.value)}
              >
                <MenuItem value="ONLINE">آنلاین</MenuItem>
                <MenuItem value="ON-SITE">حضوری</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="حداکثر تعداد عضو"
              type="number"
              value={formData.max_member_accept}
              onChange={(e) => handleInputChange('max_member_accept', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="مدت دوره"
              type="number"
              value={formData.course_duration}
              onChange={(e) => handleInputChange('course_duration', e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_have_licence}
                  onChange={(e) => handleInputChange('is_have_licence', e.target.checked)}
                />
              }
              label="دارای مجوز"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>وضعیت</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <MenuItem value="active">فعال</MenuItem>
                <MenuItem value="inactive">غیرفعال</MenuItem>
                <MenuItem value="completed">تکمیل شده</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/course-session-program/${id}`)}
        >
          لغو
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <CircularProgress size={20} /> : 'ذخیره تغییرات'}
        </Button>
      </Box>

      {/* Dialogs */}
      <SubjectDialog
        open={subjectDialogOpen}
        onClose={() => setSubjectDialogOpen(false)}
        onSave={handleSaveSubject}
        initialData={editingSubjectIndex !== null ? formData.subjects[editingSubjectIndex] : undefined}
      />

      {/* Sample Media Dialog */}
      <SampleMediaDialog
        open={sampleMediaDialogOpen}
        onClose={() => setSampleMediaDialogOpen(false)}
        onSave={handleSaveSampleMedia}
        editingSampleMediaIndex={editingSampleMediaIndex}
        initialData={formData.sample_media || []}
      />
    </Box>
  )
}

export default EditCourseSessionProgram
