import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Typography,
    TextField,
    Button,
    IconButton,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { Edit, Add, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { formatPrice } from '../../components/format/formats';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import { getProductList } from '../../service/ShopService';
import useDebounce from '../../components/hooks/useDebounce';
import { apiClient } from '../../core/api';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const DashboardProducts = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const role = useAuthUser()?.role;
    const varToken = useAuthHeader();
    const navigate = useNavigate();
    const itemsPerPage = 10;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const filters = { query: debouncedSearchTerm };
            const data = await getProductList(page, itemsPerPage, filters);
            setProducts(data.content || []);
            setPageCount(data.totalPages || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products.');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearchTerm]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await apiClient.delete(`/api/products/${productId}`, {
                headers: { Authorization: varToken },
            });
            toast.success('Product deleted successfully', { position: 'bottom-right' });
            if (products.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product', { position: 'bottom-right' });
        } finally {
            setIsModalOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <tr key={index}>
                    <td className='px-4 py-3'><Skeleton variant="rectangular" width={60} height={60} /></td>
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
            <div className='flex items-center justify-between mb-4'>
                <Typography variant='h4' className='text-3xl font-bold'>
                    Products Management
                </Typography>
                {role !== 'STAFF' && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        component={Link}
                        to='/Dashboard/Products/Add'
                    >
                        Add New Product
                    </Button>
                )}
            </div>

            <div className='flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow'>
                <TextField
                    label="Search Products by Name..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full"
                />
            </div>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full table-auto'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Image</th>
                        <th style={{ width: '30%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Product Name</th>
                        <th style={{ width: '15%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Brand</th>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Price</th>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>Stock</th>
                        <th style={{ width: '10%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Rating</th>
                        <th style={{ width: '15%' }} className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>Actions</th>
                    </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                    {loading ? (
                        <TableSkeleton />
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.productId} className='hover:bg-gray-50 align-middle'>
                                <td className='px-4 py-2'>
                                    <img
                                        src={product.productVariationImage || 'https://placehold.co/60x60'}
                                        alt={product.productName}
                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                </td>
                                <td className='px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer whitespace-nowrap'
                                    onClick={() => navigate(`/Dashboard/Products/${product.productId}`)}>
                                    {product.productName}
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{product.brandName || 'N/A'}</td>
                                <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                                    {product.productPrice ? formatPrice(product.productPrice) : 'N/A'}
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-700 text-center'>{product.quantity ?? 0}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>
                                    {product.averageRating.toFixed(1)} ({product.totalRatings})
                                </td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center justify-center gap-2'>
                                        {role !== 'STAFF' && (
                                            <>
                                                <Tooltip title="Edit">
                                                    <IconButton component={Link} to={`/Dashboard/Products/Edit/${product.productId}`} color="primary" size="small">
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleOpenModal(product)} color="error" size="small">
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-gray-500">
                                No products found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <EnhancedPagination
                currentPage={page - 1}
                totalPages={pageCount}
                onPageChange={(newPage) => setPage(newPage + 1)}
                isLoading={loading}
            />

            <DeleteConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={() => handleDeleteProduct(selectedProduct.productId)}
                name={selectedProduct ? selectedProduct.productName : ''}
            />
        </div>
    );
};

export default DashboardProducts;