// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router'
import { useDebounce } from '../../hooks/useDebounce';
import axios from 'axios'; // or your preferred HTTP client

const List = ({
    apiUrl,
    filters = [],
    renderItem,
    searchPlaceholder,
    title,
    searchDebounceDelay = 500 // default 500ms delay
}) => {
    // State for data and loading
    const [data, setData] = useState({
        results: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
    });
    const [loading, setLoading] = useState(false);

    // State for search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, searchDebounceDelay);
    const [filterValues, setFilterValues] = useState({});

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

    // Fetch data when debounced search or filters change
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                // Add pagination params
                params.append('page', data.page);
                params.append('limit', data.limit);

                // Add debounced search query if exists
                if (debouncedSearchQuery) {
                    params.append('q', debouncedSearchQuery);
                }

                // Add filters
                Object.entries(filterValues).forEach(([key, value]) => {
                    if (value !== '' && value !== false) {
                        params.append(key, value);
                    }
                });

                const response = await axios.get(`${apiUrl}?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('__token__')}`
                    }
                });
                setData({
                    ...data,
                    results: response.data.results,
                    totalPages: response.data.totalPages,
                    totalResults: response.data.totalResults,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [data.page, data.limit, debouncedSearchQuery, filterValues]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setData({ ...data, page: newPage });
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        // Reset to first page when searching
        setData({ ...data, page: 1 });
    };

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilterValues({
            ...filterValues,
            [key]: value,
        });
        // Reset to first page when filtering
        setData({ ...data, page: 1 });
    };

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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div dir="rtl" className="list-header bg-white py-4 px-4 md:px-8 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-8 pt-4">{title}</h2>

                {/* General Search */}
                <div className="mb-6">
                    <label htmlFor="general-search" className="block text-sm font-medium text-gray-700 mb-1">
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
                    {loading && debouncedSearchQuery !== searchQuery && (
                        <p className="text-xs text-gray-500 mt-1">Typing...</p>
                    )}
                </div>

                {/* Dynamic Filters */}
                {filters.length > 0 && (
                    <div className="filters-section mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">فیلتر</h3>
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
                    </div>
                )}
            </div>

            {/* List Content */}
            <div className="list-content bg-white p-4 rounded-lg shadow flex-1">
                {loading ? (
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
                                    No results found
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