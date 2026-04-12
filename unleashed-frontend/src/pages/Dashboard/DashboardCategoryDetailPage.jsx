import React, { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Grid, Box, Button, Skeleton, Divider, Stack
} from "@mui/material";
import {
    ArrowBack, Description, Inventory, CalendarToday, Update, Edit, Delete
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { DateTime } from "luxon";
import { toast, Zoom } from "react-toastify";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";

const DetailItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        {icon}
        <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

const DashboardCategoryDetailPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const varToken = useAuthHeader();
    const authUser = useAuthUser();
    const userRole = authUser?.role;

    const [category, setCategory] = useState(location.state?.category || null);
    const [loading, setLoading] = useState(!location.state?.category);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (categoryId && !location.state?.category) {
            fetchCategoryDetails();
        }
    }, [categoryId]);

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return DateTime.fromISO(dateString, { zone: "utc" })
            .setZone("Asia/Ho_Chi_Minh")
            .toFormat("dd/MM/yyyy, HH:mm:ss a");
    };

    const fetchCategoryDetails = async () => {
        try {
            const response = await apiClient.get(`/api/categories/${categoryId}`, {
                headers: { Authorization: varToken },
            });
            setCategory(prevCategory => ({ ...prevCategory, ...response.data }));
        } catch (error) {
            console.error("Failed to fetch category details:", error);
            if (!category) setCategory(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        apiClient.delete(`/api/categories/${categoryId}`, { headers: { Authorization: varToken } })
            .then((response) => {
                toast.success(response.data.message || "Category deleted successfully", { position: "bottom-right", transition: Zoom });
                navigate("/Dashboard/Categories");
            })
            .catch((error) =>
                toast.error(error.response?.data?.message || "Error deleting category", { position: "bottom-right", transition: Zoom })
            )
            .finally(() => setDeleteModalOpen(false));
    };

    const handleBack = () => navigate("/Dashboard/Categories");

    if (loading) {
        return (
            <Container sx={{ py: 3 }}>
                <Skeleton variant="text" width={200} height={50} />
                <Paper sx={{ p: 3, mt: 2 }} variant="outlined">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}><Skeleton variant="rectangular" width="100%" height={200} /></Grid>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="text" height={40} />
                            <Skeleton variant="rectangular" width="100%" height={150} sx={{ mt: 2 }} />
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        );
    }

    if (!category) {
        return (
            <Container sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">Category Not Found</Typography>
                <Typography>The category details could not be loaded.</Typography>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }} variant="contained">Back to Categories</Button>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">Category Details</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    {userRole === 'ADMIN' && (
                        <Stack direction="row" spacing={1}>
                            <Button component={Link} to={`/Dashboard/Categories/Edit/${categoryId}`} variant="contained" color="primary" startIcon={<Edit />}>Edit</Button>
                            <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => setDeleteModalOpen(true)}>Delete</Button>
                        </Stack>
                    )}
                    <Button startIcon={<ArrowBack />} onClick={handleBack} variant="outlined">Back to List</Button>
                </Stack>
            </Box>

            <Paper sx={{ p: 3 }} variant="outlined">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Box component="img" src={category.categoryImageUrl} alt={category.categoryName} sx={{ width: '100%', maxWidth: '250px', height: 'auto', objectFit: 'contain', border: '1px solid', borderColor: 'divider', p: 1, borderRadius: 2 }}/>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>{category.categoryName}</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}><DetailItem icon={<Description sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Description" value={category.categoryDescription} /></Grid>
                            <Grid item xs={12} sm={6}><DetailItem icon={<Inventory sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Total Product Quantity" value={category.totalQuantity} /></Grid>
                            <Grid item xs={12} sm={6}><DetailItem icon={<CalendarToday sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Created At" value={formatDateTime(category.categoryCreatedAt)} /></Grid>
                            <Grid item xs={12} sm={6}><DetailItem icon={<Update sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Last Updated" value={formatDateTime(category.categoryUpdatedAt)} /></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} name={category?.categoryName || "this category"}/>
        </Container>
    );
};

export default DashboardCategoryDetailPage;