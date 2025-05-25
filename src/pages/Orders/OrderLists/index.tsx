import { useState, useCallback } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { Link } from 'react-router';
import {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridToolbar,
} from '@mui/x-data-grid';
import { useOrders } from '../../../API/Order/order.hook';
import { formatDate } from '../../../utils/date';
import { formatPrice } from '../../../utils/price';
import { OrderStatus, PaymentStatus } from '../../../API/Order/types';
import StyledDataGrid from './StyledGridComponent';

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

const OrderList = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [quickFilterValue, setQuickFilterValue] = useState('');

  const { data, isLoading } = useOrders({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    ...(quickFilterValue && { q: quickFilterValue }),
    ...(sortModel.length > 0 && {
      sortBy: `${sortModel[0].field}:${sortModel[0].sort}`,
    }),
  });

  const columns: GridColDef[] = [
    {
      field: 'reference',
      headerName: 'شماره سفارش',
      width: 150,
    },
    {
      field: 'customer',
      headerName: 'مشتری',
      width: 200,
      renderCell: (params) => (
        <span>
          {`${params.row.customer.first_name} ${params.row.customer.last_name}`}
        </span>
      ),
    },
    {
      field: 'productCount',
      headerName: 'تعداد محصولات',
      width: 130,
      renderCell: (params) => params.row.products.length,
    },
    {
      field: 'totalAmount',
      headerName: 'مبلغ کل',
      width: 150,
      renderCell: (params) => (
        <div className="font-bold">
          {formatPrice(params.value)}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'وضعیت سفارش',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={statusColors[params.value as OrderStatus]}
          size="small"
        />
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'وضعیت پرداخت',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={paymentStatusColors[params.value as PaymentStatus]}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاریخ ثبت',
      width: 150,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 100,
      renderCell: (params) => (
        <Link to={`/orders/${params.row._id}`}>
          <VisibilityIcon color="primary" />
        </Link>
      ),
    },
  ];

  const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  }, []);

  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => {
    setFilterModel(newModel);
  }, []);

  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    setSortModel(newModel);
  }, []);

  const handleQuickFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuickFilterValue(event.target.value);
  };


  const ordersData = data?.data?.orders || [];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Typography variant="h4">لیست سفارش‌ها</Typography>
      </Box>

      <StyledDataGrid
        rows={ordersData || []}
        columns={columns}
        rowCount={data?.data?.count || 0}
        loading={isLoading}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="server"
        filterMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        filterModel={filterModel}
        sortModel={sortModel}
        onFilterModelChange={handleFilterModelChange}
        onSortModelChange={handleSortModelChange}
        getRowId={(row) => row._id}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: {
              value: quickFilterValue,
              onChange: handleQuickFilterChange,
            },
          },
        }}
      />
    </Box>
  );
};

export default OrderList;