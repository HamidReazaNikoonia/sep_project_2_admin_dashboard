import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  MenuItem,
  FormControl,
  FormHelperText,
  CircularProgress,
  Paper,
  Grid2 as Grid,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { useCreateCoach } from '../../../API/Coach/coach.hook'
import { useNavigate } from 'react-router'
import { styled } from '@mui/material/styles'
import { showToast } from '@/utils/toast'

// Styled component for image upload
const UploadBox = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const AvatarPreview = styled('img')({
  width: '100px',
  height: '100px',
  objectFit: 'cover',
  borderRadius: '50%',
  marginTop: '10px',
})

const ImagePreview = styled('img')({
  width: '80px',
  height: '80px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginTop: '10px',
})

const SERVER_URL = process.env.REACT_APP_SERVER_URL

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NewCoach = () => {
  const navigate = useNavigate()
  const { mutate: createCoach, isPending } = useCreateCoach()

  // Form state
  const [formData, setFormData] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    email: '',
    avatar: '',
    personal_img: '',
    national_card_images: [] as string[],
    address: '',
    postal_code: '',
    field_of_study: '',
    educational_qualification: '',
    tel: '',
    nationalId: '',
    isVerified: false,
    permission: false,  // Changed from access_level: ''
    featured: false,
    description: '',
    description_long: '',
    tags: [] as string[],
  })

  // File upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [personalImgPreview, setPersonalImgPreview] = useState<string>('')
  const [nationalCardPreviews, setNationalCardPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // Form validation errors
  // Form validation errors
  const [errors, setErrors] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    avatar: '',
    personal_img: '',
    national_card_images: '',
    address: '',
    postal_code: '',
    field_of_study: '',
    educational_qualification: '',
    tel: '',
    nationalId: '',
    // Remove access_level: ''
  })

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  // Handle switch changes
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const uploadFile = async (file: File): Promise<any> => {
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

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))

      try {
        setIsUploading(true)
        const uploadedFile = await uploadFile(file)
        console.log({ uploadedFile })
        setFormData({
          ...formData,
          avatar: uploadedFile._id,
        })
        setIsUploading(false)
      } catch (error) {
        console.error('Error uploading file:', error)
        setErrors({
          ...errors,
          avatar: 'خطا در آپلود فایل',
        })
        setIsUploading(false)
      }
    }
  }

  // Handle personal image upload
  const handlePersonalImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPersonalImgPreview(URL.createObjectURL(file))

      try {
        setIsUploading(true)
        const uploadedFile = await uploadFile(file)
        setFormData({
          ...formData,
          personal_img: uploadedFile._id,
        })
        setIsUploading(false)
      } catch (error) {
        console.error('Error uploading file:', error)
        setErrors({
          ...errors,
          personal_img: 'خطا در آپلود فایل',
        })
        setIsUploading(false)
      }
    }
  }

  // Handle national card images upload (multiple)
  const handleNationalCardImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      // Create preview URLs
      const previewUrls = files.map(file => URL.createObjectURL(file))
      setNationalCardPreviews([...nationalCardPreviews, ...previewUrls])

      try {
        setIsUploading(true)
        const uploadPromises = files.map(file => uploadFile(file))
        const uploadedFiles = await Promise.all(uploadPromises)
        const uploadedIds = uploadedFiles.map(file => file._id)

        setFormData({
          ...formData,
          national_card_images: [...formData.national_card_images, ...uploadedIds],
        })
        setIsUploading(false)
      } catch (error) {
        console.error('Error uploading files:', error)
        setErrors({
          ...errors,
          national_card_images: 'خطا در آپلود فایل‌ها',
        })
        setIsUploading(false)
      }
    }
  }

  // Remove national card image
  const handleRemoveNationalCardImage = (index: number) => {
    const newImages = formData.national_card_images.filter((_, i) => i !== index)
    const newPreviews = nationalCardPreviews.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      national_card_images: newImages,
    })
    setNationalCardPreviews(newPreviews)
  }

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        })
      }
      setTagInput('')
    }
  }

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToDelete),
    })
  }

  // Validate form
  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    // Validate mobile (Iranian format)
    const mobileRegex = /^09[0-9]{9}$/
    if (!formData.mobile) {
      newErrors.mobile = 'شماره موبایل الزامی است'
      valid = false
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'فرمت شماره موبایل صحیح نیست'
      valid = false
    }

    // Validate first_name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'نام الزامی است'
      valid = false
    }

    // Validate last_name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'نام خانوادگی الزامی است'
      valid = false
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'جنسیت الزامی است'
      valid = false
    }

    // Validate email (if provided)
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست'
      valid = false
    }

    // Validate national card images (at least 3)
    // if (formData.national_card_images.length < 3) {
    //   newErrors.national_card_images = 'حداقل 3 تصویر کارت ملی الزامی است'
    //   valid = false
    // }

    // Validate national ID (Iranian format - 10 digits)
    const nationalIdRegex = /^[0-9]{10}$/
    if (formData.nationalId && !nationalIdRegex.test(formData.nationalId)) {
      newErrors.nationalId = 'کد ملی باید 10 رقم باشد'
      valid = false
    }

    // Validate postal code (Iranian format - 10 digits)
    const postalCodeRegex = /^[0-9]{10}$/
    if (formData.postal_code && !postalCodeRegex.test(formData.postal_code)) {
      newErrors.postal_code = 'کد پستی باید 10 رقم باشد'
      valid = false
    }

    // Validate tel (Iranian landline format)
    const telRegex = /^0[0-9]{10}$/
    if (formData.tel && !telRegex.test(formData.tel)) {
      newErrors.tel = 'فرمت تلفن ثابت صحیح نیست'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        mobile: formData.mobile.trim(),
        gender: formData.gender,
        ...(formData.avatar && { avatar: formData.avatar }),
        ...(formData.personal_img && { personal_img: formData.personal_img }),
        ...(formData.national_card_images.length > 0 && {
          national_card_images: formData.national_card_images
        }),
        ...(formData.address && { address: formData.address.trim() }),
        ...(formData.postal_code && { postal_code: formData.postal_code.trim() }),
        ...(formData.field_of_study && { field_of_study: formData.field_of_study.trim() }),
        ...(formData.educational_qualification && {
          educational_qualification: formData.educational_qualification.trim()
        }),
        ...(formData.tel && { tel: formData.tel.trim() }),
        ...(formData.email && emailRegex.test(formData.email) && {
          email: formData.email.trim()
        }),
        ...(formData.nationalId && { nationalId: formData.nationalId.trim() }),
        isVerified: formData.isVerified,
        permission: formData.permission,  // Changed from access_level
        featured: formData.featured,
        ...(formData.description && { description: formData.description.trim() }),
        ...(formData.description_long && { description_long: formData.description_long.trim() }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        age: formData.age ? parseInt(formData.age) : undefined,
      }

      createCoach(payload, {
        onSuccess: (data) => {
          navigate(`/coach`)
        },
        onError: (error) => {
          // check for the error 
          if (error?.response?.data?.message) {
            if (error.response.data.message.includes('E11000')) {
              showToast('خطا', 'شماره موبایل قبلا استفاده شده است', 'error')
            }
          }
        },
      })
    }
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <div className="mb-8">
          <Typography
            fontWeight={600}
            variant="h6"
            component="h1"
            gutterBottom
            align="center"
          >
            افزودن مربی جدید
          </Typography>
        </div>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                اطلاعات پایه
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="شماره موبایل"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                error={!!errors.mobile}
                helperText={errors.mobile}
                dir="ltr"
                inputProps={{ maxLength: 11 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="نام"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                required
                fullWidth
                label="نام خانوادگی"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="سن"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                required
                fullWidth
                label="جنسیت"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                error={!!errors.gender}
                helperText={errors.gender}
              >
                <MenuItem value="M">مرد</MenuItem>
                <MenuItem value="W">زن</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="کد ملی"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                error={!!errors.nationalId}
                helperText={errors.nationalId}
                dir="ltr"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                اطلاعات تماس
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="ایمیل"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                dir="ltr"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="تلفن ثابت"
                name="tel"
                value={formData.tel}
                onChange={handleInputChange}
                error={!!errors.tel}
                helperText={errors.tel}
                dir="ltr"
                inputProps={{ maxLength: 11 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="کد پستی"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                error={!!errors.postal_code}
                helperText={errors.postal_code}
                dir="ltr"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="آدرس"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                rows={3}
              />
            </Grid>

            {/* Educational Information Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                اطلاعات تحصیلی
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="رشته تحصیلی"
                name="field_of_study"
                value={formData.field_of_study}
                onChange={handleInputChange}
                error={!!errors.field_of_study}
                helperText={errors.field_of_study}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="مدرک تحصیلی"
                name="educational_qualification"
                value={formData.educational_qualification}
                onChange={handleInputChange}
                error={!!errors.educational_qualification}
                helperText={errors.educational_qualification}
              />
            </Grid>

            {/* System Settings Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                تنظیمات سیستم
              </Typography>
            </Grid>


            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={4} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVerified}
                      onChange={handleSwitchChange}
                      name="isVerified"
                    />
                  }
                  label="تایید شده"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.permission}
                      onChange={handleSwitchChange}
                      name="permission"
                    />
                  }
                  label="دسترسی"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.featured}
                      onChange={handleSwitchChange}
                      name="featured"
                    />
                  }
                  label="ویژه"
                />
              </Box>
            </Grid>


            {/* Description Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                توضیحات
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="توضیحات کوتاه"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="توضیحات بلند"
                name="description_long"
                value={formData.description_long}
                onChange={handleInputChange}
                multiline
                rows={5}
              />
            </Grid>

            {/* Tags Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                برچسب‌ها
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="افزودن برچسب (Enter برای اضافه کردن)"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                helperText="برای افزودن برچسب، متن را وارد کرده و Enter را فشار دهید"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    dir="ltr"
                    sx={{ px: 2, textAlign: 'right' }}
                    key={index}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Images Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                تصاویر
              </Typography>
            </Grid>

            {/* Avatar */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.avatar}>
                <Typography
                  sx={{ paddingTop: '20px' }}
                  textAlign={'right'}
                  variant="subtitle1"
                  gutterBottom
                >
                  تصویر پروفایل
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />

                <label htmlFor="avatar-upload">
                  <UploadBox>
                    {isUploading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Typography>برای آپلود تصویر کلیک کنید</Typography>
                        {avatarPreview && (
                          <Box display="flex" justifyContent="center" mt={2}>
                            <AvatarPreview
                              src={avatarPreview}
                              alt="Avatar preview"
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </UploadBox>
                </label>

                {errors.avatar && (
                  <FormHelperText>{errors.avatar}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Personal Image */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.personal_img}>
                <Typography
                  sx={{ paddingTop: '20px' }}
                  textAlign={'right'}
                  variant="subtitle1"
                  gutterBottom
                >
                  تصویر شخصی
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  id="personal-img-upload"
                  style={{ display: 'none' }}
                  onChange={handlePersonalImgChange}
                />

                <label htmlFor="personal-img-upload">
                  <UploadBox>
                    {isUploading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <Typography>برای آپلود تصویر کلیک کنید</Typography>
                        {personalImgPreview && (
                          <Box display="flex" justifyContent="center" mt={2}>
                            <AvatarPreview
                              src={personalImgPreview}
                              alt="Personal image preview"
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </UploadBox>
                </label>

                {errors.personal_img && (
                  <FormHelperText>{errors.personal_img}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* National Card Images */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.national_card_images}>
                <Typography
                  sx={{ paddingTop: '20px' }}
                  textAlign={'right'}
                  variant="subtitle1"
                  gutterBottom
                >
                  تصاویر کارت ملی (حداقل 3 تصویر)
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  id="national-card-upload"
                  style={{ display: 'none' }}
                  onChange={handleNationalCardImagesChange}
                  multiple
                />

                <label htmlFor="national-card-upload">
                  <UploadBox>
                    {isUploading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography>
                        برای آپلود تصاویر کلیک کنید ({formData.national_card_images.length}/3)
                      </Typography>
                    )}
                  </UploadBox>
                </label>

                {nationalCardPreviews.length > 0 && (
                  <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                    {nationalCardPreviews.map((preview, index) => (
                      <Box key={index} position="relative">
                        <ImagePreview src={preview} alt={`National card ${index + 1}`} />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                            },
                          }}
                          onClick={() => handleRemoveNationalCardImage(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                {errors.national_card_images && (
                  <FormHelperText>{errors.national_card_images}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isPending || isUploading}
                  startIcon={
                    isPending && <CircularProgress size={20} color="inherit" />
                  }
                >
                  {isPending ? 'در حال ارسال...' : 'ثبت مربی'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}

export default NewCoach
