import { useState, useCallback } from 'react';
import { Box, Button, styled, Theme, Typography } from '@mui/material';
import { Link } from 'react-router';
import { debounce } from 'lodash';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridToolbar,
} from '@mui/x-data-grid';
import { useTransactions } from '../../../API/Transaction/transaction.hook'; // Adjust import path


// utils
import { formatDate } from '../../../utils/date';

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  border: 0,
  direction: 'rtl',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: [
    'Samim',
    'Arial',
    'sans-serif',
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: '#1d1d1d',
    ...theme.applyStyles('light', {
      backgroundColor: '#fafafa',
    }),
  },
  '& .MuiDataGrid-footerContainer': {
    direction: 'ltr',
  },
  '& .MuiDataGrid-columnHeaders': {
    direction: 'rtl',
    textAlign: 'right',
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: '1px solid #303030',
    ...theme.applyStyles('light', {
      borderRightColor: '#f0f0f0',
    }),
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-toolbarContainer': {
    direction: 'rtl',
    justifyContent: 'flex-start',
    '& .MuiButton-root': {
      direction: 'rtl',
    },
    '& .MuiButton-startIcon': {
      marginRight: '0',
      marginLeft: '8px',
    },
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: '1px solid #303030',
    ...theme.applyStyles('light', {
      borderBottomColor: '#f0f0f0',
    }),
  },
  '& .MuiDataGrid-cell': {
    color: 'rgba(255,255,255,0.65)',
    direction: 'rtl',
    textAlign: 'right',
    ...theme.applyStyles('light', {
      color: 'rgba(0,0,0,.85)',
    }),
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0,
  },
  ...theme.applyStyles('light', {
    color: 'rgba(0,0,0,.85)',
  }),
  '& .MuiDataGrid-toolbarQuickFilter': {
    direction: 'rtl',
    '& .MuiInputBase-root': {
      direction: 'rtl',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '4px 12px',
    },
    '& .MuiInputBase-input.MuiInput-input': {
      direction: 'rtl',
      textAlign: 'right',
      padding: '8px 10px',
      fontSize: '14px',
      color: '#333',
      '&::placeholder': {
        color: '#666',
        opacity: 1,
      },
      '&:focus': {
        backgroundColor: '#fff',
      },
    },
    '& .MuiInputBase-inputAdornedStart': {
      paddingRight: '8px',
    },
    '& .MuiInputBase-inputAdornedEnd': {
      paddingLeft: '8px',
    },
    '& .MuiInputAdornment-root': {
      marginLeft: '8px',
      marginRight: '-8px',
      '& .MuiSvgIcon-root': {
        fontSize: '20px',
        color: '#666',
      },
    },
  },
}));

const TransactionList = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [debouncedFilterValue, setDebouncedFilterValue] = useState('');

  const { data, isLoading, isError } = useTransactions({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    ...(debouncedFilterValue && { q: debouncedFilterValue }),
    ...(filterModel.items.length > 0 && {
      order_id: filterModel.items.find((item) => item.field === 'order_id')?.value,
      status: filterModel.items.find((item) => item.field === 'status')?.value,
      amount: filterModel.items.find((item) => item.field === 'amount')?.value,
    }),
    ...(sortModel.length > 0 && {
      sortBy: `${sortModel[0].field}:${sortModel[0].sort}`,
    }),
  });

  const transactions = data?.data?.results || [];
  const totalCount = data?.data?.totalResults || 0;

//   const formatDate = (dateString: string) => {
//     return formatDate(dateString);
//   };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const columns: GridColDef[] = [
    {
      field: 'order_id',
      headerName: 'شماره سفارش',
      width: 200,
      renderCell: (params) => (
        <Link
          to={`/transactions/${params.row.id}`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: 'amount',
      headerName: 'مبلغ',
      width: 150,
      renderCell: (params) => (
        <div className='font-bold'>
          {formatPrice(params.value)}
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'وضعیت',
      width: 80,
      renderCell: (params) => (
        <div style={{ 
          color: params.value ? 'green' : 'red', 
          fontWeight: 'bold'
        }}>
          {params.value ? 'موفق' : 'ناموفق'}
        </div>
      ),
    },
    {
      field: 'tax',
      headerName: 'مالیات',
      width: 120,
      renderCell: (params) => formatPrice(params.value),
    },
    {
      field: 'factorNumber',
      headerName: 'شماره فاکتور',
      width: 350,
    },
    {
      field: 'createdAt',
      headerName: 'تاریخ تراکنش',
      width: 150,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 150,
      renderCell: (params) => (
        <Button variant="outlined" color="secondary">
          <Link
            to={`/transactions/${params.row.id}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            جزئیات
          </Link>
        </Button>
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

  const debouncedSetFilter = useCallback(
    debounce((value: string) => {
      setDebouncedFilterValue(value);
    }, 500),
    []
  );

  const handleQuickFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setQuickFilterValue(newValue);
    debouncedSetFilter(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Typography variant="h4">لیست تراکنش‌ها</Typography>
        
      </Box>

      <StyledDataGrid
        rows={transactions}
        columns={columns}
        rowCount={totalCount}
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
        getRowId={(row) => row.id}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: {
              value: quickFilterValue,
              debounceMs: 0,
              onChange: handleQuickFilterChange,
            },
          },
        }}
      />
    </Box>
  );
};

export default TransactionList;