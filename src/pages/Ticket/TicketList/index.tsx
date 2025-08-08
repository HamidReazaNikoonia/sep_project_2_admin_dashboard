import React from 'react';
import { Link } from 'react-router';
import moment from 'moment-jalaali';
import {
  Assignment,
  AccountCircle,
  PriorityHigh,
  QuestionAnswer,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import GeneralList from '../../../components/GeneralList';
import TicketSummary from '../TicketSummary';
import { useTickets } from '../../../API/Ticket/ticket.hook';
import { Ticket } from '../../../API/Ticket/types';
const SERVER_FILE = process.env.REACT_APP_SERVER_FILE
const TicketList = () => {
  // Define filters for the GeneralList component
  const filters = [
    {
      queryParamKey: 'status',
      label: 'وضعیت',
      type: 'options',
      options: ['open', 'in_progress', 'resolved', 'closed']
    },
    {
      queryParamKey: 'priority',
      label: 'اولویت',
      type: 'options',
      options: ['low', 'medium', 'high', 'urgent']
    },
    {
      queryParamKey: 'category',
      label: 'دسته‌بندی',
      type: 'options',
      options: [
        'technical_support',
        'course_content',
        'payment_issue',
        'access_problem',
        'general_inquiry',
        'bug_report',
        'feature_request',
        'other'
      ]
    },
    {
      queryParamKey: 'is_read_by_admin',
      label: 'خوانده شده توسط ادمین',
      type: 'checkbox'
    },
    {
      queryParamKey: 'is_read_by_user',
      label: 'خوانده شده توسط کاربر',
      type: 'checkbox'
    }
  ];

  // Helper functions for display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      'technical_support': 'پشتیبانی فنی',
      'course_content': 'محتوای دوره',
      'payment_issue': 'مشکل پرداخت',
      'access_problem': 'مشکل دسترسی',
      'general_inquiry': 'سوال عمومی',
      'bug_report': 'گزارش باگ',
      'feature_request': 'درخواست ویژگی',
      'other': 'سایر'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'open': 'باز',
      'in_progress': 'در حال بررسی',
      'resolved': 'حل شده',
      'closed': 'بسته شده'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap = {
      'low': 'کم',
      'medium': 'متوسط',
      'high': 'بالا',
      'urgent': 'فوری'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  };

  // Render function for each ticket item
  const renderTicketItem = (ticket: Ticket) => {
    const hasReply = ticket.replies && ticket.replies.length > 0;
    const avatarUrl = ticket.user?.avatar?.file_name 
      ? `${SERVER_FILE}/${ticket?.user?.avatar?.file_name}`
      : null;

    return (
      <Link
      to={`/tickets/${ticket?.id}`}
      className=""
    >
      <div key={ticket?.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          {/* User Info and Title */}
          <div className="flex items-start space-x-4 space-x-reverse flex-1">
            {/* User Avatar */}
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${ticket.user.first_name} ${ticket.user.last_name}`}
                  className="w-8 h-8 md:w-16 md:h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <AccountCircle className="text-gray-600" />
                </div>
              )}
            </div>

            {/* Ticket Content */}
            <div className="flex-1 min-w-0 mr-4">
              {/* User Name and Title */}
              <div className="flex flex-col items-start space-x-2 space-x-reverse mb-2">
                <h3 className="text-lg font-medium mb-2 text-gray-900 truncate">
                  {ticket.user.first_name} {ticket.user.last_name}
                </h3>
                {/* <span className="text-sm text-gray-500">•</span> */}
                <Link 
                  to={`/tickets/${ticket.id}`}
                  className="text-blue-600 mr-2 hover:text-blue-800 font-medium truncate"
                >
                  {ticket.title}
                </Link>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mr-1 mb-3 line-clamp-2">
                {ticket.description}
              </p>

              {/* Status, Priority, Category Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {getStatusLabel(ticket.status)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  <PriorityHigh className="w-3 h-3 mr-1" />
                  {getPriorityLabel(ticket.priority)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getCategoryLabel(ticket.category)}
                </span>
              </div>

              {/* Icons and Indicators */}
              <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                {/* Read Status */}
                <div className="flex items-center space-x-1 space-x-reverse">
                  {ticket.is_read_by_admin ? (
                    <Visibility className="w-2 h-2 text-green-500" />
                  ) : (
                    <VisibilityOff className="w-2 h-2 text-red-500" />
                  )}
                  <span className='mr-2'>ادمین</span>
                </div>

                <div className="flex items-center space-x-1 space-x-reverse">
                  {ticket.is_read_by_user ? (
                    <Visibility className="w-2 h-2 text-green-500" />
                  ) : (
                    <VisibilityOff className="w-2 h-2 text-red-500" />
                  )}
                  <span className='mr-2'>کاربر</span>
                </div>

                {/* Has Reply */}
                {hasReply && (
                  <div className="flex items-center space-x-1 space-x-reverse text-green-600">
                    <QuestionAnswer className="w-2 h-2" />
                    <span className='mr-2'>پاسخ داده شده</span>
                  </div>
                )}

                {/* Has Program */}
                {ticket.program_id && (
                  <div className="flex items-center space-x-1 space-x-reverse text-blue-600">
                    <Assignment className="w-2 h-2" />
                    <span className='mr-2'>برنامه</span>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-4  text-xs text-gray-400 mt-3">
                <span>ایجاد: {moment(ticket.createdAt).format('jYYYY/jMM/jDD HH:mm')}</span>
                <span>بروزرسانی: {moment(ticket.updatedAt).format('jYYYY/jMM/jDD HH:mm')}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 ml-4">
           
         
          </div>
        </div>
      </div>
      </Link>
    );
  };

  return (
    <div dir="rtl" className="p-6">
      {/* Ticket Summary */}
      <TicketSummary />

      {/* Ticket List */}
      <GeneralList
        useDataQuery={useTickets}
        filters={filters as any}
        renderItem={renderTicketItem}
        searchPlaceholder="جستجو در تیکت‌ها..."
        title="لیست تیکت‌ها"
        showDateFilter={true}
      />
    </div>
  );
};

export default TicketList;