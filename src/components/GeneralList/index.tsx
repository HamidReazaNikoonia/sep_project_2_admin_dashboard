// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router'
import { useDebounce } from '../../hooks/useDebounce';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import DatePicker from 'react-datepicker2'
import moment from 'moment-jalaali'

const List = ({
    useDataQuery, // Replace apiUrl with custom hook
    filters = [],
    renderItem,
    searchPlaceholder,
    title,
    searchDebounceDelay = 500,
    showDateFilter = false
}) => {
    // State for pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    // State for search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, searchDebounceDelay);
    const [filterValues, setFilterValues] = useState({});

    // Add state for accordion
    const [expanded, setExpanded] = useState(false);
    const [expandedCreatedAtDate, setExpandedCreatedAtDate] = useState(false);

    // State for date range
    const [dateRange, setDateRange] = useState({
        created_from_date: null,
        created_to_date: null
    });

    // Build query parameters for the hook
    const queryParams = useMemo(() => {
        const params = {
            page,
            limit,
            sortBy: 'createdAt:desc',
        };

        // Add search query
        if (debouncedSearchQuery) {
            params.search = debouncedSearchQuery;
            // Also add 'q' for backward compatibility if needed
            params.q = debouncedSearchQuery;
        }

        // Add filters
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value !== '' && value !== false) {
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
    }, [page, limit, debouncedSearchQuery, filterValues, dateRange, showDateFilter]);

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

    const handleAccordionChange = () => {
        setExpanded(!expanded);
    };

    const handleCreatedAtAccordionChange = () => {
        setExpandedCreatedAtDate(!expandedCreatedAtDate);
    };

    // Initialize filter values
    useEffect(() => {
        const initialFilters = {};
        filters.forEach(filter => {
            if (filter.type === 'checkbox') {
                initialFilters[filter.queryParamKey] = false;
            } else if (filter.type === 'options') {
                initialFilters[filter.queryParamKey] = ''; // Default to empty (no selection)
            } else {
                initialFilters[filter.queryParamKey] = '';
            }
        });
        setFilterValues(initialFilters);
    }, [filters]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        // Reset to first page when searching
        setPage(1);
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilterValues({
            ...filterValues,
            [key]: value,
        });
        // Reset to first page when filtering
        setPage(1);
    };

    // Handle date range change
    // const handleDateChange = (e) => {
    //     const { name, value } = e.target;
    //     setDateRange(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));
    //     // Reset to first page when date changes
    //     setData(prev => ({ ...prev, page: 1 }));
    // };

    const handleDateChange = (name: string) => (date: any) => {
        setDateRange({
            ...dateRange,
            [name]: date,
        });
        // Reset to first page when date changes
        setPage(1);
    }

    // reset 
    const resetDateRange = () => {
        setDateRange({
            created_from_date: null,
            created_to_date: null
        })
    }

    // Render filter inputs based on type
    const renderFilterInput = (filter) => {
        switch (filter.type) {
            case 'search':
                return (
                    <input
                        type="text"
                        placeholder={`${filter.label || filter.queryParamKey}`}
                        value={filterValues[filter.queryParamKey] || ''}
                        onChange={(e) => handleFilterChange(filter.queryParamKey, e.target.value)}
                        className="filter_on_list w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                );
            case 'checkbox':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={filterValues[filter.queryParamKey] || false}
                            onChange={(e) => handleFilterChange(filter.queryParamKey, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="mr-2 block text-sm text-gray-600">
                            {filter.label || filter.queryParamKey}
                        </label>
                    </div>
                );
            case 'options':
                return (
                    <select
                        dir='ltr'
                        value={filterValues[filter.queryParamKey] || ''}
                        onChange={(e) => handleFilterChange(filter.queryParamKey, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All {filter.label || filter.queryParamKey}</option>
                        {filter.options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    };

    return (
        <div className="list-container flex flex-col gap-4">
            {/* Header and Search Section */}
            <div dir="rtl" className="list-header bg-white pb-12 pt-4 px-4 md:px-8 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-8 pt-4">{title}</h2>

                {/* General Search */}
                <div className="mb-6">
                    <label htmlFor="general-search" className="block text-sm md:text-base font-medium text-gray-700 mb-1">
                        جستجو
                    </label>
                    <input
                        id="general-search"
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {isLoading && debouncedSearchQuery !== searchQuery && (
                        <p className="text-xs text-gray-500 mt-1">Typing...</p>
                    )}
                </div>

                {/* Dynamic Filters */}
                {filters.length > 0 && (
                    <Accordion sx={{ backgroundColor: "#f0f0f0", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)" }} expanded={expanded} onChange={handleAccordionChange}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="filter-content"
                            id="filter-header"
                        >
                            <h3 className="text-sm md:text-base font-medium text-gray-700">فیلتر</h3>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filters.map((filter) => (
                                    <div key={filter.queryParamKey} className="filter-item">
                                        {(filter.label && filter.type !== 'checkbox') && (
                                            <label htmlFor={`filter-${filter.queryParamKey}`} className="block text-sm text-gray-600 mb-1">
                                                {filter.label}
                                            </label>
                                        )}
                                        {renderFilterInput(filter)}
                                    </div>
                                ))}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Date Range Filter Section */}
                {showDateFilter && (
                    <Accordion sx={{ backgroundColor: "#f0f0f0", boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)" }} expanded={expandedCreatedAtDate} onChange={handleCreatedAtAccordionChange}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="filter-content"
                            id="filter-header"
                        >
                            <h3 className="text-sm md:text-base font-medium text-gray-700">فیلتر بر اساس زمان </h3>
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
                                        <button type='button' className='text-sm  px-4 py-1 bg-purple-600 text-white rounded-sm' onClick={resetDateRange}>
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
                            <div dir='ltr' className="mt-6 flex items-center justify-between">
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
                                        // Show pages around current page
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