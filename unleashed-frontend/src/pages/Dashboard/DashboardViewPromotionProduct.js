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

const DashboardViewPromotionProduct = () => {
    const [products, setProducts] = useState([]);
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const { promotionId } = useParams();
    const varToken = useAuthHeader();
    const authUser = useAuthUser();
    const userRole = authUser.role;

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        apiClient.get(`/api/promotions/${promotionId}`, { headers: { Authorization: varToken } })
            .then((response) => setPromotion(response.data.body || response.data))
            .catch((error) => console.error('Error fetching promotion details:', error));
    }, [promotionId, varToken]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(1);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchProductsInPromotion();
    }, [promotionId, currentPage, debouncedSearchTerm, varToken]);

    const fetchProductsInPromotion = () => {
        setLoading(true);
        apiClient.get(`/api/promotions/${promotionId}/products`, {
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
            .catch((error) => console.error('Error fetching products for promotion:', error))
            .finally(() => setLoading(false));
    };

    const handleDeleteProduct = (productId) => {
        apiClient.delete(`/api/promotions/${promotionId}/products?productId=${productId}`, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success('Product removed from promotion', { position: 'bottom-right', transition: Zoom });
                if (products.length === 1 && currentPage > 1) {
                    setCurrentPage(p => p - 1);
                } else {
                    fetchProductsInPromotion();
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
            <Typography variant='h4' component='h1' gutterBottom>Promotion Details</Typography>
            {promotion ? (
                <Paper elevation={2} className="p-4 mb-6">
                    <Typography variant="h6" className="font-bold">Promotion ID: {promotion.id}</Typography>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        <p><strong>Type:</strong> {promotion.promotionType?.promotionTypeName || 'N/A'}</p>
                        <p><strong>Value:</strong> {promotion.promotionType?.promotionTypeName === 'PERCENTAGE' ? `${promotion.promotionValue}%` : formatPrice(promotion.promotionValue)}</p>
                        <p><strong>Start Date:</strong> {new Date(promotion.promotionStartDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(promotion.promotionEndDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {promotion.promotionStatus?.promotionStatusName || 'N/A'}</p>
                    </div>
                </Paper>
            ) : <Skeleton variant="rectangular" height={120} className="mb-6 rounded-lg" />}

            <div className='flex items-center justify-between mb-4'>
                <Typography variant='h5' component='h2' className="font-bold">Products in Promotion</Typography>
                {userRole === 'ADMIN' && (
                    <Button component={Link} to={`/Dashboard/Promotions/${promotionId}/AddProduct`} variant="contained" startIcon={<FaPlus />}>
                        Add More Products
                    </Button>
                )}
            </div>

            <Paper elevation={2} className="p-3 mb-4">
                <TextField label="Search products in this promotion..." variant='outlined' fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small"/>
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
                                        <IconButton onClick={() => handleDeleteProduct(product.productId)} color="error" title="Remove from Promotion">
                                            <FaTrash />
                                        </IconButton>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">No products found for this promotion.</td>
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

export default DashboardViewPromotionProduct;