// @ts-nocheck
import React from 'react';
import { Link } from 'react-router';
import {
  Avatar,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Reply as ReplyIcon,
  Visibility,
  Edit
} from '@mui/icons-material';
import GeneralList from '../../../components/GeneralList';
import { useNotifications } from '../../../API/Notification/notification.hook';
import moment from 'moment-jalaali';

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const NotificationList = () => {
  // Define filters for the notification list
  const filters = [
    // {
    //   queryParamKey: 'user',
    //   label: 'کاربر',
    //   type: 'search'
    // },
    {
      queryParamKey: 'status',
      label: 'وضعیت',
      type: 'options',
      options: ['draft', 'scheduled', 'processing', 'sent', 'delivered', 'failed', 'cancelled', 'expired']
    },
    {
      queryParamKey: 'priority',
      label: 'اولویت',
      type: 'options',
      options: ['low', 'medium', 'high', 'urgent']
    },
    {
      queryParamKey: 'notification_type',
      label: 'نوع اعلان',
      type: 'options',
      options: [
        'success_create_reference',
        'payment_fail_create_reference',
        'from_admin',
        'course_enrollment',
        'course_completion',
        'session_reminder',
        'session_cancelled',
        'payment_success',
        'payment_failed',
        'coupon_expiry',
        'account_verification',
        'password_reset',
        'profile_update',
        'system_maintenance',
        'promotional',
        'announcement'
      ]
    },
    // {
    //   queryParamKey: 'is_read_by_admin',
    //   label: 'خوانده شده توسط ادمین',
    //   type: 'checkbox'
    // }
  ];

  // Translation helpers
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

  // Update the getCategoryLabel function
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

  const getStatusColor = (status: string) => {
    const colorMap = {
      'draft': 'default',
      'scheduled': 'info',
      'processing': 'warning',
      'sent': 'primary',
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

  // Render individual notification item
  const renderNotificationItem = (notification) => (
    <Link to={`/notifications/${notification.id}`}>
      <div key={notification.id} className="border-b border-gray-200 last:border-b-0">
        <div className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            {/* Left side - Main content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-10 gap-4 items-center">

              {/* User Info */}
              <div className="flex col-span-3 items-center space-x-3 space-x-reverse">
                <Avatar
                  src={notification.customer?.avatar?.file_name ? `${SERVER_FILE}/${notification.customer.avatar.file_name}` : undefined}
                  sx={{ width: 60, height: 60 }}
                >
                  {!notification.customer?.avatar?.file_name &&
                    `${notification.customer?.first_name?.[0] || ''}${notification.customer?.last_name?.[0] || ''}`
                  }
                </Avatar>
                <div className='mr-2'>
                  <Typography variant="body2" className="font-medium">
                    {`${notification.customer?.first_name || ''} ${notification.customer?.last_name || ''}`.trim() || 'نامشخص'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {notification.customer?.id}
                  </Typography>
                </div>
              </div>

              {/* Title & Category */}
              <div className=''>
                <div className='flex flex-col items-center'>
                  <div className='text-xs text-gray-600 mb-1'>نوع اعلان</div>
                  <Chip
                    label={getCategoryLabel(notification.notification_type)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', minWidth: 120 }}
                  />
                </div>
              </div>

              {/* Status & Priority */}
              <div className="space-x-3 col-span-2 flex items-center">
                <div className='flex flex-col items-center'>
                  <div className='text-xs text-gray-600 mb-1'>وضعیت ارسال</div>
                  <Chip
                    sx={{ minWidth: 100 }}
                    label={getStatusLabel(notification.status)}
                    color={getStatusColor(notification.status)}
                    size="small"
                  />
                </div>

                <div className='flex flex-col items-center'>
                  <div className='text-xs text-gray-600 mb-1'>اولویت</div>
                  <Chip
                    sx={{ minWidth: 50 }}
                    label={getPriorityLabel(notification.priority)}
                    color={getPriorityColor(notification.priority)}
                    size="small"
                    variant="outlined"
                  />
                </div>
              </div>

              {/* Read Status & Replies */}
              {/* <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Tooltip title="خوانده شده توسط ادمین">
                  <div>
                    {notification.is_read_by_admin ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <Cancel color="error" fontSize="small" />
                    )}
                  </div>
                </Tooltip>
                <Tooltip title="خوانده شده توسط کاربر">
                  <div>
                    {notification.is_read_by_user ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <Cancel color="error" fontSize="small" />
                    )}
                  </div>
                </Tooltip>
              </div>
              {notification.replies > 0 && (
                <div className="flex items-center space-x-1 space-x-reverse">
                  <ReplyIcon fontSize="small" color="primary" />
                  <Typography variant="caption" color="primary">
                    {notification.replies} پاسخ
                  </Typography>
                </div>
              )}
            </div> */}

              {/* Dates */}
              <div className="text-xs col-span-2 text-gray-500">
                <div>
                  <strong>ایجاد:</strong> {moment(notification.created_at).format('jYYYY/jMM/jDD HH:mm')}
                </div>
                <div>
                  <strong>بروزرسانی:</strong> {moment(notification.updated_at).format('jYYYY/jMM/jDD HH:mm')}
                </div>
              </div>

              {/* Channels */}
              <div className="flex items-center gap-2 col-span-2">
                {notification.channels?.map((channel, index) => (
                  <Chip
                    key={index}
                    label={channel === 'sms' ? 'پیامک' :
                      channel === 'email' ? 'ایمیل' :
                        channel === 'push' ? 'پوش' :
                          channel === 'in_app' ? 'درون برنامه‌ای' :
                            channel === 'webhook' ? 'وب‌هوک' : channel}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '10px' }}
                  />
                ))}
              </div>

              {/* Actions */}
              {/* <div className="flex items-center space-x-2 space-x-reverse">
              <Tooltip title="مشاهده جزئیات">
                <Link to={`/notifications/${notification.id}`}>
                  <IconButton size="small" color="primary">
                    <Visibility fontSize="small" />
                  </IconButton>
                </Link>
              </Tooltip>
              <Tooltip title="ویرایش">
                <Link to={`/notifications/${notification.id}/edit`}>
                  <IconButton size="small" color="secondary">
                    <Edit fontSize="small" />
                  </IconButton>
                </Link>
              </Tooltip>
            </div> */}
            </div>
          </div>

          {/* Description preview */}
          {notification.description && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Typography variant="body2" color="text.secondary" className="line-clamp-2">
                {notification.description.length > 150
                  ? `${notification.description.substring(0, 150)}...`
                  : notification.description
                }
              </Typography>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="notification-list">
      <GeneralList
        useDataQuery={useNotifications}
        filters={filters}
        renderItem={renderNotificationItem}
        searchPlaceholder="جستجو در اعلان‌ها..."
        title="لیست اعلان‌ها"
        showDateFilter={true}
      />
    </div>
  );
};

export default NotificationList;