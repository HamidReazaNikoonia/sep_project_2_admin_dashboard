import React, { useMemo, useState } from 'react'
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
  Grid2 as Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import LoadingButton from '@/components/LoadingButton'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import InventoryIcon from '@mui/icons-material/Inventory'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'

import UserSelector from '@/components/UserSelector'
import CourseSelector from '@/components/CourseSelector'
import ProductSelector from '@/components/ProductSelector'
import CouponCodesApply from '@/components/CouponCodesApply'

import { useCalculateOrderSummary, useCreateOrder } from '@/API/Order/order.hook'
import { useProducts } from '@/API/Products/products.hook'
import { useCourses } from '@/API/Course/course.hook'

const steps = ['انتخاب کاربر', 'انتخاب محصولات/دوره‌ها', 'اعمال کوپن و پیش‌فاکتور', 'تایید و ثبت سفارش']

const ImplementNewOrderForUserExplicitPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [couponCodes, setCouponCodes] = useState<string[]>([])
  const [currentCoupon, setCurrentCoupon] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)



  // Create items array for API call
  const orderItems = useMemo(() => {
    const items: Array<{ productId?: string; courseId?: string; quantity: number }> = []
    
    selectedProductIds.forEach(id => {
      items.push({ productId: id, quantity: 1 })
    })
    
    selectedCourseIds.forEach(id => {
      items.push({ courseId: id, quantity: 1 })
    })
    
    return items
  }, [selectedProductIds, selectedCourseIds])

   // Calculate order summary
   const { data: orderSummary, isLoading: summaryLoading } = useCalculateOrderSummary({
    couponCodes,
    items: orderItems,
    enabled: activeStep >= 2 && orderItems.length > 0,
  })

  // Create order mutation
  const createOrderMutation = useCreateOrder()

  // Fetch product details for display
  const { data: productsData } = useProducts({
    page: 1,
    limit: 100,
    enabled: selectedProductIds.length > 0,
  })

  // Fetch course details for display
  const { data: coursesData } = useCourses({
    page: 1,
    limit: 100,
    enabled: selectedCourseIds.length > 0,
  })

  

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

  const handleAddCoupon = (couponCode: string) => {
    if (!couponCodes.includes(couponCode)) {
      setCouponCodes([...couponCodes, couponCode])
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
      await createOrderMutation.mutateAsync({
        customer: selectedUser.id,
        products: orderItems.map(item => ({
          product: item.productId,
          course: item.courseId,
          quantity: item.quantity,
        })),
        couponCodes: couponCodes,
      })
      
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
              <Grid size={{ xs: 12 }}>
                <ProductSelector
                  selectedIds={selectedProductIds}
                  onSelectionChange={setSelectedProductIds}
                  label="انتخاب محصولات"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
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
                اعمال کوپن و پیش‌فاکتور
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                کوپن‌های تخفیف را اعمال کرده و پیش‌فاکتور سفارش را مشاهده کنید
              </Typography>
  
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CouponCodesApply
                    couponCodes={couponCodes}
                    couponInfo={orderSummary?.couponInfo}
                    onCouponAdd={handleAddCoupon}
                    onCouponRemove={handleRemoveCoupon}
                    loading={summaryLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MonetizationOnIcon />
                      پیش‌فاکتور
                    </Typography>
  
                    {summaryLoading ? (
                      <Typography>در حال محاسبه...</Typography>
                    ) : orderSummary ? (
                      <Box>
                        {/* Order Items */}
                        <List>
                          {orderSummary?.products?.map((item, index) => {
                            return (
                              <ListItem key={index} divider>
                                <ListItemText
                                  primary={item?.course || item?.product}
                                  secondary={`تعداد: ${item?.quantity} - قیمت: ${item?.price && item?.price.toLocaleString('fa-IR')} ریال`}
                                />
                              </ListItem>
                            )
                          })}
                        </List>
  
                        <Divider sx={{ my: 2 }} />
  
                        {/* Summary */}
                        {orderSummary && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>مجموع:</Typography>
                            <Typography>{orderSummary?.total?.toLocaleString('fa-IR')} تومان</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>مالیات:</Typography>
                            <Typography>{orderSummary?.tax?.toLocaleString('fa-IR')} تومان</Typography>
                          </Box>
                          {orderSummary?.couponInfo?.totalDiscount > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                              <Typography>تخفیف:</Typography>
                              <Typography>-{orderSummary?.couponInfo?.totalDiscount?.toLocaleString('fa-IR')} تومان</Typography>
                            </Box>
                          )}
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <Typography>مجموع نهایی:</Typography>
                            <Typography>{orderSummary?.totalAmount?.toLocaleString('fa-IR')} تومان</Typography>
                          </Box>
                        </Box>
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        برای مشاهده پیش‌فاکتور، ابتدا محصول یا دوره‌ای انتخاب کنید
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShoppingCartIcon />
        ثبت سفارش جدید
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel> &nbsp;&nbsp;{label} </StepLabel>
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