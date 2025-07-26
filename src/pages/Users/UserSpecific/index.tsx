import { useParams } from 'react-router';
import { Box, Typography, Paper as MuiPaper, CircularProgress, Chip, Avatar, Button, createTheme } from '@mui/material';
import { useUserById } from '../../../API/Users/users.hook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useCitiesByProvinceId } from '../../../API/SiteInfo/siteInfo.hook';
import EditIcon from '@mui/icons-material/Edit';
// import StyledPaper from '../../../components/StyledPaper';
import { useState, useEffect } from 'react';
import { useGetAllCourseSessionsOfUser } from '../../../API/CourseSession/courseSession.hook';


// components
import EnrollmentsTable from './components/EnrollmentsTable';
import CoachCourseProgramList from './components/CoachCourseProgramList';
import { useOrders } from '@/API/Order/order.hook';
import ClassIcon from '@mui/icons-material/Class';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptIcon from '@mui/icons-material/Receipt';


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

  // State for showing course sessions
  const [showCourseSessions, setShowCourseSessions] = useState<boolean>(false);
  const [showCoachPrograms, setShowCoachPrograms] = useState<boolean>(false);
  const [showUserOrders, setShowUserOrders] = useState<boolean>(false);

  // Fetch cities by province ID (only when user.province is available)
  const {
    data: provinceData,
    isLoading: isProvinceLoading
  } = useCitiesByProvinceId(user?.province?.toString() || '');

  // Fetch course sessions when user clicks the button
  const {
    data: courseSessionsData,
    isLoading: isLoadingCourseSessions,
    isError: isErrorCourseSessions
  } = useGetAllCourseSessionsOfUser(user_id!, {
    enabled: showCourseSessions && !!user_id
  });

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

  const handleShowCourseSessions = () => {
    setShowCourseSessions(true);
  };

  const handleShowCoachPrograms = () => {
    setShowCoachPrograms(true);
  };

  const handleShowUserOrders = () => {
    setShowUserOrders(true);
  };



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
    'W': 'زن'
  }


  const userRoleTitleMap = {
    coach: "مربی",
    user: "کاربر",
    admin: "ادمین"
  }

  return (
    <div className='bg-gray-200 pb-12 px-2 md:px-6 rounded-2xl' dir="rtl" >
      <div className='flex justify-start pt-4' >
        <Button href={`/users/${user?.id}/edit`} variant="outlined" color="primary" startIcon={<EditIcon className='ml-4' />}>
          عملیات
        </Button>
      </div>
      <div className='flex flex-col-reverse md:flex-row pt-6 justify-between items-center md:items-start w-full'>
        <div className='py-6 text-base md:text-4xl' >
          جزئیات {userRoleTitleMap[user?.role as keyof typeof userRoleTitleMap]}    <span className='text-green-800 font-bold'> {`${user.first_name} ${user.last_name}`} </span>
        </div>


        <Avatar
          src={`${SERVER_FILE}/${user?.avatar?.file_name}`}
          alt={`${user.first_name} ${user.last_name}`}
          sx={{ width: 160, height: 160, my: 1, mx: { xs: 0, md: 4 }, border: '6px solid white', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}
        />
      </div>



      <div className=''>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              نام
            </Typography>
            <Typography fontWeight={500}>{user.first_name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              نام خانوادگی
            </Typography>
            <Typography fontWeight={500}>{user.last_name}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              کد دانشجویی
            </Typography>
            <Typography fontWeight={500}>{user?.student_code || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              شماره تلفن
            </Typography>
            <Typography fontWeight={500}>{user.mobile || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Role
            </Typography>
            <Typography fontWeight={500}>
            {userRoleTitleMap[user?.role as keyof typeof userRoleTitleMap]} 
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              موجودی کیف پول
            </Typography>
            <Typography fontWeight={500}>{(user?.wallet_amount ? user?.wallet_amount.toLocaleString('fa-IR') : 0)} <span className='text-xs text-gray-600'>
              ریال
            </span></Typography>
          </Box>



          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              کد دعوت
            </Typography>
            <Typography fontWeight={500}>{user?.referral_code || 'N/A'}</Typography>
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
                <Typography fontWeight={500}>{user?.father_name || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  سن
                </Typography>
                <Typography fontWeight={500}>{user?.age || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  تاریخ تولد
                </Typography>
                <Typography fontWeight={500}>{user?.birth_date || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  وضعیت تاهل
                </Typography>
                <Typography fontWeight={500}>{user?.mariage_status ? 'متاهل' : 'مجرد'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  جنسیت
                </Typography>
                <Typography fontWeight={500}>{(userGenderMap[user?.gender as keyof typeof userGenderMap] || 'N/A')}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  شهر
                </Typography>
                <Typography fontWeight={500}>
                  {isProvinceLoading ? 'در حال بارگذاری...' : (cityName || user?.city || 'N/A')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  کشور
                </Typography>
                <Typography fontWeight={500}>{user?.country || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  استان
                </Typography>
                <Typography fontWeight={500}>
                  {isProvinceLoading ? 'در حال بارگذاری...' : (provinceName || user?.province || 'N/A')}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  کد ملی
                </Typography>
                <Typography fontWeight={500}>{user?.nationalId || 'N/A'}</Typography>
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


        {/* User Course session */}
        {user?.role === 'user' && (
          <div className='mt-8 px-2 md:px-6 py-6 border-t border-1 border-gray-400 rounded-lg'>
            <div className='w-full '>
              <div className='flex justify-between items-center'>

                <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
                  کلاس های ثبت نام شده
                </Typography>

                <Button startIcon={<ClassIcon className='ml-4' />} onClick={handleShowCourseSessions} variant="contained" color="primary">
                  نمایش کلاس ها
                </Button>
              </div>


              {showCourseSessions && (
                <Button href={`/programs?user=${user?._id}`} variant="outlined" color="primary" startIcon={<VisibilityIcon className='ml-4 text-gray-500' />}>
                  <Typography textAlign="right" variant="subtitle2" color="textSecondary">
                    نمایش کامل کلاس های این کاربر در قسمت مدیریت کلاس ها
                  </Typography>
                </Button>
              )}

              {showCourseSessions && (
                <div className='mt-4'>
                  {isLoadingCourseSessions ? 'در حال بارگذاری...' : (
                    <div>
                      <EnrollmentsTable enrollments={courseSessionsData?.course_session_program_enrollments} />
                      {/* {courseSessionsData?.course_session_program_enrollments?.map((session: any) => (
                     <div key={session?.program?._id}>
                       a
                       <Typography variant="subtitle2" color="textSecondary">
                         {session?.program?.course?.title}
                       </Typography>
                     </div>
                   ))} */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}



        {/* Coach Programs */}
        {user?.role === 'coach' && user?.courseSessionsProgram && (
          <div className='mt-8 px-2 md:px-6 py-6 border-t border-1 border-gray-400 rounded-lg'>
            <div className='w-full '>
              <div className='flex justify-between items-center'>

                <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
                  دوره های مربی
                </Typography>

                <Button startIcon={<ClassIcon className='ml-4' />} onClick={handleShowCoachPrograms} variant="contained" color="primary">
                  نمایش دوره ها
                </Button>
              </div>


              {showCoachPrograms && (
                <Button href={`/programs?coach=${user?._id}`} variant="outlined" color="primary">
                  <Typography textAlign="right" variant="subtitle2" color="textSecondary">
                    نمایش کامل دوره های این مربی در قسمت مدیریت کلاس ها
                  </Typography>
                </Button>
              )}



              {showCoachPrograms && (
                <div className='mt-4'>
                  <div>
                    <CoachCourseProgramList programs={user?.courseSessionsProgram} />
                    {/* {courseSessionsData?.course_session_program_enrollments?.map((session: any) => (
                     <div key={session?.program?._id}>
                       a
                       <Typography variant="subtitle2" color="textSecondary">
                         {session?.program?.course?.title}
                       </Typography>
                     </div>
                   ))} */}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* User Orders */}
        <div className='mt-8 px-2 md:px-6 py-6 border-t border-1 border-gray-400 rounded-lg'>
          <div className='w-full '>
            <div className='flex justify-between items-center'>
              <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
                سفارشات
              </Typography>

              <Button startIcon={<ReceiptIcon className='ml-4' />} href={`/orders?user=${user?.id}`} onClick={handleShowUserOrders} variant="contained" color="primary">
                نمایش سفارش ها
              </Button>
            </div>
          </div>
        </div>


        <div className='mt-8 px-2 md:px-6 py-6 border-t border-1 border-gray-400 rounded-lg'>
          <div className='w-full '>
            <div className='flex justify-between items-center'>
              <Typography variant="h6" gutterBottom sx={{ mt: 1, mb: 2 }}>
                تراکنش ها
              </Typography>

              <Button startIcon={<PaidIcon className='ml-4' />} href={`/orders?user=${user?.id}`} onClick={handleShowUserOrders} variant="contained" color="primary">
                نمایش تراکنش ها
              </Button>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
};

export default UserSpecific;
