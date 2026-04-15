import React, { useState, useEffect } from "react";
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Button,
    Avatar,
    Skeleton,
    Chip,
    Divider,
} from "@mui/material";
import {
    ArrowBack,
    Person,
    Email,
    Phone,
    Home,
    AdminPanelSettings,
    Badge,
    CheckCircle,
    Cancel,
    CalendarToday,
    Update,
    CreditCard
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

// Helper for displaying details consistently
const DetailItem = ({ icon, label, value, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Box>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {value}
                {children}
            </Typography>
        </Box>
    </Box>
);

const DashboardAccountDetailPage = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId } = useParams();
    const navigate = useNavigate();
    const varToken = useAuthHeader();

    useEffect(() => {
        if (userId) {
            fetchAccountDetails();
        }
    }, [userId]);

    const fetchAccountDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/admin/${userId}`, {
                headers: { Authorization: varToken },
            });
            setAccount(response.data);
        } catch (error) {
            console.error("Failed to fetch account details:", error);
            setAccount(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate("/Dashboard/Accounts");

    const getRoleChip = (role) => {
        if (!role) return null;
        let color, icon;
        switch (role.toUpperCase()) {
            case "ADMIN": color = "error"; icon = <AdminPanelSettings />; break;
            case "STAFF": color = "warning"; icon = <Badge />; break;
            case "CUSTOMER": color = "success"; icon = <Person />; break;
            default: color = "default";
        }
        return <Chip label={role} color={color} icon={icon} size="small" />;
    };

    if (loading) {
        return (
            <Container sx={{ py: 3 }}>
                <Skeleton variant="text" width={200} height={50} />
                <Paper sx={{ p: 3, mt: 2 }} variant="outlined">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Skeleton variant="circular" width={150} height={150} />
                            <Skeleton variant="text" width="80%" height={40} sx={{ mt: 2 }} />
                            <Skeleton variant="text" width="60%" height={30} />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="rectangular" width="100%" height={250} />
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        );
    }

    if (!account) {
        return (
            <Container sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">Account Not Found</Typography>
                <Typography>The account details could not be loaded. Please try again.</Typography>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }} variant="contained">
                    Back to Accounts
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Account Details
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={handleBack} variant="outlined">
                    Back to Accounts List
                </Button>
            </Box>

            <Paper sx={{ p: 3 }} variant="outlined">
                <Grid container spacing={4}>
                    {/* Left Column: Avatar and Basic Info */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={account.userImage}
                            alt={account.userUsername}
                            sx={{ width: 150, height: 150, mb: 2, mx: 'auto', border: '3px solid', borderColor: 'divider' }}
                        />
                        <Typography variant="h5" fontWeight="bold">{account.userUsername}</Typography>
                        <Typography variant="body1" color="text.secondary">{account.userEmail}</Typography>
                        <Box sx={{ mt: 2 }}>
                            {getRoleChip(account.role.roleName)}
                        </Box>
                    </Grid>

                    {/* Right Column: Detailed Information */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>User Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={<Badge sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Full Name" value={account.userFullname} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={<Phone sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Phone Number" value={account.userPhone || "Not Provided"} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={<Home sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Address" value={account.userAddress || "Not Provided"} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={<CreditCard sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Current Payment" value={account.userCurrentPaymentMethod || "Not Set"} />
                            </Grid>
                        </Grid>

                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>System Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={account.isUserEnabled ? <CheckCircle sx={{ mr: 1.5, color: 'success.main' }} /> : <Cancel sx={{ mr: 1.5, color: 'error.main' }} />} label="Status">
                                    <Chip
                                        label={account.isUserEnabled ? "Enabled" : "Disabled"}
                                        color={account.isUserEnabled ? "success" : "error"}
                                        size="small"
                                        variant="outlined"
                                    />
                                </DetailItem>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={<CalendarToday sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Created At" value={new Date(account.userCreatedAt).toLocaleString()} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DetailItem icon={<Update sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Last Updated" value={new Date(account.userUpdatedAt).toLocaleString()} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default DashboardAccountDetailPage;