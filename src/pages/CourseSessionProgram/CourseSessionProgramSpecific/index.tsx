import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useCancelProgramSession, useCompleteProgramSession, useGetCourseSessionProgramById } from '../../../API/CourseSession/courseSession.hook'
import { Link } from 'react-router'
import PromptModal from '@/components/PromptModal';
import moment from 'moment-jalaali'
import CompleteModal from '@/components/CompleteModal';
import { showToast } from '@/utils/toast';
import DetailModal from '@/components/DetailModal';

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

const sessionCancelMessage = {
  'scheduled': 'آیا مطمئن هستید که می‌خواهید این جلسه را کنسل کنید؟ با کنسل کردن این جلسه به تمامی دانش جو ها پیام کنسل شدن ارسال خواهد شد و این عملیات بدون بازگشت است',
  'completed': 'آیا مطمئن هستید که می‌خواهید این جلسه را کنسل کنید؟',
  'cancelled': 'آیا مطمئن هستید که می‌خواهید این جلسه را کنسل کنید؟'
} as const

type SessionStatus = keyof typeof sessionStatusMap

const getStatusColor = (status: SessionStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-200 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}


const getStatusCardContainerColor = (status: SessionStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-[#483d8b] text-white'
    case 'completed':
      return 'bg-green-500 text-white'
    case 'cancelled':
      return 'bg-red-500 text-white'
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
  programId: string
}

const SessionCard: React.FC<SessionCardProps> = ({ date, startTime, endTime, status, id, programId }) => {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // API Calls
  const { mutate: completeProgramMutation, isSuccess: isCompleteProgramSuccess, isPending: isCompleteProgramLoading, isError: isCompleteProgramError } = useCompleteProgramSession()
  const { mutate: cancelProgramMutation, isSuccess: isCancelProgramSuccess, isPending: isCancelProgramLoading, isError: isCancelProgramError } = useCancelProgramSession()

  // helpers var
  const weekDay = moment(date, 'jYYYY/jM/jD').format('dddd');
  const month = moment(date, 'jYYYY/jM/jD').format('jMMMM');
  const day = moment(date, 'jYYYY/jM/jD').format('jD');


  /**
   * Complete Program Session Side Effect
   */
  useEffect(() => {
    if (isCompleteProgramSuccess) {
      showToast('success', 'جلسه با موفقیت تکمیل شد')
    }
  }, [isCompleteProgramSuccess])

  useEffect(() => {
    if (isCompleteProgramError) {
      showToast('error', 'خطا در تکمیل جلسه')
    }
  }, [isCompleteProgramError])

  /**
   * Cancel Program Session Side Effect
   */
  useEffect(() => {
    if (isCancelProgramSuccess) {
      showToast('success', 'جلسه با موفقیت کنسل شد')
    }
  }, [isCancelProgramSuccess])

  useEffect(() => {
    if (isCancelProgramError) {
      showToast('error', 'خطا در کنسل کردن جلسه')
    }
  }, [isCancelProgramError])

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
    cancelProgramMutation({
      programId: programId,
      sessionId: id
    })
  }

  const handleCompleteSession = () => {
    setShowCompleteModal(true)
  }

  const handleCompleteSubmit = (data: { presentUsers: string[], description: string }) => {
    // TODO: Implement complete session mutation
    console.log('Completing session with data:', {
      sessionId: id,
      ...data
    })

    completeProgramMutation({
      programId: programId,
      sessionId: id,
      presentUsers: data.presentUsers,
      description: data.description
    })

    setShowCompleteModal(false)
  }

  const handleViewDetails = () => {
    // TODO: Implement view details functionality
    console.log('Viewing details for session:', id)
    setShowDetailModal(true)
  }

  // Loading state
  if (isCompleteProgramLoading || isCancelProgramLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className={`rounded-lg shadow-md p-4 relative ${getStatusCardContainerColor(status)} ${status === 'cancelled' ? 'opacity-70' : ''}`}>
        {/* Status Badge */}
        <div className={`absolute left-3 top-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {sessionStatusMap[status]}
        </div>

        {/* Date and Week Day */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white">{persianDate}</h3>
          <p className="text-sm text-gray-200 mt-1">{weekDay} - {(day && convertToPersianDigits(day)) || ''} {month}</p>
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
                className="w-full px-3 py-1.5 text-sm font-medium text-red-100 border border-red-200 rounded-md hover:bg-red-600 cursor-pointer transition-colors"
              >
                کنسل کردن
              </button>
            )}

            {/* Complete Button - Only show if session is scheduled */}
            {status === 'scheduled' && (
              <button
                onClick={handleCompleteSession}
                className="w-full px-3 py-1.5 text-sm font-medium text-green-100  border border-green-200 rounded-md hover:bg-green-600 cursor-pointer transition-colors"
              >
                تکمیل
              </button>
            )}

            {/* Details Button - Always show */}
            {status === 'completed' && (
              <button
                onClick={handleViewDetails}
                className="col-span-2 w-full px-3 py-1.5 text-sm font-medium text-blue-100 border border-blue-200 rounded-md hover:opacity-80 cursor-pointer transition-colors"
              >
                جزییات
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <PromptModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="کنسل کردن جلسه"
        message={sessionCancelMessage[status]}
        confirmText="بله، کنسل کن"
        cancelText="انصراف"
      />

      {/* Complete Modal */}
      <CompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onSubmit={handleCompleteSubmit}
        programId={programId}
      />

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
        }}
        sessionId={id}
        programId={programId}
      />
    </>
  )
}

export default function CourseSessionProgramSpecific() {
  const { id } = useParams<{ id: string }>()
  const [sampleMediaExpanded, setSampleMediaExpanded] = useState(false)
  const [subjectsExpanded, setSubjectsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({})

  const { data, isLoading, isError, error } = useGetCourseSessionProgramById(id!)

  const getUserSessionStatus = (sessionId: string, userId: string) => {
    const session = data?.sessions?.find((s: any) => s._id === sessionId)
    if (!session?.attendance) return null

    const userAttendance = session.attendance.find((att: any) => att.user._id === userId)
    return userAttendance?.status || null
  }

  const toggleMemberAccordion = (memberId: string) => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
  }

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

  const tabs = [
    { id: 'general' as TabType, label: 'اطلاعات عمومی' },
    { id: 'schedule' as TabType, label: 'اطلاعات زمان بندی' },
    { id: 'students' as TabType, label: 'اطلاعات دانشجویان' },
  ]

  const cancelledSessions = data?.sessions?.filter(session => session.status === 'cancelled') || []
  const otherSessions = data?.sessions?.filter(session => session.status !== 'cancelled') || []

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

              {otherSessions && otherSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {otherSessions.map((session: any) => (
                    <SessionCard
                      key={session._id}
                      id={session._id}
                      date={session.date}
                      startTime={session.startTime}
                      endTime={session.endTime}
                      status={session.status as SessionStatus}
                      programId={data._id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">هیچ جلسه‌ای برای این دوره تعریف نشده است</p>
              )}
            </div>


            {/* Cancelled Sessions */}
            {cancelledSessions.length > 0 && (
              <div className="bg-white mt-8 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-red-800 mb-4 border-b-2 border-red-300 pb-2">
                  جلسات کنسل شده
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cancelledSessions.map((session: any) => (
                    <SessionCard
                      key={session._id}
                      id={session._id}
                      date={session.date}
                      startTime={session.startTime}
                      endTime={session.endTime}
                      status={session.status as SessionStatus}
                      programId={data._id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case 'students':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-indigo-500 pb-2">
              لیست اعضا
            </h2>
            {data?.members && data.members.length > 0 ? (
              <div className="space-y-4">
                {data.members.map((member: any) => (
                  <div key={member._id} className="bg-gray-50 rounded-lg border">
                    {/* Member Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleMemberAccordion(member._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {member.user?.avatar?.file_name ? (
                              <img
                                src={`${SERVER_FILE}/${member.user.avatar.file_name}`}
                                alt={`${member.user.first_name} ${member.user.last_name}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-lg font-medium">
                                  {member.user.first_name?.[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Member Info */}
                          <div className="flex-1 min-w-0 mr-2 md:mr-4">
                            <h3 className="font-medium text-gray-800 truncate">
                              {member.user.first_name} {member.user.last_name}
                            </h3>
                            {member.user.mobile && (
                              <p className="text-sm text-gray-600 mt-1">
                                {convertToPersianDigits(member.user.mobile)}
                              </p>
                            )}
                            {member.enrolledAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                تاریخ ثبت نام: {convertToPersianDigits(moment(member.enrolledAt).format('jYYYY/jM/jD'))}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Accordion Arrow */}
                        <svg
                          className={`w-5 h-5 transform transition-transform ${expandedMembers[member._id] ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Attendance Accordion Content */}
                    {expandedMembers[member._id] && (
                      <div className="px-4 pb-4">
                        <div className="bg-white rounded-lg p-4 border-t">
                          <h4 className="font-medium text-gray-700 mb-3">سوابق حضور و غیاب</h4>

                          {data?.sessions && data.sessions.length > 0 ? (
                            <div className="space-y-2">
                              {data.sessions.map((session: any) => {
                                const userStatus = getUserSessionStatus(session._id, member.user._id)

                                return (
                                  <div
                                    key={session._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    {/* Session Info */}
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 space-x-reverse">
                                        <span className="font-medium text-gray-800">
                                          {convertToPersianDigits(session.date)}
                                        </span>
                                        <span className="text-sm text-gray-600 mr-1 md:mr-3">
                                          {convertToPersianDigits(session.startTime)} - {convertToPersianDigits(session.endTime)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs mr-2 md:mr-8 font-medium ${getStatusColor(session.status)}`}>
                                          {sessionStatusMap[session.status as keyof typeof sessionStatusMap]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Attendance Status */}
                                    <div className="flex items-center mr-6">
                                      {session.status === 'completed' ? (
                                        userStatus ? (
                                          userStatus === 'present' ? (
                                            <div className="flex items-center text-green-600">
                                              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              <span className="text-sm">حاضر</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center text-red-600">
                                              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                              <span className="text-sm">غایب</span>
                                            </div>
                                          )
                                        ) : (
                                          <div className="flex items-center text-gray-500">
                                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">نامشخص</span>
                                          </div>
                                        )
                                      ) : session.status === 'cancelled' ? (
                                        <div className="flex items-center text-gray-400">
                                          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                          </svg>
                                          <span className="text-sm">کنسل شده</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center text-blue-600">
                                          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span className="text-sm">در انتظار</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">هیچ جلسه‌ای برای این برنامه تعریف نشده است</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">عضوی برای این برنامه ثبت نشده است</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-2 md:p-6 bg-[#dcdcdc] min-h-screen" dir="rtl">
      {/* Tab Container */}
      <div className="max-w-6xl mx-auto">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-300 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 text-xs md:text-lg cursor-pointer font-medium transition-colors duration-200
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