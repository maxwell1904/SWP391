import React, { useEffect, useState } from "react";
import { Drawer, Typography, Box } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const NotificationDrawer = ({ isOpen, onClose, notification }) => {
  const varToken = useAuthHeader();
  const [recipients, setRecipients] = useState([]);

  // 🔥 Gọi API lấy danh sách người nhận khi mở modal
  useEffect(() => {
    if (isOpen && notification.notificationId) {
      apiClient
        .get(`/api/notifications/${notification.notificationId}/recipients`, {
          headers: { Authorization: varToken },
        })
        .then((response) => {
          setRecipients(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching recipients:", error);
          setRecipients(["Error loading recipients"]);
        });
    }
  }, [isOpen, notification, varToken]);

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
        {/* Close button */}
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

        {/* Notification Details */}
        <Typography variant="h6" component="div" sx={{ marginBottom: 2 }}>
          <strong>Title:</strong> {notification.notificationTitle || "N/A"}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Message:</strong> {notification.notificationContent || "N/A"}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Recipients:</strong>{" "}
          {recipients.length > 0 ? recipients.join(", ") : "No Recipients"}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Created at:</strong>{" "}
          {notification.createdAt
            ? new Date(notification.createdAt).toLocaleString()
            : "No Date"}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          <strong>Draft Status:</strong>{" "}
          {notification.notificationDraft ? "Yes (Draft)" : "No (Published)"}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
