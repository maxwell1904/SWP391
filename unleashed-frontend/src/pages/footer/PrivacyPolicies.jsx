import React from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

function PrivacyPolicies() {
  const handleEmailSupport = () => {
    window.location.href = "mailto:unleashedworkshop.business@gmail.com?subject=Privacy%20Policy%20Question";
  };
  return (
    <div>
      <Box sx={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        <Typography fontFamily="Poppins" variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          We value your privacy and are committed to
          protecting your personal information. This Privacy Policy outlines how
          we collect, use, and safeguard your data when you interact with our
          website and services.
        </Typography>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          1. Information We Collect
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          We may collect the following types of information:
        </Typography>
        <List>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="Personal Identification Information (e.g., name, email address, phone number)" />
          </ListItem>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="Payment information (credit card details, billing address)" />
          </ListItem>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="Usage Data (e.g., browsing behavior, site interactions)" />
          </ListItem>
        </List>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          2. How We Use Your Information
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          We use the information we collect in the following ways:
        </Typography>
        <List>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="To process transactions and provide customer support" />
          </ListItem>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="To improve our website and services based on user feedback" />
          </ListItem>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="To send periodic emails regarding your order or other products and services" />
          </ListItem>
        </List>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          3. Data Security
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          We implement a variety of security measures to maintain the safety of
          your personal information. However, no method of transmission over the
          Internet or electronic storage is 100% secure, and we cannot guarantee
          its absolute security.
        </Typography>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          4. Sharing Your Information
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information with trusted third parties who
          assist us in operating our website or conducting our business, as long
          as they agree to keep your information confidential.
        </Typography>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          5. Cookies and Tracking Technologies
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          Our website uses cookies to enhance user experience. Cookies are small
          files that are stored on your device to help us improve site
          functionality and analyze site usage. You can choose to disable
          cookies through your browser settings.
        </Typography>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          6. Your Rights
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          You have the right to:
        </Typography>
        <List>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="Access and update your personal information" />
          </ListItem>
          <ListItem>
            <ListItemText fontFamily="Poppins" primary="Request the deletion of your data under certain circumstances" />
          </ListItem>
        </List>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          7. Third-Party Links
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          Our website may contain links to third-party sites. These sites have
          their own privacy policies, and we are not responsible for their
          content or practices. We encourage you to review the privacy policies
          of any third-party websites you visit.
        </Typography>

        <Typography fontFamily="Poppins" variant="h6" component="h2" paragraph>
          8. Changes to This Privacy Policy
        </Typography>
        <Typography fontFamily="Poppins" variant="body1" paragraph>
          We reserve the right to update or modify this Privacy Policy at any
          time. Any changes will be reflected on this page, with the updated
          date at the top.
        </Typography>

        <Typography fontFamily="Poppins" variant="body1" paragraph>
          By using our website, you agree to the terms outlined in this Privacy
          Policy. If you have any questions or concerns, please contact us.
        </Typography>

        <Box mt={3} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleEmailSupport}
            sx={{
              textTransform: "none",
              borderRadius: "8px", // Slightly rounded
              padding: "15px 40px",
              display: "flex",
              alignItems: "center", // Align icon and text
              justifyContent: "center",
              fontFamily: "Poppins",
              transition: "background-color 0.3s ease, transform 0.3s ease",
              "&:hover": {
                backgroundColor: "#1976d2", // Darker shade for hover
                transform: "scale(1.05)", // Slight zoom effect on hover
              },
            }}
          >
            Email Support for More Information
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default PrivacyPolicies;
