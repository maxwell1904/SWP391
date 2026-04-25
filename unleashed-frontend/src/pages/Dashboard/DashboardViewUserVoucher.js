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

const DashboardViewUserVoucher = () => {
    const { voucherId } = useParams();
    const varToken = useAuthHeader();

    const [voucher, setVoucher] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVoucherData = async () => {
        setLoading(true);
        try {
            const voucherPromise = apiClient.get(`/api/vouchers/${voucherId}`, { headers: { Authorization: varToken } });
            const usersPromise = apiClient.get(`/api/vouchers/${voucherId}/users`, { headers: { Authorization: varToken } });

            const [voucherResponse, usersResponse] = await Promise.all([voucherPromise, usersPromise]);

            setVoucher(voucherResponse.data);
            setAssignedUsers(usersResponse.data.users || []);

        } catch (error) {
            toast.error("Failed to fetch voucher data.");
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVoucherData();
    }, [voucherId, varToken]);

    const handleRemoveUser = async (userId) => {
        try {
            await apiClient.delete(`/api/vouchers/${voucherId}/users?userId=${userId}`, {
                headers: { Authorization: varToken },
            });
            setAssignedUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
            toast.success("User removed from voucher successfully.", { position: "bottom-right", transition: Zoom });
        } catch (error) {
            console.error("Error removing user:", error);
            toast.error("Failed to remove user from voucher.", { position: "bottom-right", transition: Zoom });
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!voucher) {
        return (
            <Container>
                <Alert severity="error">Voucher details could not be loaded.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Voucher Details
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Code: <strong>{voucher.voucherCode}</strong>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr 1fr' }, gap: 2 }}>
                    <InfoItem label="Type" value={voucher.voucherTypeName} />
                    <InfoItem label="Status" value={voucher.voucherStatusName} />
                    <InfoItem label="Rank Requirement" value={voucher.rankName} />
                    <InfoItem
                        label="Value"
                        value={voucher.voucherTypeName === 'PERCENTAGE' ? `${voucher.voucherValue}%` : formatPrice(voucher.voucherValue)}
                    />
                    <InfoItem label="Usage" value={`${voucher.usageCount} / ${voucher.usageLimit}`} />
                    <InfoItem label="Start Date" value={new Date(voucher.startDate).toLocaleString()} />
                    <InfoItem label="End Date" value={new Date(voucher.endDate).toLocaleString()} />
                    {voucher.minimumOrderValue > 0 && <InfoItem label="Min. Order Value" value={formatPrice(voucher.minimumOrderValue)} />}
                    {voucher.maximumVoucherValue > 0 && <InfoItem label="Max. Voucher Value" value={formatPrice(voucher.maximumVoucherValue)} />}
                </Box>
                {voucher.voucherDescription && <InfoItem label="Description" value={voucher.voucherDescription} sx={{ mt: 2 }} />}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                    Assigned Users ({assignedUsers.length})
                </Typography>
                <Button
                    component={Link}
                    to={`/Dashboard/Vouchers/${voucherId}/Assign`}
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
                                        <Tooltip title="Remove user from voucher">
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
                                    No users are assigned to this voucher yet.
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

export default DashboardViewUserVoucher;