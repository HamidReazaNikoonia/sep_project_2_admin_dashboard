// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useDebounce } from '../../../hooks/useDebounce';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import DatePicker from 'react-datepicker2';
import { useOrders } from '../../../API/Order/order.hook';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { formatDate } from '../../../utils/date';
import { formatPrice } from '../../../utils/price';
import { Chip } from '@mui/material';
import { OrderStatus, PaymentStatus } from '../../../API/Order/types';
import { useSearchParams } from 'react-router';

const statusColors: Record<OrderStatus, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning'> = {
  waiting: 'warning',
  confirmed: 'primary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
  finish: 'success',
};

const paymentStatusColors: Record<PaymentStatus, 'success' | 'error'> = {
  paid: 'success',
  unpaid: 'error',
};

// Status translations
const orderStatusTranslations = {
  waiting: 'در انتظار',
  confirmed: 'تایید شده',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
  returned: 'مرجوع شده',
  finish: 'تکمیل شده',
};

const paymentStatusTranslations = {
  paid: 'پرداخت شده',
  unpaid: 'پرداخت نشده',
};

const OrderList = () => {

  // Get search params from URL
  const [searchParams] = useSearchParams();


  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // State for filters
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [transactionId, setTransactionId] = useState(searchParams.get('transaction_id') || '');
  const [orderId, setOrderId] = useState(searchParams.get('order_id') || '');
  const [reference, setReference] = useState('');
  const [customerId, setCustomerId] = useState(searchParams.get('customer_id') || '');
  const [customer, setCustomer] = useState('');

  // Add these new boolean filter states
  const [haveProduct, setHaveProduct] = useState(false);
  const [haveCourse, setHaveCourse] = useState(false);
  const [haveCoupon, setHaveCoupon] = useState(false);
  const [haveDiscount, setHaveDiscount] = useState(false);
  const [haveShipping, setHaveShipping] = useState(false);

  // Debounced text inputs
  const debouncedTransactionId = useDebounce(transactionId, 500);
  const debouncedOrderId = useDebounce(orderId, 500);
  const debouncedReference = useDebounce(reference, 500);
  const debouncedCustomerId = useDebounce(customerId, 500);
  const debouncedCustomer = useDebounce(customer, 500);

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

    // Get URL params directly
    const urlTransactionId = searchParams.get('transaction_id');
    const urlCustomerId = searchParams.get('customer_id');

    // Add filters
    if (orderStatus) params.order_status = orderStatus;
    if (paymentStatus) params.payment_status = paymentStatus;

    // Priority: URL params > debounced state values
    if (urlTransactionId) {
      params.transaction_id = urlTransactionId;
    } else if (debouncedTransactionId) {
      params.transaction_id = debouncedTransactionId;
    }

    if (urlCustomerId) {
      params.customer_id = urlCustomerId;
    } else if (debouncedCustomerId) {
      params.customer_id = debouncedCustomerId;
    }

    if (orderId) {
      params.order_id = orderId;
    } else if (debouncedOrderId) {
      params.order_id = debouncedOrderId;
    }

    // Other debounced filters
    if (debouncedOrderId) params.order_id = debouncedOrderId;
    if (debouncedReference) params.reference = debouncedReference;
    if (debouncedCustomer) params.customer = debouncedCustomer;

    // Add boolean filters
    if (haveProduct) params.have_product = true;
    if (haveCourse) params.have_course = true;
    if (haveCoupon) params.have_coupon = true;
    if (haveDiscount) params.have_discount = true;
    if (haveShipping) params.have_shipping = true;

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
    searchParams, // Add searchParams as dependency
    orderStatus,
    paymentStatus,
    debouncedTransactionId,
    debouncedOrderId,
    debouncedReference,
    debouncedCustomerId,
    debouncedCustomer,
    haveProduct,
    haveCourse,
    haveCoupon,
    haveDiscount,
    haveShipping,
    createdDateRange,
    updatedDateRange,
  ]);

  // Use the useOrders hook
  const { data: queryData, isLoading, error } = useOrders(queryParams);


  console.log({ queryData })

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
    setOrderStatus('');
    setPaymentStatus('');
    setTransactionId('');
    setOrderId('');
    setReference('');
    setCustomerId('');
    setCustomer('');
    setHaveProduct(false);
    setHaveCourse(false);
    setHaveCoupon(false);
    setHaveDiscount(false);
    setHaveShipping(false);
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

  // Render single order item
  const renderOrderItem = (order: any) => {
    // Helper function to check what types of items are in the order
    const getOrderItemTypes = () => {
      const itemTypes = {
        have_product_on_order: false,
        have_course_on_order: false,
      };

      order.products?.forEach((item: any) => {
        if (item.product) {
          itemTypes.have_product_on_order = true;
        }
        if (item.course) {
          itemTypes.have_course_on_order = true;
        }
      });

      return itemTypes;
    };

    const itemTypes = getOrderItemTypes();

    return (
      <div
        key={order._id}
        className="border border-gray-500 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
          {/* Order Reference */}
          <div>
            <span className="text-sm text-gray-500">شماره سفارش:</span>
            <p className="font-semibold">{order.reference}</p>
          </div>

          {/* Customer Information */}
          <div>
            <span className="text-sm text-gray-500">مشتری:</span>
            <p className="font-semibold">
              {order.customer?.first_name} {order.customer?.last_name}
            </p>
            {order.customer?.mobile && (
              <p className="text-sm font-medium text-gray-600 mt-1">موبایل: {order.customer.mobile}</p>
            )}
            {order.customer?.student_id && (
              <p className="text-sm font-medium text-gray-600">شماره دانشجویی: {order.customer.student_id}</p>
            )}
          </div>

          {/* Order Item Types */}
          <div>
            <span className="text-sm text-gray-500">سفارش شامل:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {itemTypes.have_product_on_order && (
                <Chip label="محصول فیزیکی" color="primary" size="small" variant="outlined" />
              )}
              {itemTypes.have_course_on_order && (
                <Chip label="دوره" color="secondary" size="small" variant="outlined" />
              )}
            </div>
          </div>

          {/* Order Status */}
          <div>
            <span className="text-sm text-gray-500">وضعیت سفارش:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Chip
                label={orderStatusTranslations[order.status as OrderStatus] || order.status}
                color={statusColors[order.status as OrderStatus]}
                size="small"
              />
              {order.returned && (
                <Chip label="سفارش بازگشت داده شده" color="error" size="small" />
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <span className="text-sm text-gray-500">وضعیت پرداخت:</span>
            <div className="mt-1">
              <Chip
                label={paymentStatusTranslations[order.paymentStatus as PaymentStatus] || order.paymentStatus}
                color={paymentStatusColors[order.paymentStatus as PaymentStatus]}
                size="small"
              />
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <span className="text-sm text-gray-500">نوع ارسال:</span>
              <div className="mt-1">
                <Chip label="ارسال پستی" color="info" size="small" variant="outlined" />
              </div>
            </div>
          )}

          {/* Price Information */}
          <div className="lg:col-span-3">
            <span className="text-sm text-gray-500 block mb-2">اطلاعات مالی:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-gray-50 p-3 rounded">
            <div>
                <span className="text-xs text-gray-500">مبلغ کل:</span>
                <p className="font-medium text-gray-700">{formatPrice(order.total)}</p>
              </div>
              
              <div>
                <span className="text-xs text-gray-500">مبلغ پرداخت شده:</span>
                <p className="font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
              </div>

              {order.final_order_price !== undefined && (
                <div>
                  <span className="text-xs text-gray-500">مبلغ نهایی:</span>
                  <p className="font-bold text-green-600">{formatPrice(order.final_order_price)}</p>
                </div>
              )}

              {order.total_discount_price !== undefined && order.total_discount_price > 0 && (
                <div>
                  <span className="text-xs text-gray-500">کسری:</span>
                  <p className="font-bold text-red-600">{formatPrice(order.total_discount_price)}</p>
                </div>
              )}

              {order.taxes !== undefined && order.taxes > 0 && (
                <div>
                  <span className="text-xs text-gray-500">مالیات:</span>
                  <p className="font-semibold">{formatPrice(order.taxes)}</p>
                  {order.taxRate && (
                    <p className="text-xs text-gray-500">نرخ: {order.taxRate}%</p>
                  )}
                </div>
              )}

              {order.appliedCoupons && order.appliedCoupons.length > 0 && (
                <div className="flex items-center">
                  <Chip label="دارای کوپن" color="warning" size="small" icon={<span>🎟️</span>} />
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div>
            <span className="text-sm text-gray-500">تاریخ ثبت:</span>
            <p className="text-sm">{formatDate(order.createdAt)}</p>
          </div>

          <div>
            <span className="text-sm text-gray-500">تاریخ آخرین تغییر:</span>
            <p className="text-sm">{formatDate(order.updatedAt)}</p>
          </div>

          {/* Transaction ID */}
          {order.transactionId && (
            <div>
              <span className="text-sm text-gray-500">شناسه تراکنش:</span>
              <p className="font-mono text-sm">{order.transactionId}</p>
            </div>
          )}

          {/* View Details Button */}
          <div className="flex items-end lg:col-span-3">
            <Link
              to={`/orders/${order._id}`}
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
          <h2 className="text-xl font-semibold">لیست سفارشات</h2>
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
              {/* Order Status Filter */}
              <FormControl fullWidth size="small">
                <InputLabel id="order-status-label">وضعیت سفارش</InputLabel>
                <Select
                  labelId="order-status-label"
                  value={orderStatus}
                  label="وضعیت سفارش"
                  onChange={(e) => handleFilterChange(setOrderStatus)(e.target.value)}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="waiting">{orderStatusTranslations.waiting}</MenuItem>
                  <MenuItem value="confirmed">{orderStatusTranslations.confirmed}</MenuItem>
                  <MenuItem value="shipped">{orderStatusTranslations.shipped}</MenuItem>
                  <MenuItem value="delivered">{orderStatusTranslations.delivered}</MenuItem>
                  <MenuItem value="cancelled">{orderStatusTranslations.cancelled}</MenuItem>
                  <MenuItem value="returned">{orderStatusTranslations.returned}</MenuItem>
                  <MenuItem value="finish">{orderStatusTranslations.finish}</MenuItem>
                </Select>
              </FormControl>

              {/* Payment Status Filter */}
              <FormControl fullWidth size="small">
                <InputLabel id="payment-status-label">وضعیت پرداخت</InputLabel>
                <Select
                  labelId="payment-status-label"
                  value={paymentStatus}
                  label="وضعیت پرداخت"
                  onChange={(e) => handleFilterChange(setPaymentStatus)(e.target.value)}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="paid">{paymentStatusTranslations.paid}</MenuItem>
                  <MenuItem value="unpaid">{paymentStatusTranslations.unpaid}</MenuItem>
                </Select>
              </FormControl>

              {/* Transaction ID Filter */}
              <TextField
                label="شناسه تراکنش"
                size="small"
                fullWidth
                value={transactionId}
                onChange={(e) => handleFilterChange(setTransactionId)(e.target.value)}
                placeholder="جستجو بر اساس شناسه تراکنش"
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

              {/* Reference Filter */}
              <TextField
                label="شماره سفارش"
                size="small"
                fullWidth
                value={reference}
                onChange={(e) => handleFilterChange(setReference)(e.target.value)}
                placeholder="جستجو بر اساس شماره سفارش"
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

              {/* Customer Name Filter */}
              <TextField
                label="نام مشتری"
                size="small"
                fullWidth
                value={customer}
                onChange={(e) => handleFilterChange(setCustomer)(e.target.value)}
                placeholder="جستجو بر اساس نام مشتری"
              />
            </div>

            {/* Boolean Filters Box - All Checkboxes in One Container */}
            <div className="mt-6 p-4 bg-white border border-gray-300 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3">فیلترهای اضافی</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="have_product"
                    checked={haveProduct}
                    onChange={(e) => handleFilterChange(setHaveProduct)(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="have_product" className="text-sm text-gray-700 cursor-pointer">
                    سفارش های داری محصول فیزیکی
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="have_course"
                    checked={haveCourse}
                    onChange={(e) => handleFilterChange(setHaveCourse)(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="have_course" className="text-sm text-gray-700 cursor-pointer">
                    سفارش های داری دوره
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="have_coupon"
                    checked={haveCoupon}
                    onChange={(e) => handleFilterChange(setHaveCoupon)(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="have_coupon" className="text-sm text-gray-700 cursor-pointer">
                    دارای کوپن
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="have_discount"
                    checked={haveDiscount}
                    onChange={(e) => handleFilterChange(setHaveDiscount)(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="have_discount" className="text-sm text-gray-700 cursor-pointer">
                    دارای تخفیف
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="have_shipping"
                    checked={haveShipping}
                    onChange={(e) => handleFilterChange(setHaveShipping)(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="have_shipping" className="text-sm text-gray-700 cursor-pointer">
                    مرسوله پستی
                  </label>
                </div>
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
                data.results.map((order) => renderOrderItem(order))
              ) : (
                <div className="text-center py-10 text-gray-500">سفارشی یافت نشد</div>
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
                    className={`px-4 py-2 border rounded-md ${data.page === 1
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
                        className={`px-4 py-2 border rounded-md ${data.page === pageNum
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
                    className={`px-4 py-2 border rounded-md ${data.page === data.totalPages
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

export default OrderList;