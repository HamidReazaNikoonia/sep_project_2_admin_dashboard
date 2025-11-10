import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Chip,
  IconButton,
  Alert,
  Grid,
} from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import InventoryIcon from '@mui/icons-material/Inventory'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import UserSelector from '@/components/UserSelector'
import CourseSelector from '@/components/CourseSelector'
import ProductSelector from '@/components/ProductSelector'

const steps = ['انتخاب کاربر', 'انتخاب محصولات/دوره‌ها', 'اعمال کوپن', 'تایید و ثبت سفارش']

const ImplementNewOrderForUserExplicitPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [currentCoupon, setCurrentCoupon] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedUser(null)
    setSelectedProductIds([])
    setSelectedCourseIds([])
    setCouponCodes([])
    setCurrentCoupon('')
  }

  const handleAddCoupon = () => {
    if (currentCoupon.trim() && !couponCodes.includes(currentCoupon.trim())) {
      setCouponCodes([...couponCodes, currentCoupon.trim()])
      setCurrentCoupon('')
    }
  }

  const handleRemoveCoupon = (couponToRemove: string) => {
    setCouponCodes(couponCodes.filter(coupon => coupon !== couponToRemove))
  }

  const handleSubmitOrder = async () => {
    if (!selectedUser) {
      alert('لطفا کاربر را انتخاب کنید')
      return
    }

    if (selectedProductIds.length === 0 && selectedCourseIds.length === 0) {
      alert('لطفا حداقل یک محصول یا دوره انتخاب کنید')
      return
    }

    setIsSubmitting(true)

    try {
      // Here you would call the create order API
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('سفارش با موفقیت ثبت شد!')
      handleReset()
    } catch (error) {
      alert('خطا در ثبت سفارش')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              انتخاب کاربر
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              کاربر مورد نظر برای ثبت سفارش را جستجو و انتخاب کنید
            </Typography>
            <UserSelector
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
            />
          </Box>
        )
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              انتخاب محصولات و دوره‌ها
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              محصولات و دوره‌های مورد نظر برای سفارش را انتخاب کنید
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ProductSelector
                  selectedIds={selectedProductIds}
                  onSelectionChange={setSelectedProductIds}
                  label="انتخاب محصولات"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CourseSelector
                  type="COURSE"
                  selectedIds={selectedCourseIds}
                  onSelectionChange={setSelectedCourseIds}
                  label="انتخاب دوره‌ها"
                />
              </Grid>
            </Grid>
          </Box>
        )
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              اعمال کوپن تخفیف
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              در صورت داشتن کد کوپن، آن را وارد کنید (اختیاری)
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="کد کوپن را وارد کنید"
                value={currentCoupon}
                onChange={(e) => setCurrentCoupon(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCoupon()
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleAddCoupon}
                disabled={!currentCoupon.trim()}
              >
                افزودن
              </Button>
            </Box>

            {couponCodes.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  کوپن‌های اعمال شده:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {couponCodes.map((coupon, index) => (
                    <Chip
                      key={index}
                      label={coupon}
                      onDelete={() => handleRemoveCoupon(coupon)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              تایید و ثبت سفارش
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              لطفا اطلاعات سفارش را بررسی و تایید کنید
            </Typography>

            {/* Order Summary */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                اطلاعات کاربر
              </Typography>
              {selectedUser ? (
                <Box sx={{ mt: 2 }}>
                  <Typography>نام: {selectedUser.first_name} {selectedUser.last_name}</Typography>
                  <Typography>موبایل: {selectedUser.mobile}</Typography>
                  {selectedUser.email && <Typography>ایمیل: {selectedUser.email}</Typography>}
                </Box>
              ) : (
                <Alert severity="error">کاربر انتخاب نشده</Alert>
              )}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon />
                محصولات و دوره‌های انتخاب شده
              </Typography>
              {selectedProductIds.length === 0 && selectedCourseIds.length === 0 ? (
                <Alert severity="error">هیچ محصول یا دوره‌ای انتخاب نشده</Alert>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {selectedProductIds.length > 0 && (
                    <Typography>محصولات: {selectedProductIds.length} مورد</Typography>
                  )}
                  {selectedCourseIds.length > 0 && (
                    <Typography>دوره‌ها: {selectedCourseIds.length} مورد</Typography>
                  )}
                </Box>
              )}
            </Paper>

            {couponCodes.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumberIcon />
                  کوپن‌های تخفیف
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {couponCodes.map((coupon, index) => (
                    <Chip key={index} label={coupon} color="primary" />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        )
      default:
        return 'Unknown step'
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShoppingCartIcon />
        ثبت سفارش جدید
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, mb: 2 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            بازگشت
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          
          {activeStep === steps.length - 1 ? (
            <LoadingButton
              variant="contained"
              onClick={handleSubmitOrder}
              loading={isSubmitting}
              startIcon={<CheckCircleIcon />}
              disabled={!selectedUser || (selectedProductIds.length === 0 && selectedCourseIds.length === 0)}
            >
              ثبت سفارش
            </LoadingButton>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !selectedUser) ||
                (activeStep === 1 && selectedProductIds.length === 0 && selectedCourseIds.length === 0)
              }
            >
              بعدی
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default ImplementNewOrderForUserExplicitPage