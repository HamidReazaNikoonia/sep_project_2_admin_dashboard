import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import couponApi from './coupon.api'

// Query keys
const COUPON_KEY = 'coupon'

export const useCreateCoupon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (couponData: any) => couponApi.createCoupon(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COUPON_KEY] })
    },
  })
}
