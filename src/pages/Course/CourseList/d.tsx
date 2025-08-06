import { useState, useCallback } from 'react'
import { Box, Button, styled, Theme, Typography } from '@mui/material'
import { Link } from 'react-router'
import { debounce } from 'lodash'
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridToolbar,
} from '@mui/x-data-grid'
import { useCourses } from '../../../API/Course/course.hook'

const StyledDataGrid = styled(DataGrid)(({ theme }: { theme: Theme }) => ({
  border: 0,
  direction: 'rtl',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: ['Samim', 'Arial', 'sans-serif'].join(','),
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
}))

const CourseList = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  })
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [quickFilterValue, setQuickFilterValue] = useState('')
  const [debouncedFilterValue, setDebouncedFilterValue] = useState('')

  const { data, isLoading } = useCourses({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    ...(debouncedFilterValue && { q: debouncedFilterValue }),
    ...(filterModel.items.length > 0 && {
      title: filterModel.items.find((item) => item.field === 'title')?.value,
      sub_title: filterModel.items.find((item) => item.field === 'sub_title')
        ?.value,
      course_type: filterModel.items.find(
        (item) => item.field === 'course_type',
      )?.value,
      price: filterModel.items.find((item) => item.field === 'price')?.value,
      category: filterModel.items.find((item) => item.field === 'category')
        ?.value,
    }),
    ...(sortModel.length > 0 && {
      sortBy: `${sortModel[0].field}:${sortModel[0].sort}`,
    }),
  })

  const courses = data?.data?.results || []
  const totalCount = data?.data?.totalResults || 0

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'عنوان دوره',
      width: 200,
      renderCell: (params) => (
        <Link
          to={`/courses/${params.row.id}`}
          style={{
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          {params.value}
        </Link>
      ),
    },
    // {
    //     field: 'course_type',
    //     headerName: 'نوع دوره',
    //     width: 80,
    //     renderCell: (params) => (
    //         <div>
    //             {params.value === 'HOZORI' ? 'حضوری' : 'آفلاین'}
    //         </div>
    //     ),
    // },
    {
      field: 'price_real',
      headerName: 'قیمت',
      width: 150,
      renderCell: (params) => (
        <div className="font-bold">
          {params.value.toLocaleString('fa-IR')} ریال
        </div>
      ),
    },
    {
      field: 'price_discount',
      headerName: 'قیمت با تخفیف',
      width: 150,
      renderCell: (params) => (
        <div className="font-bold">
          {params.value ? params.value.toLocaleString('fa-IR') : '-'}
        </div>
      ),
    },
    // {
    //     field: 'course_category',
    //     headerName: 'دسته بندی',
    //     width: 120,
    //     renderCell: (params) => (
    //         <div>
    //             {params.value?.name || '-'}
    //         </div>
    //     ),
    // },
    {
      field: 'coach_id',
      headerName: 'مدرس',
      width: 150,
      renderCell: (params) => <div>{params.value?.name || '-'}</div>,
    },
    {
      field: 'member',
      headerName: 'تعداد دانشجو',
      width: 120,
      renderCell: (params) => (
        <div>
          {params.value?.length || 0} / {params.row.max_member_accept}
        </div>
      ),
    },
    {
      field: 'course_duration',
      headerName: 'مدت دوره',
      width: 120,
      renderCell: (params) => (
        <div>{params.value ? `${params.value} ساعت` : '-'}</div>
      ),
    },
    {
      field: 'course_status',
      headerName: 'وضعیت',
      width: 100,
      renderCell: (params) => (
        <div
          style={{
            color: params.value ? 'green' : 'red',
            fontWeight: 'bold',
          }}
        >
          {params.value ? 'فعال' : 'غیرفعال'}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 160,
      renderCell: (params) => (
        <Button variant="outlined" color="secondary">
          <Link
            to={`/courses/${params.row.id}`}
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
  ]

  const handlePaginationModelChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel)
    },
    [],
  )

  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => {
    setFilterModel(newModel)
  }, [])

  const handleSortModelChange = useCallback((newModel: GridSortModel) => {
    setSortModel(newModel)
  }, [])

  const debouncedSetFilter = useCallback(
    debounce((value: string) => {
      setDebouncedFilterValue(value)
    }, 500),
    [],
  )

  const handleQuickFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.value
    setQuickFilterValue(newValue)
    debouncedSetFilter(newValue)
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Link
          to="/courses/new"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Button variant="contained" color="primary">
            افزودن دوره جدید
          </Button>
        </Link>
        <Typography variant="h4">لیست دوره‌ها</Typography>
      </Box>

      <StyledDataGrid
        rows={courses}
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
  )
}

export default CourseList
