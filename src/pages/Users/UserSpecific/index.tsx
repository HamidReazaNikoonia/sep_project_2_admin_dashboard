import { useParams } from 'react-router';
import { Box, Typography, Paper as MuiPaper, CircularProgress, Chip, Avatar } from '@mui/material';
import { useUserById } from '../../../API/Users/users.hook';
import { useCitiesByProvinceId } from '../../../API/SiteInfo/siteInfo.hook';
import StyledPaper from '../../../components/StyledPaper';
import { useState, useEffect } from 'react';



const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE;

const UserSpecific = () => {
  const { user_id } = useParams<{ user_id: string }>();

  const {
    data: user,
    isLoading,
    isError,
    error
  } = useUserById(user_id!);

  // State for province and city names
  const [provinceName, setProvinceName] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');

  // Fetch cities by province ID (only when user.province is available)
  const {
    data: provinceData,
    isLoading: isProvinceLoading
  } = useCitiesByProvinceId(user?.province?.toString() || '');

  // Update province and city names when data is available
  useEffect(() => {
    if (provinceData && user) {
      // Get province name
      if (provinceData.province?.name) {
        setProvinceName(provinceData.province.name);
      }

      // Get city name by filtering cities array
      if (provinceData.cities && user.city) {
        const foundCity = provinceData.cities.find((city: any) => city.id === user.city);
        if (foundCity) {
          setCityName(foundCity.name);
        }
      }
    }
  }, [provinceData, user]);



  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading user details: {error?.message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Typography>این کاربر یافت نشد</Typography>
      </Box>
    );
  }

  const userGenderMap = {
    'M': 'مرد',
    'F': 'زن'
  }

  return (
    <div className='bg-gray-200 pb-12 md:px-6 rounded-2xl' dir="rtl" >
      <div className='flex flex-col-reverse md:flex-row pt-6 justify-between items-center md:items-start w-full'>
        <div className='py-6 text-base md:text-4xl' >
          جزئیات کاربر    <span className='text-green-800'> {`${user.first_name} ${user.last_name}`} </span>
        </div>

        <Avatar
          src={`${SERVER_FILE}/${user?.avatar?.file_name}`}
          alt={`${user.first_name} ${user.last_name}`}
          sx={{ width: 160, height: 160, my: 1, mx: { xs: 0, md: 4 } }}
        />
      </div>

      <div className=''>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              نام
            </Typography>
            <Typography>{user.first_name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              نام خانوادگی
            </Typography>
            <Typography>{user.last_name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              ایمیل
            </Typography>
            <Typography>{user.email}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              شماره تلفن
            </Typography>
            <Typography>{user.mobile || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Role
            </Typography>
            <Typography>{user.role}</Typography>
          </Box>

          {/* Add more user details as needed */}
        </Box>

        {/* User Identity */}
        <div className='mt-8 px-2 md:px-6 py-6 border-t border-1 border-gray-400 rounded-lg'>
          <div className='w-full '>
            <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
              اطلاعات هویتی
            </Typography>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  نام پدر
                </Typography>
                <Typography>{user?.father_name || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  سن
                </Typography>
                <Typography>{user?.age || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  تاریخ تولد
                </Typography>
                <Typography>{user?.birth_date || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  وضعیت تاهل
                </Typography>
                <Typography>{user?.mariage_status ? 'متاهل' : 'مجرد'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  جنسیت
                </Typography>
                <Typography>{(userGenderMap[user?.gender as keyof typeof userGenderMap] || 'N/A')}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  شهر
                </Typography>
                <Typography>
                  {isProvinceLoading ? 'در حال بارگذاری...' : (cityName || user?.city || 'N/A')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  کشور
                </Typography>
                <Typography>{user?.country || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  استان
                </Typography>
                <Typography>
                  {isProvinceLoading ? 'در حال بارگذاری...' : (provinceName || user?.province || 'N/A')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  کد ملی
                </Typography>
                <Typography>{user?.nationalId || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  وضعیت تایید کد ملی
                </Typography>
                <Chip
                  label={user?.isNationalIdVerified ? "تایید شده" : "تایید نشده"}
                  sx={{ padding: '2px 10px' }}
                  color={user?.isNationalIdVerified ? "success" : "error"}
                />
              </Box>

              {user?.national_card_images && user?.national_card_images?.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    تصاویر کارت ملی
                  </Typography>
                  <div className='flex flex-wrap space-x-2.5 mt-2'>
                    {user.national_card_images.map((image: any, index: number) => (
                      <div className='flex flex-wrap'>
                        {/* Image */}
                        <a target="_blank" href={`${SERVER_FILE}/${image?.file_name}`} className='w-full max-w-48 flex flex-col'>
                          <img className='border-4 border-white' src={`${SERVER_FILE}/${image?.file_name}`} />
                          {/* Title */}
                          <div className='text-xs'> {image?.file_name} </div>
                        </a>
                      </div>

                    ))}
                  </div>
                </Box>
              )}

              {user?.personal_img && (
                <Box sx={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    عکس پرسنلی
                  </Typography>
                  <div className='flex flex-wrap space-x-2.5 mt-2'>

                    <div className='flex flex-wrap'>
                      {/* Image */}
                      <a target="_blank" href={`${SERVER_FILE}/${user?.personal_img?.file_name}`} className='w-full max-w-48 flex flex-col'>
                        <img className='border-4 border-white' src={`${SERVER_FILE}/${user?.personal_img?.file_name}`} />
                        {/* Title */}
                        <div className='text-xs'> {user?.personal_img?.file_name} </div>
                      </a>
                    </div>

                  </div>
                </Box>
              )}
            </Box>
          </div>
        </div>


        {/* User Address */}
        <div className='mt-8 px-2 md:px-6 py-6 border-t border-1 border-gray-400 rounded-lg'>
          <div className='w-full '>
            <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
              آدرس
            </Typography>

            <div className='w-full mb-6'>
              <div className="text-sm text-gray-600 mb-1">
                آدرس محل سکونت
              </div>
              <div className="text-base">
                {user?.address || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <div className="text-sm text-gray-600 mb-1">
                  شهر
                </div>
                <div className="text-base">
                  {isProvinceLoading ? 'در حال بارگذاری...' : (cityName || user?.city || 'N/A')}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">
                  استان
                </div>
                <div className="text-base">
                  {isProvinceLoading ? 'در حال بارگذاری...' : (provinceName || user?.province || 'N/A')}
                </div>
              </div>


              <div>
                <div className="text-sm text-gray-600 mb-1">
                  شغل
                </div>
                <div className="text-base">
                  {user?.job_title || 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">
                  شماره ثابت
                </div>
                <div className="text-base">
                  {user?.tel || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSpecific;
