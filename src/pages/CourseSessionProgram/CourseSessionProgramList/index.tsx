// @ts-ignore
import { Link } from 'react-router'
import ProgramGeneralList from "./components/List";
import { useGetAllCourseSessionPrograms } from '@/API/CourseSession/courseSession.hook';
import { findFirstSession } from '@/utils/helper';

const ProgramList = () => {


    const programTypeMap = {
        "ON-SITE": "حضوری",
        "ONLINE": "آنلاین"
    }

    const renderUserItem = (program) => (
        <div dir='rtl' key={program.id} className="p-3 border-b hover:bg-gray-50">
            <Link to={`/course-session-program/${program.id}`} className="font-medium hover:opacity-80">
                {/* Mobile Layout (column) */}
                <div className="md:hidden space-y-3">

                    <div className='flex flex-row justify-between'>
                        <div>
                            {/* Row 1: Name + ID */}
                            <div className="flex flex-col">
                                <p className='text-xs text-gray-500' >دوره </p>
                                <p className="font-medium mb-2">{program?.course?.title}</p>
                            </div>


                            {/* Row 2: Name + ID */}
                            <div className="flex flex-col">
                                <p className='text-xs text-gray-500' >مربی </p>
                                <p className="font-medium mb-2">{program?.coach?.first_name} - {program?.coach?.last_name}</p>
                            </div>

                            <div className="flex flex-row items-center mt-1">
                                <div style={{ maxWidth: '60px' }} className={`px-2 py-1 text-xs text-center rounded-full ${program?.status === 'active' ? 'bg-green-100 text-green-800' :
                                    program?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {program?.status === 'active' ? 'فعال' :
                                        program?.status === 'completed' ? 'تکمیل شده' :
                                            'غیرفعال'}
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Status + Actions */}
                        <div className="flex flex-col items-center">
                            <div className="flex space-x-2">
                                <p className="text-xs text-gray-500">شروع کلاس</p>
                                <p className="text-xs font-semibold text-gray-700">{findFirstSession(program?.sessions)}</p>
                            </div>
                            <div className="flex mt-2">
                                <p className="text-xs flex flex-row items-center">
                                    <span className="text-xs text-gray-500 ml-3 block">نوع دوره</span>
                                    {programTypeMap[program.program_type] || 'N/A'}
                                </p>
                            </div>

                            <div className="flex flex-row items-center mt-2">
                                <p className="text-xs text-gray-500 ml-2">تعداد ثبت نام</p>
                                <p className="text-xs text-gray-700">{program?.members?.length && (program?.members?.length).toLocaleString('fa-IR')} / {program?.max_member_accept?.toLocaleString('fa-IR')}</p>
                            </div>

                            <div className="flex flex-row items-center mt-4">
                                <p className="text-xs text-gray-500">قیمت</p>
                                <div className="flex items-center gap-1">
                                    {program?.price_discounted ? (
                                        <div className='flex flex-col'>
                                            <p className="text-sm font-medium text-gray-700">
                                                {program.price_discounted.toLocaleString('fa-IR')} ریال
                                            </p>
                                            <p className="text-xs text-gray-400 line-through">
                                                {program.price_real.toLocaleString('fa-IR')}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-700">
                                            {program.price_real.toLocaleString('fa-IR')} ریال
                                        </p>
                                    )}
                                </div>
                            </div>



                        </div>
                    </div>





                </div>

                {/* Desktop Layout (grid) */}
                <div className="hidden md:grid grid-cols-12 text-right items-center py-4">
                    {/* Row 1: Name + ID */}
                    <div className="col-span-3">
                        <p className='text-xs text-gray-500' >دوره </p>
                        <p className="text-sm font-medium mb-2">{program?.course?.title}</p>
                    </div>

                    <div className="col-span-2">
                        <p className='text-xs text-gray-500' >مربی </p>
                        <p className="text-sm font-medium">{program?.coach?.first_name} - {program?.coach?.last_name}</p>
                        {/* <p className="text-xs text-gray-500">ID: {program.id}</p> */}
                    </div>



                    <div className="col-span-1">
                        <p className="text-xs text-gray-500">تعداد ثبت نام</p>
                        <p className="text-sm text-gray-700">{program?.members?.length && (program?.members?.length).toLocaleString('fa-IR')} / {program?.max_member_accept?.toLocaleString('fa-IR')}</p>
                    </div>

                    <div className="col-span-1">
                        <p className="text-sm">
                            <span className="text-xs text-gray-500 block">نوع دوره</span>
                            {programTypeMap[program.program_type] || 'N/A'}
                        </p>
                    </div>

                    <div className="col-span-1">
                        <div style={{ maxWidth: '60px' }} className={`px-2 py-1 text-xs text-center rounded-full ${program?.status === 'active' ? 'bg-green-100 text-green-800' :
                            program?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {program?.status === 'active' ? 'فعال' :
                                program?.status === 'completed' ? 'تکمیل شده' :
                                    'غیرفعال'}
                        </div>
                    </div>

                    <div className="col-span-1">
                        <p className="text-xs text-gray-700">کلاس</p>
                        <p className="text-sm text-gray-700">{program?.class_id?.class_title}</p>
                    </div>

                    <div className="col-span-1">
                        <p className="text-xs text-gray-500">شروع کلاس</p>
                        <p className="text-sm text-gray-700">{findFirstSession(program?.sessions)}</p>
                    </div>

                    <div className="col-span-1">
                        <p className="text-xs text-gray-500">قیمت</p>
                        <div className="flex items-center gap-1">
                            {program?.price_discounted ? (
                                <div className='flex flex-col'>
                                    <p className="text-sm font-medium text-gray-700">
                                        {program.price_discounted.toLocaleString('fa-IR')} ریال
                                    </p>
                                    <p className="text-xs text-gray-400 line-through">
                                        {program.price_real.toLocaleString('fa-IR')}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-700">
                                    {program.price_real.toLocaleString('fa-IR')} ریال
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    const userFilters = [
        // {
        //     type: 'search',
        //     queryParamKey: 'mobile',
        //     label: 'موبایل بر اسسا'
        // },
        // {
        //     type: 'search',
        //     queryParamKey: 'mobile1',
        //     label: 'موبایل بر اسسا'
        // },
        // {
        //     type: 'search',
        //     queryParamKey: 'mobile2',
        //     label: 'موبایل بر اسسا'
        // },
        {
            type: 'checkbox',
            queryParamKey: 'isVerified',
            label: 'کاربران فعال'
        },
        {
            type: 'checkbox',
            queryParamKey: 'have_enrolled_course_session',
            label: 'ثبت نام شده'
        },
        {
            type: 'checkbox',
            queryParamKey: 'have_wallet_amount',
            label: 'کاربر با موجودی کیف پول'
        },
        {
            type: 'options',
            queryParamKey: 'role',
            label: 'نقش کاربر',
            options: ['admin', 'user', 'coach']
        }
    ];

    return (
        <ProgramGeneralList
            useDataQuery={useGetAllCourseSessionPrograms}
            filters={userFilters}
            renderItem={renderUserItem}
            title="مدیریت کلاس ها"
            searchPlaceholder="جستجو بر اساس نام , شماره موبایل"
            showDateFilter
        />
    );
};

export default ProgramList;

// export default List;