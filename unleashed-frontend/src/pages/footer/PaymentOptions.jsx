import React from "react";
import { Grid, Card, CardContent, Typography, CardMedia } from "@mui/material";

// Import icons for the payment methods
import CodIcon from "../../assets/images/codforPayment.jpeg";
import VnPayIcon from "../../assets/images/vnpay.jpg";
import PayOsIcon from "../../assets/images/payos.svg";
import TransferIcon from "../../assets/images/banktransfer.png";

const paymentMethods = [
  { name: "COD", icon: CodIcon },
  { name: "VNPAY", icon: VnPayIcon },
  { name: "Transfer", icon: TransferIcon },
];

function PaymentOptions() {
  return (
    <div className="px-3">
      <h1 className="font-poppins text-center text-3xl font-bold py-5">
        Payment Methods
      </h1>
      <Grid container spacing={4} justifyContent="center">
        {paymentMethods.map((method, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                alt={method.name}
                height="140"
                image={method.icon}
                sx={{
                  width:"100%",
                  height: "360px", // Set a fixed height for images
                  objectFit: "fill", // Ensures the image fills the container without distortion
                  borderRadius: "12px 12px 0 0", // Rounded corners for the top of the image
                }}
              />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" component="div" fontWeight="bold">
                  {method.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default PaymentOptions;
