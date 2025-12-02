// @ts-nocheck
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useOrders, useUpdateOrderStatus } from '../../../API/Order/order.hook';
import { formatDate } from '../../../utils/date';
import { formatPrice } from '../../../utils/price';
import { showToast } from '../../../utils/toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { OrderStatus, PaymentStatus } from '../../../API/Order/types';
import { StyledTable, StyledTableContainer, StyledTableHead, StyledTableBody, StyledTableRow, StyledTableCell } from '../../../components/StyledTableContainer';

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

const paymentMethodTranslations = {
  credit_card: 'کارت اعتباری',
  zarinpal: 'زرین پال',
  bank_transfer: 'انتقال بانکی',
  cash_on_delivery: 'پرداخت در محل',
};

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const calculateTotalCouponsDiscount = (order: any) => {
  return order?.appliedCoupons?.reduce((acc: number, coupon: any) => acc + coupon.discountAmount, 0);
}

const OrderSpecific = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // cancell status state
  const [cancellStatusProperties, setCancellStatusProperties] = useState({
    returnMoneyBackToWallet: false,
    redoCoupons: false,
    redoOrderProducts: false,
  });

  // Fetch order data using useOrders with order_id query param
  const { data: queryData, isLoading, error } = useOrders({ order_id: order_id, limit: 1 });

  // Update order status mutation
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Extract order from results
  const order = queryData?.results?.[0];

  // Handle status update
  const handleStatusUpdate = async () => {

    // if selected status is cancelled, check if the user has chosen to return money to wallet, redo coupons or redo order products

    if (selectedStatus === 'cancelled') {
      // If chosen to return money to wallet, confirm with window prompt
      if (cancellStatusProperties.returnMoneyBackToWallet) {
        const confirmed = window.confirm(
          "در صورتی که این گزینه را انتخاب کرده‌اید، مبلغ سفارش به کیف پول کاربر بازخواهد گشت. آیا مطمئن هستید؟"
        );
        if (!confirmed) {
          // Show a toast notification if user cancels
          showToast("عملیات تغییر وضعیت سفارش لغو شد", "بازگرداندن پول به کیف پول لغو شد", "warning");
          return;
        }
      }


      // If chosen to redo coupons, confirm with window prompt
      if (cancellStatusProperties.redoCoupons) {
        const confirmed = window.confirm(
          "در صورتی که این گزینه را انتخاب کرده‌اید، کوپن های اعمال شده بر روی سفارش بازخواهد گشت. آیا مطمئن هستید؟"
        );
        if (!confirmed) {
          // Show a toast notification if user cancels
          showToast("عملیات تغییر وضعیت سفارش لغو شد", "بازگرداندن کوپن های اعمال شده بر روی سفارش لغو شد", "warning");
          return;
        }
      }

      // If chosen to redo order products, confirm with window prompt
      if (cancellStatusProperties.redoOrderProducts) {
        const confirmed = window.confirm(
          "در صورتی که این گزینه را انتخاب کرده‌اید، محصولات سفارش بازخواهد گشت. آیا مطمئن هستید؟"
        );
        if (!confirmed) {
          // Show a toast notification if user cancels
          showToast("عملیات تغییر وضعیت سفارش لغو شد", "بازگرداندن محصولات سفارش لغو شد", "warning");
          return;
        }
      }
    }


    if (!selectedStatus || !order) return;

    console.log('cancellStatusProperties', cancellStatusProperties);

    setIsUpdating(true);
    try {
      await updateOrderStatusMutation.mutateAsync({
        id: order._id,
        status: selectedStatus,
        ...(cancellStatusProperties.returnMoneyBackToWallet && { returnMoneyBackToWallet: true }),
        ...(cancellStatusProperties.redoCoupons && { redoCoupons: true }),
        ...(cancellStatusProperties.redoOrderProducts && { redoOrderProducts: true }),
      });
      setSelectedStatus('');
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          خطا در بارگذاری اطلاعات سفارش. لطفاً دوباره تلاش کنید.
        </Alert>
        <Button
          endIcon={<ArrowBackIcon className='mr-3' />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          بازگشت به لیست سفارشات
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">جزئیات سفارش</Typography>
        <Button
          component={Link}
          to="/orders"
          endIcon={<ArrowBackIcon className='mr-3' />}
          variant="outlined"
        >
          بازگشت به لیست
        </Button>
      </Box>

      {/* Order Reference and Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                شماره سفارش
              </Typography>
              <div className="font-normal text-lg">{order.reference}</div>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                شناسه سفارش
              </Typography>
              <div className="font-normal text-lg">{order._id}</div>
            </Grid>


            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary">
                وضعیت سفارش
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={orderStatusTranslations[order.status] || order.status}
                  color={statusColors[order.status]}
                  size="medium"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle2" color="text.secondary">
                وضعیت پرداخت
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={paymentStatusTranslations[order.paymentStatus] || order.paymentStatus}
                  color={paymentStatusColors[order.paymentStatus]}
                  size="medium"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              {order.returned && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    وضعیت بازگشت
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label="سفارش بازگشت داده شده" color="error" size="medium" />
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box className='mb-2'>
                <Link className='flex items-center gap-2 hover:text-blue-500' to={`/users/${order.customer?.id}`}>
                  <PersonIcon sx={{ ml: 1 }} color="primary" />
                  <Typography variant="h6">اطلاعات مشتری</Typography>
                </Link>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  {order.customer?.avatar?.file_name ? (
                    <a href={`${SERVER_FILE}/${order.customer.avatar.file_name}`} target="_blank" rel="noopener noreferrer">
                      <img
                        src={`${SERVER_FILE}/${order.customer.avatar.file_name}`}
                        alt={`${order.customer.first_name} ${order.customer.last_name}`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <PersonIcon sx={{ color: '#9ca3af', fontSize: 24 }} />
                    </div>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    نام و نام خانوادگی
                  </Typography>
                  <Typography variant="body1">
                    {order.customer?.first_name} {order.customer?.last_name}
                  </Typography>
                </Grid>
                {order.customer?.email && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ایمیل
                    </Typography>
                    <Typography variant="body1">{order.customer.email}</Typography>
                  </Grid>
                )}
                {order.customer?.mobile && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      شماره تماس
                    </Typography>
                    <Typography variant="body1">{order.customer.mobile}</Typography>
                  </Grid>
                )}
                {order.customer?.student_id && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      شماره دانشجویی
                    </Typography>
                    <Typography variant="body1">{order.customer.student_id}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    شناسه مشتری
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {order.customer?.id}
                  </Typography>
                </Grid>

                {order.customer?.isNationalIdVerified !== undefined && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      وضعیت تایید کد ملی
                    </Typography>
                    <Typography variant="body1">
                      {order.customer.isNationalIdVerified ? 'تایید شده' : 'تایید نشده'}
                    </Typography>
                  </Grid>
                )}
                {order.customer?.nationalId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      کد ملی
                    </Typography>
                    <Typography variant="body1">{order.customer.nationalId}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information - Bill Style */}
        <Grid item xs={12}>
          <Card sx={{ minHeight: '562px' }}>
            <CardContent>
              <Box className='mb-2'>
                <Link className='flex items-center gap-2 hover:text-blue-500' to={`/transactions/${order?.transactionId}`}>
                  <PaymentIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">اطلاعات پرداخت</Typography>
                </Link>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Bill Header */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">روش پرداخت:</span>
                  <span className="font-medium">{paymentMethodTranslations[order.paymentMethod] || order.paymentMethod}</span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">شناسه تراکنش:</span>
                    <span className="font-mono text-sm">{order.transactionId}</span>
                  </div>
                )}
              </div>

              {/* Bill Body */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Bill Items */}
                <div className="divide-y divide-gray-200">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-600">جمع محصولات:</span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>

                 

                  {/* Taxes */}
                  {order.taxes !== undefined && order.taxes > 0 && (
                    <div className="flex justify-between items-center p-3">
                      <span className="text-sm text-gray-600">
                        مالیات {order.taxRate && `(${order.taxRate}%)`}:
                      </span>
                      <span className="font-semibold">{formatPrice(order.taxes)}</span>
                    </div>
                  )}

                  {/* Delivery Fees */}

                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-600">هزینه ارسال:</span>

                    <span>
                      {order.deliveryFees !== undefined && order.deliveryFees > 0 ? (
                        <span className="font-semibold">{formatPrice(order.deliveryFees)}</span>
                      ) : (
                        <span className="font-semibold"> --- </span>
                      )}
                    </span>
                  </div>

                   {/* Discount */}
                   {order.total_discount_price !== undefined && order.total_discount_price > 0 && (
                    <div className="flex justify-between items-center p-3 bg-red-50">
                      <span className="text-sm text-red-600">  کسری: </span>
                      <span className="font-semibold text-red-600">-{formatPrice(order.total_discount_price)}</span>
                    </div>
                  )}

                  {/* Use Wallet Amount */}
                  {order.used_wallet_amount !== undefined && order.used_wallet_amount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-50">
                      <span className="text-sm text-green-600">مبلغ استفاده شده از کیف پول: </span>
                      <span className="font-semibold text-green-600">{formatPrice(order.used_wallet_amount)}</span>
                    </div>
                  )}

                  {/* Coupons */}

                  <div className="p-3 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-green-600">کوپن‌های اعمال شده:</span>
                      <span className="font-semibold text-xs text-gray-600">
                        {order?.appliedCoupons?.length ? (
                          <>
                            {order.appliedCoupons.length}
                            <span className="mx-1">عدد</span>
                          </>
                        ) : (
                          '۰'
                        )}
                      </span>
                    </div>
                    {order?.appliedCoupons?.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        {order.appliedCoupons.map((coupon: any, idx: number) => (
                          <div key={idx} className="flex flex-wrap gap-4 border rounded p-2 bg-white items-center shadow-sm text-xs">
                            <div>
                              <span className="font-bold">کد:</span>{" "}
                              <span className="font-mono">{coupon.code}</span>
                            </div>
                            <div>
                              <span className="font-bold">نوع تخفیف:</span>{" "}
                              <span>
                                {coupon.discountType === 'PERCENTAGE' ? 'درصدی' : coupon.discountType === 'FIXED_AMOUNT' ? 'مبلغ ثابت' : coupon.discountType}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold">مقدار تخفیف:</span>{" "}
                              <span>
                                {coupon.discountType === 'percent'
                                  ? `${coupon.discountAmount}%`
                                  : formatPrice
                                    ? formatPrice(coupon.discountAmount)
                                    : coupon.discountAmount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Bill Footer - Final Amount */}
                <div className="bg-gray-50 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">مبلغ قابل پرداخت:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(order.final_order_price ?? order.totalAmount)}
                    </span>
                  </div>

                  {/* Payment Status Badge */}
                  <div className="flex justify-center mt-3">
                    <Chip
                      label={paymentStatusTranslations[order.paymentStatus] || order.paymentStatus}
                      color={paymentStatusColors[order.paymentStatus]}
                      size="small"
                      className="font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Payment Info */}
              {/* {(order.total_discount_price > 0 && order.appliedCoupons?.length > 0) && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">  جمع تخفیف کوپن های اعمال شده:</span>
                    <span className="font-bold text-green-700">
                      {calculateTotalCouponsDiscount(order)}
                    </span>
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Information */}
        {(order.shippingAddress || order.billingAddress) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalShippingIcon sx={{ ml: 1 }} color="primary" />
                  <Typography variant="h6">اطلاعات ارسال</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {order.shippingAddress && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        آدرس ارسال
                      </Typography>
                      <Typography variant="body1">{order?.shippingAddress?.billingAddress?.addressLine1}</Typography>
                      <Typography variant="body1">{order?.shippingAddress?.billingAddress?.city}</Typography>
                      <Typography variant="body1">{order?.shippingAddress?.billingAddress?.state}</Typography>
                      <Typography variant="body1">{order?.shippingAddress?.billingAddress?.postal_code}</Typography>
                    </Grid>
                  )}
                  {order.billingAddress && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        آدرس صورتحساب
                      </Typography>
                      <Typography variant="body1">{order.billingAddress}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Products/Courses Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ ml: 1 }} color="primary" />
                <Typography variant="h6">محصولات</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <StyledTableContainer component={Paper} variant="outlined">
                <StyledTable size="small">
                  <StyledTableHead>
                    <StyledTableRow>
                      <StyledTableCell>نام</StyledTableCell>
                      <StyledTableCell>نوع</StyledTableCell>
                      <StyledTableCell align="center">تعداد</StyledTableCell>
                      <StyledTableCell align="left">قیمت واحد</StyledTableCell>
                      <StyledTableCell align="left">قیمت کل</StyledTableCell>
                    </StyledTableRow>
                  </StyledTableHead>
                  <StyledTableBody>
                    {order.products?.map((item, index) => (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          {item.product?.title || item.course?.title || 'نامشخص'}
                        </StyledTableCell>
                        <StyledTableCell>
                          {item.product ? (
                            <Chip label="محصول فیزیکی" color="primary" size="small" variant="outlined" />
                          ) : item.course ? (
                            <Chip label="دوره" color="secondary" size="small" variant="outlined" />
                          ) : (
                            '-'
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">{item.quantity}</StyledTableCell>
                        <StyledTableCell align="left">{formatPrice(item.price)}</StyledTableCell>
                        <StyledTableCell align="left">
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </StyledTableBody>
                </StyledTable>
              </StyledTableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Dates */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ ml: 1 }} color="primary" />
                <Typography variant="h6">تاریخ‌ها</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    تاریخ ثبت سفارش
                  </Typography>
                  <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    آخرین بروزرسانی
                  </Typography>
                  <Typography variant="body1">{formatDate(order.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Update Order Status */}
        <Grid item xs={12}>
        {order?.status === 'cancelled' && (
                <div className='w-full my-2 flex flex-col items-start gap-2 mb-6'>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                  <div className='mr-2 text-lg font-bold text-red-800'>
                  لطفا بعد از لغو سفارش , وضعیت سفارش را تغییر ندهید و یک سفارش جدید ایجاد کنید
                </div>
                  </Alert>
                </div>
              )}
          <Card>
            <CardContent>
              <div className='w-full mb-2 flex justify-between items-center'>
                <Typography variant="h6">
                  بروزرسانی وضعیت سفارش
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={orderStatusTranslations[order.status] || order.status}
                    color={statusColors[order.status]}
                    size="medium"
                  />
                </Box>
              </div>
              <Divider sx={{ mb: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="update-status-label">وضعیت جدید</InputLabel>
                <Select
                  labelId="update-status-label"
                  value={selectedStatus}
                  label="وضعیت جدید"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="waiting">{orderStatusTranslations.waiting}</MenuItem>
                  <MenuItem value="confirmed">{orderStatusTranslations.confirmed}</MenuItem>
                  <MenuItem value="shipped">{orderStatusTranslations.shipped}</MenuItem>
                  <MenuItem value="delivered">{orderStatusTranslations.delivered}</MenuItem>
                  <MenuItem value="cancelled">{orderStatusTranslations.cancelled}</MenuItem>
                  <MenuItem value="returned">{orderStatusTranslations.returned}</MenuItem>
                  <MenuItem value="finish">{orderStatusTranslations.finish}</MenuItem>
                </Select>
              </FormControl>
              {selectedStatus === 'cancelled' && (
                <div className='my-2 flex flex-col items-start gap-2 mb-6'>
                  <div className='flex flex-col gap-2'>
                    <div className='text-sm text-red-400 font-bold'>لطفا اطلاعات بیشتری درباره لغو سفارش را وارد کنید</div>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <div className='mr-2'>
                        لطفا در انتخاب گزینه های زیر قبل از بروزرسانی وضعیت سفارش توجه کنید

                      </div>
                    </Alert>
                  </div>

                  <div className='flex flex-col gap-2 md:flex-row'>
                    <FormControlLabel
                      control={<Checkbox checked={cancellStatusProperties.returnMoneyBackToWallet} onChange={(e) => setCancellStatusProperties({ ...cancellStatusProperties, returnMoneyBackToWallet: e.target.checked })} />}
                      label="بازگشت پول به کیف پول کاربر"
                    />

                    <FormControlLabel
                      control={<Checkbox checked={cancellStatusProperties.redoCoupons} onChange={(e) => setCancellStatusProperties({ ...cancellStatusProperties, redoCoupons: e.target.checked })} />}
                      label="بازگشت کوپن های اعمال شده"
                    />

                    <FormControlLabel
                      control={<Checkbox checked={cancellStatusProperties.redoOrderProducts} onChange={(e) => setCancellStatusProperties({ ...cancellStatusProperties, redoOrderProducts: e.target.checked })} />}
                      label="بازگشت محصولات سفارش"
                    />
                  </div>
                </div>
              )}

              <div className='flex w-full justify-center md:w-autom'>
                <Button
                  className='w-full md:w-auto'
                  sx={{
                    minWidth: '250px',
                    textAlign: 'center',
                  }}
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || isUpdating || updateOrderStatusMutation.isPending}
                >
                  {isUpdating || updateOrderStatusMutation.isPending ? 'در حال بروزرسانی...' : 'بروزرسانی وضعیت'}
                </Button>
              </div>
              {selectedStatus && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  وضعیت فعلی: <strong>{orderStatusTranslations[order.status]}</strong>
                  <br />
                  وضعیت جدید: <strong>{orderStatusTranslations[selectedStatus]}</strong>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderSpecific;
