import axios from '../axios'

const couponApi = {
  // Create course category
  createCoupon: async (couponData: any) => {
    const { data } = await axios.post('course/category', couponData)
    return data
  },
}

export default couponApi
