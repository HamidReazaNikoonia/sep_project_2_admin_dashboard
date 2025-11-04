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
  Alert,
  Divider,
  Chip,
} from '@mui/material'
import DatePicker from 'react-datepicker2'
import moment from 'moment-jalaali'
import { useCreateCoupon } from '@/API/Coupon/coupon.hook'
import CourseSelector from '@/components/CourseSelector'
import CoachSelector from '@/components/CoachSelector'
import { showToast } from '@/utils/toast'

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
    is_combined: true,
    coupon_variant: '',
  })

  // Error state for validation
  const [errors, setErrors] = useState({
    max_uses: '',
    discount_value: '',
  })

  // State for course/session specific coupon
  const [isSpecificProducts, setIsSpecificProducts] = useState(false)
  const [isExceptMode, setIsExceptMode] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])

  // State for coach specific coupon
  const [isSpecificCoaches, setIsSpecificCoaches] = useState(false)
  const [isExceptCoachMode, setIsExceptCoachMode] = useState(false)
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([])

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

  // Handle checkbox change for specific products
  const handleSpecificProductsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsSpecificProducts(e.target.checked)
    // Reset selections when toggling
    if (!e.target.checked) {
      setSelectedCourses([])
      setSelectedSessions([])
      setIsExceptMode(false)
    }
  }

  // Handle checkbox change for except mode
  const handleExceptModeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsExceptMode(e.target.checked)
  }

  // Handle checkbox change for specific coaches
  const handleSpecificCoachesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsSpecificCoaches(e.target.checked)
    // Reset selections when toggling
    if (!e.target.checked) {
      setSelectedCoaches([])
      setIsExceptCoachMode(false)
    }
  }

  // Handle checkbox change for except coach mode
  const handleExceptCoachModeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsExceptCoachMode(e.target.checked)
  }

  // Handle checkbox change for is_combined
  const handleIsCombinedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData({
      ...formData,
      is_combined: e.target.checked,
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // validation
    if (formData.discount_type === '') {
      showToast('خطا', 'نوع تخفیف الزامی است', 'error')
      return
    }
    if (formData.discount_value === '' || Number(formData.discount_value) <= 0) {
      showToast('خطا', 'مقدار تخفیف الزامی است', 'error')
      return
    }
    
    if(formData.coupon_variant === '' || formData.coupon_variant === null || formData.coupon_variant === undefined) {
      showToast('خطا', 'نوع کوپن الزامی است', 'error')
      return
    }

    // Validate percentage discount value
    if (formData.discount_type === 'PERCENTAGE') {
      const discountValue = Number(formData.discount_value)
      if (discountValue < 1 || discountValue > 100) {
        showToast('خطا', 'مقدار تخفیف درصدی باید بین ۱ تا ۱۰۰ باشد', 'error')
        return
      }
    }


    // Check for validation errors
    if (errors.max_uses || errors.discount_value) {
      return
    }

    // Map courses with correct target_type
    const _selectedCourses = selectedCourses.map((courseId) => ({
      target_type: 'COURSE',
      target_id: courseId,
    }))

    // Map sessions with correct target_type
    const _selectedSessions = selectedSessions.map((sessionId) => ({
      target_type: 'COURSE_SESSION',
      target_id: sessionId,
    }))

    // Combine selected items
    const selectedItems = [..._selectedCourses, ..._selectedSessions]

    // Prepare coach IDs
    const coachIds = selectedCoaches

    // Prepare data for API
    const couponData = {
      ...formData,
      type: 'DISCOUNT',
      max_uses: Number(formData.max_uses),
      discount_value: Number(formData.discount_value),
      min_purchase_amount: formData.min_purchase_amount
        ? Number(formData.min_purchase_amount)
        : undefined,
      valid_from: formData.valid_from.format('YYYY-MM-DD'),
      valid_until: formData.valid_until.format('YYYY-MM-DD'),
      is_combined: formData.is_combined,
      coupon_variant: formData.coupon_variant,
      // Add courses/sessions to except_courses or applicable_courses
      ...(isSpecificProducts &&
        selectedItems.length > 0 && {
        [isExceptMode ? 'except_courses' : 'applicable_courses']: selectedItems,
      }),
      // Add coaches to except_coach or applicable_coach
      ...(isSpecificCoaches &&
        coachIds.length > 0 && {
        [isExceptCoachMode ? 'except_coach' : 'applicable_coach']: coachIds,
      }),
    }

    console.log('Submitting coupon data:', couponData)

    // Submit data
    createCouponMutation.mutate(couponData, {
      onSuccess: () => {
        showToast('موفق', 'کد تخفیف با موفقیت ایجاد شد', 'success')
        // Reset form state here if needed
      },
      onError: (error) => {
        console.error('Error creating coupon:', error)
        showToast('خطا', 'خطا در ایجاد کد تخفیف', 'error')
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

          {/* Coupon Variant */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Alert severity="info" sx={{ mb: 4 }}>
              <div className='mr-4'>
                <Typography variant="body2">
                  همه: کوپن روی همه محصولات اعمال خواهد شد
                </Typography>
                <Typography variant="body2">
                  کلاس های آموزشی: کوپن روی کلاس های آموزشی اعمال خواهد شد
                </Typography>
                <Typography variant="body2">
                  سفارش: کوپن  شامل محصولات فیزیکی و دوره های آفلاین هست اعمال خواهد شد
                </Typography>
              </div>

            </Alert>
            <FormControl fullWidth required>
              <InputLabel id="coupon-variant-label">نوع کوپن</InputLabel>
              <Select
                labelId="coupon-variant-label"
                id="coupon_variant"
                name="coupon_variant"
                value={formData.coupon_variant}
                onChange={handleChange}
                label="نوع کوپن"
              >
                <MenuItem value="ALL">همه</MenuItem>
                <MenuItem value="COURSE_SESSION">کلاس های آموزشی</MenuItem>
                <MenuItem value="ORDER">سفارش</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Description (Optional) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="توضیحات (اختیاری)"
              multiline
              rows={6}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          {/* Valid From Date */}
          <Grid sx={{ mt: 5 }} size={{ xs: 12, md: 6 }}>
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
          <Grid sx={{ mt: {xs: 1, md: 5} }} size={{ xs: 12, md: 6 }}>
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



          {/* Is Combined Checkbox */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_combined}
                  onChange={handleIsCombinedChange}
                  name="is_combined"
                  color="primary"
                />
              }
              label="آیا این کوپن قابل تجمیع هست"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 4 }}>
              <Chip label="اعمال کوپن روی آیتم های مشخص" size="small" />
            </Divider>
          </Grid>


          <Grid size={{ xs: 12 }}>
            <Alert severity="warning" sx={{ mb: 1 }}>
                <div className='mr-4'>
                  در نظر داشته باشید که مشخص و فیلتر کردن استاد و همزمان مشخص و فیلتر کردن دوره یا کلاس آموزشی در صورت در نظر گرفتن تداخل موجب خطا در سیستم میباشد , لذا در انتخاب هر دو توجه کافی کنید 
                </div>
            </Alert>
          </Grid>




          {/* Product Specific Checkbox */}
          <Grid size={{ xs: 12 }}>
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

          {/* Except Mode Checkbox (Conditional) */}
          {isSpecificProducts && (
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isExceptMode}
                    onChange={handleExceptModeChange}
                    name="exceptMode"
                    color="secondary"
                  />
                }
                label="کوپن روی تمام آیتم ها اعمال شود به غیر از"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mr: 4 }}>
                {isExceptMode
                  ? 'کوپن روی همه محصولات به جز موارد انتخاب شده اعمال خواهد شد'
                  : 'کوپن فقط روی موارد انتخاب شده اعمال خواهد شد'}
              </Typography>
            </Grid>
          )}

          {/* Course and Session Selectors (Conditional) */}
          {isSpecificProducts && (
            <>
              {/* Courses Selector */}
              <Grid size={{ xs: 12 }}>
                <CourseSelector
                  type="COURSE"
                  selectedIds={selectedCourses}
                  onSelectionChange={setSelectedCourses}
                  label={
                    isExceptMode
                      ? 'انتخاب فیلم های آموزشی که کوپن روی آنها اعمال نشود'
                      : 'انتخاب فیلم های آموزشی'
                  }
                  isExceptMode={isExceptMode}
                />
              </Grid>

              {/* Course Sessions Selector */}
              <Grid size={{ xs: 12 }}>
                <CourseSelector
                  type="COURSE_SESSION"
                  selectedIds={selectedSessions}
                  onSelectionChange={setSelectedSessions}
                  label={
                    isExceptMode
                      ? 'انتخاب دوره هایی که کوپن روی آنها اعمال نشود'
                      : 'انتخاب دوره ها'
                  }
                  isExceptMode={isExceptMode}
                />
              </Grid>
            </>
          )}

          {/* Coach Specific Checkbox */}
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSpecificCoaches}
                  onChange={handleSpecificCoachesChange}
                  name="specificCoaches"
                  color="primary"
                />
              }
              label="آیا میخواهید این کد تخفیف روی مربی خاصی اعمال شود"
            />
          </Grid>

          {/* Except Coach Mode Checkbox (Conditional) */}
          {isSpecificCoaches && (
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isExceptCoachMode}
                    onChange={handleExceptCoachModeChange}
                    name="exceptCoachMode"
                    color="secondary"
                  />
                }
                label="کوپن روی تمام مربیان اعمال شود به غیر از"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mr: 4 }}>
                {isExceptCoachMode
                  ? 'کوپن روی همه مربیان به جز موارد انتخاب شده اعمال خواهد شد'
                  : 'کوپن فقط روی مربیان انتخاب شده اعمال خواهد شد'}
              </Typography>
            </Grid>
          )}

          {/* Coach Selector (Conditional) */}
          {isSpecificCoaches && (
            <Grid size={{ xs: 12 }}>
              <CoachSelector
                selectedIds={selectedCoaches}
                onSelectionChange={setSelectedCoaches}
                label={
                  isExceptCoachMode
                    ? 'انتخاب مربیانی که کوپن روی آنها اعمال نشود'
                    : 'انتخاب مربیان'
                }
                isExceptMode={isExceptCoachMode}
              />
            </Grid>
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