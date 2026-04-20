import React from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function ReturnOrder() {
  const navigate = useNavigate();

  const handlecontact = () => {
    navigate("/about");
  }
  return (
    <div className="bg-beluBlue min-h-[100vh]">
      <Container
        sx={{ padding: "40px 24px", maxWidth: "1200px", marginTop: "40px" }}
      >
        <Box
          sx={{
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: 2,
          }}
        >
          <Typography fontFamily="Poppins" variant="h4" component="h1" align="center" gutterBottom>
            Return & Refund Policy
          </Typography>

          <Typography fontFamily="Poppins" variant="body1" paragraph>
            We aim to ensure that you have a positive
            shopping experience with us. If you're not fully satisfied with your
            purchase, we offer a straightforward return policy to make it right.
            Please read through the following information on how to return or
            exchange your items.
          </Typography>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            1. Return Timeframe
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            You may return any eligible item(s) within 30 days of receiving your
            order. After 30 days, unfortunately, we cannot accept returns or
            issue refunds. Please ensure you return your items within this time
            frame.
          </Typography>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            2. Conditions for Returns
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            For a return to be accepted, the following conditions must be met:
          </Typography>
          <List>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="The item must be unused and in its original condition." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="The item must be in its original packaging." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Items that have been opened, used, or damaged cannot be returned, unless defective." />
            </ListItem>
          </List>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            3. How to Initiate a Return
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            To start the return process, please follow these steps:
          </Typography>
          <List>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Contact our customer service team via email or phone to request return authorization." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Provide your order number and a brief reason for the return." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Once approved, return the item to the address provided by our team." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Make sure the item is securely packed to prevent damage during shipping." />
            </ListItem>
          </List>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            4. Refund Process
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            After we receive your return, we will inspect the item. Once the
            return is processed, you will be notified via email regarding the
            approval or rejection of your refund. If your return is approved,
            the refund will be issued to your original payment method within
            7-10 business days.
          </Typography>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            5. Non-Returnable Items
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            Please note that some items are non-returnable. These include:
          </Typography>
          <List>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Gift cards and vouchers." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Personal care and hygiene products." />
            </ListItem>
            <ListItem>
              <ListItemText fontFamily="Poppins" primary="Opened or used electronics and accessories." />
            </ListItem>
          </List>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            6. Exchange Policy
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            If you would prefer an exchange instead of a refund, please contact
            us within the return window. Depending on availability, we can issue
            a store credit or exchange the item for an alternative product.
          </Typography>

          <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
            7. Defective Items
          </Typography>
          <Typography fontFamily="Poppins" variant="body1" paragraph>
            If you receive an item that is defective or damaged, please contact
            our customer service team immediately. We will provide instructions
            on how to return the defective product and arrange for a replacement
            or refund.
          </Typography>

          <Box mt={3} display="flex" justifyContent="center">
            <Button
              variant="outlined"
              color="primary"
              onClick={handlecontact}
              sx={{
                textTransform: "none",
                borderRadius: "30px", // Rounded corners
                borderColor: "#3f51b5", // Blue border color
                padding: "10px 30px",
                "&:hover": {
                  borderColor: "#303f9f", // Darker blue on hover
                  backgroundColor: "#f0f0f0", // Light gray background on hover
                },
              }}
            >
              Contact Us for Returns
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default ReturnOrder;
