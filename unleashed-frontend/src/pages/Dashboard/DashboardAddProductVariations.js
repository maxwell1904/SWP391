import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../core/api';
import {
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Box,
    IconButton,
    Typography,
    Paper,
    Grid,
    InputAdornment,
    Avatar,
    CircularProgress,
    Skeleton,
} from '@mui/material';
import { Delete, ArrowBack, AddPhotoAlternate } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { toast } from 'react-toastify';

const AddVariationsSkeleton = () => (
    <div className="p-4">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="text" width={300} height={50} />
            <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
        <Paper sx={{ p: 4, mb: 4 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
                <Grid item xs={12}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12}><Skeleton variant="rectangular" height={80} /></Grid>
            </Grid>
        </Paper>
        <Paper sx={{ p: 4 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }}/>
        </Paper>
    </div>
);


const DashboardAddProductVariations = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [productVariations, setVariations] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const varToken = useAuthHeader();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [productRes, sizesRes, colorsRes] = await Promise.all([
                    apiClient.get(`/api/products/${productId}/detail`, { headers: { Authorization: varToken } }),
                    apiClient.get('/api/sizes', { headers: { Authorization: varToken } }),
                    apiClient.get('/api/colors', { headers: { Authorization: varToken } })
                ]);

                setProduct(productRes.data);
                setSizes(sizesRes.data);
                setColors(colorsRes.data);

                const existingVariations = productRes.data.productVariations.map(v => ({
                    id: v.id,
                    sizeId: v.size.id,
                    colorId: v.color.id,
                    productPrice: v.variationPrice,
                    productVariationImage: v.variationImage,
                    previewUrl: v.variationImage,
                    isExisting: true,
                }));
                setVariations(existingVariations);

            } catch (error) {
                toast.error('Failed to fetch initial product data.');
                navigate('/Dashboard/Products');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchInitialData();
        }
    }, [productId, varToken, navigate]);

    const handleVariationChange = (index, field, value) => {
        const newVariations = [...productVariations];
        newVariations[index][field] = value;
        setVariations(newVariations);
    };

    const handleAddVariation = () => {
        setVariations([
            ...productVariations,
            { sizeId: '', colorId: '', productPrice: '', productVariationImage: null, previewUrl: '', isExisting: false },
        ]);
    };

    const handleRemoveVariation = (index) => {
        setVariations(productVariations.filter((_, i) => i !== index));
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const newVariations = [...productVariations];
            newVariations[index].productVariationImage = file;
            newVariations[index].previewUrl = URL.createObjectURL(file);
            setVariations(newVariations);
        }
    };

    const uploadImage = (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return toast.promise(
            fetch('https://api.imgbb.com/1/upload?key=37a8229aac308c0f3568b5163a7104f8', {
                method: 'POST', body: formData,
            }).then(res => res.json()).then(data => {
                if (data.success) return data.data.display_url;
                throw new Error('Image upload failed');
            }),
            { pending: 'Uploading image...', success: 'Image uploaded!', error: 'Upload failed.' }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newVariations = productVariations.filter(v => !v.isExisting);
        if (newVariations.length === 0) {
            toast.info("No new variations to add.");
            return;
        }
        if (newVariations.some(v => !v.productVariationImage)) {
            toast.error('An image is required for every new variation.');
            return;
        }

        setIsSubmitting(true);
        try {
            const processedNewVariations = await Promise.all(
                newVariations.map(async (v) => ({
                    sizeId: v.sizeId,
                    colorId: v.colorId,
                    productPrice: v.productPrice,
                    productVariationImage: v.productVariationImage instanceof File ? await uploadImage(v.productVariationImage) : v.productVariationImage
                }))
            );

            await apiClient.post(`/api/products/${productId}/product-variations`, processedNewVariations, {
                headers: { Authorization: varToken },
            });

            toast.success('New product variations added successfully!');
            navigate(`/Dashboard/Products/edit/${productId}`);
        } catch (error) {
            toast.error(error.message || 'Failed to add product variations.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <AddVariationsSkeleton />;
    }

    return (
        <div className="p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Add New Variations
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate(`/Dashboard/Products/edit/${productId}`)} variant="outlined">
                    Back to Product
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 4, mb: 4 }} className="bg-white rounded-lg shadow">
                    <Typography variant="h6" className="font-semibold mb-4">Adding Variations For</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}><TextField label='Product Name' fullWidth value={product.productName} disabled /></Grid>
                        <Grid item xs={12}><TextField label='Product Description' fullWidth multiline rows={2} value={product.productDescription} disabled /></Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
                    <Typography variant="h6" className="font-semibold mb-4">Product Variations</Typography>
                    <Grid container spacing={2} sx={{ pb: 1, borderBottom: 1, borderColor: 'divider', display: { xs: 'none', md: 'flex' } }}>
                        <Grid item md={2}><Typography variant="subtitle2" color="text.secondary">Size</Typography></Grid>
                        <Grid item md={2}><Typography variant="subtitle2" color="text.secondary">Color</Typography></Grid>
                        <Grid item md={3}><Typography variant="subtitle2" color="text.secondary">Price</Typography></Grid>
                        <Grid item md={4}><Typography variant="subtitle2" color="text.secondary">Image</Typography></Grid>
                        <Grid item md={1} />
                    </Grid>

                    {productVariations.map((variation, index) => (
                        <Grid container key={variation.id || `new-${index}`} spacing={2} sx={{ py: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider', backgroundColor: variation.isExisting ? 'grey.100' : 'transparent' }}>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth required>
                                    <Select value={variation.sizeId} onChange={(e) => handleVariationChange(index, 'sizeId', e.target.value)} disabled={isSubmitting || variation.isExisting} size="small" displayEmpty>
                                        <MenuItem value="" disabled><em>Size</em></MenuItem>
                                        {sizes.map((size) => <MenuItem key={size.id} value={size.id}>{size.sizeName}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth required>
                                    <Select value={variation.colorId} onChange={(e) => handleVariationChange(index, 'colorId', e.target.value)} disabled={isSubmitting || variation.isExisting} size="small" displayEmpty renderValue={(selected) => {
                                        if (!selected) return <em>Color</em>;
                                        const selectedColor = colors.find((c) => c.id === selected);
                                        if (!selectedColor) return null;
                                        return (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: selectedColor.colorHexCode, border: '1px solid #ccc' }} />
                                            {selectedColor.colorName}
                                        </Box>);
                                    }}>
                                        <MenuItem value="" disabled><em>Color</em></MenuItem>
                                        {colors.map((color) => <MenuItem key={color.id} value={color.id}>
                                            <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color.colorHexCode, mr: 1.5, border: '1px solid #ccc' }} />
                                            {color.colorName}
                                        </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField placeholder="Price" type='number' fullWidth value={variation.productPrice} onChange={(e) => handleVariationChange(index, 'productPrice', e.target.value)} required inputProps={{ min: 0 }} disabled={isSubmitting || variation.isExisting} size="small"
                                           InputProps={{ startAdornment: <InputAdornment position="start">VND</InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {!variation.isExisting && (
                                    <Button component='label' size="small" variant="outlined" startIcon={<AddPhotoAlternate />} disabled={isSubmitting}>
                                        Upload
                                        <input type='file' accept="image/*" hidden onChange={(e) => handleImageChange(index, e)} />
                                    </Button>
                                )}
                                <Avatar src={variation.previewUrl} alt='Preview' variant="rounded" sx={{ width: 60, height: 60 }}>
                                    <AddPhotoAlternate />
                                </Avatar>
                            </Grid>
                            <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
                                {!variation.isExisting && (
                                    <IconButton onClick={() => handleRemoveVariation(index)} color="error" disabled={isSubmitting}>
                                        <Delete />
                                    </IconButton>
                                )}
                            </Grid>
                        </Grid>
                    ))}
                </Paper>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant='outlined' onClick={handleAddVariation} disabled={isSubmitting}>
                        Add New Variation
                    </Button>
                    <Button type='submit' variant='contained' color='primary' size="large" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save New Variations'}
                    </Button>
                </Box>
            </form>
        </div>
    );
};

export default DashboardAddProductVariations;