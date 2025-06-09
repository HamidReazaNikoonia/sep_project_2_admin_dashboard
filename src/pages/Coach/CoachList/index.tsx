// @ts-ignore
import { useState, useCallback } from 'react'
import { Button, styled, Theme } from '@mui/material'
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

import { useGetAllCoaches } from '../../../API/Coach/coach.hook'

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE
const SERVER_URL = process.env.REACT_APP_SERVER_URL
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
  },
}))

const CoachList = () => {
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

  const { data, isLoading, isError } = useGetAllCoaches({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    ...(debouncedFilterValue && { q: debouncedFilterValue }),
  })

  // Extract the actual data and total count from the response
  const coaches = data || []
  const totalCount = coaches.length

  const columns: GridColDef[] = [
    // {
    //     field: 'role',
    //     headerName: 'نقش',
    //     width: 120,
    //     renderCell: (params) => (
    //         <div style={{
    //             color: params.value === 'coach' ? 'green' : 'gray',
    //             fontWeight: 'bold'
    //         }}>
    //             {params.value === 'coach' ? 'مربی' : 'کاربر'}
    //         </div>
    //     ),
    // },
    {
      field: 'avatar',
      headerName: 'تصویر',
      width: 100,
      renderCell: (params) => (
        <div className="flex items-center justify-center w-full h-full">
          {params.row.avatar?.file_name ? (
            <img
              src={`${SERVER_FILE}/${params.row.avatar.file_name}`}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-[10px]">بدون عکس</span>
            </div>
          )}
        </div>
      ),
    },
    {
      field: 'mobile',
      headerName: 'شماره موبایل',
      width: 150,
    },
    {
      field: 'first_name',
      headerName: 'نام',
      width: 150,
    },
    {
      field: 'last_name',
      headerName: 'نام خانوادگی',
      width: 150,
    },
    {
      field: 'access_level',
      headerName: 'سطح فعال',
      width: 150,
      renderCell: (params) => (
        <div
          style={{
            color: params.value === 'none' ? 'red' : 'green',
            fontWeight: 'bold',
          }}
        >
          {params.value === 'none' ? 'بدون دسترسی' : params.value}
        </div>
      ),
    },
    {
      field: 'access_level_request',
      headerName: 'سطح درخواستی',
      width: 150,
      renderCell: (params) => (
        <div
          style={{
            color: params.value === 'none' ? 'gray' : 'blue',
            fontWeight: 'bold',
          }}
        >
          {params.value === 'none' ? 'بدون درخواست' : params.value}
        </div>
      ),
    },
    // {
    //   field: 'enrolledCourses',
    //   headerName: 'دوره‌های ثبت‌نام شده',
    //   width: 200,
    //   renderCell: (params) => <div>{params.value.length} دوره</div>,
    // },
    {
      field: 'actions',
      headerName: 'عملیات',
      width: 160,
      renderCell: (params) => (
        <Button variant="outlined" color="secondary">
          <Link
            to={`/coach/${params.row.id}`}
            style={{
              color: 'inherit',
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

  const handleQuickFilterChange = useCallback(
    debounce((value: string) => {
      setDebouncedFilterValue(value)
    }, 500),
    [],
  )

  if (isLoading) return <div>در حال بارگذاری...</div>
  if (isError) return <div>Error loading coaches</div>

  return (
    <div style={{ minHeight: 600, width: '100%' }}>
      <StyledDataGrid
        rows={coaches}
        columns={columns}
        rowCount={totalCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        filterModel={filterModel}
        onFilterModelChange={handleFilterModelChange}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            quickFilterProps: { debounceMs: 500 },
            showQuickFilter: true,
          },
        }}
        onQuickFilterChange={(event) =>
          handleQuickFilterChange(event.target.value)
        }
      />
    </div>
  )
}

export default CoachList
