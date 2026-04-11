import React, { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Grid, Box, Button, Skeleton, Divider, Stack
} from "@mui/material";
import {
    ArrowBack, Email, Phone, Home, CalendarToday, Update, Edit, Delete
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

const DashboardProviderDetailPage = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const varToken = useAuthHeader();
    const authUser = useAuthUser();
    const userRole = authUser?.role;

    const [provider, setProvider] = useState(location.state?.provider || null);
    const [loading, setLoading] = useState(!location.state?.provider);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (providerId && !location.state?.provider) {
            fetchProviderDetails();
        }
    }, [providerId]);

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        return DateTime.fromISO(dateString, { zone: "utc" })
            .setZone("Asia/Ho_Chi_Minh")
            .toFormat("dd/MM/yyyy, HH:mm:ss a");
    };

    const fetchProviderDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/providers/${providerId}`, {
                headers: { Authorization: varToken },
            });
            setProvider(response.data);
        } catch (error) {
            console.error("Failed to fetch provider details:", error);
            setProvider(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        apiClient.delete(`/api/providers/${providerId}`, { headers: { Authorization: varToken } })
            .then((response) => {
                toast.success(response.data?.message || "Provider deleted successfully", { position: "bottom-right", transition: Zoom });
                navigate("/Dashboard/Providers");
            })
            .catch((error) =>
                toast.error(error.response?.data?.message || "Delete provider failed", { position: "bottom-right", transition: Zoom })
            )
            .finally(() => setDeleteModalOpen(false));
    };

    const handleBack = () => navigate("/Dashboard/Providers");

    if (loading) {
        return (
            <Container sx={{ py: 3 }}>
                <Skeleton variant="text" width={250} height={50} />
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

    if (!provider) {
        return (
            <Container sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">Provider Not Found</Typography>
                <Typography>The provider details could not be loaded.</Typography>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }} variant="contained">Back to Providers</Button>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">Provider Details</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    {userRole === 'ADMIN' && (
                        <Stack direction="row" spacing={1}>
                            <Button component={Link} to={`/Dashboard/Providers/Edit/${providerId}`} variant="contained" color="primary" startIcon={<Edit />}>Edit</Button>
                            <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => setDeleteModalOpen(true)}>Delete</Button>
                        </Stack>
                    )}
                    <Button startIcon={<ArrowBack />} onClick={handleBack} variant="outlined">Back to List</Button>
                </Stack>
            </Box>

            <Paper sx={{ p: 3 }} variant="outlined">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Box component="img" src={provider.providerImageUrl} alt={provider.providerName} sx={{ width: '100%', maxWidth: '250px', height: 'auto', objectFit: 'contain', border: '1px solid', borderColor: 'divider', p: 1, borderRadius: 2 }}/>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>{provider.providerName}</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><DetailItem icon={<Email sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Email" value={provider.providerEmail} /></Grid>
                            <Grid item xs={12} sm={6}><DetailItem icon={<Phone sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Phone" value={provider.providerPhone} /></Grid>
                            <Grid item xs={12}><DetailItem icon={<Home sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Address" value={provider.providerAddress} /></Grid>
                            <Grid item xs={12} sm={6}><DetailItem icon={<CalendarToday sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Created At" value={formatDateTime(provider.providerCreatedAt)} /></Grid>
                            <Grid item xs={12} sm={6}><DetailItem icon={<Update sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Last Updated" value={formatDateTime(provider.providerUpdatedAt)} /></Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
            <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} name={provider?.providerName || "this provider"}/>
        </Container>
    );
};

export default DashboardProviderDetailPage;