import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash'; // Import debounce
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridFilterModel,
  GridToolbar,
  GridSortModel,
} from '@mui/x-data-grid';
import { useUsers } from '../../../API/Users/users.hook';
import { Box, Typography, CircularProgress, styled, Theme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Link } from 'react-router'; // Add this import at the top

// Create a theme with RTL direction
const theme = createTheme({
  direction: 'rtl', // Set direction to RTL
});


const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  border: 0,
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

const UserList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Separate state for immediate input value and debounced API query
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [debouncedFilterValue, setDebouncedFilterValue] = useState('');

  const { data, isLoading, isError, error } = useUsers({
    page,
    limit,
    ...(debouncedFilterValue && { q: debouncedFilterValue }), // Use debounced value for API
    ...(filterModel.items.length > 0 && {
      first_name: filterModel.items.find((item) => item.field === 'first_name')?.value,
      last_name: filterModel.items.find((item) => item.field === 'last_name')?.value,
      role: filterModel.items.find((item) => item.field === 'role')?.value,
      mobile: filterModel.items.find((item) => item.field === 'mobile')?.value,
    }),
    ...(sortModel.length > 0 && {
      sortBy: `${sortModel[0].field}:${sortModel[0].sort}`,
    }),
  });

  const handleSearchChange = useCallback(
    debounce((newSearchValue: string) => {
      setSearchValue(newSearchValue);
    }, 2500), // 9500ms debounce
    []
  );


  // const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newSearchValue = event.target.value;
  //   setSearchValue(newSearchValue); // Update the state immediately
  //   handleSearchChange(newSearchValue); // Debounced API call
  // };

  // Debugging: Log the rows data
  const rows = useMemo(() => {
    console.log('Rows data:', data?.results); // Debugging
    return data?.results || [];
  }, [data]);

  const rowCount = useMemo(() => data?.totalResults || 0, [data]);

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
      renderCell: (params) => (
        <Link
          to={`/users/${params.value}`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'block',
            width: '100%'
          }}
        >
          {params.value}
        </Link>
      ),
    },
    { field: 'first_name', headerName: 'نام', width: 150 },
    { field: 'last_name', headerName: 'نام خانوادگی', width: 150 },
    { field: 'mobile', headerName: 'شماره تلفن', width: 150 },
    { field: 'role', headerName: 'نقش', width: 120 },
    {
      field: 'fullName',
      headerName: 'نام و نام خانوادگی',
      width: 200,
      valueGetter: (value, row) => {
        console.log('cose', row)
        return `${row.first_name || 'Unknown'} ${row.last_name || ''}`.trim()
      },
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 120,
      renderCell: (params) => (
        <Link
          to={`/users/${params.row.id}`}
          style={{
            color: 'primary.main',
            textDecoration: 'none'
          }}
        >
          نمایش کاربر
        </Link>
      ),
    }
  ];

  // Handle pagination change
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPage(model.page + 1); // MUI DataGrid pages are zero-based
    setLimit(model.pageSize);
  };

  // Debounced filter handler
  const handleFilterModelChange = useCallback(
    debounce((newFilterModel: GridFilterModel) => {
      setFilterModel(newFilterModel);
    }, 3000), // 9500ms debounce
    []
  );

  // Handle sort change
  const handleSortModelChange = useCallback((newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        لیست کاربران
      </Typography>

      {/* DataGrid with Advanced Features */}
      <ThemeProvider theme={theme}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          paginationMode="server"
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 20, 50]}
          loading={isLoading}
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: {
                value: quickFilterValue, // Controlled input value
                onChange: handleQuickFilterChange,
                debounceMs: 0, // Disable MUI's built-in debounce
              },
            },
          }}
          sx={{
            height: 600,
            direction: 'rtl', // Set direction for the entire DataGrid
          }}
        />
      </ThemeProvider>

    </Box>
  );
};

export default UserList;