// src/components/DetailModal/index.tsx
import React from 'react'
import { useGetCourseSessionProgramById } from '../../API/CourseSession/courseSession.hook'
import moment from 'moment-jalaali'

interface DetailModalProps {
    isOpen: boolean
    onClose: () => void
    sessionId: string | null
    programId: string
}

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

// Persian digits conversion
const convertToPersianDigits = (text: string) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return text.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

const sessionStatusMap = {
    'scheduled': 'برنامه گذاری شده',
    'completed': 'برگذار شده',
    'cancelled': 'کنسل شده'
} as const

const DetailModal: React.FC<DetailModalProps> = ({
    isOpen,
    onClose,
    sessionId,
    programId
}) => {
    const { data, isLoading, error } = useGetCourseSessionProgramById(programId)

    if (!isOpen) return null

    // Find the specific session
    const selectedSession = data?.sessions?.find((session: any) => session._id === sessionId)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const AttendanceIcon = ({ status }: { status: 'present' | 'absent' }) => {
        if (status === 'present') {
            return (
                <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">حضور داشته</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center text-red-600">
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm">غایب بوده</span>
                </div>
            )
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-300 opacity-80"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 z-10 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
                dir="rtl"
            >
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">خطا در دریافت اطلاعات جلسه</p>
                    </div>
                ) : selectedSession ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="border-b pb-4">
                            <h3 className="text-xl font-medium text-gray-900">
                                جزئیات جلسه
                            </h3>
                        </div>

                        {/* Session Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-3">اطلاعات جلسه</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="block text-sm text-gray-600">تاریخ</span>
                                    <span className="font-medium">{convertToPersianDigits(selectedSession.date)}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-gray-600">زمان</span>
                                    <span className="font-medium">
                                        {convertToPersianDigits(selectedSession.startTime)} - {convertToPersianDigits(selectedSession.endTime)}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-sm text-gray-600">وضعیت</span>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSession.status)}`}>
                                        {sessionStatusMap[selectedSession.status as keyof typeof sessionStatusMap]}
                                    </span>
                                </div>
                            </div>
                            {selectedSession?.sessionReport?.description && (
                                <div className="mt-4">
                                    <span className="block text-sm text-gray-600">توضیحات</span>
                                    <p className="text-gray-800 mt-1">{selectedSession?.sessionReport?.description}</p>
                                </div>
                            )}

                            {selectedSession?.sessionReport?.submitted_at && (
                                <div className="mt-4">
                                    <span className="block text-sm text-gray-600">تاریخ ثبت</span>
                                    <p className="text-gray-800 mt-1">{moment(selectedSession?.sessionReport?.submitted_at).format('jYYYY/jM/jD HH:mm')}</p>
                                </div>
                            )}
                        </div>

                        {/* Attendance List */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">لیست حضور و غیاب</h4>

                            {selectedSession.attendance && selectedSession.attendance.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedSession.attendance.map((record: any, index: number) => (
                                        <div
                                            key={record.user._id || index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3 space-x-reverse">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    {record.user?.avatar?.file_name ? (
                                                        <img
                                                            src={`${SERVER_FILE}/${record.user.avatar.file_name}`}
                                                            alt={`${record.user.first_name} ${record.user.last_name}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-gray-600 text-sm">
                                                                {record.user.first_name?.[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Name */}
                                                <span className="font-medium mr-4 text-gray-800">
                                                    {record.user.first_name} {record.user.last_name}
                                                </span>
                                            </div>

                                            {/* Attendance Status */}
                                            <AttendanceIcon status={record.status} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    {selectedSession.status === 'completed'
                                        ? 'اطلاعات حضور و غیاب ثبت نشده است'
                                        : 'جلسه هنوز برگذار نشده است'
                                    }
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-4 border-t">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                onClick={onClose}
                            >
                                بستن
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600">جلسه مورد نظر یافت نشد</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DetailModal