import React, { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Grid, Divider, Box, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, Skeleton, Stack
} from "@mui/material";
import {
    ArrowBack, Home, Payment, LocalShipping, TrackChanges, DateRange, Person, Group,
    Receipt, Notes, CalendarToday, CheckCircle, Cancel, ContentPasteSearch
} from "@mui/icons-material";
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import { FaBarcode } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { formatPrice } from "../../components/format/formats";

const getStatusChip = (status) => {
    if (!status) return null;
    let color;
    switch (status.toUpperCase()) {
        case 'PENDING': color = 'warning'; break;
        case 'PROCESSING': color = 'secondary'; break;
        case 'COMPLETED': color = 'success'; break;
        case 'SHIPPED': color = 'info'; break;
        case 'CANCELLED': case 'DENIED': color = 'error'; break;
        case 'RETURNING': case 'INSPECTION': case 'RETURNED': color = 'default'; break;
        default: color = 'primary';
    }
    return <Chip label={status} color={color} size="small" />;
};

const DetailItem = ({ icon, label, value, children }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        {icon}
        <Typography variant="body2" sx={{ minWidth: '150px', color: 'text.secondary' }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "medium" }}>
            {value}
            {children}
        </Typography>
    </Box>
);

const DashboardOrderDetailPage = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const varToken = useAuthHeader();
    const authUser = useAuthUser();

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/orders/${orderId}`, {
                headers: { Authorization: varToken },
            });
            setOrderDetails(response.data);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
            setOrderDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (url, data) => {
        apiClient
            .put(url, data, { headers: { Authorization: varToken } })
            .then(() => fetchOrderDetails())
            .catch((error) => console.error('Error performing action:', error));
    };

    const handleReview = (orderId, isApproved) => {
        handleAction(`/api/orders/${orderId}/staff-review`, {
            isApproved,
            staffName: authUser.username,
        });
    };

    const handleInspectOrder = (orderId) => {
        handleAction(`/api/orders/${orderId}/inspect`, {});
    };

    const handleReturnOrder = (orderId) => {
        handleAction(`/api/orders/${orderId}/returned`, {});
    };

    const renderOrderActions = (order) => {
        if (!order) return null;
        switch (order.orderStatus.toUpperCase()) {
            case 'PENDING':
                return (
                    <Stack direction="row" spacing={1}>
                        <Button variant='contained' color='success' size='small' onClick={() => handleReview(order.orderId, true)} startIcon={<CheckCircle />}>Approve</Button>
                        <Button variant='contained' color='error' size='small' onClick={() => handleReview(order.orderId, false)} startIcon={<Cancel />}>Reject</Button>
                    </Stack>
                );
            case 'PROCESSING':
                return <Button variant='contained' color='success' size='small' onClick={() => handleReview(order.orderId, true)} startIcon={<CheckCircle />}>Approve Ship</Button>;
            case 'RETURNING':
                return <Button variant='contained' color='info' size='small' onClick={() => handleInspectOrder(order.orderId)} startIcon={<ContentPasteSearch />}>Inspect</Button>;
            case 'INSPECTION':
                return <Button variant='contained' color='warning' size='small' onClick={() => handleReturnOrder(order.id)} startIcon={<KeyboardReturnOutlinedIcon />}>Returned</Button>;
            default:
                return null;
        }
    };

    const handleBack = () => navigate("/Dashboard/Orders");

    if (loading) {
        return (
            <Container sx={{ py: 3 }}>
                <Skeleton variant="text" width={150} height={40} />
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ my: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
            </Container>
        )
    }

    if (!orderDetails) {
        return (
            <Container sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error.main">Order Not Found</Typography>
                <Typography>The order details could not be loaded.</Typography>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }} variant="contained">
                    Back to Orders
                </Button>
            </Container>
        )
    }

    return (
        <Container sx={{ py: 3 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold">
                    Order #{orderDetails.orderId}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Details for the selected order
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, mb: 2, gap: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    {renderOrderActions(orderDetails)}
                    <Button startIcon={<ArrowBack />} onClick={handleBack} variant="outlined">
                        Back to Orders
                    </Button>
                </Stack>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <DetailItem icon={<Receipt sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Order ID:">{orderDetails.orderId}</DetailItem>
                        <DetailItem icon={<DateRange sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Order Date:">{new Date(orderDetails.orderDate).toLocaleString()}</DetailItem>
                        <DetailItem icon={<TrackChanges sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Order Status:">{getStatusChip(orderDetails.orderStatus)}</DetailItem>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <DetailItem icon={<Person sx={{ mr: 1.5, color: 'success.main' }} />} label="Customer:">{orderDetails.customerUsername}</DetailItem>
                        <DetailItem icon={<Group sx={{ mr: 1.5, color: 'warning.main' }} />} label="Assigned Staff:">{orderDetails.staffUsername || 'N/A'}</DetailItem>
                        <DetailItem icon={<Home sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Billing Address:">{orderDetails.billingAddress}</DetailItem>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <DetailItem icon={<LocalShipping sx={{ mr: 1.5, color: 'info.main' }} />} label="Shipping Method:">{orderDetails.shippingMethod}</DetailItem>
                        <DetailItem icon={<Payment sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Payment Method:">{orderDetails.paymentMethod}</DetailItem>
                        <DetailItem icon={<CalendarToday sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Expected Delivery:">{orderDetails.expectedDeliveryDate ? new Date(orderDetails.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</DetailItem>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <DetailItem icon={<FaBarcode style={{ marginRight: "12px", color: 'text.secondary' }} size="1.25em" />} label="Transaction Ref:">{orderDetails.transactionReference || "N/A"}</DetailItem>
                        {orderDetails.notes && (<DetailItem icon={<Notes sx={{ mr: 1.5, color: 'text.secondary' }} />} label="Notes:">{orderDetails.notes}</DetailItem>)}
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3 }} variant="outlined">
                <Typography variant="h6" fontWeight="bold" gutterBottom>Order Items ({orderDetails.totalOrderQuantity || 0})</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold' } }}>
                                <TableCell>Product</TableCell>
                                <TableCell align="right">Unit Price</TableCell>
                                <TableCell align="center">Quantity</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderDetails.orderDetails.map((item, index) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar variant="rounded" src={item.productImage} sx={{ mr: 2, width: 56, height: 56, backgroundColor: '#f5f5f5' }}><Receipt /></Avatar>
                                            <Box>
                                                <Typography variant="body1" fontWeight="medium">{item.productName}</Typography>
                                                <Typography variant="body2" color="text.secondary">Color: {item.color || "N/A"}, Size: {item.size || "N/A"}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{formatPrice(item.unitPrice)}</TableCell>
                                    <TableCell align="center">{item.orderQuantity}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'medium' }}>{formatPrice(item.unitPrice * item.orderQuantity)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ minWidth: 300 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography color="text.secondary">Subtotal</Typography><Typography fontWeight="medium">{formatPrice(orderDetails.totalAmount)}</Typography></Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography color="text.secondary">Shipping</Typography><Typography fontWeight="medium">{formatPrice(0)}</Typography></Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" fontWeight="bold">Total</Typography><Typography variant="h6" fontWeight="bold">{formatPrice(orderDetails.totalAmount)}</Typography></Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default DashboardOrderDetailPage;