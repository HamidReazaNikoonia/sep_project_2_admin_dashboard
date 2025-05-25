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


import { useProducts } from '../../../API/Products/products.hook';


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
    // Change footer direction
    '& .MuiDataGrid-footerContainer': {
        direction: 'ltr',
    },
    '& .MuiDataGrid-columnHeaders': {
        direction: 'rtl', // Ensure column headers are RTL
        textAlign: 'right', // Align header text to the right
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
        fontWeight: 'bold', // Optional: Make header text bold
    },
    // Custom styles for the toolbar icons and text
    '& .MuiDataGrid-toolbarContainer': {
        direction: 'rtl', // Set RTL direction for the toolbar
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
        backgroundColor: 'rgba(0, 0, 0, 0.04)', // Optional: add hover effect
    },
    '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
        borderBottom: '1px solid #303030',
        ...theme.applyStyles('light', {
            borderBottomColor: '#f0f0f0',
        }),
    },
    '& .MuiDataGrid-cell': {
        color: 'rgba(255,255,255,0.65)',
        direction: 'rtl', // Ensure cell content is RTL
        textAlign: 'right', // Align cell text to the right
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
    // Add styles for the search input
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
        '& .MuiInputBase-inputTypeSearch': {
            // Add specific styles for search type input if needed
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

const ProductList = () => {
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

    const { data, isLoading, isError } = useProducts({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...(debouncedFilterValue && { q: debouncedFilterValue }),
        ...(filterModel.items.length > 0 && {
            title: filterModel.items.find((item) => item.field === 'title')?.value,
            subtitle: filterModel.items.find((item) => item.field === 'subtitle')?.value,
            brand: filterModel.items.find((item) => item.field === 'brand')?.value,
            price: filterModel.items.find((item) => item.field === 'price')?.value,
            category: filterModel.items.find((item) => item.field === 'category')?.value,
            discountable: filterModel.items.find((item) => item.field === 'discountable')?.value,
          }),
        ...(sortModel.length > 0 && {
            sortBy: `${sortModel[0].field}:${sortModel[0].sort}`,
          }),
      });

    // Extract the actual data and total count from the response
  const products = data?.data?.results || [];
  const totalCount = data?.data?.totalResults || 0;

  

    console.log({ dataaaaaaa: data });

    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'عنوان',
            width: 200,
            renderCell: (params) => (
                <Link
                    to={`/products/${params.row.id}`}
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
            field: 'subtitle',
            headerName: 'زیرعنوان',
            width: 250,
        },
        {
            field: 'brand',
            headerName: 'برند',
            width: 100,
        },
        {
            field: 'price',
            headerName: 'قیمت',
            width: 180,
            renderCell: (params) => (
                <div className='font-bold'>
                      {params.value.toLocaleString('fa-IR')} تومان
                </div>
            ),
        },
        {
            field: 'category',
            headerName: 'دسته بندی',
            width: 100,
            renderCell: (params) => (
                <div>
                      {params.value?.name}
                </div>
            ),
        },
        {
            field: 'countInStock',
            headerName: 'موجودی',
            width: 90,
            renderCell: (params) => (
                <div style={{ color: params.value === 0 ? 'red' : 'black', fontWeight: params.value === 0 ? 'bold' : 'normal' }}>
                      {params.value === 0 ? 'ناموجود' : params.value}
                </div>
            ),
        },
        {
            field: 'status',
            headerName: 'وضعیت',
            width: 100,
            renderCell: (params) => (
                <div style={{ color: params.value === 'publish' ? 'green' : 'red', fontWeight: 'bold'}}>
                      {params.value === 'publish' ? 'فعال ' : 'غیر فعال'}
                </div>
            ),
        }, 
        {
            field: 'actions',
            headerName: 'عملیات',
            width: 160,
            renderCell: (params) => (
                <Button variant="outlined" color="secondary" > 
                    <Link
                    to={`/products/${params.row.id}`}
                    style={{
                        color: 'primary.main',
                        textDecoration: 'none',
                    }}
                >
                    مشاهده و ویرایش
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

    // Debounced handler for API calls
  const debouncedSetFilter = useCallback(
    debounce((value: string) => {
      setDebouncedFilterValue(value);
    }, 500),
    []
  );


     // Immediate handler for input changes
  const handleQuickFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setQuickFilterValue(newValue); // Update input value immediately
    debouncedSetFilter(newValue); // Debounce the API call
  };


    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <div className='flex gap-4'>
                    <Link
                    to="/products/new"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    <Button variant="contained" color="primary" >  افزودن محصول جدید</Button>
                </Link>

                <Link
                    to="/products-category"
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    <Button variant="contained" color="primary" >   افزودن  دسته بندی محصول </Button>
                </Link>
                </div>
                <Typography variant="h4">لیست محصولات</Typography>
                
            </Box>

            <StyledDataGrid
                rows={products}
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

export default ProductList; 