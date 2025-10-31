import { Edit as EditIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid2 as Grid,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useTransactions } from '@/API/Transaction/transaction.hook';
import StyledPaper from '@/components/StyledPaper';

import {formatDate} from '@/utils/date';

import { showToast } from '@/utils/toast';

const TransactionSpecific = () => {
  const { transaction_id } = useParams();
  const { data, isLoading, isError, error } = useTransactions({id: transaction_id});
  
  const [status, setStatus] = useState(false);

  const transaction = data?.results?.[0] || [];

  useEffect(() => {
    if (transaction) {
      setStatus(transaction?.status);
    }
  }, [transaction]);


  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('fa-IR');
//   };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          خطا در دریافت اطلاعات تراکنش: {error?.message || 'خطای ناشناخته'}
        </Typography>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box p={3}>
        <Typography>تراکنش یافت نشد</Typography>
      </Box>
    );
  }

  return (
    <Box dir="rtl" p={3}>
      <div className="flex justify-between items-center mb-4">
        <Typography className="text-right" variant="h4" gutterBottom>
          جزئیات تراکنش
        </Typography>
      </div>

      <Grid container spacing={3}>
        {/* Basic Transaction Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              اطلاعات اصلی تراکنش
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    شماره سفارش
                  </Typography>
                  <Typography>{transaction.order_id}</Typography>
                </Box>
              </Grid>

               <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    شماره فاکتور
                  </Typography>
                  <Typography>{transaction.factorNumber}</Typography>
                </Box>
              </Grid>

              <Grid  size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    مبلغ تراکنش
                  </Typography>
                  <Typography>{formatPrice(transaction.amount)}</Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    مالیات
                  </Typography>
                  <Typography>{formatPrice(transaction.tax)}</Typography>
                </Box>
              </Grid>


              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    وضعیت
                  </Typography>
                  <Chip
                    color={status ? 'success' : 'error'}
                    sx={{padding: '5px 25px'}}
                    label={status ? 'موفق' : 'ناموفق'}
                  />
                    
                    
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    تاریخ تراکنش
                  </Typography>
                  <Typography>{formatDate(transaction.createdAt)}</Typography>
                </Box>
              </Grid>

              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    آخرین بروزرسانی
                  </Typography>
                  <Typography>{formatDate(transaction.updatedAt)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Payment Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              جزئیات پرداخت
            </Typography>
            {transaction.payment_details && (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      کد وضعیت
                    </Typography>
                    <Typography>{transaction?.payment_details?.code}</Typography>
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      پیام پرداخت
                    </Typography>
                    <Typography>{transaction?.payment_details?.message}</Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      شماره کارت
                    </Typography>
                    <Typography>{transaction?.payment_details?.card_pan}</Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      کارمزد
                    </Typography>
                    <Typography>{formatPrice(transaction?.payment_details?.fee)}</Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      کارمزد شاپرک
                    </Typography>
                    <Typography>{formatPrice(transaction?.payment_details?.shaparak_fee)}</Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      نوع کارمزد
                    </Typography>
                    <Typography>{transaction?.payment_details?.fee_type}</Typography>
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      هش کارت
                    </Typography>
                    <Typography className="break-all">
                      {transaction?.payment_details?.card_hash}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </StyledPaper>
        </Grid>

        {/* Additional Information */}
        <Grid size={12}>
          <StyledPaper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              اطلاعات تکمیلی
            </Typography>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    شناسه مرجع پرداخت
                  </Typography>
                  <Typography>{transaction?.payment_reference_id}</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    شناسه تراکنش
                  </Typography>
                  <Typography>{transaction.id}</Typography>
                </Box>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionSpecific;