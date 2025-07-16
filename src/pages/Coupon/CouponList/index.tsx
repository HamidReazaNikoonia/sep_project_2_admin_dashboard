import React from 'react';
import { Link } from 'react-router'
import {
  Box,
  Typography,
  Paper,
  Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import moment from 'moment-jalaali';
import { useGetAllCoupons } from '@/API/Coupon/coupon.hook';

// Define the coupon interface based on the mongoose schema
interface ApplicableCourse {
  target_type: 'COURSE_SESSION' | 'COURSE';
  target_id: string;
}

interface Coupon {
  id: string;
  code: string;
  type: 'REFERRAL' | 'DISCOUNT';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  min_purchase_amount: number;
  is_active: boolean;
  created_by?: string;
  applicable_courses?: ApplicableCourse[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const CouponList: React.FC = () => {
  const { data, isLoading, error } = useGetAllCoupons();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          خطا در بارگذاری کدهای تخفیف: {(error as Error).message}
        </Typography>
      </Box>
    );
  }

  const coupons = data?.results || [];

  // Function to format dates to Jalali calendar
  const formatDate = (dateString: string) => {
    return moment(dateString).format('jYYYY/jMM/jDD');
  };

  // Function to determine coupon status
  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);
    
    if (!coupon.is_active) {
      return { label: 'غیرفعال', color: 'error' as const };
    }
    if (validUntil < now) {
      return { label: 'منقضی شده', color: 'error' as const };
    }
    if (coupon.current_uses >= coupon.max_uses) {
      return { label: 'استفاده شده', color: 'warning' as const };
    }
    return { label: 'فعال', color: 'success' as const };
  };

  return (
    <Paper dir="rtl" sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          لیست کدهای تخفیف
        </Typography>

        <Link
          to="/coupon/create"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Button variant="contained" color="primary">
            افزودن کد تخفیف جدید
          </Button>
        </Link>
      </Box>

      <Grid container spacing={3}>
        {coupons.length > 0 ? (
          coupons.map((coupon: Coupon) => {
            const status = getCouponStatus(coupon);
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={coupon.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {coupon.code}
                      </Typography>
                      <Chip 
                        label={status.label} 
                        color={status.color}
                        size="small"
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        نوع:
                      </Typography>
                      <Typography variant="body2">
                        {coupon.type === 'DISCOUNT' ? 'تخفیف' : 'معرفی'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        تخفیف:
                      </Typography>
                      <Typography variant="body2">
                        {coupon.discount_value} {coupon.discount_type === 'PERCENTAGE' ? 'درصد' : 'تومان'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        استفاده:
                      </Typography>
                      <Typography variant="body2">
                        {coupon.current_uses} / {coupon.max_uses}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        اعتبار:
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(coupon.valid_from)} تا {formatDate(coupon.valid_until)}
                      </Typography>
                    </Box>
                    
                    {coupon.min_purchase_amount > 0 && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          حداقل خرید:
                        </Typography>
                        <Typography variant="body2">
                          {coupon.min_purchase_amount.toLocaleString()} تومان
                        </Typography>
                      </Box>
                    )}
                    
                    {coupon.applicable_courses && coupon.applicable_courses.length > 0 && (
                      <Box mt={1.5}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          مخصوص:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {coupon.applicable_courses.map((course, idx) => (
                            <Chip 
                              key={idx}
                              label={course.target_type === 'COURSE' ? 'دوره' : 'جلسه'} 
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {coupon.description && (
                      <Box mt={1.5}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          توضیحات:
                        </Typography>
                        <Typography variant="body2">
                          {coupon.description}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    {/* <Button size="small" color="primary">
                      ویرایش
                    </Button> */}
                    {/* <Button size="small" color="error">
                      حذف
                    </Button> */}
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box p={3} textAlign="center">
              <Typography variant="body1">
                هیچ کد تخفیفی یافت نشد.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default CouponList;