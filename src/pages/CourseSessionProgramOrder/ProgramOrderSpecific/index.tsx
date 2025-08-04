import React from 'react'
import { useParams, Link } from 'react-router'
import { useGetCourseSessionProgramOrderById } from '../../../API/CourseSession/courseSession.hook'
import Spinner from '../../../components/Spinner'
import { findFirstSession } from '../../../utils/helper'
import { convertToPersianDigits } from '../../../utils/helper'


const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

export default function ProgramOrderSpecific() {
    const { order_id } = useParams<{ order_id: string }>()

    const {
        data: programOrder,
        isLoading,
        error
    } = useGetCourseSessionProgramOrderById(order_id || '')

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <Spinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-md" dir="rtl">
                <h2 className="text-lg font-semibold text-red-800 mb-2">خطا در بارگذاری سفارش</h2>
                <p className="text-red-600">
                    بارگذاری اطلاعات سفارش با خطا مواجه شد. لطفاً مجدداً تلاش کنید.
                </p>
            </div>
        )
    }

    if (!programOrder) {
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md" dir="rtl">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">سفارش پیدا نشد</h2>
                <p className="text-yellow-600">
                    سفارش درخواستی یافت نشد.
                </p>
            </div>
        )
    }

    const order = programOrder;

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'در انتظار' },
            'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'تکمیل شده' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'لغو شده' },
            'active': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'فعال' },
            'inactive': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'غیرفعال' },
            'unpaid': { bg: 'bg-red-100', text: 'text-red-800', label: 'پرداخت نشده' },
            'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'پرداخت شده' },
            'refunded': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'بازگردانی شده' }
        }

        const config = statusConfig[status as keyof typeof statusConfig] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
    }

    return (
        <div className="p-6 space-y-6" dir="rtl">
            {/* Course Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات دوره</h2>
                <Link
                    to={`/courses/${order?.classProgramId?.course?.id}`}
                    className="block hover:bg-gray-50 transition-colors rounded-lg p-4 border border-gray-200"
                >
                    <div className="flex items-start gap-4">
                        {order?.classProgramId?.course?.tumbnail?.file_name && (
                            <img
                                src={order.classProgramId?.course?.tumbnail ? `${SERVER_FILE}/${order.classProgramId.course.tumbnail.file_name}` : ''}
                                alt="تصویر دوره"
                                className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                عنوان دوره: {order?.classProgramId?.course?.title}
                            </h3>
                            {order?.classProgramId?.course?.sub_title && (
                                <p className="text-gray-600">
                                    زیر عنوان: {order.classProgramId.course.sub_title}
                                </p>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Program Section */}
            <Link to={`/course-session-program/${order?.classProgramId?.id}`}>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات کلاس</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {order?.classProgramId?.coach?.avatar?.file_name && (
                                <img
                                    src={order.classProgramId?.coach?.avatar ? `${SERVER_FILE}/${order.classProgramId.coach.avatar.file_name}` : ''}
                                    alt="تصویر مربی"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium text-gray-900">
                                    مربی: {order?.classProgramId?.coach?.first_name} {order?.classProgramId?.coach?.last_name}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت کلاس</label>
                            {getStatusBadge(order?.classProgramId?.status || '')}
                        </div>

                        {order?.classProgramId?.sessions && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">شروع دوره</label>
                                <p className="text-gray-900">{convertToPersianDigits(findFirstSession(order.classProgramId.sessions))}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </Link>

            {/* Packages Section */}
            {order?.packages && order.packages.length > 0 && (
                <div className="bg-white mt-6 shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">پکیج‌ها</h2>
                    <div className="space-y-3">
                        {order.packages.map((pkg: any, index: number) => (
                            <div key={pkg._id || index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{pkg.title}</p>
                                        <p className="text-sm text-gray-500">شناسه: {pkg._id}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-green-600">{formatPrice(pkg.price)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">اطلاعات سفارش</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">شناسه سفارش</label>
                            <p className="text-gray-900">{order?.id}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">کد پیگیری سفارش</label>
                            <p className="text-gray-900">{order?.reference}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت سفارش</label>
                            {getStatusBadge(order?.orderStatus || '')}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت پرداخت</label>
                            {getStatusBadge(order?.paymentStatus || '')}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">روش پرداخت</label>
                            <p className="text-gray-900">{order?.paymentMethod || 'نامشخص'}</p>
                        </div>
                    </div>

                    {/* Prices Section */}
                    <div className="space-y-4">
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-900 mb-3">جزئیات قیمت</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">قیمت اصلی کلاس:</span>
                                    <span className="font-medium">{formatPrice(order?.program_price_real || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">قیمت کلاس با تخفیف:</span>
                                    <span className="font-medium">{formatPrice(order?.program_price_discounted || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">قیمت نهایی کلاس:</span>
                                    <span className="font-medium">{formatPrice(order?.program_original_price || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">جمع هزینه پکیج‌ها:</span>
                                    <span className="font-medium">{formatPrice(order?.total_packages_price || 0)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>جمع کل تخفیف:</span>
                                    <span className="font-medium">{formatPrice(order?.total_discount || 0)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                    <span>جمع کل:</span>
                                    <span className="text-green-600">{formatPrice(order?.program_total_price || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Section */}
            {order?.appliedCoupons && order.appliedCoupons.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">کوپن‌های استفاده شده</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.appliedCoupons.map((coupon: any, index: number) => (
                            <div key={coupon?.couponId?.id || index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">شناسه کوپن:</span>
                                        <span className="text-sm text-gray-900">{coupon?.couponId?.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">مقدار تخفیف:</span>
                                        <span className="text-sm font-semibold text-green-600">{formatPrice(coupon?.discountAmount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">نوع تخفیف:</span>
                                        <span className="text-sm text-gray-900">{coupon?.couponId?.discount_type === 'PERCENTAGE' ? 'درصدی' : 'مبلغ ثابت'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">مقدار:</span>
                                        <span className="text-sm text-gray-900">{ coupon?.couponId?.discount_type === 'PERCENTAGE' ? `${coupon?.couponId?.discount_value}%` : (coupon?.couponId?.discount_value || 0) }</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">نوع:</span>
                                        <span className="text-sm text-gray-900">{coupon?.couponId?.type === "REFERRAL" ? "کد معرف" : "کوپن خرید"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            

            {/* Transaction Section */}
            {order?.transactionId && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">تراکنش مالی</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه تراکنش</label>
                                <p className="text-gray-900">{order?.transactionId?.id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">کد رفرنس تراکنش</label>
                                <p className="text-gray-900">{order?.transactionId?.payment_reference_id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه فاکتور</label>
                                <p className="text-gray-900">{order?.transactionId?.factorNumber}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه order</label>
                                <p className="text-gray-900">{order?.transactionId?.order_id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
                                <div className="flex items-center gap-2">
                                    {order?.transactionId?.status ? (
                                        <>
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-600 font-medium">موفق</span>
                                        </>
                                    ) : (
                                        <span className="text-red-600 font-medium">ناموفق</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">مالیات بانکی</label>
                                <p className="text-gray-900">{formatPrice(order?.transactionId?.tax || 0)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ</label>
                                <p className="text-gray-900 font-semibold">{formatPrice(order?.transactionId?.amount || 0)}</p>
                            </div>
                        </div>

                        {/* Payment Details */}
                        {order?.transactionId?.payment_details && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 mb-3">جزئیات پرداخت</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">هش کارت بانکی</label>
                                    <p className="text-gray-900 font-mono text-sm">{order?.transactionId?.payment_details?.card_hash}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">شماره کارت</label>
                                    <p className="text-gray-900">{order?.transactionId?.payment_details?.card_pan}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">کد</label>
                                    <p className="text-gray-900">{order?.transactionId?.payment_details?.code}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">کارمزد</label>
                                    <p className="text-gray-900">{formatPrice(order?.transactionId?.payment_details?.fee || 0)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع کارمزد</label>
                                    <p className="text-gray-900">{order?.transactionId?.payment_details?.fee_type}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">پیام</label>
                                    <p className="text-gray-900">{order?.transactionId?.payment_details?.message}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">کارمزد شاپرک</label>
                                    <p className="text-gray-900">{formatPrice(order?.transactionId?.payment_details?.shaparak_fee || 0)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
