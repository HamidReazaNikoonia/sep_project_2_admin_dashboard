import axios from '../axios'

const couponApi = {
  // Create course category
  createCoupon: async (couponData: any) => {
    const { data } = await axios.post('admin/coupon-code', couponData)
    return data
  },

  // get all coupons
  getAllCoupons: async () => {
    const { data } = await axios.get('admin/coupon-code')
    return data
  },
}

export default couponApi
