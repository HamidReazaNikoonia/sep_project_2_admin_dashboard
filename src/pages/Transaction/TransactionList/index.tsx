// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { useDebounce } from '../../../hooks/useDebounce';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TextField } from '@mui/material';
import DatePicker from 'react-datepicker2';
import { useTransactions } from '../../../API/Transaction/transaction.hook';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { formatDate } from '../../../utils/date';
import { formatPrice } from '../../../utils/price';
import { Chip } from '@mui/material';

const TransactionList = () => {
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // State for filters
  const [id, setId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState('');
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(false);

  // Debounced text inputs
  const debouncedId = useDebounce(id, 500);
  const debouncedCustomerId = useDebounce(customerId, 500);
  const debouncedCustomer = useDebounce(customer, 500);
  const debouncedOrderId = useDebounce(orderId, 500);

  // State for accordions
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [expandedCreatedDate, setExpandedCreatedDate] = useState(false);
  const [expandedUpdatedDate, setExpandedUpdatedDate] = useState(false);

  // State for date ranges
  const [createdDateRange, setCreatedDateRange] = useState({
    created_from_date: null,
    created_to_date: null,
  });

  const [updatedDateRange, setUpdatedDateRange] = useState({
    updated_from_date: null,
    updated_to_date: null,
  });

  // Build query parameters for the hook
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      sortBy: 'createdAt:desc',
    };

    // Add filters
    if (debouncedId) params.id = debouncedId;
    if (debouncedCustomerId) params.customer_id = debouncedCustomerId;
    if (debouncedCustomer) params.customer = debouncedCustomer;
    if (debouncedOrderId) params.order_id = debouncedOrderId;
    if (status) params.status = true;

    // Add created date range
    if (createdDateRange.created_from_date) {
      params.created_from_date = createdDateRange.created_from_date.format('YYYY-MM-DD');
    }
    if (createdDateRange.created_to_date) {
      params.created_to_date = createdDateRange.created_to_date.format('YYYY-MM-DD');
    }

    // Add updated date range
    if (updatedDateRange.updated_from_date) {
      params.updated_from_date = updatedDateRange.updated_from_date.format('YYYY-MM-DD');
    }
    if (updatedDateRange.updated_to_date) {
      params.updated_to_date = updatedDateRange.updated_to_date.format('YYYY-MM-DD');
    }

    return params;
  }, [
    page,
    limit,
    debouncedId,
    debouncedCustomerId,
    debouncedCustomer,
    debouncedOrderId,
    status,
    createdDateRange,
    updatedDateRange,
  ]);

  // Use the useTransactions hook
  const { data: queryData, isLoading, error } = useTransactions(queryParams);

  console.log({ queryData });

  // Extract data from query result
  const data = queryData
    ? {
        results: queryData.results || [],
        page,
        limit,
        totalPages: queryData.totalPages || 0,
        totalResults: queryData.totalResults || 0,
      }
    : {
        results: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
      };

  // Accordion handlers
  const handleFiltersAccordionChange = () => {
    setExpandedFilters(!expandedFilters);
  };

  const handleCreatedDateAccordionChange = () => {
    setExpandedCreatedDate(!expandedCreatedDate);
  };

  const handleUpdatedDateAccordionChange = () => {
    setExpandedUpdatedDate(!expandedUpdatedDate);
  };

  // Date change handlers
  const handleCreatedDateChange = (name: string) => (date: any) => {
    setCreatedDateRange({
      ...createdDateRange,
      [name]: date,
    });
    setPage(1);
  };

  const handleUpdatedDateChange = (name: string) => (date: any) => {
    setUpdatedDateRange({
      ...updatedDateRange,
      [name]: date,
    });
    setPage(1);
  };

  // Reset handlers
  const resetCreatedDateRange = () => {
    setCreatedDateRange({
      created_from_date: null,
      created_to_date: null,
    });
  };

  const resetUpdatedDateRange = () => {
    setUpdatedDateRange({
      updated_from_date: null,
      updated_to_date: null,
    });
  };

  const resetAllFilters = () => {
    setId('');
    setCustomerId('');
    setCustomer('');
    setOrderId('');
    setStatus(false);
    resetCreatedDateRange();
    resetUpdatedDateRange();
    setPage(1);
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle filter changes with page reset
  const handleFilterChange = (setter: Function) => (value: any) => {
    setter(value);
    setPage(1);
  };

  // Render single transaction item
  const renderTransactionItem = (transaction: any) => {
    return (
      <div
        key={transaction._id}
        className="border border-gray-500 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
          {/* Transaction ID */}
          <div>
            <span className="text-sm text-gray-500">شناسه تراکنش:</span>
            <p className="font-semibold font-mono">{transaction._id}</p>
          </div>

          {/* Factor Number */}
          {transaction.factorNumber && (
            <div>
              <span className="text-sm text-gray-500">شماره فاکتور:</span>
              <p className="font-semibold">{transaction.factorNumber}</p>
            </div>
          )}

          {/* Order ID */}
          {transaction.order_id && (
            <div>
              <span className="text-sm text-gray-500">شناسه سفارش:</span>
              <p className="font-semibold">{transaction.order_id}</p>
            </div>
          )}

          {/* Transaction Status */}
          <div>
            <span className="text-sm text-gray-500">وضعیت تراکنش:</span>
            <div className="mt-1">
              <Chip
                label={transaction.status ? 'موفق' : 'ناموفق'}
                color={transaction.status ? 'success' : 'error'}
                size="small"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <span className="text-sm text-gray-500">مبلغ:</span>
            <p className="font-bold text-blue-600 text-lg">{formatPrice(transaction.amount)}</p>
          </div>

          {/* Tax */}
          {transaction.tax !== undefined && transaction.tax > 0 && (
            <div>
              <span className="text-sm text-gray-500">مالیات:</span>
              <p className="font-semibold">{formatPrice(transaction.tax)}</p>
            </div>
          )}

          {/* Payment Details */}
          {transaction.payment_details && (
            <div className="lg:col-span-3">
              <span className="text-sm text-gray-500 block mb-2">جزئیات پرداخت:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-3 rounded">
                {transaction.payment_details.card_pan && (
                  <div>
                    <span className="text-xs text-gray-500">شماره کارت:</span>
                    <p className="font-mono text-sm">{transaction.payment_details.card_pan}</p>
                  </div>
                )}
                {transaction.payment_details.code && (
                  <div>
                    <span className="text-xs text-gray-500">کد:</span>
                    <p className="font-semibold">{transaction.payment_details.code}</p>
                  </div>
                )}
                {transaction.payment_details.message && (
                  <div>
                    <span className="text-xs text-gray-500">پیام:</span>
                    <p className="text-sm">{transaction.payment_details.message}</p>
                  </div>
                )}
                {transaction.payment_details.fee !== undefined && (
                  <div>
                    <span className="text-xs text-gray-500">کارمزد:</span>
                    <p className="font-semibold">{formatPrice(transaction.payment_details.fee)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div>
            <span className="text-sm text-gray-500">تاریخ ایجاد:</span>
            <p className="text-sm">{formatDate(transaction.createdAt)}</p>
          </div>

          <div>
            <span className="text-sm text-gray-500">تاریخ آخرین تغییر:</span>
            <p className="text-sm">{formatDate(transaction.updatedAt)}</p>
          </div>

          {/* View Details Button */}
          <div className="flex items-end lg:col-span-3">
            <Link
              to={`/transactions/${transaction.id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <VisibilityIcon className="ml-2" fontSize="small" />
              مشاهده جزئیات
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="list-container flex flex-col gap-4">
      {/* Header and Filters Section */}
      <div dir="rtl" className="list-header bg-white pb-12 pt-4 px-4 md:px-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-8 pt-4">
          <h2 className="text-xl font-semibold">لیست تراکنش‌ها</h2>
          <button
            onClick={resetAllFilters}
            className="text-sm px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            پاک کردن همه فیلترها
          </button>
        </div>

        {/* Main Filters Accordion */}
        <Accordion
          sx={{ backgroundColor: '#f0f0f0', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)', mb: 2 }}
          expanded={expandedFilters}
          onChange={handleFiltersAccordionChange}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="filters-content" id="filters-header">
            <h3 className="text-sm md:text-base font-medium text-gray-700">فیلترها</h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Transaction ID Filter */}
              <TextField
                label="شناسه تراکنش"
                size="small"
                fullWidth
                value={id}
                onChange={(e) => handleFilterChange(setId)(e.target.value)}
                placeholder="جستجو بر اساس شناسه تراکنش"
              />

              {/* Customer ID Filter */}
              <TextField
                label="شناسه مشتری"
                size="small"
                fullWidth
                value={customerId}
                onChange={(e) => handleFilterChange(setCustomerId)(e.target.value)}
                placeholder="جستجو بر اساس شناسه مشتری"
              />

              {/* Customer Name/Mobile Filter */}
              <TextField
                label="نام یا موبایل مشتری"
                size="small"
                fullWidth
                value={customer}
                onChange={(e) => handleFilterChange(setCustomer)(e.target.value)}
                placeholder="جستجو بر اساس نام یا موبایل مشتری"
              />

              {/* Order ID Filter */}
              <TextField
                label="شناسه سفارش"
                size="small"
                fullWidth
                value={orderId}
                onChange={(e) => handleFilterChange(setOrderId)(e.target.value)}
                placeholder="جستجو بر اساس شناسه سفارش"
              />
            </div>

            {/* Status Checkbox Filter */}
            <div className="mt-6 p-4 bg-white border border-gray-300 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3">فیلتر وضعیت</h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status"
                  checked={status}
                  onChange={(e) => handleFilterChange(setStatus)(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                />
                <label htmlFor="status" className="text-sm text-gray-700 cursor-pointer">
                  فقط تراکنش‌های موفق
                </label>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Created Date Range Accordion */}
        <Accordion
          sx={{ backgroundColor: '#f0f0f0', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)', mb: 2 }}
          expanded={expandedCreatedDate}
          onChange={handleCreatedDateAccordionChange}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="created-date-content" id="created-date-header">
            <h3 className="text-sm md:text-base font-medium text-gray-700">بر اساس تاریخ ایجاد</h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="date-filter-section py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="created_from_date" className="block text-sm text-gray-600 mb-1">
                    از تاریخ
                  </label>
                  <DatePicker
                    value={createdDateRange.created_from_date}
                    onChange={handleCreatedDateChange('created_from_date')}
                    name="created_from_date"
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <label htmlFor="created_to_date" className="block text-sm text-gray-600 mb-1">
                    تا تاریخ
                  </label>
                  <DatePicker
                    value={createdDateRange.created_to_date}
                    onChange={handleCreatedDateChange('created_to_date')}
                    name="created_to_date"
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="text-sm px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors"
                    onClick={resetCreatedDateRange}
                  >
                    حذف فیلتر تاریخ ایجاد
                  </button>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Updated Date Range Accordion */}
        <Accordion
          sx={{ backgroundColor: '#f0f0f0', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)' }}
          expanded={expandedUpdatedDate}
          onChange={handleUpdatedDateAccordionChange}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="updated-date-content" id="updated-date-header">
            <h3 className="text-sm md:text-base font-medium text-gray-700">بر اساس تاریخ تغییر</h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="date-filter-section py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="updated_from_date" className="block text-sm text-gray-600 mb-1">
                    از تاریخ
                  </label>
                  <DatePicker
                    value={updatedDateRange.updated_from_date}
                    onChange={handleUpdatedDateChange('updated_from_date')}
                    name="updated_from_date"
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <label htmlFor="updated_to_date" className="block text-sm text-gray-600 mb-1">
                    تا تاریخ
                  </label>
                  <DatePicker
                    value={updatedDateRange.updated_to_date}
                    onChange={handleUpdatedDateChange('updated_to_date')}
                    name="updated_to_date"
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="text-sm px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors"
                    onClick={resetUpdatedDateRange}
                  >
                    حذف فیلتر تاریخ تغییر
                  </button>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* List Content */}
      <div className="list-content bg-white p-4 rounded-lg shadow flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Render items */}
            <div className="">
              {data.results.length > 0 ? (
                data.results.map((transaction) => renderTransactionItem(transaction))
              ) : (
                <div className="text-center py-10 text-gray-500">تراکنشی یافت نشد</div>
              )}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div dir="ltr" className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page {data.page} of {data.totalPages} • {data.totalResults} total items
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(data.page - 1)}
                    disabled={data.page === 1}
                    className={`px-4 py-2 border rounded-md ${
                      data.page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    let pageNum;
                    if (data.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (data.page <= 3) {
                      pageNum = i + 1;
                    } else if (data.page >= data.totalPages - 2) {
                      pageNum = data.totalPages - 4 + i;
                    } else {
                      pageNum = data.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-md ${
                          data.page === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(data.page + 1)}
                    disabled={data.page === data.totalPages}
                    className={`px-4 py-2 border rounded-md ${
                      data.page === data.totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionList;