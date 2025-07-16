import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Grid2 as Grid,
  FormHelperText,
} from '@mui/material'
import DatePicker from 'react-datepicker2'
import moment from 'moment-jalaali'
import { useCourses } from '@/API/Course/course.hook'
import { useCourseSessions } from '@/API/CourseSession/courseSession.hook'
import { useCreateCoupon } from '@/API/Coupon/coupon.hook'

const CreateCoupon = () => {
  // Form state
  const [formData, setFormData] = useState({
    discount_type: '',
    discount_value: '',
    max_uses: '',
    valid_from: moment(),
    valid_until: moment().add(1, 'month'),
    min_purchase_amount: '',
    description: '',
  })

  // Error state for validation
  const [errors, setErrors] = useState({
    max_uses: '',
    discount_value: '',
  })

  // State for course/session specific coupon
  const [isSpecificProducts, setIsSpecificProducts] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])

  // Fetch courses and sessions
  const { data: coursesData } = useCourses()
  const { data: courseSessionsData } = useCourseSessions()

  // Create coupon mutation
  const createCouponMutation = useCreateCoupon()

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>,
  ) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name as string]: value,
    })

    // Validate max_uses
    if (name === 'max_uses') {
      const numValue = Number(value)
      if (isNaN(numValue) || numValue < 1) {
        setErrors((prev) => ({
          ...prev,
          max_uses: 'تعداد استفاده باید بزرگتر یا مساوی 1 باشد',
        }))
      } else {
        setErrors((prev) => ({ ...prev, max_uses: '' }))
      }
    }

    // Validate discount_value (should be a positive number)
    if (name === 'discount_value') {
      const numValue = Number(value)
      if (isNaN(numValue) || numValue <= 0) {
        setErrors((prev) => ({
          ...prev,
          discount_value: 'مقدار تخفیف باید عدد مثبت باشد',
        }))
      } else {
        setErrors((prev) => ({ ...prev, discount_value: '' }))
      }
    }
  }

  // Handle date changes
  const handleDateChange = (name: string) => (date: any) => {
    setFormData({
      ...formData,
      [name]: date,
    })
  }

  // Handle checkbox change
  const handleSpecificProductsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsSpecificProducts(e.target.checked)
    // Reset selections when toggling
    if (!e.target.checked) {
      setSelectedCourses([])
      setSelectedSessions([])
    }
  }

  // Handle multi-select for courses
  const handleCourseSelectChange = (
    e: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setSelectedCourses(e.target.value as string[])
  }

  // Handle multi-select for sessions
  const handleSessionSelectChange = (
    e: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setSelectedSessions(e.target.value as string[])
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check for validation errors
    if (errors.max_uses || errors.discount_value) {
      return
    }

    const _selectedCourses = selectedCourses.map((course) => ({
      target_type :"COURSE_SESSION",
      target_id: course,
    }))

    const _selectedSessions = selectedSessions.map((session) => ({
      target_id: session,
      target_type: "COURSE"
    }))

    console.log({_selectedCourses, _selectedSessions})
    console.log({both: [..._selectedCourses, ..._selectedSessions]})

    // Prepare data for API
    const couponData = {
      ...formData,
      type: "DISCOUNT",
      max_uses: Number(formData.max_uses),
      discount_value: Number(formData.discount_value),
      min_purchase_amount: formData.min_purchase_amount
        ? Number(formData.min_purchase_amount)
        : undefined,
      valid_from: formData.valid_from.format('YYYY-MM-DD'),
      valid_until: formData.valid_until.format('YYYY-MM-DD'),
      ...(isSpecificProducts ? {
        applicable_courses: [..._selectedCourses, ..._selectedSessions]
      } : {})
    }

    // Submit data
    createCouponMutation.mutate(couponData, {
      onSuccess: () => {
        // Reset form or navigate away as needed
        alert('کد تخفیف با موفقیت ایجاد شد')
        // Reset form state here if needed
      },
      onError: (error) => {
        console.error('Error creating coupon:', error)
        alert('خطا در ایجاد کد تخفیف')
      },
    })
  }

  return (
    <Paper dir="rtl" sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        ایجاد کد تخفیف جدید
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Discount Type */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel id="discount-type-label">نوع تخفیف</InputLabel>
              <Select
                labelId="discount-type-label"
                id="discount_type"
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                label="نوع تخفیف"
              >
                <MenuItem value="PERCENTAGE">درصدی</MenuItem>
                <MenuItem value="FIXED_AMOUNT">مبلغ ثابت</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Discount Value */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              id="discount_value"
              name="discount_value"
              label="مقدار تخفیف"
              type="number"
              value={formData.discount_value}
              onChange={handleChange}
              error={!!errors.discount_value}
              helperText={errors.discount_value}
            />
          </Grid>

          {/* Max Uses */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              fullWidth
              id="max_uses"
              name="max_uses"
              label="حداکثر تعداد استفاده"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.max_uses}
              onChange={handleChange}
              error={!!errors.max_uses}
              helperText={errors.max_uses}
            />
          </Grid>

          {/* Min Purchase Amount (Optional) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              id="min_purchase_amount"
              name="min_purchase_amount"
              label="حداقل مبلغ خرید (اختیاری)"
              type="number"
              value={formData.min_purchase_amount}
              onChange={handleChange}
            />
          </Grid>

          {/* Valid From Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">تاریخ شروع اعتبار *</Typography>
            </Box>
            <DatePicker
              value={formData.valid_from}
              onChange={handleDateChange('valid_from')}
              isGregorian={false}
              timePicker={false}
              className="form-control w-100"
              inputFormat="jYYYY/jMM/jDD"
            />
          </Grid>

          {/* Valid Until Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2">تاریخ پایان اعتبار *</Typography>
            </Box>
            <DatePicker
              value={formData.valid_until}
              onChange={handleDateChange('valid_until')}
              isGregorian={false}
              timePicker={false}
              className="form-control w-100"
              inputFormat="jYYYY/jMM/jDD"
            />
          </Grid>

          {/* Description (Optional) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="توضیحات (اختیاری)"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          {/* Product Specific Checkbox */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSpecificProducts}
                  onChange={handleSpecificProductsChange}
                  name="specificProducts"
                  color="primary"
                />
              }
              label="آیا میخواهید این کد تخفیف روی محصول خاصی اعمال شود"
            />
          </Grid>

          {/* Applicable Courses Section (Conditional) */}
          {isSpecificProducts && (
            <>
              {/* Courses */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="courses-label">فیلم های آموزشی</InputLabel>
                  <Select
                    labelId="courses-label"
                    id="courses"
                    multiple
                    value={selectedCourses}
                    onChange={handleCourseSelectChange}
                    label="فیلم های آموزشی"
                    renderValue={(selected) => {
                      const selectedNames = (selected as string[]).map((id) => {
                        const course = coursesData?.data.results.find(
                          (c) => c.id === id,
                        )
                        return course ? course.title : id
                      })
                      return selectedNames.join(', ')
                    }}
                  >
                    {coursesData?.data.results.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        <Checkbox
                          checked={selectedCourses.indexOf(course.id) > -1}
                        />
                        {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>اضافه کردن فیلم های آموزشی</FormHelperText>
                </FormControl>
              </Grid>

              {/* Course Sessions */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="sessions-label">دوره ها</InputLabel>
                  <Select
                    labelId="sessions-label"
                    id="sessions"
                    multiple
                    value={selectedSessions}
                    onChange={handleSessionSelectChange}
                    label="دوره ها"
                    renderValue={(selected) => {
                      const selectedNames = (selected as string[]).map((id) => {
                        const session = courseSessionsData?.data.results.find(
                          (s) => s.id === id,
                        )
                        return session ? session.title : id
                      })
                      return selectedNames.join(', ')
                    }}
                  >
                    {courseSessionsData?.data.results.map((session) => (
                      <MenuItem key={session.id} value={session.id}>
                        <Checkbox
                          checked={selectedSessions.indexOf(session.id) > -1}
                        />
                        {session.title}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>دوره ها</FormHelperText>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Submit Button */}
          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={createCouponMutation.isPending}
            >
              {createCouponMutation.isPending
                ? 'در حال ارسال...'
                : 'ایجاد کد تخفیف'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default CreateCoupon
