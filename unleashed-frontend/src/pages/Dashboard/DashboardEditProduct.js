import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../core/api';
import {
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Skeleton,
    Paper,
    Grid,
    Box,
    Typography
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { toast } from 'react-toastify';

const EditProductSkeleton = () => (
    <div className="p-4">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="text" width={250} height={50} />
            <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
        <Paper sx={{ p: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12}><Skeleton variant="rectangular" height={120} /></Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton variant="rectangular" width={150} height={40} />
                </Grid>
            </Grid>
        </Paper>
    </div>
);

const DashboardEditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const varToken = useAuthHeader();
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [categoryIdList, setCategoryIdList] = useState([]);
    const [brandId, setBrandId] = useState('');
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [productRes, categoriesRes, brandsRes] = await Promise.all([
                    apiClient.get(`/api/products/${productId}`, { headers: { Authorization: varToken } }),
                    apiClient.get(`/api/categories`, { headers: { Authorization: varToken } }),
                    apiClient.get(`/api/brands`, { headers: { Authorization: varToken } })
                ]);

                const { productName, description, brand, categories } = productRes.data;
                setProductName(productName);
                setProductDescription(description || '');
                setCategoryIdList(categories ? categories.map(c => c.id) : []);
                setBrandId(brand?.id || '');
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data);
            } catch (error) {
                toast.error("Failed to fetch product data.");
                navigate('/Dashboard/Products');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [productId, varToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedProduct = { productName, productDescription, categoryIdList, brandId };
        try {
            await apiClient.put(`/api/products/${productId}`, updatedProduct, { headers: { Authorization: varToken } });
            toast.success('Product updated successfully');
            navigate(`/Dashboard/Products`);
        } catch (error) {
            toast.error('Failed to update product.');
        }
    };

    if (loading) {
        return <EditProductSkeleton />;
    }

    return (
        <div className='p-4'>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Edit Product Details
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/Dashboard/Products")} variant="outlined">
                    Back to Products
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField label='Product Name' variant='outlined' fullWidth required value={productName} onChange={(e) => setProductName(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Brand</InputLabel>
                                <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} label='Brand' required>
                                    {brands.map((brand) => <MenuItem key={brand.brandId} value={brand.brandId}>{brand.brandName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Categories</InputLabel>
                                <Select multiple required value={categoryIdList} onChange={(e) => setCategoryIdList(e.target.value)} label='Categories'
                                        renderValue={(selected) => categories.filter(c => selected.includes(c.id)).map(c => c.categoryName).join(', ')}>
                                    {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.categoryName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label='Product Description' variant='outlined' required fullWidth multiline rows={4} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type='submit' variant='contained' color='primary' size="large">
                                Update Product
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </div>
    );
};

export default DashboardEditProduct;