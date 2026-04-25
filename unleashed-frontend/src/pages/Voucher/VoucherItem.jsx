import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { formatPrice } from '../../components/format/formats';
import { toast, Zoom } from "react-toastify";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const VoucherCard = ({ voucherId, voucherCode, voucherValue, voucherTypeName, statusName, expiry, minimumOrderValue }) => {

    const handleCopyCode = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(voucherCode);
        toast.success("Voucher code copied!", {
            position: "bottom-center",
            transition: Zoom,
            autoClose: 2000
        });
    };

    const getStatusChipColor = () => {
        switch (statusName?.toUpperCase()) {
            case "ACTIVE": return "success";
            case "EXPIRED": return "error";
            default: return "default";
        }
    };

    return (
        <Link to={`/user/vouchers/${voucherId}`} style={{ textDecoration: 'none' }}>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    borderLeft: 5,
                    borderColor: getStatusChipColor() + '.main',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                    }
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {voucherTypeName === "PERCENTAGE" ? `${voucherValue}% OFF` : `${formatPrice(voucherValue)} OFF`}
                        </Typography>
                        <Chip label={statusName} color={getStatusChipColor()} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {minimumOrderValue > 0 ? `For orders over ${formatPrice(minimumOrderValue)}` : 'No minimum spend'}
                    </Typography>
                </Box>
                <Box>
                    <Paper
                        variant="outlined"
                        sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5' }}
                    >
                        <Typography variant="body1" fontWeight="medium" sx={{ letterSpacing: '0.5px' }}>
                            {voucherCode}
                        </Typography>
                        <ContentCopyIcon
                            fontSize="small"
                            sx={{ cursor: 'pointer', color: 'text.secondary' }}
                            onClick={handleCopyCode}
                        />
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                        Expires: {expiry}
                    </Typography>
                </Box>
            </Paper>
        </Link>
    );
};

export default VoucherCard;