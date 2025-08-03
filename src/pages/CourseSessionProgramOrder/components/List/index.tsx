// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router'
import { useDebounce } from '../../../../hooks/useDebounce';
import { useGetAllCoaches } from '../../../../API/Coach/coach.hook';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Add these MUI imports
import { 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    CircularProgress 
} from '@mui/material';

import DatePicker from 'react-datepicker2'
import moment from 'moment-jalaali'

const List = ({
    useDataQuery, // Replace apiUrl with custom hook
    renderItem,
    title,
    searchDebounceDelay = 500,
    showDateFilter = false
}) => {
    // State for pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // State for search queries
    const [userSearch, setUserSearch] = useState('');
    const [programSearch, setProgramSearch] = useState('');
    const [referenceSearch, setReferenceSearch] = useState('');
    
    // Debounced search values
    const debouncedUserSearch = useDebounce(userSearch, searchDebounceDelay);
    const debouncedProgramSearch = useDebounce(programSearch, searchDebounceDelay);
    const debouncedReferenceSearch = useDebounce(referenceSearch, searchDebounceDelay);

    // State for accordions
    const [expandedCoach, setExpandedCoach] = useState(false);
    const [expandedFilters, setExpandedFilters] = useState(false);
    const [expandedCreatedAtDate, setExpandedCreatedAtDate] = useState(false);

    // State for filters
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [filterValues, setFilterValues] = useState({
        is_have_package: false,
        with_coupon: false,
        with_discound: false,
        program_discounted: false,
        order_status: '',
        payment_status: ''
    });

    // State for date range
    const [dateRange, setDateRange] = useState({
        created_from_date: null,
        created_to_date: null
    });

    // Get coaches for the select dropdown
    const { data: coachesData, isLoading: isLoadingCoaches } = useGetAllCoaches({
        limit: 1000 // Get all coaches
    });

    // Build query parameters for the hook
    const queryParams = useMemo(() => {
        const params = {
            page,
            limit,
            sortBy: 'createdAt:desc',
        };

        // Add search queries
        if (debouncedUserSearch) {
            params.user_search = debouncedUserSearch;
        }
        if (debouncedProgramSearch) {
            params.program_search = debouncedProgramSearch;
        }
        if (debouncedReferenceSearch) {
            params.reference = debouncedReferenceSearch;
        }

        // Add coach filter
        if (selectedCoachId) {
            params.coach_id = selectedCoachId;
        }

        // Add checkbox and select filters
        Object.entries(filterValues).forEach(([key, value]) => {
            if (typeof value === 'boolean' && value) {
                params[key] = value;
            } else if (typeof value === 'string' && value !== '') {
                params[key] = value;
            }
        });

        // Add date range if enabled and dates are set
        if (showDateFilter) {
            if (dateRange.created_from_date) {
                params.created_from_date = dateRange.created_from_date?.format('YYYY-MM-DD');
            }
            if (dateRange.created_to_date) {
                params.created_to_date = dateRange.created_to_date?.format('YYYY-MM-DD');
            }
        }

        return params;
    }, [page, limit, debouncedUserSearch, debouncedProgramSearch, debouncedReferenceSearch, selectedCoachId, filterValues, dateRange, showDateFilter]);

    // Use the custom hook passed as prop
    const { data: queryData, isLoading, error } = useDataQuery(queryParams);

    // Extract data from query result
    const data = queryData ? {
        results: queryData.results || [],
        page,
        limit,
        totalPages: queryData.totalPages || 0,
        totalResults: queryData.totalResults || 0,
    } : {
        results: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
    };

    // Accordion handlers
    const handleCoachAccordionChange = () => {
        setExpandedCoach(!expandedCoach);
    };

    const handleFiltersAccordionChange = () => {
        setExpandedFilters(!expandedFilters);
    };

    const handleCreatedAtAccordionChange = () => {
        setExpandedCreatedAtDate(!expandedCreatedAtDate);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Handle search input changes
    const handleUserSearchChange = (e) => {
        setUserSearch(e.target.value);
        setPage(1);
    };

    const handleProgramSearchChange = (e) => {
        setProgramSearch(e.target.value);
        setPage(1);
    };

    const handleReferenceSearchChange = (e) => {
        setReferenceSearch(e.target.value);
        setPage(1);
    };

    // Handle filter changes
    const handleCoachChange = (event) => {
        setSelectedCoachId(event.target.value);
        setPage(1);
    };

    const handleFilterChange = (key, value) => {
        setFilterValues({
            ...filterValues,
            [key]: value,
        });
        setPage(1);
    };

    // Handle date range change
    const handleDateChange = (name: string) => (date: any) => {
        setDateRange({
            ...dateRange,
            [name]: date,
        });
        setPage(1);
    }

    // Reset date range
    const resetDateRange = () => {
        setDateRange({
            created_from_date: null,
            created_to_date: null
        })
    }

    return (
        <div className="list-container flex flex-col gap-4">
            {/* Header and Search Section */}
            <div dir="rtl" className="list-header bg-white pb-12 pt-4 px-4 md:px-8 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-8 pt-4">{title}</h2>

                {/* Search Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Student Search */}
                    <div>
                        <label htmlFor="user-search" className="block text-sm font-medium text-gray-600 mb-1">
                            جستجو بر اساس نام و موبایل دانشجو
                        </label>
                        <input
                            id="user-search"
                            type="text"
                            placeholder="نام یا شماره موبایل دانشجو..."
                            value={userSearch}
                            onChange={handleUserSearchChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Coach Search */}
                    <div>
                        <label htmlFor="program-search" className="block text-sm font-medium text-gray-600 mb-1">
                            جستجو بر اساس نام استاد و شماره موبایل
                        </label>
                        <input
                            id="program-search"
                            type="text"
                            placeholder="نام یا شماره موبایل استاد..."
                            value={programSearch}
                            onChange={handleProgramSearchChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Reference Search */}
                    <div>
                        <label htmlFor="reference-search" className="block text-sm font-medium text-gray-600 mb-1">
                            جستجو بر اساس کد رهگیری
                        </label>
                        <input
                            id="reference-search"
                            type="text"
                            placeholder="کد رهگیری..."
                            value={referenceSearch}
                            onChange={handleReferenceSearchChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Coach Selection Accordion */}
                <Accordion sx={{ backgroundColor: "#f0f0f0", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)", mb: 2 }} expanded={expandedCoach} onChange={handleCoachAccordionChange}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="coach-content"
                        id="coach-header"
                    >
                        <h3 className="text-sm md:text-base font-medium text-gray-700">انتخاب استاد</h3>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="w-full">
                            <FormControl fullWidth variant="outlined" size="medium">
                                <InputLabel id="coach-select-label">انتخاب استاد</InputLabel>
                                <Select
                                    labelId="coach-select-label"
                                    id="coach-select"
                                    value={selectedCoachId}
                                    onChange={handleCoachChange}
                                    label="انتخاب استاد"
                                    disabled={isLoadingCoaches}
                                    dir="rtl"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'right',
                                        },
                                        '& .MuiInputLabel-root': {
                                            right: 14,
                                            left: 'auto',
                                            transformOrigin: 'top right',
                                        },
                                        '& .MuiInputLabel-shrink': {
                                            transform: 'translate(-14px, -9px) scale(0.75)',
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>همه استادها</em>
                                    </MenuItem>
                                    {isLoadingCoaches ? (
                                        <MenuItem disabled>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            در حال بارگذاری...
                                        </MenuItem>
                                    ) : (
                                        coachesData?.results?.map((coach) => (
                                            <MenuItem key={coach?.id} value={coach?.id}>
                                                {coach?.first_name} {coach?.last_name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </div>
                    </AccordionDetails>
                </Accordion>

                {/* Filters Accordion */}
                <Accordion sx={{ backgroundColor: "#f0f0f0", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)", mb: 2 }} expanded={expandedFilters} onChange={handleFiltersAccordionChange}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="filters-content"
                        id="filters-header"
                    >
                        <h3 className="text-sm md:text-base font-medium text-gray-700">فیلتر</h3>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="space-y-4">
                            {/* Checkbox Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_have_package"
                                        checked={filterValues.is_have_package}
                                        onChange={(e) => handleFilterChange('is_have_package', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_have_package" className="mr-2 block text-sm text-gray-600">
                                        ثبت نام های همراه با پیکیج (مدرک)
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="with_coupon"
                                        checked={filterValues.with_coupon}
                                        onChange={(e) => handleFilterChange('with_coupon', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="with_coupon" className="mr-2 block text-sm text-gray-600">
                                        ثبت نام با کد تخفیف
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="with_discound"
                                        checked={filterValues.with_discound}
                                        onChange={(e) => handleFilterChange('with_discound', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="with_discound" className="mr-2 block text-sm text-gray-600">
                                        ثبت نام های تخفیف دار
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="program_discounted"
                                        checked={filterValues.program_discounted}
                                        onChange={(e) => handleFilterChange('program_discounted', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="program_discounted" className="mr-2 block text-sm text-gray-600">
                                        کلاس های تخفیف خورده
                                    </label>
                                </div>
                            </div>

                            {/* Select Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                {/* Order Status */}
                                <div>
                                    <FormControl fullWidth variant="outlined" size="medium">
                                        <InputLabel id="order-status-label">وضعیت سفارش</InputLabel>
                                        <Select
                                            labelId="order-status-label"
                                            id="order_status"
                                            value={filterValues.order_status}
                                            onChange={(e) => handleFilterChange('order_status', e.target.value)}
                                            label="وضعیت سفارش"
                                            dir="rtl"
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    textAlign: 'right',
                                                },
                                                '& .MuiInputLabel-root': {
                                                    right: 14,
                                                    left: 'auto',
                                                    transformOrigin: 'top right',
                                                },
                                                '& .MuiInputLabel-shrink': {
                                                    transform: 'translate(-14px, -9px) scale(0.75)',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>همه</em>
                                            </MenuItem>
                                            <MenuItem value="pending">در انتظار</MenuItem>
                                            <MenuItem value="completed">تکمیل شده</MenuItem>
                                            <MenuItem value="cancelled">کنسل شده</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>

                                {/* Payment Status */}
                                <div>
                                    <FormControl fullWidth variant="outlined" size="medium">
                                        <InputLabel id="payment-status-label">وضعیت پرداخت</InputLabel>
                                        <Select
                                            labelId="payment-status-label"
                                            id="payment_status"
                                            value={filterValues.payment_status}
                                            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                                            label="وضعیت پرداخت"
                                            dir="rtl"
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    textAlign: 'right',
                                                },
                                                '& .MuiInputLabel-root': {
                                                    right: 14,
                                                    left: 'auto',
                                                    transformOrigin: 'top right',
                                                },
                                                '& .MuiInputLabel-shrink': {
                                                    transform: 'translate(-14px, -9px) scale(0.75)',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>همه</em>
                                            </MenuItem>
                                            <MenuItem value="unpaid">پرداخت نشده</MenuItem>
                                            <MenuItem value="paid">پرداخت شده</MenuItem>
                                            <MenuItem value="refunded">بازگشت داده شده</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>

                {/* Date Range Filter Section */}
                {showDateFilter && (
                    <Accordion sx={{ backgroundColor: "#f0f0f0", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)" }} expanded={expandedCreatedAtDate} onChange={handleCreatedAtAccordionChange}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="date-filter-content"
                            id="date-filter-header"
                        >
                            <h3 className="text-sm md:text-base font-medium text-gray-700">فیلتر بر اساس زمان</h3>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="date-filter-section mb-4 py-8 border px-4">
                                <h3 className="text-sm md:text-base font-medium text-gray-700 mb-4">
                                    فیلتر بر اساس تاریخ ایجاد شدن
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="created_from_date" className="block text-sm text-gray-600 mb-1">
                                            از تاریخ
                                        </label>
                                        <DatePicker
                                            value={dateRange.created_from_date}
                                            onChange={handleDateChange('created_from_date')}
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
                                            value={dateRange.created_to_date}
                                            onChange={handleDateChange('created_to_date')}
                                            name="created_to_date"
                                            isGregorian={false}
                                            timePicker={false}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            inputFormat="jYYYY/jMM/jDD"
                                        />
                                    </div>
                                    <div>
                                        <button type='button' className='text-sm px-4 py-1 bg-purple-600 text-white rounded-sm' onClick={resetDateRange}>
                                            حذف فیلتر تاریخ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                )}
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
                                data.results.map((item) => renderItem(item))
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    مقداری وجود ندارد
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {data.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing page {data.page} of {data.totalPages} • {data.totalResults} total items
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(data.page - 1)}
                                        disabled={data.page === 1}
                                        className={`px-4 py-2 border rounded-md ${data.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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
                                                className={`px-4 py-2 border rounded-md ${data.page === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => handlePageChange(data.page + 1)}
                                        disabled={data.page === data.totalPages}
                                        className={`px-4 py-2 border rounded-md ${data.page === data.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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

export default List;