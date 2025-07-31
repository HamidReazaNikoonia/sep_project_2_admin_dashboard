import React, { useState } from 'react'
import { useParams } from 'react-router'
import { useGetCourseSessionProgramById } from '../../../API/CourseSession/courseSession.hook'
import { Link } from 'react-router'
import PromptModal from '@/components/PromptModal';
import moment from 'moment-jalaali'

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

// Persian digits conversion
const convertToPersianDigits = (text: string) => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return text.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

type TabType = 'general' | 'schedule' | 'students'

const sessionStatusMap = {
  'scheduled': 'برنامه گذاری شده',
  'completed': 'برگذار شده',
  'cancelled': 'کنسل شده'
} as const

type SessionStatus = keyof typeof sessionStatusMap

const getStatusColor = (status: SessionStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-500 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}


const getStatusCardContainerColor = (status: SessionStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-[#483d8b] text-white'
    case 'completed':
      return 'bg-green-400 text-white'
    case 'cancelled':
      return 'bg-red-400 text-white'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

interface SessionCardProps {
  date: string
  startTime: string
  endTime: string
  status: SessionStatus
  id: string
}

const SessionCard: React.FC<SessionCardProps> = ({ date, startTime, endTime, status, id }) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const weekDay = moment(date, 'jYYYY/jM/jD').format('dddd')
  
  // Convert date and times to Persian digits
  const persianDate = convertToPersianDigits(date)
  const persianStartTime = convertToPersianDigits(startTime)
  const persianEndTime = convertToPersianDigits(endTime)

  const handleCancelSession = () => {
    setShowCancelModal(true)
  }

  const handleConfirmCancel = () => {
    // TODO: Implement cancel session mutation
    console.log('Cancelling session:', id)
    // cancelSessionMutation.mutate(id)
  }

  const handleCompleteSession = () => {
    // TODO: Implement complete session functionality
    console.log('Completing session:', id)
  }

  const handleViewDetails = () => {
    // TODO: Implement view details functionality
    console.log('Viewing details for session:', id)
  }
  
  return (
    <>
      <div className={`rounded-lg shadow-md p-4 relative ${getStatusCardContainerColor(status)}`}>
        {/* Status Badge */}
        <div className={`absolute left-3 top-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {sessionStatusMap[status]}
        </div>

        {/* Date and Week Day */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">{persianDate}</h3>
          <p className="text-sm text-gray-200 mt-1">{weekDay}</p>
        </div>

        {/* Time Range */}
        <div className="mt-4 flex items-center justify-center bg-gray-50 rounded-lg p-3">
          <div className="text-gray-700 text-center">
            <span className="font-medium">{persianStartTime}</span>
            <span className="mx-2">-</span>
            <span className="font-medium">{persianEndTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Cancel Button - Only show if session is scheduled */}
            {status === 'scheduled' && (
              <button
                onClick={handleCancelSession}
                className="w-full px-3 py-2 text-sm font-medium text-red-100 border border-red-200 rounded-md hover:bg-red-600 cursor-pointer transition-colors"
              >
                کنسل کردن
              </button>
            )}
            
            {/* Complete Button - Only show if session is scheduled */}
            {status === 'scheduled' && (
              <button
                onClick={handleCompleteSession}
                className="w-full px-3 py-2 text-sm font-medium text-green-100  border border-green-200 rounded-md hover:bg-green-600 cursor-pointer transition-colors"
              >
                تکمیل
              </button>
            )}

            {/* Details Button - Always show */}
            <button
              onClick={handleViewDetails}
              className="col-span-2 w-full px-3 py-2 text-sm font-medium text-blue-100 border border-blue-200 rounded-md hover:bg-blue-900 cursor-pointer transition-colors"
            >
              جزییات
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <PromptModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="کنسل کردن جلسه"
        message="آیا مطمئن هستید که می‌خواهید این جلسه را کنسل کنید؟"
        confirmText="بله، کنسل کن"
        cancelText="انصراف"
      />
    </>
  )
}

export default function CourseSessionProgramSpecific() {
  const { id } = useParams<{ id: string }>()
  const [sampleMediaExpanded, setSampleMediaExpanded] = useState(false)
  const [subjectsExpanded, setSubjectsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('general')

  const { data, isLoading, isError, error } = useGetCourseSessionProgramById(id!)

  const tabs = [
    { id: 'general' as TabType, label: 'اطلاعات عمومی' },
    { id: 'schedule' as TabType, label: 'اطلاعات زمانبندی' },
    { id: 'students' as TabType, label: 'اطلاعات دانشجویان' },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 text-lg">
          خطا در دریافت اطلاعات: {error?.message || 'خطای ناشناخته'}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600 text-lg">اطلاعات برنامه دوره یافت نشد</div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">جزئیات برنامه دوره</h1>
              <div className="text-sm text-gray-600">شناسه: {data._id}</div>
            </div>

            {/* مشخصات دوره */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                مشخصات دوره
              </h2>
              <Link to={`/course-session/${data?.course?._id}`}>
                <div className="flex items-center space-x-4 space-x-reverse">
                  {data?.course?.tumbnail?.file_name && (
                    <img
                      src={`${SERVER_FILE}/${data.course.tumbnail.file_name}`}
                      alt="تصویر دوره"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                    />
                  )}
                  <div className="text-lg text-gray-700 mr-4">

                    <span className="font-medium">عنوان دوره:</span> {data?.course?.title || 'نامشخص'}
                    <div className="text-sm text-gray-500 mt-1">
                      {data?.course?.sub_title || 'بدون زیرعنوان'}
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      برای مشاهده جزئیات دوره کلیک کنید
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* مشخصات استاد دوره */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                مشخصات استاد دوره
              </h2>
              <Link to={`/coach/${data?.coach?._id}`}>
                <div className="flex items-center space-x-4 space-x-reverse">
                  {data?.coach?.avatar?.file_name && (
                    <img
                      src={`${SERVER_FILE}/${data.coach.avatar.file_name}`}
                      alt="تصویر استاد"
                      className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                  <div className='flex flex-col  mr-4'>
                    <div className="text-lg text-gray-700">
                      <span className="font-medium">نام استاد:</span> {data?.coach?.first_name || ''} {data?.coach?.last_name || ''}
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      برای مشاهده جزئیات دوره کلیک کنید
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* مشخصات کلاس دوره */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className='flex justify-between items-center'>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4  border-gray-300 pb-2">
                  مشخصات کلاس دوره
                </h2>
                <div className={`text-xl font-bold ${data?.program_type === 'ONLINE' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                  {data?.program_type === 'ONLINE' ? 'آنلاین' : 'حضوری'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-gray-700">
                  <span className="font-semibold block">عنوان کلاس</span>
                  <span className="font-bold text-lg">{data?.class_id?.class_title || 'نامشخص'}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold block">وضعیت کلاس</span>
                  <span style={{ minWidth: '80px' }} className={`inline-block text-center px-3 py-1 rounded-full text-sm font-medium ${data?.class_id?.class_status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {data?.class_id?.class_status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold block">حداکثر تعداد دانشجو</span>
                  <span className="font-bold text-lg">{data?.class_id?.class_max_student_number || 'نامحدود'}</span>
                </div>
              </div>
            </div>

            {/* مشخصات دوره - سرفصل ها */}
            <div className="bg-white rounded-lg shadow-md">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSubjectsExpanded(!subjectsExpanded)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800 pb-2">
                    سرفصل های دوره
                  </h2>
                  <svg
                    className={`w-6 h-6 transform transition-transform ${subjectsExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {subjectsExpanded && (
                <div className="px-6 pb-6">
                  {data?.subjects && data.subjects.length > 0 ? (
                    <div className="space-y-3">
                      {data.subjects.map((subject: any, index: number) => (
                        <div key={index} className="bg-gray-300 p-4 rounded-lg">
                          <h3 className="font-medium text-gray-800 mb-1">{subject.title}</h3>
                          <p className="text-gray-600 text-sm">{subject.sub_title}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">سرفصلی تعریف نشده است</p>
                  )}
                </div>
              )}
            </div>

            {/* رسانه نمونه - آکاردئون */}
            <div className="bg-white rounded-lg shadow-md">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSampleMediaExpanded(!sampleMediaExpanded)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800 pb-2">
                    رسانه های نمونه
                  </h2>
                  <svg
                    className={`w-6 h-6 transform transition-transform ${sampleMediaExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {sampleMediaExpanded && (
                <div className="px-6 pb-6">
                  {data?.sample_media && data.sample_media.length > 0 ? (
                    <div className="space-y-4">
                      {data.sample_media.map((media: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="font-medium text-gray-700 block">نوع رسانه:</span>
                              <span className="text-gray-600">{media.media_type}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 block">عنوان:</span>
                              <span className="text-gray-600">{media.media_title}</span>
                            </div>
                            <div>
                              {media.url_address && (
                                <a
                                  href={media.url_address}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  مشاهده رسانه
                                </a>
                              )}
                              {media.file?.file_name && (
                                <a
                                  href={`${SERVER_FILE}/${media.file.file_name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline block mt-1"
                                >
                                  دانلود فایل
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">رسانه نمونه ای تعریف نشده است</p>
                  )}
                </div>
              )}
            </div>

            {/* پکیج ها */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                پکیج ها
              </h2>
              {data?.packages && data.packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.packages.map((pkg: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        {pkg.avatar?.file_name && (
                          <img
                            src={`${SERVER_FILE}/${pkg.avatar.file_name}`}
                            alt="تصویر پکیج"
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 mb-2">{pkg.title}</h3>
                          <div className="text-lg font-semibold text-green-600">
                            {formatPrice(pkg.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">پکیجی تعریف نشده است</p>
              )}
            </div>

            {/* قیمت */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-500 pb-2">
                اطلاعات قیمت
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-2">قیمت اصلی</div>
                  <div className="text-xl font-bold text-blue-600">
                    {data?.price_real ? formatPrice(data.price_real) : 'نامشخص'}
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-2">قیمت تخفیف خورده</div>
                  <div className="text-xl font-bold text-green-600">
                    {data?.price_discounted ? formatPrice(data.price_discounted) : 'بدون تخفیف'}
                  </div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-2">فروش ویژه</div>
                  <div className={`text-xl font-bold ${data?.is_fire_sale ? 'text-orange-600' : 'text-gray-600'}`}>
                    {data?.is_fire_sale ? 'فعال' : 'غیرفعال'}
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-gray-700 mb-2">نوع برنامه</div>
                  <div className={`text-xl font-bold ${data?.program_type === 'ONLINE' ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                    {data?.program_type === 'ONLINE' ? 'آنلاین' : 'حضوری'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
                جلسات دوره
              </h2>
              
              {data?.sessions && data.sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data.sessions.map((session: any) => (
                    <SessionCard
                      key={session._id}
                      id={session._id}
                      date={session.date}
                      startTime={session.startTime}
                      endTime={session.endTime}
                      status={session.status as SessionStatus}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">هیچ جلسه‌ای برای این دوره تعریف نشده است</p>
              )}
            </div>
          </div>
        )
      case 'students':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
              اطلاعات دانشجویان
            </h2>
            <p className="text-gray-500">این بخش در حال تکمیل است...</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6 bg-[#dcdcdc] min-h-screen" dir="rtl">
      {/* Tab Container */}
      <div className="max-w-6xl mx-auto">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-300 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 text-lg font-medium transition-colors duration-200
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-[2px]'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}