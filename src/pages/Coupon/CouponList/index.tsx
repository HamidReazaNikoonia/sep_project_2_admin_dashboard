import React, { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
  Box,
  Typography,
  Paper,
  Grid2 as Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ViewListIcon from '@mui/icons-material/ViewList'
import moment from 'moment-jalaali'
import DatePicker from 'react-datepicker2'
import { useGetAllCoupons } from '@/API/Coupon/coupon.hook'
import { useDebounce } from '@/hooks/useDebounce'

// Define the coupon interface
interface ApplicableCourse {
  target_type: 'COURSE_SESSION' | 'COURSE'
  target_id: string
}

interface Coupon {
  id: string
  code: string
  type: 'REFERRAL' | 'DISCOUNT'
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discount_value: number
  max_uses: number
  current_uses: number
  valid_from: string
  valid_until: string
  min_purchase_amount: number
  is_active: boolean
  is_combined?: boolean
  coupon_variant?: string
  created_by?: string
  applicable_courses?: ApplicableCourse[]
  except_courses?: ApplicableCourse[]
  applicable_coach?: string[]
  except_coach?: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

const CouponList: React.FC = () => {
  // State for pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // State for view mode
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  // State for filters
  const [code, setCode] = useState('')
  const [type, setType] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [isCombined, setIsCombined] = useState<boolean | undefined>(undefined)
  const [discountType, setDiscountType] = useState('')
  const [couponVariant, setCouponVariant] = useState('')

  // Debounced code search
  const debouncedCode = useDebounce(code, 500)

  // State for date ranges
  const [validDateRange, setValidDateRange] = useState({
    valid_from: null,
    valid_until: null,
  })

  const [createdDateRange, setCreatedDateRange] = useState({
    createdAt_from: null,
    createdAt_to: null,
  })

  // State for accordions
  const [expandedFilters, setExpandedFilters] = useState(true)
  const [expandedValidDate, setExpandedValidDate] = useState(false)
  const [expandedCreatedDate, setExpandedCreatedDate] = useState(false)

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      sortBy: 'createdAt:desc',
    }

    if (debouncedCode) params.code = debouncedCode
    if (type) params.type = type
    if (isActive !== undefined) params.is_active = isActive
    if (isCombined !== undefined) params.is_combined = isCombined
    if (discountType) params.discount_type = discountType
    if (couponVariant) params.coupon_variant = couponVariant

    // Add valid date range
    if (validDateRange.valid_from) {
      params.valid_from = validDateRange.valid_from.format('YYYY-MM-DD')
    }
    if (validDateRange.valid_until) {
      params.valid_until = validDateRange.valid_until.format('YYYY-MM-DD')
    }

    // Add created date range
    if (createdDateRange.createdAt_from) {
      params.createdAt_from = createdDateRange.createdAt_from.format('YYYY-MM-DD')
    }
    if (createdDateRange.createdAt_to) {
      params.createdAt_to = createdDateRange.createdAt_to.format('YYYY-MM-DD')
    }

    return params
  }, [
    page,
    limit,
    debouncedCode,
    type,
    isActive,
    isCombined,
    discountType,
    couponVariant,
    validDateRange,
    createdDateRange,
  ])

  // Fetch coupons
  const { data: queryData, isLoading, error } = useGetAllCoupons(queryParams)

  // Extract data
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
      }

  // Format dates
  const formatDate = (dateString: string) => {
    return moment(dateString).format('jYYYY/jMM/jDD')
  }

  // Determine coupon status
  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    const validUntil = new Date(coupon.valid_until)

    if (!coupon.is_active) {
      return { label: 'غیرفعال', color: 'error' as const }
    }
    if (validUntil < now) {
      return { label: 'منقضی شده', color: 'error' as const }
    }
    if (coupon.current_uses >= coupon.max_uses) {
      return { label: 'استفاده شده', color: 'warning' as const }
    }
    return { label: 'فعال', color: 'success' as const }
  }

  // Handle filter changes
  const handleFilterChange = (setter: Function) => (value: any) => {
    setter(value)
    setPage(1)
  }

  // Date change handlers
  const handleValidDateChange = (name: string) => (date: any) => {
    setValidDateRange({
      ...validDateRange,
      [name]: date,
    })
    setPage(1)
  }

  const handleCreatedDateChange = (name: string) => (date: any) => {
    setCreatedDateRange({
      ...createdDateRange,
      [name]: date,
    })
    setPage(1)
  }

  // Reset handlers
  const resetValidDateRange = () => {
    setValidDateRange({
      valid_from: null,
      valid_until: null,
    })
  }

  const resetCreatedDateRange = () => {
    setCreatedDateRange({
      createdAt_from: null,
      createdAt_to: null,
    })
  }

  const resetAllFilters = () => {
    setCode('')
    setType('')
    setIsActive(undefined)
    setIsCombined(undefined)
    setDiscountType('')
    setCouponVariant('')
    resetValidDateRange()
    resetCreatedDateRange()
    setPage(1)
  }

  // Page change handler
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Render card view
  const renderCardView = () => (
    <Grid container spacing={3}>
      {data.results.length > 0 ? (
        data.results.map((coupon: Coupon) => {
          const status = getCouponStatus(coupon)
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={coupon.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {coupon.code}
                    </Typography>
                    <Chip label={status.label} color={status.color} size="small" />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      نوع:
                    </Typography>
                    <Typography variant="body2">
                      {coupon.type === 'DISCOUNT' ? 'تخفیف' : 'معرفی'}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      تخفیف:
                    </Typography>
                    <Typography variant="body2">
                      {coupon.discount_value}{' '}
                      {coupon.discount_type === 'PERCENTAGE' ? 'درصد' : 'تومان'}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      استفاده:
                    </Typography>
                    <Typography variant="body2">
                      {coupon.current_uses} / {coupon.max_uses}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      اعتبار:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(coupon.valid_from)} تا {formatDate(coupon.valid_until)}
                    </Typography>
                  </Box>

                  {coupon.min_purchase_amount > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        حداقل خرید:
                      </Typography>
                      <Typography variant="body2">
                        {coupon.min_purchase_amount.toLocaleString()} تومان
                      </Typography>
                    </Box>
                  )}

                  {coupon.is_combined !== undefined && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        قابل تجمیع:
                      </Typography>
                      <Chip
                        label={coupon.is_combined ? 'بله' : 'خیر'}
                        size="small"
                        color={coupon.is_combined ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {coupon.coupon_variant && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        نوع کوپن:
                      </Typography>
                      <Typography variant="body2">
                        {coupon.coupon_variant === 'COURSE_SESSION'
                          ? 'کلاس آموزشی'
                          : coupon.coupon_variant === 'ORDER'
                          ? 'سفارش'
                          : 'همه'}
                      </Typography>
                    </Box>
                  )}

                  {coupon.applicable_courses && coupon.applicable_courses.length > 0 && (
                    <Box mt={1.5}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        مخصوص:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {coupon.applicable_courses.map((course, idx) => (
                          <Chip
                            key={idx}
                            label={course.target_type === 'COURSE' ? 'دوره' : 'جلسه'}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {coupon.except_courses && coupon.except_courses.length > 0 && (
                    <Box mt={1.5}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        به جز:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {coupon.except_courses.map((course, idx) => (
                          <Chip
                            key={idx}
                            label={course.target_type === 'COURSE' ? 'دوره' : 'جلسه'}
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {coupon.description && (
                    <Box mt={1.5}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        توضیحات:
                      </Typography>
                      <Typography variant="body2">{coupon.description}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })
      ) : (
        <Grid size={{ xs: 12 }}>
          <Box p={3} textAlign="center">
            <Typography variant="body1">هیچ کد تخفیفی یافت نشد.</Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  )

  // Render list view
  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="right">کد</TableCell>
            <TableCell align="right">نوع</TableCell>
            <TableCell align="right">تخفیف</TableCell>
            <TableCell align="right">استفاده</TableCell>
            <TableCell align="right">اعتبار</TableCell>
            <TableCell align="right">وضعیت</TableCell>
            <TableCell align="right">تاریخ ایجاد</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.results.length > 0 ? (
            data.results.map((coupon: Coupon) => {
              const status = getCouponStatus(coupon)
              return (
                <TableRow key={coupon.id} hover>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {coupon.code}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {coupon.type === 'DISCOUNT' ? 'تخفیف' : 'معرفی'}
                  </TableCell>
                  <TableCell align="right">
                    {coupon.discount_value}{' '}
                    {coupon.discount_type === 'PERCENTAGE' ? 'درصد' : 'تومان'}
                  </TableCell>
                  <TableCell align="right">
                    {coupon.current_uses} / {coupon.max_uses}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" display="block">
                      {formatDate(coupon.valid_from)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {formatDate(coupon.valid_until)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={status.label} color={status.color} size="small" />
                  </TableCell>
                  <TableCell align="right">{formatDate(coupon.createdAt)}</TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography variant="body1">هیچ کد تخفیفی یافت نشد.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          خطا در بارگذاری کدهای تخفیف: {(error as Error).message}
        </Typography>
      </Box>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header and Filters Section */}
      <div dir="rtl" className="bg-white pb-12 pt-4 px-4 md:px-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-8 pt-4">
          <h2 className="text-xl font-semibold">لیست کدهای تخفیف</h2>
          <Box display="flex" gap={2}>
            {/* View Mode Toggle */}
            <Box display="flex" gap={1}>
              <Tooltip title="نمایش کارتی">
                <IconButton
                  onClick={() => setViewMode('card')}
                  color={viewMode === 'card' ? 'primary' : 'default'}
                >
                  <ViewModuleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="نمایش لیستی">
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <button
              onClick={resetAllFilters}
              className="text-sm px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              پاک کردن همه فیلترها
            </button>

            <Link
              to="/coupon/create"
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Button variant="contained" color="primary">
                افزودن کد تخفیف جدید
              </Button>
            </Link>
          </Box>
        </div>

        {/* Main Filters Accordion */}
        <Accordion
          sx={{ backgroundColor: '#f0f0f0', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)', mb: 2 }}
          expanded={expandedFilters}
          onChange={() => setExpandedFilters(!expandedFilters)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className="text-sm md:text-base font-medium text-gray-700">فیلترها</h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Code Filter */}
              <TextField
                label="کد تخفیف"
                size="small"
                fullWidth
                value={code}
                onChange={(e) => handleFilterChange(setCode)(e.target.value)}
                placeholder="جستجو بر اساس کد"
              />

              {/* Type Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>نوع کوپن</InputLabel>
                <Select
                  value={type}
                  label="نوع کوپن"
                  onChange={(e) => handleFilterChange(setType)(e.target.value)}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="DISCOUNT">تخفیف</MenuItem>
                  <MenuItem value="REFERRAL">معرفی</MenuItem>
                </Select>
              </FormControl>

              {/* Discount Type Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>نوع تخفیف</InputLabel>
                <Select
                  value={discountType}
                  label="نوع تخفیف"
                  onChange={(e) => handleFilterChange(setDiscountType)(e.target.value)}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="PERCENTAGE">درصدی</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">مبلغ ثابت</MenuItem>
                </Select>
              </FormControl>

              {/* Coupon Variant Filter */}
              <FormControl fullWidth size="small">
                <InputLabel>محدوده کوپن</InputLabel>
                <Select
                  value={couponVariant}
                  label="محدوده کوپن"
                  onChange={(e) => handleFilterChange(setCouponVariant)(e.target.value)}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="COURSE_SESSION">کلاس آموزشی</MenuItem>
                  <MenuItem value="ORDER">سفارش</MenuItem>
                  <MenuItem value="ALL">همه</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Boolean Filters */}
            <div className="mt-6 p-4 bg-white border border-gray-300 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3">فیلترهای اضافی</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={isActive === true}
                    onChange={(e) =>
                      handleFilterChange(setIsActive)(e.target.checked ? true : undefined)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                    فقط کوپن های فعال
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_combined"
                    checked={isCombined === true}
                    onChange={(e) =>
                      handleFilterChange(setIsCombined)(e.target.checked ? true : undefined)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="is_combined" className="text-sm text-gray-700 cursor-pointer">
                    قابل تجمیع
                  </label>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Valid Date Range Accordion */}
        <Accordion
          sx={{ backgroundColor: '#f0f0f0', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)', mb: 2 }}
          expanded={expandedValidDate}
          onChange={() => setExpandedValidDate(!expandedValidDate)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className="text-sm md:text-base font-medium text-gray-700">بر اساس تاریخ اعتبار</h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">از تاریخ</label>
                  <DatePicker
                    value={validDateRange.valid_from}
                    onChange={handleValidDateChange('valid_from')}
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">تا تاریخ</label>
                  <DatePicker
                    value={validDateRange.valid_until}
                    onChange={handleValidDateChange('valid_until')}
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="text-sm px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors"
                    onClick={resetValidDateRange}
                  >
                    حذف فیلتر تاریخ اعتبار
                  </button>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Created Date Range Accordion */}
        <Accordion
          sx={{ backgroundColor: '#f0f0f0', boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)' }}
          expanded={expandedCreatedDate}
          onChange={() => setExpandedCreatedDate(!expandedCreatedDate)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 className="text-sm md:text-base font-medium text-gray-700">بر اساس تاریخ ایجاد</h3>
          </AccordionSummary>
          <AccordionDetails>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">از تاریخ</label>
                  <DatePicker
                    value={createdDateRange.createdAt_from}
                    onChange={handleCreatedDateChange('createdAt_from')}
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">تا تاریخ</label>
                  <DatePicker
                    value={createdDateRange.createdAt_to}
                    onChange={handleCreatedDateChange('createdAt_to')}
                    isGregorian={false}
                    timePicker={false}
                    className="w-full p-2 border border-gray-300 rounded-md"
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
      </div>

      {/* List Content */}
      <div className="bg-white p-4 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <>
            {/* Render view based on mode */}
            {viewMode === 'card' ? renderCardView() : renderListView()}

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
                    let pageNum
                    if (data.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (data.page <= 3) {
                      pageNum = i + 1
                    } else if (data.page >= data.totalPages - 2) {
                      pageNum = data.totalPages - 4 + i
                    } else {
                      pageNum = data.page - 2 + i
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
                    )
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
  )
}

export default CouponList