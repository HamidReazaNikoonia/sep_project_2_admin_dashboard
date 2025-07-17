// @ts-ignore
import { Link } from 'react-router'
import GeneralList from "../../../components/GeneralList";

const UserList = () => {


    const userRoleTitleMap = {
        coach: "مربی",
        user: "کاربر",
        admin: "ادمین"
    }

    const renderUserItem = (user) => (
        <div dir='rtl' key={user.id} className="p-3 border-b hover:bg-gray-50">
            <Link to={`/users/${user.id}`} className="font-medium hover:opacity-80">
                {/* Mobile Layout (column) */}
                <div className="md:hidden space-y-3">
                    {/* Row 1: Name + ID */}
                    <div className="flex flex-col">
                        <p className="font-medium mb-2">{user?.first_name} - {user?.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                    </div>

                    {/* Row 2: Email */}
                    <div>
                        <p className="text-xs text-gray-400"></p>
                        <p className="text-sm text-gray-700">{user?.role && userRoleTitleMap[user?.role]}</p>
                    </div>

                    {/* Row 3: Mobile */}
                    <div>
                        <p className="text-xs text-gray-400">Mobile</p>
                        <p className="text-sm text-gray-700">{user.mobile || 'N/A'}</p>
                    </div>

                    {/* Row 4: Status + Actions */}
                    <div className="flex justify-between items-center">
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
                    </div>
                </div>

                {/* Desktop Layout (grid) */}
                <div className="hidden md:grid grid-cols-12 items-center py-4">
                    <div className="col-span-3">
                        <p className="font-medium">{user.first_name} - {user.last_name}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-sm text-gray-700">{user.role && userRoleTitleMap[user.role]}</p>
                    </div>

                    <div className="col-span-2">
                        <p className="text-sm">
                            <span className="text-xs text-gray-400 block">Mobile</span>
                            {user.mobile || 'N/A'}
                        </p>
                    </div>

                    <div className="col-span-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${user?.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isVerified ? 'تایید شده' : 'عدم تایید'}
                        </span>
                    </div>

                    <div className="col-span-3 flex justify-end space-x-2">
                        <Link
                            to={`/users/${user.id}/edit`}
                            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                            تغیرات
                        </Link>
                        {/* <button className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">
                Delete
              </button> */}
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
        <GeneralList
            apiUrl="http://localhost:9000/v1/users"
            filters={userFilters}
            renderItem={renderUserItem}
            title="مدیریت کاربران"
            searchPlaceholder="جستجو بر اساس نام , شماره موبایل"
            showDateFilter
        />
    );
};

export default UserList;

// export default List;