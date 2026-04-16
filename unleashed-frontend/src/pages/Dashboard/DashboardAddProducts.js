import React, { useEffect, useState } from 'react';
import { apiClient } from '../../core/api';
import {
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Box,
    IconButton,
    Typography,
    Paper,
    Grid,
    InputAdornment,
    Avatar,
} from '@mui/material';
import { Delete, ArrowBack, AddPhotoAlternate } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const DashboardAddProducts = () => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [categoryIdList, setCategoryIdList] = useState([]);
    const [brandId, setBrandId] = useState('');
    const [sizes, setSizes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [colors, setColors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variations, setVariations] = useState([
        { sizeId: '', colorId: '', productPrice: '', productVariationImage: null, previewUrl: '' },
    ]);
    const navigate = useNavigate();
    const varToken = useAuthHeader();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sizesRes, categoriesRes, brandsRes, colorsRes] = await Promise.all([
                    apiClient.get('/api/sizes', { headers: { Authorization: varToken } }),
                    apiClient.get('/api/categories', { headers: { Authorization: varToken } }),
                    apiClient.get('/api/brands', { headers: { Authorization: varToken } }),
                    apiClient.get('/api/colors', { headers: { Authorization: varToken } }),
                ]);
                setSizes(sizesRes.data);
                setCategories(categoriesRes.data);
                setBrands(brandsRes.data);
                setColors(colorsRes.data);
            } catch (error) {
                toast.error("Failed to load initial data for the form.");
            }
        };
        fetchData();
    }, [varToken]);

    const handleVariationChange = (index, field, value) => {
        const newVariations = [...variations];
        newVariations[index][field] = value;
        setVariations(newVariations);
    };

    const handleAddVariation = () => {
        setVariations([
            ...variations,
            { sizeId: '', colorId: '', productPrice: '', productVariationImage: null, previewUrl: '' },
        ]);
    };

    const handleRemoveVariation = (index) => {
        if (variations.length > 1) {
            setVariations(variations.filter((_, i) => i !== index));
        } else {
            toast.warn("At least one product variation is required.");
        }
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const newVariations = [...variations];
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
        if (variations.some(v => !v.productVariationImage)) {
            toast.error('An image is required for every product variation.');
            return;
        }
        setIsSubmitting(true);
        try {
            const uploadedVariations = await Promise.all(
                variations.map(async (v) => ({
                    sizeId: v.sizeId,
                    colorId: v.colorId,
                    productPrice: v.productPrice,
                    productVariationImage: await uploadImage(v.productVariationImage)
                }))
            );
            const productData = { productName, productDescription, categoryIdList, brandId, variations: uploadedVariations };
            await apiClient.post('/api/products', productData, { headers: { Authorization: varToken } });
            toast.success('Product added successfully!');
            navigate('/Dashboard/Products');
        } catch (error) {
            toast.error(error.message || 'Failed to add product.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Create New Product
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/Dashboard/Products")} variant="outlined">
                    Back to Products
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 4, mb: 4 }} className="bg-white rounded-lg shadow">
                    <Typography variant="h6" className="font-semibold mb-4">Core Details</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}><TextField label='Product Name' fullWidth value={productName} onChange={(e) => setProductName(e.target.value)} required disabled={isSubmitting} /></Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Brand</InputLabel>
                                <Select value={brandId} onChange={(e) => setBrandId(e.target.value)} disabled={isSubmitting} label='Brand'>
                                    {brands.map((brand) => <MenuItem key={brand.brandId} value={brand.brandId}>{brand.brandName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Categories</InputLabel>
                                <Select multiple value={categoryIdList} onChange={(e) => setCategoryIdList(e.target.value)} disabled={isSubmitting} label='Categories'
                                        renderValue={(selected) => categories.filter(c => selected.includes(c.id)).map(c => c.categoryName).join(', ')}>
                                    {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.categoryName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField label='Product Description' fullWidth multiline rows={4} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required disabled={isSubmitting} /></Grid>
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

                    {variations.map((variation, index) => (
                        <Grid container key={index} spacing={2} sx={{ py: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth required>
                                    <Select value={variation.sizeId} onChange={(e) => handleVariationChange(index, 'sizeId', e.target.value)} disabled={isSubmitting} size="small" displayEmpty>
                                        <MenuItem value="" disabled><em>Size</em></MenuItem>
                                        {sizes.map((size) => <MenuItem key={size.id} value={size.id}>{size.sizeName}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth required>
                                    <Select
                                        value={variation.colorId}
                                        onChange={(e) => handleVariationChange(index, 'colorId', e.target.value)}
                                        disabled={isSubmitting}
                                        size="small"
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em>Color</em>;
                                            }
                                            const selectedColor = colors.find((c) => c.id === selected);
                                            if (!selectedColor) return null;
                                            return (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: selectedColor.colorHexCode, border: '1px solid #ccc' }} />
                                                    {selectedColor.colorName}
                                                </Box>
                                            );
                                        }}
                                    >
                                        <MenuItem value="" disabled><em>Color</em></MenuItem>
                                        {colors.map((color) => <MenuItem key={color.id} value={color.id}>
                                            <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color.colorHexCode, mr: 1.5, border: '1px solid #ccc' }} />
                                            {color.colorName}
                                        </MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField placeholder="Price" type='number' fullWidth value={variation.productPrice} onChange={(e) => handleVariationChange(index, 'productPrice', e.target.value)} required inputProps={{ min: 0 }} disabled={isSubmitting} size="small"
                                           InputProps={{ startAdornment: <InputAdornment position="start">VND</InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button component='label' size="small" variant="outlined" startIcon={<AddPhotoAlternate />} disabled={isSubmitting}>
                                    Upload
                                    <input type='file' accept="image/*" hidden onChange={(e) => handleImageChange(index, e)} />
                                </Button>
                                <Avatar src={variation.previewUrl} alt='Preview' variant="rounded" sx={{ width: 60, height: 60 }}>
                                    <AddPhotoAlternate />
                                </Avatar>
                            </Grid>
                            <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
                                <IconButton onClick={() => handleRemoveVariation(index)} color="error" disabled={isSubmitting || variations.length <= 1}>
                                    <Delete />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                </Paper>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant='outlined' onClick={handleAddVariation} disabled={isSubmitting}>
                        Add Another Variation
                    </Button>
                    <Button type='submit' variant='contained' color='primary' size="large" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Product'}
                    </Button>
                </Box>
            </form>
        </div>
    );
};

export default DashboardAddProducts;