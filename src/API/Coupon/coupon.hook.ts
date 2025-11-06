import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import couponApi from './coupon.api'

// Query keys
const COUPON_KEY = 'coupon'


// Get all coupons with filters
export const useGetAllCoupons = (params?: {
  page?: number
  limit?: number
  code?: string
  type?: string
  is_active?: boolean
  is_combined?: boolean
  valid_from?: string
  valid_until?: string
  discount_type?: string
  coupon_variant?: string
  createdAt_from?: string
  createdAt_to?: string
  sortBy?: string
}) => {
  return useQuery({
    queryKey: [COUPON_KEY, params],
    queryFn: () => couponApi.getAllCoupons(params),
    // Add these options to ensure proper refetching
    staleTime: 0,
    refetchOnMount: true,
  })
}

// create coupon
export const useCreateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (couponData: any) => couponApi.createCoupon(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPON_KEY] })
    },
  })
}
