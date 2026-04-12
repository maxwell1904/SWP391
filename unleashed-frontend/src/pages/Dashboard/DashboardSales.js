import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaEye, FaPlusSquare, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { apiClient } from '../../core/api';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { toast, Zoom } from 'react-toastify';
import { formatPrice } from '../../components/format/formats';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination'; // Import enhanced pagination
import { TextField, Select, MenuItem, FormControl, InputLabel, Chip, Button, Skeleton } from '@mui/material';

const DashboardSales = () => {
    const [sales, setSales] = useState([]);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // State for pagination, search, and filter
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    const authUser = useAuthUser();
    const userRole = authUser.role;
    const varToken = useAuthHeader();

    // Reset page to 1 on filter/search change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm, statusFilter]);

    // Fetch sales whenever dependencies change
    useEffect(() => {
        fetchSales();
    }, [varToken, currentPage, debouncedSearchTerm, statusFilter]);

    const fetchSales = () => {
        setIsLoading(true);
        apiClient.get('/api/sales', {
            headers: { Authorization: varToken },
            params: {
                page: currentPage ,
                size: 10,
                search: debouncedSearchTerm,
                status: statusFilter,
            },
        })
            .then((response) => {
                setSales(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => console.error('Error fetching sales:', error))
            .finally(() => setIsLoading(false));
    };

    const openDeleteModal = (sale) => {
        setSaleToDelete(sale);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!saleToDelete) return;
        apiClient.delete(`/api/sales/${saleToDelete.id}`, { headers: { Authorization: varToken } })
            .then((response) => {
                // If we are on the last page and it's the only item, go to the previous page
                if (sales.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchSales(); // Otherwise, just refetch
                }
                setIsDeleteModalOpen(false);
                toast.success(response.data.message, { position: 'bottom-right', transition: Zoom });
            })
            .catch((error) => toast.error(error.response?.data?.message || 'Delete failed', { position: 'bottom-right', transition: Zoom }));
    };

    const getStatusChip = (statusName) => {
        let color;
        switch (statusName) {
            case 'ACTIVE': color = 'success'; break;
            case 'INACTIVE': color = 'default'; break;
            case 'EXPIRED': color = 'error'; break;
            default: color = 'primary';
        }
        return <Chip label={statusName} color={color} size="small" />;
    };

    const TableSkeleton = () => (
        [...Array(10)].map((_, i) => (
            <tr key={i}>
                {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton variant="text" /></td>)}
            </tr>
        ))
    );

    return (
        <div className="p-4">
            <div className='flex items-center justify-between mb-4'>
                <h1 className='text-3xl font-bold'>Sales Management</h1>
                {userRole === 'ADMIN' && (
                    <Button component={Link} to='/Dashboard/Sales/Create' variant="contained" startIcon={<FaPlusSquare />}>
                        Create New Sale
                    </Button>
                )}
            </div>

            <div className='flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow gap-4'>
                <TextField
                    label="Search by Type or Value..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                <FormControl variant="outlined" size="small" className="w-1/4">
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                        <MenuItem value="EXPIRED">Expired</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>ID</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Type</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Value</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Start Date</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>End Date</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Status</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {isLoading ? <TableSkeleton /> : sales.length > 0 ? (
                        sales.map((sale) => (
                            <tr key={sale.id} className='hover:bg-gray-50'>
                                <td className='px-4 py-2'>{sale.id}</td>
                                <td className='px-4 py-2'>{sale.saleType?.saleTypeName || 'N/A'}</td>
                                <td className='px-4 py-2'>{sale.saleType?.saleTypeName === 'PERCENTAGE' ? `${sale.saleValue}%` : formatPrice(sale.saleValue)}</td>
                                <td className='px-4 py-2'>{new Date(sale.saleStartDate).toLocaleDateString()}</td>
                                <td className='px-4 py-2'>{new Date(sale.saleEndDate).toLocaleDateString()}</td>
                                <td className='px-4 py-2'>{getStatusChip(sale.saleStatus?.saleStatusName)}</td>
                                <td className='px-4 py-2 flex space-x-2 items-center'>
                                    <Link to={`/Dashboard/Sales/${sale.id}`} title="View Details"><FaEye className='text-green-500 cursor-pointer' /></Link>
                                    {userRole === 'ADMIN' &&
                                        <>
                                            <Link to={`/Dashboard/Sales/Edit/${sale.id}`} title="Edit Sale"><FaEdit className='text-blue-500 cursor-pointer' /></Link>
                                            <Link to={`/Dashboard/Sales/${sale.id}/AddProduct`} title="Add Products to Sale"><FaPlusSquare className='text-indigo-500 cursor-pointer' /></Link>
                                            <button onClick={() => openDeleteModal(sale)} title="Delete Sale"><FaTrash className='text-red-500 cursor-pointer' /></button>
                                        </>
                                    }
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan='7' className='text-center text-gray-500 py-6'>No sales found for the selected filters.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            <EnhancedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} isLoading={isLoading} />

            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} name={`Sale #${saleToDelete?.id}`} />
        </div>
    );
};

export default DashboardSales;