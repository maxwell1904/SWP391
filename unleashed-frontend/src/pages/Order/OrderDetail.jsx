import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    Card,
    Typography,
    Box,
    Divider,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import CustomizedSteppers from "../../components/inputs/StepperCommon";
import { formatPrice } from "../../components/format/formats";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { confirmOrder, getOrderById, returnOrder } from "../../service/OrderSevice";
import { cancelOrder } from "../../service/CheckoutService";
import ReviewModal from "../../components/modals/Review";
import { postReview } from "../../service/ReviewService";
import { toast } from "react-toastify";

function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState("");
    const authHeader = useAuthHeader();
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);
    const fetchOnce = useRef(false);

    const handleClickBack = () => {
        navigate("/user/orders");
    };

    const fetchOrder = async () => {
        try {
            setIsLoading(true);
            const response = await getOrderById(orderId, authHeader);
            setOrder(response.data);
            setOrderStatus(response.data.orderStatus);
        } catch (error) {
            console.error("Error fetching order details:", error);
            if (error.response?.status === 403) {
                toast.warning("You don't have permission to access this order!");
            } else if (error.response?.status === 404) {
                toast.error("Order not found!");
            } else {
                toast.error("You don't have permission to access this order!");
            }
            navigate("/user/orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (fetchOnce.current) return;
        fetchOnce.current = true;
        fetchOrder();
    }, [orderId, authHeader, navigate]);


    const handleConfirmOrder = async () => {
        try {
            await confirmOrder(orderId, authHeader);
            setOrderStatus('COMPLETED');
            const updatedOrder = await getOrderById(orderId, authHeader);
            setOrder(updatedOrder.data);
        } catch (error) {
            console.error("Error confirming order:", error);
            toast.error("Failed to confirm order. Please try again.");
        }
    };

    const handleCancelOrder = async () => {
        try {
            await cancelOrder(orderId, authHeader);
            setOrderStatus("CANCELLED");
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast.error("Failed to cancel order. Please try again.");
        }
    };

    const handleReturnOrder = async () => {
        try {
            await returnOrder(orderId, authHeader);
            setOrderStatus('RETURNING');
            const updatedOrder = await getOrderById(orderId, authHeader);
            setOrder(updatedOrder.data);
        } catch (error) {
            console.error("Error returning order:", error);
            toast.error("Failed to request return. Please try again.");
        }
    };

    const handleAddReview = (productId, name, image, item) => {
        setSelectedProduct(productId);
        setSelectedProductDetails({
            productName: name,
            productImage: image,
            variationSingleId: item.variationSingleId,
            customerUserId: order.customerUserId
        });
        setOpenReviewModal(true);
    };

    const handleCloseReviewModal = () => {
        setOpenReviewModal(false);
    };

    const handleSubmitReview = async (productId, reviewDataFromModal) => {
        const reviewPayload = {
            productId: productId,
            reviewComment: reviewDataFromModal.reviewComment,
            reviewRating: reviewDataFromModal.reviewRating,
            userId: reviewDataFromModal.userId,
            orderId: order.orderId,
        };

        try {
            await postReview(reviewPayload, authHeader); // <-- FIXED FUNCTION CALL
            toast.success("Your review has been submitted!");
            handleCloseReviewModal();
            fetchOrder(); // Refetch all order data to show the updated "hasReviewed" status
        } catch (error) {
            // Error toast is already handled in the service
            console.error("Error submitting review:", error);
        }
    };


    if (isLoading) {
        return (
            <Backdrop
                sx={(theme) => ({ color: "#8f8f8f", zIndex: theme.zIndex.drawer + 1 })}
                open={true}
            >
                <CircularProgress />
            </Backdrop>
        );
    }

    if (!order) {
        return <div>Error loading order details. Please try again.</div>;
    }

    const statusMapping = {
        PENDING: 0,
        PROCESSING: 1,
        SHIPPING: 2,
        COMPLETED: 3,
        CANCELLED: 4,
        RETURNED: 5,
        DENIED: 6,
        RETURNING: 7,
        INSPECTION: 8,
    };

    const statusStep = statusMapping[orderStatus] || 0;

    const totalProductPrice = order.orderDetails.reduce((acc, item) => {
        return acc + (item.unitPrice || 0) * (item.orderQuantity || 0) - (item.discountAmount || 0);
    }, 0);

    const shippingCost = (order.totalAmount || 0) - totalProductPrice;

    return (
        <div className="px-5 py-5 font-poppins">
            <div className="pb-5">
                <Button
                    onClick={handleClickBack}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: "bold",
                        textTransform: "none",
                    }}
                >
                    <FaArrowLeft className="text-2xl text-black" />
                    <p className="text-black">Back to Orders</p>
                </Button>
            </div>

            <Card
                sx={{
                    p: 3,
                    mb: 3,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    borderRadius: "12px",
                }}
            >
                <Typography
                    variant="h4"
                    sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
                >
                    Order Details - {order?.trackingNumber}
                </Typography>
                <Box sx={{ py: 3 }}>
                    <CustomizedSteppers status={statusStep} />
                </Box>
            </Card>

            <div className="order-summary">
                {order.orderDetails.map((item, index) => (
                    <Card
                        key={index}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 3,
                            mb: 3,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            borderRadius: "12px",
                            backgroundColor: "#f9f9f9",
                        }}
                    >
                        <Box sx={{ marginRight: "20px" }}>
                            <a href={`/shop/product/${item.productId}`} style={{ display: "block" }}>
                                <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    style={{
                                        width: 120,
                                        height: 120,
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                />
                            </a>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{ fontFamily: "Calibri", fontWeight: "bold", mb: 1 }}
                            >
                                {item.productName}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: "Poppins",
                                        color: "gray",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                  <span style={{ fontWeight: "bold", marginRight: "5px" }}>
                    Color:
                  </span>{" "}
                                    {item.color}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: "Poppins",
                                        color: "gray",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                  <span style={{ fontWeight: "bold", marginRight: "5px" }}>
                    Size:
                  </span>{" "}
                                    {item.size}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1, backgroundColor: "#e0e0e0" }} />
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontFamily: "Poppins", fontWeight: "medium" }}
                                    >
                                        <span style={{ fontWeight: "bold" }}>Unit Price:</span>{" "}
                                        {formatPrice(item.unitPrice)}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontFamily: "Poppins", fontWeight: "medium" }}
                                    >
                                        <span style={{ fontWeight: "bold" }}>Quantity:</span>{" "}
                                        {item.orderQuantity}
                                    </Typography>
                                </Box>

                                <Box>
                                    {item.discountAmount > 0 && (
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontFamily: "Poppins",
                                                fontWeight: "medium",
                                                color: "green",
                                            }}
                                        >
                                            <span style={{ fontWeight: "bold" }}>Discount:</span> -{" "}
                                            {formatPrice(item.discountAmount)}
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontFamily: "Poppins",
                                            fontWeight: "bold",
                                            color: "#1976d2",
                                        }}
                                    >
                                        <span style={{ fontWeight: "bold" }}>Total Price:</span>{" "}
                                        {formatPrice((item.unitPrice || 0) * (item.orderQuantity || 0) - (item.discountAmount || 0))}
                                    </Typography>
                                </Box>
                            </Box>
                            {orderStatus === "COMPLETED" && !item.hasReviewed && (
                                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() =>
                                            handleAddReview(
                                                item.productId,
                                                item.productName,
                                                item.productImage,
                                                item
                                            )
                                        }
                                        sx={{
                                            textTransform: "none",
                                            fontFamily: "Montserrat",
                                            borderRadius: "30px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Add Review
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Card>
                ))}
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
                    >
                        Shipping Fee:
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "Poppins" }}>
                        {formatPrice(shippingCost)}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
                    >
                        Total:
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: "Poppins" }}>
                        {formatPrice(order.totalAmount)}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    {orderStatus === 'SHIPPING' && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleConfirmOrder}
                            sx={{ textTransform: 'none', borderRadius: 30, fontFamily: 'Poppins' }}
                        >
                            Confirm Receipt
                        </Button>
                    )}
                    {(orderStatus === 'PENDING' || orderStatus === 'PROCESSING') && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleCancelOrder}
                            sx={{ textTransform: 'none', borderRadius: 30, fontFamily: 'Poppins' }}
                        >
                            Cancel Order
                        </Button>
                    )}
                    {/*{(orderStatus === 'SHIPPING' || orderStatus === 'COMPLETED') && (*/}
                    {/*    <Button*/}
                    {/*        variant="contained"*/}
                    {/*        color="warning"*/}
                    {/*        onClick={handleReturnOrder}*/}
                    {/*        sx={{ textTransform: 'none', borderRadius: 30, fontFamily: 'Poppins' }}*/}
                    {/*    >*/}
                    {/*        Return Order*/}
                    {/*    </Button>*/}
                    {/*)}*/}
                </Box>
            </div>
            <ReviewModal
                open={openReviewModal}
                handleClose={handleCloseReviewModal}
                productId={selectedProduct}
                name={selectedProductDetails?.productName}
                image={selectedProductDetails?.productImage}
                variationSingleId={selectedProductDetails?.variationSingleId}
                userId={selectedProductDetails?.customerUserId}
                orderId={order.orderId}
                handleSubmitReview={handleSubmitReview}
            />
        </div>
    );
}

export default OrderDetail;