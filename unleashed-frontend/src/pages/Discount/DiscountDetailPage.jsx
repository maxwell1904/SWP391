import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, CircularProgress, Paper, Typography, Button, Divider } from "@mui/material";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { apiClient } from '../../core/api';
import { formatPrice } from "../../components/format/formats";

const DiscountDetailPage = () => {
    const { discountId } = useParams();
    const [discountDetail, setDiscountDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const authHeader = useAuthHeader();

    useEffect(() => {
        const fetchDiscountDetail = async () => {
            if (!discountId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(`/api/discounts/me/${discountId}`, {
                    headers: { Authorization: authHeader }
                });
                setDiscountDetail(response.data);
            } catch (err) {
                setError("Failed to load voucher details or voucher not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchDiscountDetail();
    }, [discountId, authHeader]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !discountDetail) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">{error || "Voucher not found"}</Typography>
                <Button component={Link} to="/user/discounts" variant="contained" sx={{ mt: 2 }}>
                    ← Back to My Vouchers
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '800px', margin: 'auto' }}>
            <Button component={Link} to="/user/discounts" sx={{ mb: 2 }}>
                ← Back to My Vouchers
            </Button>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
                    {discountDetail.discountCode}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {discountDetail.discountDescription || 'No description available.'}
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2 }}>
                    <InfoItem label="Type" value={discountDetail.discountTypeName} />
                    <InfoItem label="Status" value={discountDetail.discountStatusName} />
                    <InfoItem
                        label="Value"
                        value={discountDetail.discountTypeName === "PERCENTAGE"
                            ? `${discountDetail.discountValue}%`
                            : formatPrice(discountDetail.discountValue)}
                    />
                    <InfoItem label="Usage Limit" value={`${discountDetail.usageCount} / ${discountDetail.usageLimit}`} />
                    {discountDetail.minimumOrderValue > 0 &&
                        <InfoItem label="Minimum Order" value={formatPrice(discountDetail.minimumOrderValue)} />
                    }
                    {discountDetail.maximumDiscountValue > 0 &&
                        <InfoItem label="Maximum Discount" value={formatPrice(discountDetail.maximumDiscountValue)} />
                    }
                    <InfoItem label="Start Date" value={new Date(discountDetail.startDate).toLocaleString()} />
                    <InfoItem label="End Date" value={new Date(discountDetail.endDate).toLocaleString()} />
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

export default DiscountDetailPage;