import React, { useState, useEffect } from "react";
import { Drawer, Typography, Box, CircularProgress } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const DashboardAccountDrawer = ({ isOpen, onClose, userId }) => {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const varToken = useAuthHeader();

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      apiClient
        .get(`/api/admin/${userId}`, {
          headers: {
            Authorization: varToken,
          },
        })
        .then((response) => {
          setAccount(response.data);
          setIsLoading(false);
          // console.log(response.data)
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
          setHasError(true);
          setIsLoading(false);
        });
    }
  }, [userId, isOpen, onClose]);

  if (isLoading) {
    return (
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <Box
          sx={{
            width: 400,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            padding: 2,
          }}
        >
          <CircularProgress />
        </Box>
      </Drawer>
    );
  }

  if (hasError) {
    return (
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <Box
          sx={{
            width: 400,
            padding: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Typography variant="h6" color="error">
            Error loading user details. Please try again later.
          </Typography>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          padding: 2,
          backgroundColor: "#f9f9f9",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            border: "none",
            background: "none",
            cursor: "pointer",
          }}
        >
          <FaTimes size={24} />
        </button>

        <Typography variant="h6" component="div" sx={{ marginBottom: 2 }}>
          <strong>Username:</strong> {account.userUsername}
        </Typography>
        <img
          src={account.userImage}
          alt={account.userUsername}
          style={{
            width: "100%", // Set the width
            height: "25%", // Match the height to the width for a square
            objectFit: "cover", // Ensures the image scales proportionally
            borderRadius: "8px", // Optional: Slightly rounded corners
          }}
        />
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Email:</strong> {account.userEmail}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Full Name:</strong> {account.userFullname}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Phone Number:</strong>{" "}
          {account.userPhone ? account.userPhone : "null"}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Role:</strong> {account.role.roleName}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Status:</strong> {account.isUserEnabled ? "Enable" : "Disable"}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Current Payment Method:</strong>{" "}
          {account.userCurrentPaymentMethod}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Address:</strong> {account.userAddress}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Created At:</strong>{" "}
          {new Date(account.userCreatedAt).toLocaleString()}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          <strong>Updated At:</strong>{" "}
          {new Date(account.userUpdatedAt).toLocaleString()}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default DashboardAccountDrawer;
