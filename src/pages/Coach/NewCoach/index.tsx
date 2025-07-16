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
} from '@mui/material'
import { useCreateCoach } from '../../../API/Coach/coach.hook'
import { useNavigate } from 'react-router'
import { styled } from '@mui/material/styles'

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
  })

  // File upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  // Form validation errors
  const [errors, setErrors] = useState({
    mobile: '',
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    avatar: '',
  })

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setErrors(newErrors)
    return valid
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const payload = {
        // ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        mobile: formData.mobile.trim(),
        ...(formData.avatar && { avatar: formData.avatar }),
        ...(formData.email && emailRegex.test(formData.email) && { email: formData.email.trim() }),
        age: formData.age ? parseInt(formData.age) : undefined,
      }

      createCoach(payload, {
        onSuccess: () => {
          navigate('/coach') // Assuming this is the route to redirect after successful creation
        },
      })
    }
  }

  return (
    <Container maxWidth="md">
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

            <Grid size={{ xs: 12 }}>
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
