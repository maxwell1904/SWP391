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
  Grid,
  Chip,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import CustomizedSteppers from "../../components/inputs/StepperCommon";
import { formatPrice } from "../../components/format/formats";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import {
  confirmOrder,
  getOrderById,
  returnOrder,
} from "../../service/OrderSevice";
import { cancelOrder } from "../../service/CheckoutService";
import ReviewModal from "../../components/modals/Review";
import { postReview } from "../../service/ReviewService";
import { toast } from "react-toastify";

const formatDisplayDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
};

const formatDisplayDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
};

const getStatusChip = (status) => {
  const normalizedStatus = (status || "").toUpperCase();
  let color = "primary";

  switch (normalizedStatus) {
    case "PENDING":
      color = "warning";
      break;
    case "PROCESSING":
      color = "secondary";
      break;
    case "SHIPPING":
      color = "info";
      break;
    case "COMPLETED":
      color = "success";
      break;
    case "CANCELLED":
    case "DENIED":
      color = "error";
      break;
    case "RETURNING":
    case "INSPECTION":
    case "RETURNED":
      color = "default";
      break;
    default:
      color = "primary";
  }

  return <Chip label={status || "N/A"} color={color} size="small" />;
};

const DetailField = ({ label, value, children }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {label}
    </Typography>
    {children !== undefined ? (
      <Box>{children}</Box>
    ) : (
      <Typography
        variant="body1"
        sx={{ fontWeight: 500, wordBreak: "break-word" }}
      >
        {value ?? "N/A"}
      </Typography>
    )}
  </Box>
);

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
      setOrderStatus("COMPLETED");
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
      setOrderStatus("RETURNING");
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
      customerUserId: order.customerUserId,
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

  const orderItems = order.orderDetails || [];
  const totalProductPrice = orderItems.reduce((acc, item) => {
    return (
      acc +
      (item.unitPrice || 0) * (item.orderQuantity || 0) -
      (item.discountAmount || 0)
    );
  }, 0);

  const discountTotal = orderItems.reduce(
    (acc, item) => acc + (item.discountAmount || 0),
    0,
  );

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

      <Card
        sx={{
          p: 3,
          mb: 3,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontFamily: "Poppins", fontWeight: "bold", mb: 2 }}
        >
          Order Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <DetailField label="Order ID" value={order.orderId} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField
              label="Tracking Number"
              value={order.orderTrackingNumber || order.trackingNumber}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField label="Status">
              {getStatusChip(orderStatus)}
            </DetailField>
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField
              label="Order Date"
              value={formatDisplayDateTime(order.orderDate)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField label="Customer" value={order.customerUsername} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField label="Customer ID" value={order.customerUserId} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField
              label="Total Quantity"
              value={order.totalOrderQuantity}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField label="Payment Method" value={order.paymentMethod} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField label="Shipping Method" value={order.shippingMethod} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DetailField
              label="Expected Delivery"
              value={formatDisplayDate(order.expectedDeliveryDate)}
            />
          </Grid>
          <Grid item xs={12}>
            <DetailField label="Billing Address" value={order.billingAddress} />
          </Grid>
          <Grid item xs={12}>
            <DetailField
              label="Transaction Reference"
              value={order.transactionReference}
            />
          </Grid>
          {order.notes && (
            <Grid item xs={12}>
              <DetailField label="Order Notes" value={order.notes} />
            </Grid>
          )}
        </Grid>
      </Card>

      <div className="order-summary">
        {orderItems.map((item, index) => (
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
              <a
                href={`/shop/product/${item.productId}`}
                style={{ display: "block" }}
              >
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
                    {formatPrice(
                      (item.unitPrice || 0) * (item.orderQuantity || 0) -
                        (item.discountAmount || 0),
                    )}
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
                        item,
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
            Products Total:
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "Poppins" }}>
            {formatPrice(totalProductPrice)}
          </Typography>
        </Box>
        {discountTotal > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
            >
              Discount:
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: "Poppins" }}>
              - {formatPrice(discountTotal)}
            </Typography>
          </Box>
        )}
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
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
        >
          {orderStatus === "SHIPPING" && (
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirmOrder}
              sx={{
                textTransform: "none",
                borderRadius: 30,
                fontFamily: "Poppins",
              }}
            >
              Confirm Receipt
            </Button>
          )}
          {(orderStatus === "PENDING" || orderStatus === "PROCESSING") && (
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelOrder}
              sx={{
                textTransform: "none",
                borderRadius: 30,
                fontFamily: "Poppins",
              }}
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
