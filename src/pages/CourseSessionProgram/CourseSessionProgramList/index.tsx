// @ts-ignore
import { Link } from 'react-router'
import ProgramGeneralList from "./components/List";
import { useGetAllCourseSessionPrograms } from '@/API/CourseSession/courseSession.hook';

const ProgramList = () => {


    const userRoleTitleMap = {
        coach: "مربی",
        user: "کاربر",
        admin: "ادمین"
    }

    const renderUserItem = (program) => (
        <div dir='rtl' key={program.id} className="p-3 border-b hover:bg-gray-50">
            <Link to={`/users/${program.id}`} className="font-medium hover:opacity-80">
                {/* Mobile Layout (column) */}
                <div className="md:hidden space-y-3">
                    {/* Row 1: Name + ID */}
                    <div className="flex flex-col">
                        <p className="font-medium mb-2">{program?.coach?.first_name} - {program?.coach?.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {program.id}</p>
                    </div>

                   
                   

                    {/* Row 4: Status + Actions */}
                    {/* <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isVerified ? 'تایید شده' : 'عدم تایید'}
                        </span>
                        <div className="flex space-x-2">
                            <Link
                                to={`/users/${user.id}/edit`}
                                className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
                                تغییرات
                            </Link>
                        </div>
                    </div> */}
                </div>

                {/* Desktop Layout (grid) */}
                <div className="hidden md:grid grid-cols-12 items-center py-4">
                    <div className="col-span-3">
                        <p className="font-medium">{program?.coach?.first_name} - {program?.coach?.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {program.id}</p>
                    </div>

                    {/* <div className="col-span-2">
                        <p className="text-sm text-gray-700">{user.role && userRoleTitleMap[user.role]}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-sm">
                            <span className="text-xs text-gray-400 block">Mobile</span>
                            {user.mobile || 'N/A'}
                        </p>
                    </div> */}

                    {/* <div className="col-span-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isVerified ? 'تایید شده' : 'عدم تایید'}
                        </span>
                    </div> */}

                    {/* <div className="col-span-3 flex justify-end space-x-2">
                        <Link
                            to={`/users/${user.id}/edit`}
                            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                            تغیرات
                        </Link>
                       
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