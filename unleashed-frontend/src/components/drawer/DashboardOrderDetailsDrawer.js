import React, { useState, useEffect } from "react";
import {
  Drawer,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import {
  Close,
  Home,
  Payment,
  LocalShipping,
  TrackChanges,
  DateRange,
  Info,
  Person,
  Group,
} from "@mui/icons-material";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { formatPrice } from "../format/formats";
import { FaBarcode } from "react-icons/fa";
import ReviewStars from "../reviewStars/ReviewStars";

const getStatusColor = (status) => {
  const statusColors = {
    PENDING: "orange",
    PROCESSING: "purple",
    COMPLETED: "green",
    SHIPPED: "blue",
    CANCELLED: "red",
  };
  return statusColors[status] || "gray";
};

const DashboardOrderDetailsDrawer = ({ open, onClose, orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const varToken = useAuthHeader();

  useEffect(() => {
    if (orderId && open) {
      fetchOrderDetails();
    }
  }, [orderId, open]);

  const fetchOrderDetails = async () => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}`, {
        headers: { Authorization: varToken },
      });
      setOrderDetails(response.data);
    } catch {
      setOrderDetails(null);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 480, padding: 3, position: "relative" }}>
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 10, right: 10 }}>
          <Close />
        </IconButton>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          <Info sx={{ verticalAlign: "middle", mr: 1 }} /> Order ID: {orderDetails?.orderId || "Loading..."}
        </Typography>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          <Payment sx={{ verticalAlign: "middle", mr: 1 }} /> Total Amount: {formatPrice(orderDetails?.totalAmount || 0)}
        </Typography>

        <Typography color={getStatusColor(orderDetails?.orderStatus)} gutterBottom>
          <TrackChanges sx={{ verticalAlign: "middle", mr: 1 }} /> Order Status: {orderDetails?.orderStatus || "N/A"}
        </Typography>

        <Typography variant="body1" gutterBottom>
          <DateRange sx={{ verticalAlign: "middle", mr: 1 }} /> Order Date: {orderDetails?.orderDate ? new Date(orderDetails.orderDate).toLocaleString() : "N/A"}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" gutterBottom>
          <Home sx={{ verticalAlign: "middle", mr: 1 }} /> Billing Address: {orderDetails?.billingAddress || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: "green" }}>
          <Person sx={{ verticalAlign: "middle", mr: 1 }} /> Customer: {orderDetails?.customerUsername || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: "orange" }}>
          <Group sx={{ verticalAlign: "middle", mr: 1 }} /> Staff: {orderDetails?.staffUsername || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <LocalShipping sx={{ verticalAlign: "middle", mr: 1 }} /> Shipping Method: {orderDetails?.shippingMethod || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <Payment sx={{ verticalAlign: "middle", mr: 1 }} /> Payment Method: {orderDetails?.paymentMethod || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <TrackChanges sx={{ verticalAlign: "middle", mr: 1 }} /> Tracking Number: {orderDetails?.trackingNumber || "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <DateRange sx={{ verticalAlign: "middle", mr: 1 }} /> Expected Delivery Date: {orderDetails?.expectedDeliveryDate ? new Date(orderDetails.expectedDeliveryDate).toLocaleDateString() : "N/A"}
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
          <FaBarcode style={{ marginRight: "8px" }} /> Transaction Reference: {orderDetails?.transactionReference || "N/A"}
        </Typography>
        {orderDetails?.notes && <Typography variant="body1">Notes: {orderDetails.notes}</Typography>}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Total Items: {orderDetails?.totalOrderQuantity || 0}
        </Typography>

        <Grid container spacing={2}>
          {orderDetails?.orderDetails?.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 1 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          style={{ width: "100%", borderRadius: 8 }}
                        />
                      ) : (
                        <Typography color="textSecondary">No Image</Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={7}>
                      <Typography variant="h6" fontWeight="bold">
                        {item.productName || "Product info unavailable"}
                      </Typography>
                      <Typography variant="body2">Color: {item.color || "N/A"}</Typography>
                      <Typography variant="body2">Size: {item.size || "N/A"}</Typography>
                      <Typography variant="body2">Quantity: {item.orderQuantity || 0}</Typography>
                      <Typography variant="body2">Price: {formatPrice(item.unitPrice || 0)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Drawer>
  );
};

export default DashboardOrderDetailsDrawer;
