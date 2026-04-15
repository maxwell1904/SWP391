import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../core/api';
import { Typography, Button, IconButton, Chip, Skeleton, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
    Visibility,
    CheckCircle,
    Cancel,
    ContentPasteSearch,
} from '@mui/icons-material';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { formatPrice } from '../../components/format/formats';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import { useNavigate } from 'react-router-dom';

const DashboardOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('priority_desc');
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const varToken = useAuthHeader();
    const authUser = useAuthUser();
    const isInitialMount = useRef(true);
    const navigate = useNavigate();

    const statusOptions = [
        { id: 1, name: 'Pending' },
        { id: 2, name: 'Processing' },
        { id: 3, name: 'Shipping' },
        { id: 4, name: 'Completed' },
        { id: 5, name: 'Cancelled' },
    ];

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm, sortOrder, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, debouncedSearchTerm, sortOrder, statusFilter]);

    const fetchOrders = () => {
        setLoading(true);
        const params = {
            page: currentPage,
            size: 10,
            search: debouncedSearchTerm,
            sort: sortOrder,
        };
        if (statusFilter) {
            params.statusId = statusFilter;
        }
        apiClient
            .get('/api/orders', {
                headers: { Authorization: varToken },
                params: params,
            })
            .then((response) => {
                setOrders(response.data.orders);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => console.error('Error fetching orders:', error))
            .finally(() => setLoading(false));
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleAction = (url, data) => {
        apiClient
            .put(url, data, { headers: { Authorization: varToken } })
            .then(() => fetchOrders())
            .catch((error) => console.error('Error performing action:', error));
    };

    const handleReview = (orderId, isApproved) => {
        handleAction(`/api/orders/${orderId}/staff-review`, {
            isApproved,
            staffName: authUser.username,
        });
    };

    const handleInspectOrder = (orderId) => {
        handleAction(`/api/orders/${orderId}/inspect`, {});
    };

    const handleReturnOrder = (orderId) => {
        handleAction(`/api/orders/${orderId}/returned`, {});
    };

    const viewOrderDetails = (orderId) => {
        navigate(`/Dashboard/Orders/${orderId}`);
    };

    const getStatusChip = (status) => {
        let color;
        switch (status.toUpperCase()) {
            case 'PENDING': color = 'warning'; break;
            case 'PROCESSING': color = 'secondary'; break;
            case 'COMPLETED': color = 'success'; break;
            case 'SHIPPING': color = 'info'; break;
            case 'CANCELLED': case 'DENIED': color = 'error'; break;
            case 'RETURNING': case 'INSPECTION': case 'RETURNED': color = 'default'; break;
            default: color = 'primary';
        }
        return <Chip label={status} color={color} variant='outlined' size='small' />;
    };

    const renderOrderActions = (order) => {
        switch (order.orderStatus.toUpperCase()) {
            case 'PENDING':
                return (
                    <div className='flex flex-col sm:flex-row gap-2'>
                        <Button variant='contained' color='success' size='small' onClick={() => handleReview(order.orderId, true)} startIcon={<CheckCircle />}>Approve</Button>
                        <Button variant='contained' color='error' size='small' onClick={() => handleReview(order.orderId, false)} startIcon={<Cancel />}>Reject</Button>
                    </div>
                );
            case 'PROCESSING':
                return <Button variant='contained' color='success' size='small' onClick={() => handleReview(order.orderId, true)} startIcon={<CheckCircle />}>Approve Ship</Button>;
            case 'RETURNING':
                return <Button variant='contained' color='info' size='small' onClick={() => handleInspectOrder(order.orderId)} startIcon={<ContentPasteSearch />}>Inspect</Button>;
            case 'INSPECTION':
                return <Button variant='contained' color='warning' size='small' onClick={() => handleReturnOrder(order.orderId)} startIcon={<KeyboardReturnOutlinedIcon />}>Returned</Button>;
            default:
                return null;
        }
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
        <div className='p-4'>
            <Typography variant='h4' className='text-3xl font-bold mb-4'>
                Orders Management
            </Typography>

            <div className='flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow gap-4'>
                <TextField
                    label="Search Orders..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                <FormControl variant="outlined" size="small" className="w-1/4">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="">
                            <em>All Statuses</em>
                        </MenuItem>
                        {statusOptions.map((status) => (
                            <MenuItem key={status.id} value={status.id}>
                                {status.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" className="w-1/4">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        label="Sort By"
                    >
                        <MenuItem value="priority_desc">Priority (Default)</MenuItem>
                        <MenuItem value="totalPrice_desc">Total: High to Low</MenuItem>
                        <MenuItem value="totalPrice_asc">Total: Low to High</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full table-fixed'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th style={{ width: '12%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Order ID</th>
                        <th style={{ width: '15%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Customer</th>
                        <th style={{ width: '20%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Date</th>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Total</th>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Status</th>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Staff</th>
                        <th style={{ width: '23%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Actions</th>
                    </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                    {loading ? (
                        <TableSkeleton />
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                            <tr key={order.orderId} className='hover:bg-gray-50 align-middle'>
                                <td
                                    className='px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap'
                                    onClick={() => viewOrderDetails(order.orderId)}
                                >
                                    {order.orderId}
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-700 truncate'>{order.customerUsername}</td>
                                <td className='px-4 py-3 text-sm text-gray-700 whitespace-nowrap'>
                                    {new Date(order.orderDate).toLocaleString()}
                                </td>
                                <td className='px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap'>
                                    {formatPrice(order.totalAmount)}
                                </td>
                                <td className='px-4 py-3 text-sm'>{getStatusChip(order.orderStatus)}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{order.staffUsername || 'N/A'}</td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center gap-2 min-h-[40px]'>
                                        <IconButton
                                            onClick={() => viewOrderDetails(order.orderId)}
                                            color='primary'
                                            size='small'
                                            title='View Details'
                                        >
                                            <Visibility fontSize='small' />
                                        </IconButton>
                                        {renderOrderActions(order)}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-gray-500">
                                No orders found.
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

export default DashboardOrders;