import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Alert,
} from '@mui/material'
import { ValidCoupon, InvalidCoupon } from '@/API/Order/types'

interface CouponCodesApplyProps {
  couponCodes: string[]
  couponInfo?: {
    validCoupons: ValidCoupon[]
    invalidCoupons: InvalidCoupon[]
    totalDiscount: number
  }
  onCouponAdd: (couponCode: string) => void
  onCouponRemove: (couponCode: string) => void
  loading?: boolean
}

const CouponCodesApply: React.FC<CouponCodesApplyProps> = ({
  couponCodes,
  couponInfo,
  onCouponAdd,
  onCouponRemove,
  loading = false,
}) => {
  const [currentCoupon, setCurrentCoupon] = useState('')

  const handleAddCoupon = () => {
    if (currentCoupon.trim() && !couponCodes.includes(currentCoupon.trim())) {
      onCouponAdd(currentCoupon.trim())
      setCurrentCoupon('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCoupon()
    }
  }

  const getCouponStatus = (code: string) => {
    if (couponInfo?.validCoupons.some(coupon => coupon.code === code)) {
      return 'valid'
    }
    if (couponInfo?.invalidCoupons.some(coupon => coupon.code === code)) {
      return 'invalid'
    }
    return 'pending'
  }

  const getInvalidReason = (code: string) => {
    const invalidCoupon = couponInfo?.invalidCoupons.find(coupon => coupon.code === code)
    return invalidCoupon?.reason
  }

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
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={handleAddCoupon}
          disabled={!currentCoupon.trim() || loading}
        >
          افزودن
        </Button>
      </Box>

      {couponCodes.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            کوپن‌های اعمال شده:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {couponCodes.map((coupon, index) => {
              const status = getCouponStatus(coupon)
              const invalidReason = getInvalidReason(coupon)

              return (
                <Box key={index}>
                  <Chip
                    label={coupon}
                    onDelete={status !== 'invalid' ? () => onCouponRemove(coupon) : undefined}
                    color={status === 'valid' ? 'success' : status === 'invalid' ? 'error' : 'default'}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  {status === 'valid' && (
                    <Alert severity="success" sx={{ mt: 1 }}>
                      کوپن معتبر - تخفیف اعمال شد
                    </Alert>
                  )}
                  {status === 'invalid' && invalidReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {invalidReason}
                    </Alert>
                  )}
                </Box>
              )
            })}
          </Box>

          {couponInfo && couponInfo.validCoupons.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                مجموع تخفیف: {couponInfo.totalDiscount.toLocaleString('fa-IR')} تومان
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default CouponCodesApply