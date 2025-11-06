import axios from '../axios'

const couponApi = {
  // Create course category
  createCoupon: async (couponData: any) => {
    const { data } = await axios.post('admin/coupon-code', couponData)
    return data
  },

   // Get all coupons with filters and pagination
   getAllCoupons: async (params?: {
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
    const { data } = await axios.get('admin/coupon-code', { params })
    return data
  },
}

export default couponApi
