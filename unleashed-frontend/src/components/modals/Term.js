import React, { useState } from "react";
import { Modal, Box, Typography, Button, Fade } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "90%",
  maxWidth: "600px",
  maxHeight: "85vh",
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  padding: "24px",
  overflowY: "auto",
  transition: "transform 0.5s ease-out, opacity 0.3s ease-out", // Adding a transition for transform and opacity
  opacity: 0, // Initially, we start with opacity 0
  transform: "translate(-50%, -60%) scale(0.9)", // Starting with a slightly smaller scale
};

const TermsAndPrivacyModals = () => {
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);

  const openModalStyle = {
    ...modalStyle,
    opacity: 1, // Set opacity to 1 when modal is open
    transform: "translate(-50%, -50%) scale(1)", // Modal comes to its normal position with full scale
  };

  return (
    <>
      {/* Terms of Use Modal */}
      <Modal open={isTermsOpen} onClose={() => setTermsOpen(false)}>
        <Fade in={isTermsOpen} timeout={500}>
          <Box sx={modalStyle}>
            <Typography variant="h5" mb={2} fontWeight="bold">
              Terms of Use
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome. By using our website and services, you agree
              to the following terms:
            </Typography>
            <Typography variant="body1" paragraph>
              1. <strong>Acceptance of Terms:</strong> By accessing our
              services, you agree to comply with these terms. If you do not
              agree, please discontinue use immediately.
            </Typography>
            <Typography variant="body1" paragraph>
              2. <strong>Account Responsibilities:</strong> Users are
              responsible for maintaining the confidentiality of their account
              credentials. Unauthorized access or activity under your account is
              your responsibility.
            </Typography>
            <Typography variant="body1" paragraph>
              3. <strong>Prohibited Activities:</strong> You agree not to use
              our service for unlawful purposes, including but not limited to
              fraud, spamming, or infringement of intellectual property rights.
            </Typography>
            <Typography variant="body1" paragraph>
              4. <strong>Content Ownership:</strong> All content, trademarks,
              and intellectual property on our platform are the property of
              this platform or our licensors. Unauthorized use is prohibited.
            </Typography>
            <Typography variant="body1" paragraph>
              5. <strong>Changes to Terms:</strong> We reserve the right to
              modify these terms at any time. Continued use of the service
              indicates your acceptance of updated terms.
            </Typography>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontFamily: "Poppins",
                  textTransform: "none",
                  backgroundColor: "#007BFF", // Custom background color
                  color: "#ffffff", // Text color
                  padding: "12px 24px", // Increase padding for better size
                  borderRadius: "8px", // Rounded corners
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
                  "&:hover": {
                    backgroundColor: "#0056b3", // Darker background on hover
                    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)", // Shadow effect on hover
                  },
                  transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
                  fontWeight: "600", // Slightly bolder text
                }}
                onClick={() => setTermsOpen(false)}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* Privacy Policy Modal */}
      <Modal open={isPrivacyOpen} onClose={() => setPrivacyOpen(false)}>
        <Fade in={isPrivacyOpen} timeout={500}>
          <Box sx={modalStyle}>
            <Typography variant="h5" mb={2} fontWeight="bold">
              Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We are committed to protecting your personal information.
              This policy explains how we collect, use, and safeguard your data.
            </Typography>
            <Typography variant="body1" paragraph>
              1. <strong>Information Collection:</strong> We collect personal
              data such as your name, email, address, and payment details when
              you register or make purchases.
            </Typography>
            <Typography variant="body1" paragraph>
              2. <strong>Use of Information:</strong> Your data is used to
              provide and improve our services, process orders, and communicate
              with you about your account or orders.
            </Typography>
            <Typography variant="body1" paragraph>
              3. <strong>Data Security:</strong> We implement industry-standard
              security measures to protect your data from unauthorized access,
              alteration, or disclosure.
            </Typography>
            <Typography variant="body1" paragraph>
              4. <strong>Third-Party Sharing:</strong> We may share data with
              trusted third-party service providers for payment processing,
              order fulfillment, or analytics. Your data will not be sold or
              shared for advertising purposes.
            </Typography>
            <Typography variant="body1" paragraph>
              5. <strong>Your Rights:</strong> You have the right to access,
              update, or request the deletion of your personal data. For
              assistance, contact our support team.
            </Typography>
            <Typography variant="body1" paragraph>
              6. <strong>Policy Updates:</strong> We may update this policy
              periodically. Continued use of our services constitutes acceptance
              of the revised privacy policy.
            </Typography>
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                sx={{
                  fontFamily: "Poppins",
                  textTransform: "none",
                  backgroundColor: "#007BFF", // Custom background color
                  color: "#ffffff", // Text color
                  padding: "12px 24px", // Increase padding for better size
                  borderRadius: "8px", // Rounded corners
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
                  "&:hover": {
                    backgroundColor: "#0056b3", // Darker background on hover
                    boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.2)", // Shadow effect on hover
                  },
                  transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
                  fontWeight: "600", // Slightly bolder text
                }}
                onClick={() => setPrivacyOpen(false)}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* Open modals using these methods */}
      <button
        type="button"
        className="font-semibold text-red-300 hover:text-red-200 hover:underline"
        onClick={() => setTermsOpen(true)}
      >
        Terms of Use
      </button>{" "}
      and{" "}
      <button
        type="button"
        className="font-semibold text-red-300 hover:text-red-200 hover:underline"
        onClick={() => setPrivacyOpen(true)}
      >
        Privacy Policy
      </button>
    </>
  );
};

export default TermsAndPrivacyModals;
