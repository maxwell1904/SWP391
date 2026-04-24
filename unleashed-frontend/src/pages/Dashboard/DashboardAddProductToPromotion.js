import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../core/api';
import { toast, Zoom } from 'react-toastify';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import { Button, Typography, TextField, Skeleton, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Grid } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';

const DashboardAddProductToPromotion = () => {
    const { promotionId } = useParams();
    const navigate = useNavigate();
    const varToken = useAuthHeader();

    const [products, setProducts] = useState([]);
    const [selectionList, setSelectionList] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchAvailableProducts();
    }, [promotionId, currentPage, debouncedSearchTerm, varToken]);

    const fetchAvailableProducts = () => {
        setLoading(true);
        apiClient.get(`/api/promotions/${promotionId}/products/available`, {
            headers: { Authorization: varToken },
            params: {
                page: currentPage,
                size: 8,
                search: debouncedSearchTerm,
            },
        })
            .then((response) => {
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => console.error('Error fetching products:', error))
            .finally(() => setLoading(false));
    };

    const handleToggleSelection = (product) => {
        setSelectionList(prev => {
            const newList = { ...prev };
            if (newList[product.productId]) {
                delete newList[product.productId];
            } else {
                newList[product.productId] = product;
            }
            return newList;
        });
    };

    const handleAddProducts = () => {
        const selectedProductIds = Object.keys(selectionList);
        if (selectedProductIds.length === 0) {
            toast.warn("Please select at least one product to add.", { position: "bottom-right", transition: Zoom });
            return;
        }

        apiClient.post(`/api/promotions/${promotionId}/products`, { productIds: selectedProductIds }, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success("Products added to promotion successfully!", { position: "bottom-right", transition: Zoom });
                navigate(`/Dashboard/Promotions/${promotionId}`);
            })
            .catch((error) => toast.error(error.response?.data?.message || 'Failed to add products', { position: "bottom-right", transition: Zoom }));
    };

    const ProductSkeleton = () => (
        [...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper elevation={2} className="p-3">
                    <Skeleton variant="rectangular" width="100%" height={160} className="mb-2" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                </Paper>
            </Grid>
        ))
    );

    return (
        <div className="p-4">
            <Typography variant='h4' component='h1' gutterBottom>Add Products to Promotion #{promotionId}</Typography>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3">
                    <Paper elevation={2} className="p-3 mb-4">
                        <TextField label="Search available products..." variant='outlined' fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" />
                    </Paper>

                    {loading ? (
                        <Grid container spacing={2}>
                            <ProductSkeleton />
                        </Grid>
                    ) : (
                        <Grid container spacing={2}>
                            {products.map((product) => (
                                <Grid item xs={12} sm={6} md={3} key={product.productId}>
                                    <Paper elevation={selectionList[product.productId] ? 4 : 1} className={`p-3 cursor-pointer border-2 h-full flex flex-col justify-between ${selectionList[product.productId] ? 'border-blue-500' : 'border-transparent'}`} onClick={() => handleToggleSelection(product)}>
                                        <div>
                                            {/* --- FIX #1: Use `firstVariationImage` from DTO --- */}
                                            <img src={product.firstVariationImage || '/images/placeholder.png'} alt={product.productName} className="w-full h-40 object-cover rounded-md mb-2" />
                                            <Typography variant="subtitle2" component="h2" noWrap title={product.productName} className="font-semibold">{product.productName}</Typography>

                                            {/* --- FIX #2: Use `brandName` directly from DTO --- */}
                                            <Typography variant="caption" color='textSecondary'>{product.brandName}</Typography>
                                        </div>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    <EnhancedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} isLoading={loading} />
                </div>

                <div className="w-full md:w-1/3">
                    <Paper elevation={2} className="p-4 sticky top-4">
                        <Typography variant="h6" className="font-bold mb-3 border-b pb-2">Selected Products ({Object.keys(selectionList).length})</Typography>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {Object.keys(selectionList).length === 0 ? (
                                <Typography className="text-center text-gray-500 py-10">Select products from the left to add them to the promotion.</Typography>
                            ) : (
                                <List dense>
                                    {Object.values(selectionList).map(p => (
                                        <ListItem key={p.productId} secondaryAction={<IconButton edge="end" onClick={() => handleToggleSelection(p)}><RemoveCircleOutline color="error" /></IconButton>}>
                                            {/* --- FIX #3: Use DTO properties here as well --- */}
                                            <ListItemAvatar><Avatar src={p.firstVariationImage} variant="rounded" /></ListItemAvatar>
                                            <ListItemText primary={p.productName} secondary={p.brandName} primaryTypographyProps={{ fontSize: '0.875rem' }}/>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </div>
                        {Object.keys(selectionList).length > 0 && (
                            <Button fullWidth variant='contained' color='primary' onClick={handleAddProducts} className="mt-4">
                                Add {Object.keys(selectionList).length} Products to Promotion
                            </Button>
                        )}
                    </Paper>
                </div>
            </div>
        </div>
    );
};

export default DashboardAddProductToPromotion;