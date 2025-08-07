// @ts-nocheck
import React from 'react';
import { 
  Notifications, 
  NotificationsActive, 
  CheckCircle, 
  Cancel,
  PriorityHigh,
  Schedule,
  Send,
  LocalShipping,
  Error,
  MarkEmailUnread
} from '@mui/icons-material';
import { useNotificationStatistics } from '../../../API/Notification/notification.hook';

const NotificationSummary = () => {
  const { data: stats, isLoading } = useNotificationStatistics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper function to get count from deliveryStats array
  const getDeliveryCount = (status: string) => {
    const stat = stats?.deliveryStats?.find(item => item._id === status);
    return stat?.count || 0;
  };

  // Helper function to get count from typeStats array
  const getTypeCount = (type: string) => {
    const stat = stats?.typeStats?.find(item => item._id === type);
    return stat?.count || 0;
  };

  const summaryCards = [
    {
      title: 'کل اعلان‌ها',
      value: stats?.total || 0,
      icon: <Notifications />,
      color: 'text-blue-600'
    },
    {
      title: 'خوانده نشده',
      value: stats?.unread || 0,
      icon: <MarkEmailUnread />,
      color: 'text-red-600'
    },
    // Delivery Status Cards
    {
      title: 'پیش‌نویس',
      value: getDeliveryCount('draft'),
      icon: <NotificationsActive />,
      color: 'text-gray-600'
    },
    {
      title: 'زمان‌بندی شده',
      value: getDeliveryCount('scheduled'),
      icon: <Schedule />,
      color: 'text-cyan-600'
    },
    {
      title: 'در حال پردازش',
      value: getDeliveryCount('processing'),
      icon: <NotificationsActive />,
      color: 'text-yellow-600'
    },
    {
      title: 'ارسال شده',
      value: getDeliveryCount('sent'),
      icon: <Send />,
      color: 'text-blue-600'
    },
    {
      title: 'تحویل داده شده',
      value: getDeliveryCount('delivered'),
      icon: <CheckCircle />,
      color: 'text-green-600'
    },
    {
      title: 'ناموفق',
      value: getDeliveryCount('failed'),
      icon: <Error />,
      color: 'text-red-600'
    },
    {
      title: 'لغو شده',
      value: getDeliveryCount('cancelled'),
      icon: <Cancel />,
      color: 'text-gray-600'
    },
    {
      title: 'منقضی شده',
      value: getDeliveryCount('expired'),
      icon: <Cancel />,
      color: 'text-red-600'
    }
  ];

  // Additional cards for top notification types
  const topTypeCards = [
    {
      title: 'پرداخت ناموفق',
      value: getTypeCount('payment_failed'),
      icon: <Error />,
      color: 'text-red-600'
    },
    {
      title: 'تبلیغاتی',
      value: getTypeCount('promotional'),
      icon: <Notifications />,
      color: 'text-purple-600'
    },
    {
      title: 'بروزرسانی پروفایل',
      value: getTypeCount('profile_update'),
      icon: <NotificationsActive />,
      color: 'text-blue-600'
    },
    {
      title: 'بازنشانی رمز عبور',
      value: getTypeCount('password_reset'),
      icon: <NotificationsActive />,
      color: 'text-orange-600'
    },
    {
      title: 'ثبت نام در دوره',
      value: getTypeCount('course_enrollment'),
      icon: <CheckCircle />,
      color: 'text-green-600'
    },
    {
      title: 'اعلامیه',
      value: getTypeCount('announcement'),
      icon: <Notifications />,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="mb-6">
      <h6 className="text-xl font-medium mb-4">
        خلاصه اعلان‌ها
      </h6>
      
      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg h-full">
            <div className="p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className={`${card.color} text-3xl`}>
                  {card.icon}
                </div>
                <h4 className="text-2xl font-bold">
                  {card.value}
                </h4>
                <p className="text-sm text-gray-600">
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Notification Types */}
      <div className="mb-4">
        <h6 className="text-lg font-medium mb-3 text-gray-700">
          انواع اعلان‌ها
        </h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topTypeCards.map((card, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg h-full">
              <div className="p-3 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <div className={`${card.color} text-2xl`}>
                    {card.icon}
                  </div>
                  <h5 className="text-xl font-bold">
                    {card.value}
                  </h5>
                  <p className="text-xs text-gray-600">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Notification Types (if needed) */}
      {stats?.typeStats && stats.typeStats.length > 0 && (
        <div>
          <h6 className="text-lg font-medium mb-3 text-gray-700">
            تمام انواع اعلان‌ها
          </h6>
          <div className="bg-white shadow-lg rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.typeStats.map((typeStat, index) => {
                const categoryMap = {
                  'success_create_reference': 'ایجاد مرجع موفق',
                  'payment_fail_create_reference': 'خطا در ایجاد مرجع پرداخت',
                  'from_admin': 'از طرف ادمین',
                  'course_enrollment': 'ثبت نام در دوره',
                  'course_completion': 'اتمام دوره',
                  'session_reminder': 'یادآوری جلسه',
                  'session_cancelled': 'لغو جلسه',
                  'payment_success': 'پرداخت موفق',
                  'payment_failed': 'پرداخت ناموفق',
                  'coupon_expiry': 'انقضای کد تخفیف',
                  'account_verification': 'تایید حساب کاربری',
                  'password_reset': 'بازنشانی رمز عبور',
                  'profile_update': 'بروزرسانی پروفایل',
                  'system_maintenance': 'تعمیرات سیستم',
                  'promotional': 'تبلیغاتی',
                  'announcement': 'اعلامیه'
                };
                
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">
                      {categoryMap[typeStat._id] || typeStat._id}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {typeStat.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSummary;