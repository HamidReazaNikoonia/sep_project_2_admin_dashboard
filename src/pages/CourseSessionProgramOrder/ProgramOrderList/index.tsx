import { useState, useCallback } from 'react'
import { debounce } from 'lodash'
import List from "../components/List";
import { Link } from 'react-router'

import { useGetAllCourseSessionProgramOrders } from '../../../API/CourseSession/courseSession.hook'
import { convertToPersianDigits } from '@/utils/helper';
import { formatDateShort } from '@/utils/date';




const SERVER_FILE = process.env.REACT_APP_SERVER_FILE
const SERVER_URL = process.env.REACT_APP_SERVER_URL

 // Helper get frist date from sessions
 const getFirstProgramSessionDate = (sessions: any[]) => {
    const date = sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date;
    return date ? convertToPersianDigits(formatDateShort(date)) : 'N/A';
}


const ProgramOrderList = () => {


    const userRoleTitleMap = {
        coach: "مربی",
        user: "کاربر",
        admin: "ادمین"
    }

    const renderUserItem = (order) => (
        <div dir='rtl' key={order?.id} className="p-3 border-b hover:bg-gray-50">
            <Link to={`/course-session-program/orders/${order?.id}`} className="font-medium hover:opacity-80">
                {/* Mobile Layout (column) */}
                <div className="md:hidden space-y-3">
                    {/* Row 1: Name + ID */}
                    <div className="flex flex-col">
                        <p className="font-medium mb-2">{order?.userId?.first_name} - {order?.userId?.last_name}</p>
                        <p className="text-xs text-gray-500 pt-1">
                            <a href={`tel:${order?.userId?.mobile}`} className="hover:underline">
                                موبایل {order?.userId?.mobile ? convertToPersianDigits(order?.userId?.mobile) : 'N/A'}
                            </a>
                        </p>
                        <p className="text-[11px] text-gray-400">ID: {order?.userId?.id}</p>
                    </div>

                    {/* Row 2: Email */}
                    <div>
                        <p className="text-xs text-gray-400"></p>
                        <p className="text-sm text-gray-700">{order?.user?.role && userRoleTitleMap[order?.user?.role]}</p>
                    </div>

                    {/* Row 3: Mobile */}
                    <div className='flex flex-row-reverse justify-between'>
                    <p className="text-sm">
                        <span className="text-xs text-gray-400 block">استاد</span>
                        {order?.classProgramId?.coach?.first_name} {order?.classProgramId?.coach?.last_name}
                    </p>

                    <p className="text-sm">
                        <span className="text-xs text-gray-400 block">دوره</span>
                        {order?.classProgramId?.course?.title}
                    </p>
                    </div>

                    <div className='flex flex-row-reverse justify-between'>
                    <div className="">
                        <p className="text-xs text-gray-400">تاریخ شروع دوره</p>
                        <p className="text-sm mt-1 text-gray-700">{getFirstProgramSessionDate(order?.classProgramId?.sessions)}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">تاریخ ثبت نام</p>
                        <p className="text-sm mt-1 text-gray-700">{order?.createdAt ? convertToPersianDigits(formatDateShort(order?.createdAt)) : 'N/A'}</p>
                    </div>
                    </div>

                    {/* Row 4: coach_is_valid */}
                    <div className='flex flex-row justify-between'>
                    <p className="text-xs text-gray-400">هزینه پرداخت شده</p>
                    <p className="text-xs text-gray-700">{order?.final_order_price ? (order?.final_order_price).toLocaleString('fa-IR') : '0'} ریال</p>
                    </div>

                    {/* Status */}
                    <div className='flex flex-row-reverse justify-between'>
                            <div>
                            <p className="text-xs mb-1 text-gray-400">وضعیت پرداخت</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${order?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {order?.paymentStatus === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
                        </span>
                            </div>

                            <div>
                            <p className="text-xs mb-1 text-gray-400">وضعیت ثبت نام</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${order?.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {order?.orderStatus === 'pending' ? 'درحال انتظار' : 'تایید شده'}
                        </span>
                            </div>
                        </div>

                    {/* Row 5: Status + Actions */}
                    {/* <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${order?.user?.coach_is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {order?.user?.coach_is_valid ? 'استاد تایید شده' : ' عدم تایید استاد '}
                        </span>
                        <div className="flex space-x-2">
                            <Link
                                to={`/users/${order?.user?.id}/edit`}
                                className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
                                تغییرات
                            </Link>
                        </div>
                    </div> */}
                </div>

                {/* Desktop Layout (grid) */}
                <div className="hidden md:grid grid-cols-12 items-center py-2">
                    <div className="col-span-3">
                        <div className="flex items-center gap-2">
                            <img 
                                src={order?.userId?.avatar ?`${SERVER_FILE}/${order?.userId?.avatar?.file_name}` : '/default-avatar.png'} 
                                alt="User avatar"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <p className="font-medium">{order?.userId?.first_name} - {order?.userId?.last_name}</p>
                        </div>
                        <p className="text-xs text-gray-500 pt-1">موبایل {order?.userId?.mobile ? convertToPersianDigits(order?.userId?.mobile) : 'N/A'}</p>
                        <p className="text-[11px] text-gray-400">ID: {order?.userId?.id}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-xs text-gray-400">دوره</p>
                        <p className="text-sm text-gray-700">{order?.classProgramId?.course?.title}</p>
                    </div>

                    <div className="col-span-2">
                        <div className='flex flex-col'>
                        <p className="text-sm">
                            <span className="text-xs text-gray-400 block">استاد</span>
                            {order?.classProgramId?.coach?.first_name} {order?.classProgramId?.coach?.last_name}
                        </p>

                        <p className="text-sm pt-3">
                            <span className="text-xs text-gray-400 block">کلاس</span>
                            {order?.classProgramId?.class_id?.class_title}
                        </p>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <div className='flex flex-col'>
                            <div>
                            <p className="text-xs text-gray-400">تاریخ شروع دوره</p>
                            <p className="text-sm mt-1 text-gray-700">{getFirstProgramSessionDate(order?.classProgramId?.sessions)}</p>
                            </div>

                            <div>
                            <p className="text-xs pt-3 text-gray-400">تاریخ ثبت نام</p>
                            <p className="text-sm mt-1 text-gray-700">{order?.createdAt ? convertToPersianDigits(formatDateShort(order?.createdAt)) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <div className='flex flex-col'>
                            <div>
                            <p className="text-xs mb-1 text-gray-400">وضعیت پرداخت</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${order?.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {order?.paymentStatus === 'paid' ? 'پرداخت شده' : 'پرداخت نشده'}
                        </span>
                            </div>

                            <div>
                            <p className="text-xs pt-3 mb-1 text-gray-400">وضعیت ثبت نام</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${order?.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {order?.orderStatus === 'pending' ? 'درحال انتظار' : 'تایید شده'}
                        </span>
                            </div>
                        </div>
                    </div>

                        {/* Order Prices */}
                    <div className="col-span-3 space-y-1">
                        <div className='flex flex-row items-center space-x-1.5 justify-center'>
                            <p className="text-xs text-gray-400">قیمت کل دوره</p>
                            <p className="text-xs text-gray-700">{order?.program_price_real ? (order?.program_price_real).toLocaleString('fa-IR') : 'N/A'} ریال</p>
                        </div>

                        <div className='flex flex-row items-center space-x-1.5 justify-center'>
                            <p className="text-xs text-gray-400">قیمت کل با تخفیف</p>
                            <p className="text-xs text-gray-700">{order?.program_price_discounted ? (order?.program_price_discounted).toLocaleString('fa-IR') : (order?.program_price_real).toLocaleString('fa-IR')} ریال</p>
                        </div>

                        <div className='flex flex-row items-center space-x-1.5 justify-center'>
                            <p className="text-xs text-gray-400">جمع کل تخفیف ها</p>
                            <p className="text-xs text-gray-700">{order?.total_discount ? (order?.total_discount).toLocaleString('fa-IR') : '0'} ریال</p>
                        </div>

                        <div className='flex flex-row items-center space-x-1.5 justify-center bg-green-100 text-green-800 py-1.5 rounded-3xl'>
                            <p className="text-xs text-gray-400">هزینه پرداخت شده</p>
                            <p className="text-xs text-gray-700">{order?.final_order_price ? (order?.final_order_price).toLocaleString('fa-IR') : '0'} ریال</p>
                        </div>
                    </div>

                    {/* <div className="col-span-3 flex justify-end space-x-2">
                        <Link
                            to={`/users/${order?.user?.id}/edit`}
                            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                            تغیرات
                        </Link>
                    </div> */}
                </div>
            </Link>
        </div>
    );


    return (
        <List
            useDataQuery={useGetAllCourseSessionProgramOrders}
            renderItem={renderUserItem}
            title="مدیریت ثبت نام ها"
            searchPlaceholder="جستجو بر اساس نام , شماره موبایل"
            showDateFilter
        />
    );
};

export default ProgramOrderList;