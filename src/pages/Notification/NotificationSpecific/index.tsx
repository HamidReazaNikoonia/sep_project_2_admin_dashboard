// @ts-nocheck
import React from 'react';
import { useParams, Link } from 'react-router';
import { Avatar, Chip } from '@mui/material';
import { 
  ArrowBack, 
  Schedule, 
  Person, 
  Email, 
  Sms, 
  NotificationsActive,
  CheckCircle,
  Cancel,
  Error,
  Visibility,
  ClickAwayListener,
  Edit,
  Delete,
  Refresh
} from '@mui/icons-material';
import { useNotificationById } from '../../../API/Notification/notification.hook';
import moment from 'moment-jalaali';

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const NotificationSpecific = () => {
  const { notification_id } = useParams();
  const { data: notification, isLoading, error, refetch } = useNotificationById(notification_id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Error className="text-red-500 text-4xl mb-2" />
        <p className="text-red-700">خطا در بارگذاری اطلاعات اعلان</p>
        <button 
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">اعلان مورد نظر یافت نشد</p>
      </div>
    );
  }

  // Helper functions
  const getCategoryLabel = (category: string) => {
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
    return categoryMap[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'draft': 'پیش‌نویس',
      'scheduled': 'زمان‌بندی شده',
      'processing': 'در حال پردازش',
      'sent': 'ارسال شده',
      'delivered': 'تحویل داده شده',
      'failed': 'ناموفق',
      'cancelled': 'لغو شده',
      'expired': 'منقضی شده'
    };
    return statusMap[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap = {
      'low': 'کم',
      'medium': 'متوسط',
      'high': 'بالا',
      'urgent': 'فوری'
    };
    return priorityMap[priority] || priority;
  };

  const getChannelLabel = (channel: string) => {
    const channelMap = {
      'sms': 'پیامک',
      'email': 'ایمیل',
      'push': 'پوش نوتیفیکیشن',
      'in_app': 'درون برنامه‌ای',
      'webhook': 'وب‌هوک'
    };
    return channelMap[channel] || channel;
  };

  const getDeliveryStatusLabel = (status: string) => {
    const statusMap = {
      'pending': 'در انتظار',
      'sent': 'ارسال شده',
      'delivered': 'تحویل داده شده',
      'opened': 'مشاهده شده',
      'clicked': 'کلیک شده',
      'failed': 'ناموفق',
      'not_sent': 'ارسال نشده',
      'read': 'خوانده شده'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'draft': 'default',
      'scheduled': 'primary',
      'processing': 'warning',
      'sent': 'info',
      'delivered': 'success',
      'failed': 'error',
      'cancelled': 'default',
      'expired': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      'low': 'success',
      'medium': 'warning',
      'high': 'error',
      'urgent': 'error'
    };
    return colorMap[priority] || 'default';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link to="/notifications" className="text-blue-600 hover:text-blue-800">
              <ArrowBack />
            </Link>
            <h1 className="text-2xl font-bold mr-2 text-gray-900">جزئیات اعلان</h1>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button 
              onClick={() => refetch()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Refresh className="w-4 h-4" />
            </button>
            {/* <Link 
              to={`/notifications/${notification_id}/edit`}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <Edit className="w-4 h-4" />
            </Link> */}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شناسه</label>
            <p className="text-sm text-gray-900 font-mono">{notification?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <Chip label={getStatusLabel(notification.status)} color={getStatusColor(notification.status)} size="small" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اولویت</label>
            <Chip label={getPriorityLabel(notification.priority)} color={getPriorityColor(notification.priority)} size="small" />
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">اطلاعات کاربر</h2>
        <div className="flex items-center space-x-4 space-x-reverse">
          <Avatar
            src={notification.customer?.avatar?.file_name ? `${SERVER_FILE}/${notification.customer.avatar.file_name}` : undefined}
            sx={{ width: 120, height: 120 }}
          >
            {!notification.customer?.avatar?.file_name && 
              `${notification.customer?.first_name?.[0] || ''}${notification.customer?.last_name?.[0] || ''}`
            }
          </Avatar>
          <div className='mr-4'>
            <h3 className="text-lg font-medium">
              {`${notification.customer?.first_name || ''} ${notification.customer?.last_name || ''}`.trim() || 'نامشخص'}
            </h3>
            <p className="text-sm text-gray-600">شناسه: {notification.customer?.id}</p>
            {notification.customer?.email && (
              <p className="text-sm text-gray-600">ایمیل: {notification.customer?.email}</p>
            )}
            {notification.customer?.mobile && (
              <p className="text-sm text-gray-600">موبایل: {notification.customer.mobile}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notification Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">محتوای اعلان</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع اعلان</label>
              <Chip label={getCategoryLabel(notification.notification_type)} variant="outlined" size="small" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
              <p className="text-gray-900 font-medium">{notification.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">پیام</label>
              <p className="text-gray-700 leading-relaxed">{notification.message}</p>
            </div>
            {notification.content?.short_text && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">متن کوتاه</label>
                <p className="text-gray-700">{notification.content.short_text}</p>
              </div>
            )}
            {notification.content?.action_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">لینک </label>
                <a 
                  href={notification.content.action_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {notification.content.action_url}
                </a>
              </div>
            )}
            {notification.content?.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تصویر</label>
                <img 
                  src={notification.content.image_url} 
                  alt="Notification Image" 
                  className="max-w-full h-auto rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Delivery Channels */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">کانال‌های تحویل</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">کانال‌های فعال</label>
              <div className="flex flex-wrap gap-2">
                {notification.channels?.map((channel, index) => (
                  <Chip key={index} label={getChannelLabel(channel)} size="small" />
                ))}
              </div>
            </div>

            {/* Delivery Status Details */}
            {notification.delivery_status && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">وضعیت تحویل</h3>
                
                {/* SMS Status */}
                {notification.delivery_status.sms && (
                  <div className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center">
                        <Sms className="w-4 h-4 ml-2" />
                        پیامک
                      </span>
                      <Chip 
                        label={getDeliveryStatusLabel(notification.delivery_status.sms.status)} 
                        size="small" 
                        color={notification.delivery_status.sms.status === 'delivered' ? 'success' : 'default'}
                      />
                    </div>
                    {notification.delivery_status.sms.sent_at && (
                      <p className="text-xs text-gray-600">
                        ارسال: {moment(notification.delivery_status.sms.sent_at).format('jYYYY/jMM/jDD HH:mm')}
                      </p>
                    )}
                    {notification.delivery_status.sms.delivered_at && (
                      <p className="text-xs text-gray-600">
                        تحویل: {moment(notification.delivery_status.sms.delivered_at).format('jYYYY/jMM/jDD HH:mm')}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Status */}
                {notification.delivery_status.email && (
                  <div className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center">
                        <Email className="w-4 h-4 ml-2" />
                        ایمیل
                      </span>
                      <Chip 
                        label={getDeliveryStatusLabel(notification.delivery_status.email.status)} 
                        size="small" 
                        color={notification.delivery_status.email.status === 'delivered' ? 'success' : 'default'}
                      />
                    </div>
                    {notification.delivery_status.email.sent_at && (
                      <p className="text-xs text-gray-600">
                        ارسال: {moment(notification.delivery_status.email.sent_at).format('jYYYY/jMM/jDD HH:mm')}
                      </p>
                    )}
                    {notification.delivery_status.email.opened_at && (
                      <p className="text-xs text-gray-600">
                        مشاهده: {moment(notification.delivery_status.email.opened_at).format('jYYYY/jMM/jDD HH:mm')}
                      </p>
                    )}
                  </div>
                )}

                {/* In-App Status */}
                {notification.delivery_status.in_app && (
                  <div className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium flex items-center">
                        <NotificationsActive className="w-4 h-4 ml-2" />
                        درون برنامه‌ای
                      </span>
                      <Chip 
                        label={getDeliveryStatusLabel(notification.delivery_status.in_app.status)} 
                        size="small" 
                        color={notification.delivery_status.in_app.status === 'read' ? 'success' : 'default'}
                      />
                    </div>
                    {notification.delivery_status.in_app.delivered_at && (
                      <p className="text-xs text-gray-600">
                        تحویل: {moment(notification.delivery_status.in_app.delivered_at).format('jYYYY/jMM/jDD HH:mm')}
                      </p>
                    )}
                    {notification.delivery_status.in_app.read_at && (
                      <p className="text-xs text-gray-600">
                        خواندن: {moment(notification.delivery_status.in_app.read_at).format('jYYYY/jMM/jDD HH:mm')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timing and Scheduling */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">زمان‌بندی و تاریخ‌ها</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ایجاد</label>
            <p className="text-sm text-gray-900">
              {moment(notification.createdAt).format('jYYYY/jMM/jDD HH:mm')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">آخرین بروزرسانی</label>
            <p className="text-sm text-gray-900">
              {moment(notification.updatedAt).format('jYYYY/jMM/jDD HH:mm')}
            </p>
          </div>
          {notification.scheduled_for && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">زمان‌بندی شده برای</label>
              <p className="text-sm text-gray-900">
                {moment(notification.scheduled_for).format('jYYYY/jMM/jDD HH:mm')}
              </p>
            </div>
          )}
          {notification.expires_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">انقضا</label>
              <p className="text-sm text-gray-900">
                {moment(notification.expires_at).format('jYYYY/jMM/jDD HH:mm')}
              </p>
            </div>
          )}
          {notification.read_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">زمان مشاهده کاربر</label>
              <p className="text-sm text-gray-900">
                {moment(notification.read_at).format('jYYYY/jMM/jDD HH:mm')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Interaction */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">تعامل کاربر</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            {notification.read_status ? (
              <CheckCircle className="text-green-600" />
            ) : (
              <Cancel className="text-red-600" />
            )}
            <span className="text-sm">
              {notification.read_status ? 'خوانده شده' : 'خوانده نشده'}
            </span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {notification.clicked ? (
              <CheckCircle className="text-green-600" />
            ) : (
              <Cancel className="text-red-600" />
            )}
            <span className="text-sm">
              {notification.clicked ? 'کلیک شده' : 'کلیک نشده'}
            </span>
          </div>
          {notification.analytics && (
            <>
              <div>
                <label className="block text-xs text-gray-500">نمایش</label>
                <p className="text-lg font-semibold">{notification.analytics.impressions || 0}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500">کلیک</label>
                <p className="text-lg font-semibold">{notification.analytics.clicks || 0}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* State and Context */}
      {notification.state && Object.keys(notification.state).length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">اطلاعات وضعیت</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notification.state.reference_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه مرجع</label>
                <p className="text-sm text-gray-900 font-mono">{notification.state.reference_id}</p>
              </div>
            )}
            {notification.state.order_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه سفارش</label>
                <p className="text-sm text-gray-900 font-mono">{notification.state.order_id}</p>
              </div>
            )}
            {notification.state.course_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه دوره</label>
                <p className="text-sm text-gray-900 font-mono">{notification.state.course_id}</p>
              </div>
            )}
            {notification.state.session_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">شناسه جلسه</label>
                <p className="text-sm text-gray-900 font-mono">{notification.state.session_id}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {/* {notification.actions && notification.actions.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">اقدامات</h2>
          <div className="space-y-2">
            {notification.actions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{action.label}</span>
                <a 
                  href={action.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`px-3 py-1 rounded text-sm ${
                    action.style === 'primary' ? 'bg-blue-600 text-white' :
                    action.style === 'secondary' ? 'bg-gray-600 text-white' :
                    action.style === 'danger' ? 'bg-red-600 text-white' :
                    action.style === 'success' ? 'bg-green-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}
                >
                  باز کردن
                </a>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Technical Details */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">جزئیات فنی</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">زبان</label>
            <p>{notification.language === 'fa' ? 'فارسی' : 'انگلیسی'}</p>
          </div>
          {notification.template_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شناسه قالب</label>
              <p className="font-mono">{notification.template_id}</p>
            </div>
          )}
          {notification.retry_count > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تعداد تلاش مجدد</label>
              <p>{notification.retry_count}</p>
            </div>
          )}
          {notification.sender && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">فرستنده</label>
              <p>{notification.sender.name || notification.sender.type}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSpecific;