import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../../core/api';
import { toast, Zoom } from 'react-toastify';
import { FaPlus, FaTrash } from 'react-icons/fa';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { formatPrice } from '../../components/format/formats';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import { Button, Typography, TextField, Skeleton, Paper, IconButton } from '@mui/material';

const DashboardViewSaleProduct = () => {
    const [products, setProducts] = useState([]);
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const { saleId } = useParams();
    const varToken = useAuthHeader();
    const authUser = useAuthUser();
    const userRole = authUser.role;

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        apiClient.get(`/api/sales/${saleId}`, { headers: { Authorization: varToken } })
            .then((response) => setSale(response.data.body || response.data))
            .catch((error) => console.error('Error fetching sale details:', error));
    }, [saleId, varToken]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchProductsInSale();
    }, [saleId, currentPage, debouncedSearchTerm, varToken]);

    const fetchProductsInSale = () => {
        setLoading(true);
        apiClient.get(`/api/sales/${saleId}/products`, {
            headers: { Authorization: varToken },
            params: {
                page: currentPage - 1,
                size: 10,
                search: debouncedSearchTerm,
            },
        })
            .then((response) => {
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => console.error('Error fetching products for sale:', error))
            .finally(() => setLoading(false));
    };

    const handleDeleteProduct = (productId) => {
        apiClient.delete(`/api/sales/${saleId}/products?productId=${productId}`, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success('Product removed from sale', { position: 'bottom-right', transition: Zoom });
                if (products.length === 1 && currentPage > 1) {
                    setCurrentPage(p => p - 1);
                } else {
                    fetchProductsInSale();
                }
            })
            .catch((error) => toast.error('Failed to remove product', { position: 'bottom-right', transition: Zoom }));
    };

    const TableSkeleton = () => (
        [...Array(5)].map((_, i) => (
            <tr key={i}>
                {[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><Skeleton variant="text" /></td>)}
            </tr>
        ))
    );

    return (
        <div className="p-4">
            <Typography variant='h4' component='h1' gutterBottom>Sale Details</Typography>
            {sale ? (
                <Paper elevation={2} className="p-4 mb-6">
                    <Typography variant="h6" className="font-bold">Sale ID: {sale.id}</Typography>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        <p><strong>Type:</strong> {sale.saleType?.saleTypeName || 'N/A'}</p>
                        <p><strong>Value:</strong> {sale.saleType?.saleTypeName === 'PERCENTAGE' ? `${sale.saleValue}%` : formatPrice(sale.saleValue)}</p>
                        <p><strong>Start Date:</strong> {new Date(sale.saleStartDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(sale.saleEndDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {sale.saleStatus?.saleStatusName || 'N/A'}</p>
                    </div>
                </Paper>
            ) : <Skeleton variant="rectangular" height={120} className="mb-6 rounded-lg" />}

            <div className='flex items-center justify-between mb-4'>
                <Typography variant='h5' component='h2' className="font-bold">Products in Sale</Typography>
                {userRole === 'ADMIN' && (
                    <Button component={Link} to={`/Dashboard/Sales/${saleId}/AddProduct`} variant="contained" startIcon={<FaPlus />}>
                        Add More Products
                    </Button>
                )}
            </div>

            <Paper elevation={2} className="p-3 mb-4">
                <TextField label="Search products in this sale..." variant='outlined' fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small"/>
            </Paper>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Product Name</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Category</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Brand</th>
                        <th className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>Remove</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? <TableSkeleton /> : (
                        products.length > 0 ? products.map((product) => (
                            <tr key={product.productId} className='hover:bg-gray-50'>
                                <td className='px-4 py-2 font-medium'>{product.productName}</td>

                                {/* --- FIX #1: Use `product.categoryNames` --- */}
                                <td className='px-4 py-2 text-sm'>
                                    {product.categoryNames?.join(', ') || 'N/A'}
                                </td>

                                {/* --- FIX #2: Use `product.brandName` directly --- */}
                                <td className='px-4 py-2 text-sm'>{product.brandName || 'N/A'}</td>

                                <td className='px-4 py-2 text-center'>
                                    {userRole === 'ADMIN' && (
                                        <IconButton onClick={() => handleDeleteProduct(product.productId)} color="error" title="Remove from Sale">
                                            <FaTrash />
                                        </IconButton>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">No products found for this sale.</td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            <EnhancedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} isLoading={loading} />
        </div>
    );
};

export default DashboardViewSaleProduct;