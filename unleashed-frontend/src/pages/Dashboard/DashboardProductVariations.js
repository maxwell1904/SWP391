import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../core/api';
import { Skeleton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Paper, Grid, Box, Avatar, Tooltip, IconButton, Divider, Chip } from '@mui/material';
import { Edit, Add, Delete, ArrowBack } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { toast } from 'react-toastify';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { formatPrice } from '../../components/format/formats';

const DashboardProductVariations = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [variationToDelete, setVariationToDelete] = useState(null);
    const role = useAuthUser()?.role;
    const varToken = useAuthHeader();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/products/${productId}/detail`, {
                headers: { Authorization: varToken },
            });
            setProduct(response.data || { productVariations: [] });
        } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error("Failed to fetch product details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVariation = (variationId, size, color) => {
        setVariationToDelete({ variationId, size, color });
        setOpenModal(true);
    };

    const confirmDeleteVariation = async () => {
        if (!variationToDelete) return;
        try {
            await apiClient.delete(`/api/product-variations/${variationToDelete.variationId}`, {
                headers: { Authorization: varToken },
            });
            toast.success('Variation deleted successfully!');
            fetchProductDetails(); // Refetch to get the updated list
        } catch (error) {
            toast.error("Failed to delete variation.");
            console.error('Error deleting product variation:', error);
        } finally {
            setOpenModal(false);
        }
    };

    const LoadingSkeleton = () => (
        <div className="p-4">
            <Skeleton variant="text" width={250} height={50} />
            <Paper sx={{ p: 3, mt: 2 }} className="bg-white rounded-lg shadow">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" width="100%" height={300} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="text" width="80%" height={40} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
                    </Grid>
                </Grid>
            </Paper>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 4 }} />
        </div>
    );

    if (loading) return <LoadingSkeleton />;

    const primaryImage = product?.productVariations?.[0]?.variationImage || '';

    return (
        <div className='p-4'>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Product Details
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/Dashboard/Products")} variant="outlined">
                    Back to Products
                </Button>
            </Box>

            <Paper sx={{ p: 4, mb: 4 }} className="bg-white rounded-lg shadow">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Avatar
                            src={primaryImage}
                            alt={product?.productName}
                            variant="rounded"
                            sx={{ width: '100%', height: 'auto', aspectRatio: '1 / 1' }}
                        />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" className="font-bold">{product?.productName || 'N/A'}</Typography>
                        <Chip label={product?.brand?.brandName || 'N/A'} size="small" sx={{ my: 1 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            {product?.productDescription || 'No description available.'}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            <strong>Categories:</strong> {product?.categories?.map(c => c.categoryName).join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                            Created: {new Date(product?.productCreatedAt).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Last Updated: {new Date(product?.productUpdatedAt).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-semibold">Variations</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {role !== 'STAFF' && (
                        <Button component={Link} to={`/Dashboard/Products/Edit/${product.productId}`} variant="outlined" startIcon={<Edit />}>
                            Edit Details
                        </Button>
                    )}
                    <Button component={Link} to={`/Dashboard/Products/${product.productId}/Add`} variant="contained" startIcon={<Add />}>
                        Add Variation
                    </Button>
                </Box>
            </div>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full table-auto'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Image</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Size</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Color</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Price</th>
                        <th className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>Actions</th>
                    </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                    {product?.productVariations?.length > 0 ? (
                        product.productVariations.map((variation) => (
                            <tr key={variation.id} className='hover:bg-gray-50 align-middle'>
                                <td className='px-4 py-2'>
                                    <Avatar src={variation.variationImage} alt={variation.color.colorName} variant="rounded" sx={{ width: 60, height: 60 }} />
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{variation.size.sizeName}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>
                                    <div className='flex items-center gap-2'>
                                        <Box component="span" sx={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: variation.color.colorHexCode, border: '1px solid #ccc' }} />
                                        {variation.color.colorName}
                                    </div>
                                </td>
                                <td className='px-4 py-3 text-sm font-medium text-gray-900'>{formatPrice(variation.variationPrice)}</td>
                                <td className='px-4 py-3'>
                                    <div className='flex items-center justify-center gap-2'>
                                        <Tooltip title="Edit Variation">
                                            <IconButton component={Link} to={`/Dashboard/Products/${productId}/Edit/${variation.id}`} color="primary" size="small">
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Variation">
                                            <IconButton onClick={() => handleDeleteVariation(variation.id, variation.size.sizeName, variation.color.colorName)} color="error" size="small">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='5' className='py-10 text-center text-gray-500'>
                                No product variations available.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this variation?
                    </Typography>
                    {variationToDelete && (
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                            {`Size: ${variationToDelete.size}, Color: ${variationToDelete.color}`}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)} variant="outlined">Cancel</Button>
                    <Button onClick={confirmDeleteVariation} variant="contained" color="error">Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DashboardProductVariations;