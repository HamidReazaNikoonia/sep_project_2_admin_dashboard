import React from 'react';
import {
  Assignment,
  AssignmentTurnedIn,
  BugReport,
  Cancel,
  CheckCircle,
  Error,
  Help,
  Info,
  LiveHelp,
  LocalOffer,
  Payment,
  PriorityHigh,
  QuestionAnswer,
  School,
  Security,
  Settings,
  SupportAgent,
  Warning,
} from '@mui/icons-material';
import { useTicketStatistics } from '../../../API/Ticket/ticket.hook';

const TicketSummary = () => {
  const { data: stats, isLoading } = useTicketStatistics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'کل تیکت‌ها',
      value: stats?.total || 0,
      icon: <SupportAgent />,
      color: 'text-blue-600'
    },
    {
      title: 'خوانده نشده (ادمین)',
      value: stats?.unread_by_admin || 0,
      icon: <Error />,
      color: 'text-red-600'
    },
    {
      title: 'اولویت بالا',
      value: stats?.high_priority || 0,
      icon: <PriorityHigh />,
      color: 'text-orange-600'
    },
  ];

  // Status Cards - using direct properties from response
  const statusCards = [
    {
      title: 'باز',
      value: stats?.open || 0,
      icon: <LiveHelp />,
      color: 'text-orange-600'
    },
    {
      title: 'در حال بررسی',
      value: stats?.in_progress || 0,
      icon: <Settings />,
      color: 'text-yellow-600'
    },
    {
      title: 'حل شده',
      value: stats?.resolved || 0,
      icon: <CheckCircle />,
      color: 'text-green-600'
    },
    {
      title: 'بسته شده',
      value: stats?.closed || 0,
      icon: <Cancel />,
      color: 'text-gray-600'
    },
  ];

  return (
    <div className="mb-6">
      <h6 className="text-xl font-medium mb-4">
        خلاصه تیکت‌ها
      </h6>
      
      {/* Main Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

      {/* Status Statistics */}
      <div className="mb-4">
        <h6 className="text-lg font-medium mb-3 text-gray-700">
          وضعیت تیکت‌ها
        </h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statusCards.map((card, index) => (
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
    </div>
  );
};

export default TicketSummary;