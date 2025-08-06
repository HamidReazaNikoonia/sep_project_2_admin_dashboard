// @ts-ignore
import { Link } from 'react-router'
import { useCourses } from '../../../API/Course/course.hook'
import { convertToPersianDigits, findFirstSession } from '@/utils/helper';
import GeneralList from '@/components/GeneralList';
import ArticleIcon from '@mui/icons-material/Article';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';


const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const ProgramList = () => {


    const programTypeMap = {
        "ON-SITE": "حضوری",
        "ONLINE": "آنلاین"
    }

    const renderUserItem = (courseSession: any) => (
        <div dir='rtl' key={courseSession.id} className="p-3 border-b hover:bg-gray-50">
            <Link to={`/courses-sessions/${courseSession._id}`} className="font-medium hover:opacity-80">
                {/* Mobile Layout (column) */}
                <div className="md:hidden space-y-3">

                    <div className='flex flex-row justify-between'>

                        <div className='flex flex-row gap-2'>
                            {courseSession?.tumbnail_image ? (
                                <img
                                    src={`${SERVER_FILE}/${courseSession.tumbnail_image?.file_name}`}
                                    alt={courseSession.title}
                                    className="w-16 h-16 object-cover rounded"
                                />
                            ) : (
                                <div className="w-24 h-24  bg-gray-200 flex items-center justify-center">
                                    <ArticleIcon sx={{ color: '#9ca3af', fontSize: 24 }} />
                                </div>
                            )}

                            {/* Row 1: Name + ID */}
                            <div className="flex flex-col mr-4">
                                <p className='text-xs text-gray-500 mb-2' >دوره </p>
                                <p className="font-medium mb-1 text-xs">{courseSession?.title}</p>
                                <p className=" text-[11px] font-medium text-gray-500">{courseSession?.sub_title}</p>

                            </div>

                        </div>

                        <div>
                            


                            {/* Row 2: Name + ID */}
                            <div className='flex flex-col justify-between'>
                                <div className='flex flex-col gap-y-1'>
                                    <div className='flex flex-row gap-x-2 '>
                                        <p className="text-xs text-gray-600" >قیمت</p>
                                        <p className="text-xs text-gray-900">{courseSession?.price_real && convertToPersianDigits(courseSession?.price_real)} ریال</p>
                                    </div>

                                    <div className='flex flex-row gap-x-2 '>
                                        <p className="text-xs text-gray-600" >قیمت پس از تخفیف</p>
                                        <p className="text-xs text-gray-900">{courseSession?.price_discount ? `${convertToPersianDigits(courseSession?.price_discount)} ریال` : '-'}</p>
                                    </div>
                                </div>

                                <div></div>
                            </div>
                        </div>

                    </div>





                </div>

                {/* Desktop Layout (grid) */}
                <div className="hidden md:grid grid-cols-12 text-right items-center py-1">

                    <div className="col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-24 overflow-hidden">
                                {courseSession?.tumbnail_image ? (
                                    <img
                                        src={`${SERVER_FILE}/${courseSession?.tumbnail_image?.file_name}`}
                                        alt={`${courseSession?.tumbnail_image?.file_name}`}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <ArticleIcon sx={{ color: '#9ca3af', fontSize: 24 }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Row 1: Name + ID */}
                    <div className="col-span-3">
                        <p className='text-xs text-gray-700' >دوره </p>
                        <p className="font-medium mb-2">{courseSession?.title}</p>
                        <p className="font-medium mb-2 text-xs text-gray-400">{courseSession?.sub_title}</p>
                    </div>





                    <div className="col-span-1">
                        <p className="text-xs text-gray-600">وضعیت</p>
                        <p className={`text-xs mt-2 text-white px-2 w-16 text-center py-1 rounded-full inline-block ${courseSession?.course_status ? 'bg-green-500' : 'bg-red-500'}`}>
                            {courseSession?.course_status ? 'فعال' : 'غیرفعال'}
                        </p>
                    </div>

                    <div className="col-span-3">
                        <div className='flex flex-row space-x-8'>
                            <div className='flex flex-col'>
                                <p className="text-xs text-gray-600" >قیمت</p>
                                <p className="text-sm mt-2 text-gray-900">{courseSession?.price_real && convertToPersianDigits(courseSession?.price_real)} ریال</p>
                            </div>


                            <div className='flex flex-col'>
                                <p className="text-xs text-gray-600" >قیمت پس از تخفیف</p>
                                <p className="text-sm mt-2 text-gray-900">{courseSession?.price_discount ? `${convertToPersianDigits(courseSession?.price_discount)} ریال` : '-'}</p>
                            </div>
                        </div>

                    </div>

                    <div className='col-span-1'>
                        <div className='flex flex-col'>
                            <p className="text-xs text-gray-600">تاریخ ایجاد</p>
                            <p className="text-sm mt-2 text-gray-900">
                                {courseSession?.createdAt && new Date(courseSession.createdAt).toLocaleDateString('fa-IR')}
                            </p>
                        </div>
                    </div>

                    <div className='col-span-1'>
                        <div className='flex flex-col'>
                            <p className="text-xs text-gray-600">تاریخ آخرین تغییر</p>
                            <p className="text-sm mt-2 text-gray-900">
                                {courseSession?.updatedAt && new Date(courseSession.updatedAt).toLocaleDateString('fa-IR')}
                            </p>
                        </div>
                    </div>

                    {/* <div className="col-span-1">
                        <p className="text-xs text-gray-500">قیمت</p>
                        <div className="flex items-center gap-1">
                            {courseSession?.price_discounted ? (
                                <div className='flex flex-col'>
                                    <p className="text-sm font-medium text-gray-700">
                                        {courseSession.price_discounted.toLocaleString('fa-IR')} ریال
                                    </p>
                                    <p className="text-xs text-gray-400 line-through">
                                        {courseSession.price_real.toLocaleString('fa-IR')}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-700">
                                    {courseSession.price_real.toLocaleString('fa-IR')} ریال
                                </p>
                            )}
                        </div>
                    </div> */}
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
            queryParamKey: 'is_fire_sale',
            label: 'تخفیف دار'
        },
        {
            type: 'checkbox',
            queryParamKey: 'have_members',
            label: 'ثبت نام شده'
        },
        {
            type: 'checkbox',
            queryParamKey: 'is_have_capacity',
            label: 'ظرفیت تکمیل شده'
        },
        {
            type: 'checkbox',
            queryParamKey: 'is_have_capacity_in_progress',
            label: 'ظرفیت در حال تکمیل (بیشتر از 50%)'
        },
        {
            type: 'checkbox',
            queryParamKey: 'is_have_min_capacity',
            label: 'ظرفیت در حال تکمیل (بیشتر از 20%)'
        },

        {
            type: 'checkbox',
            queryParamKey: 'is_have_min_capacity',
            label: 'ظرفیت در حال تکمیل (بیشتر از 90%)'
        },

        {
            type: 'options',
            queryParamKey: 'status',
            label: 'وضعیت دوره',
            options: ['active', 'completed', 'inactive']
        },
        {
            type: 'options',
            queryParamKey: 'program_type',
            label: 'نوع دوره',
            options: ['ON-SITE', 'ONLINE']
        }
    ];

    return (
        <>
            <div dir='rtl' className='flex  text-right mb-6'>
                <Link
                    to="/courses-sessions/create"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    <Button startIcon={<AddIcon className='ml-3' />} variant="contained" color="primary">
                        افزودن دوره (فیلم آموزشی) جدید
                    </Button>
                </Link>
            </div>

            <GeneralList
                useDataQuery={useCourses}
                filters={userFilters}
                renderItem={renderUserItem}
                title="مدیریت فیلم های آموزشی"
                searchPlaceholder="جستجو بر اساس نام استاد, دوره, کلاس"
                showDateFilter
            />
        </>

    );
};

export default ProgramList;

// export default List;