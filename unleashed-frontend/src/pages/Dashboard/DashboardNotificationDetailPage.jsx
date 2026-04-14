import React, { useState, useEffect } from "react";
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Skeleton,
    Divider,
    Chip,
    Stack
} from "@mui/material";
import {
    ArrowBack,
    Person,
    CalendarToday,
    EditNote,
    Delete
} from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast, Zoom } from "react-toastify";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";

const DetailItem = ({ icon, label, value, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        {icon}
        <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', wordBreak: 'break-word' }}>
                {value}
                {children}
            </Typography>
        </Box>
    </Box>
);

const DashboardNotificationDetailPage = () => {
    const { notificationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const varToken = useAuthHeader();

    const [notification, setNotification] = useState(location.state?.notification || null);
    const [loading, setLoading] = useState(!location.state?.notification);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (notificationId && !notification) {
            fetchNotificationDetails();
        }
    }, [notificationId]);

    const fetchNotificationDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/notifications/${notificationId}`, {
                headers: { Authorization: varToken },
            });
            setNotification(response.data);
        } catch (error) {
            console.error("Failed to fetch notification details:", error);
            setNotification(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await apiClient.delete(`/api/notifications/${notificationId}`, {
                headers: { Authorization: varToken },
            });
            if (response.status === 200) {
                toast.success(response.data.message, { position: 'bottom-right', transition: Zoom });
                navigate("/Dashboard/Notifications");
            }
        } catch (error) {
            toast.error('Failed to delete notification', { position: 'bottom-right', transition: Zoom });
        } finally {
            setDeleteModalOpen(false);
        }
    };

    const handleBack = () => navigate("/Dashboard/Notifications");

    if (loading) {
        return (
            <Container sx={{ py: 3 }}>
                <Skeleton variant="text" width={250} height={50} />
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rectangular" width="100%" height={300} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rectangular" width="100%" height={200} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (!notification) {
        return (
            <Container sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">Notification Not Found</Typography>
                <Typography>The notification details could not be loaded.</Typography>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }} variant="contained">
                    Back to Notifications
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Notification Details
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => setDeleteModalOpen(true)}>
                        Delete
                    </Button>
                    <Button startIcon={<ArrowBack />} onClick={handleBack} variant="outlined">
                        Back to List
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: '100%' }} variant="outlined">
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {notification.notificationTitle}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography
                            variant="body1"
                            component="p"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6,
                                color: 'text.secondary',
                            }}
                        >
                            {notification.notificationContent}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }} variant="outlined">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Metadata
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <DetailItem
                            icon={<Person sx={{ mr: 1.5, color: 'text.secondary' }} />}
                            label="Sender"
                            value={notification.userName || 'Unknown'}
                        />
                        <DetailItem
                            icon={<CalendarToday sx={{ mr: 1.5, color: 'text.secondary' }} />}
                            label="Created At"
                            value={new Date(notification.createdAt).toLocaleString()}
                        />
                        <DetailItem
                            icon={<EditNote sx={{ mr: 1.5, color: 'text.secondary' }} />}
                            label="Status"
                        >
                            <Chip
                                label={notification.notificationDraft ? "Draft" : "Published"}
                                color={notification.notificationDraft ? "warning" : "success"}
                                size="small"
                                variant="outlined"
                            />
                        </DetailItem>
                    </Paper>
                </Grid>
            </Grid>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                name={notification?.notificationTitle || "this notification"}
            />
        </Container>
    );
};

export default DashboardNotificationDetailPage;