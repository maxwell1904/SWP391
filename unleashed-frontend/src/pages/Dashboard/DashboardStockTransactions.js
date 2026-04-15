import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../core/api';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { formatPrice } from '../../components/format/formats';
import { Typography, Skeleton, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Avatar } from '@mui/material';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const DashboardStockTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest_first');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const varToken = useAuthHeader();
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm, dateFilter, sortOrder]);

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, debouncedSearchTerm, dateFilter, sortOrder]);

    const fetchTransactions = () => {
        setLoading(true);
        apiClient
            .get("/api/stock-transactions", {
                headers: { Authorization: varToken },
                params: {
                    page: currentPage,
                    size: 15,
                    search: debouncedSearchTerm,
                    dateFilter,
                    sort: sortOrder,
                },
            })
            .then((response) => {
                setTransactions(response.data.transactions);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => console.error("Error fetching stock transactions:", error))
            .finally(() => setLoading(false));
    };

    const getTypeChip = (type) => {
        let color = 'default';
        if (type) {
            switch (type.toUpperCase()) {
                case 'IN': color = 'success'; break;
                case 'OUT': color = 'secondary'; break;
                case 'RETURN': color = 'info'; break;
                case 'RESERVED': color = 'warning'; break;
                default: color = 'primary';
            }
        }
        return <Chip label={type || 'N/A'} color={color} size="small" />;
    };

    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <tr key={index}>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                    <td className='px-4 py-3'><Skeleton variant="text" /></td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="p-4">
            <Typography variant='h4' className='text-3xl font-bold mb-4'>
                Stock Transaction History
            </Typography>

            <div className='flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow gap-4'>
                <TextField
                    label="Search by Product, Staff, etc..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-1/2"
                />
                <FormControl variant="outlined" size="small" className="w-1/4">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        label="Date Range"
                    >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="6months">Last 6 Months</MenuItem>
                    </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" className="w-1/4">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        label="Sort By"
                    >
                        <MenuItem value="newest_first">Date: Newest First</MenuItem>
                        <MenuItem value="oldest_first">Date: Oldest First</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full table-auto'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600' style={{ width: '25%' }}>Product</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600' style={{ width: '10%' }}>Type</th>
                        <th className='px-4 py-3 text-center text-sm font-semibold text-gray-600' style={{ width: '10%' }}>Quantity</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600' style={{ width: '15%' }}>Price/Unit</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600' style={{ width: '15%' }}>Staff</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600' style={{ width: '15%' }}>Provider</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600' style={{ width: '10%' }}>Date</th>
                    </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                    {loading ? (
                        <TableSkeleton />
                    ) : transactions.length > 0 ? (
                        transactions.map((t) => (
                            <tr key={t.id} className='hover:bg-gray-50 align-middle'>
                                <td className='px-4 py-2'>
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={t.variationImage}
                                            alt={t.productName}
                                            variant="rounded"
                                            sx={{ width: 48, height: 48 }}
                                        />
                                        <div>
                                            <div className="font-semibold text-sm text-gray-800">{t.productName || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{t.colorName || 'N/A'} / {t.sizeName || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-4 py-3 text-sm'>{getTypeChip(t.transactionTypeName)}</td>
                                <td className='px-4 py-3 text-sm text-center font-semibold'>{t.transactionQuantity}</td>
                                <td className='px-4 py-3 text-sm'>{formatPrice(t.transactionProductPrice || 0)}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{t.inchargeEmployeeUsername || 'N/A'}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{t.providerName || 'N/A'}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{new Date(t.transactionDate).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-gray-500">
                                No transactions found for the selected filters.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <EnhancedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={loading}
            />
        </div>
    );
};

export default DashboardStockTransactions;