import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../core/api";
import { toast, Zoom } from "react-toastify";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { formatPrice } from "../../components/format/formats";
import {
    Container, Typography, Paper, Box, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, IconButton, Alert
} from '@mui/material';
import { PersonAdd, Delete } from "@mui/icons-material";

const DashboardViewUserDiscount = () => {
    const { discountId } = useParams();
    const varToken = useAuthHeader();

    const [discount, setDiscount] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDiscountData = async () => {
        setLoading(true);
        try {
            const discountPromise = apiClient.get(`/api/discounts/${discountId}`, { headers: { Authorization: varToken } });
            const usersPromise = apiClient.get(`/api/discounts/${discountId}/users`, { headers: { Authorization: varToken } });

            const [discountResponse, usersResponse] = await Promise.all([discountPromise, usersPromise]);

            setDiscount(discountResponse.data);
            setAssignedUsers(usersResponse.data.users || []);

        } catch (error) {
            toast.error("Failed to fetch discount data.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscountData();
    }, [discountId, varToken]);

    const handleRemoveUser = async (userId) => {
        try {
            await apiClient.delete(`/api/discounts/${discountId}/users?userId=${userId}`, {
                headers: { Authorization: varToken },
            });
            setAssignedUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
            toast.success("User removed from discount successfully.", { position: "bottom-right", transition: Zoom });
        } catch (error) {
            console.error("Error removing user:", error);
            toast.error("Failed to remove user from discount.", { position: "bottom-right", transition: Zoom });
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!discount) {
        return (
            <Container>
                <Alert severity="error">Discount details could not be loaded.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Discount Details
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Code: <strong>{discount.discountCode}</strong>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr 1fr' }, gap: 2 }}>
                    <InfoItem label="Type" value={discount.discountTypeName} />
                    <InfoItem label="Status" value={discount.discountStatusName} />
                    <InfoItem label="Rank Requirement" value={discount.rankName} />
                    <InfoItem
                        label="Value"
                        value={discount.discountTypeName === 'PERCENTAGE' ? `${discount.discountValue}%` : formatPrice(discount.discountValue)}
                    />
                    <InfoItem label="Usage" value={`${discount.usageCount} / ${discount.usageLimit}`} />
                    <InfoItem label="Start Date" value={new Date(discount.startDate).toLocaleString()} />
                    <InfoItem label="End Date" value={new Date(discount.endDate).toLocaleString()} />
                    {discount.minimumOrderValue > 0 && <InfoItem label="Min. Order Value" value={formatPrice(discount.minimumOrderValue)} />}
                    {discount.maximumDiscountValue > 0 && <InfoItem label="Max. Discount Value" value={formatPrice(discount.maximumDiscountValue)} />}
                </Box>
                {discount.discountDescription && <InfoItem label="Description" value={discount.discountDescription} sx={{ mt: 2 }} />}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                    Assigned Users ({assignedUsers.length})
                </Typography>
                <Button
                    component={Link}
                    to={`/Dashboard/Discounts/${discountId}/Assign`}
                    variant="contained"
                    startIcon={<PersonAdd />}
                >
                    Add / Assign Users
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignedUsers.length > 0 ? (
                            assignedUsers.map((user) => (
                                <TableRow key={user.userId} hover>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Remove user from discount">
                                            <IconButton color="error" onClick={() => handleRemoveUser(user.userId)}>
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No users are assigned to this discount yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

const InfoItem = ({ label, value, sx }) => (
    <Box sx={sx}>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">{label}</Typography>
        <Typography variant="body1">{value || 'N/A'}</Typography>
    </Box>
);

export default DashboardViewUserDiscount;