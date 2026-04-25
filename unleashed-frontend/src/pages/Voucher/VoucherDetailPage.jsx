import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, CircularProgress, Paper, Typography, Button, Divider } from "@mui/material";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { apiClient } from '../../core/api';
import { formatPrice } from "../../components/format/formats";

const VoucherDetailPage = () => {
    const { voucherId } = useParams();
    const [voucherDetail, setVoucherDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const authHeader = useAuthHeader();

    useEffect(() => {
        const fetchVoucherDetail = async () => {
            if (!voucherId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/api/vouchers/me/${voucherId}`, {
                    headers: { Authorization: authHeader }
                });
                setVoucherDetail(response.data);
            } catch (err) {
                setError("Failed to load voucher details or voucher not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchVoucherDetail();
    }, [voucherId, authHeader]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !voucherDetail) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">{error || "Voucher not found"}</Typography>
                <Button component={Link} to="/user/vouchers" variant="contained" sx={{ mt: 2 }}>
                    ← Back to My Vouchers
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '800px', margin: 'auto' }}>
            <Button component={Link} to="/user/vouchers" sx={{ mb: 2 }}>
                ← Back to My Vouchers
            </Button>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
                    {voucherDetail.voucherCode}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {voucherDetail.voucherDescription || 'No description available.'}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
                    <InfoItem label="Type" value={voucherDetail.voucherTypeName} />
                    <InfoItem label="Status" value={voucherDetail.voucherStatusName} />
                    <InfoItem
                        label="Value"
                        value={voucherDetail.voucherTypeName === "PERCENTAGE"
                            ? `${voucherDetail.voucherValue}%`
                            : formatPrice(voucherDetail.voucherValue)}
                    />
                    <InfoItem label="Usage Limit" value={`${voucherDetail.usageCount} / ${voucherDetail.usageLimit}`} />
                    {voucherDetail.minimumOrderValue > 0 &&
                        <InfoItem label="Minimum Order" value={formatPrice(voucherDetail.minimumOrderValue)} />
                    }
                    {voucherDetail.maximumVoucherValue > 0 &&
                        <InfoItem label="Maximum Voucher" value={formatPrice(voucherDetail.maximumVoucherValue)} />
                    }
                    <InfoItem label="Start Date" value={new Date(voucherDetail.startDate).toLocaleString()} />
                    <InfoItem label="End Date" value={new Date(voucherDetail.endDate).toLocaleString()} />
                </Box>
            </Paper>
        </Box>
    );
};

const InfoItem = ({ label, value }) => (
    <Box>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">{label}</Typography>
        <Typography variant="body1">{value}</Typography>
    </Box>
);

export default VoucherDetailPage;