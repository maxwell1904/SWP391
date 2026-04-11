import React, { useState } from "react";
import { Drawer, Typography, Box, Button, CircularProgress } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { apiClient } from "../../core/api";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { toast, Zoom } from "react-toastify";
import { DateTime } from "luxon";

const ProviderDrawer = ({ isOpen, onClose, provider, onEdit, onDeleteSuccess }) => {
  const authUser = useAuthUser();
  const varToken = useAuthHeader();
  
  const userRole = authUser.role;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return DateTime.fromISO(dateString, { zone: "utc" })
      .setZone("Asia/Ho_Chi_Minh")
      .toFormat("dd/MM/yyyy, HH:mm:ss a");
  };

  const handleDelete = (providerId) => {
    if (providerId) {
      setIsDeleting(true);
      apiClient
        .delete(`/api/providers/${providerId}`, {
          headers: {
            Authorization: varToken,
          },
        })
        .then((response) => {
          toast.success(response.data.message || "Delete provider successfully", {
            position: "bottom-right",
            transition: Zoom,
          });
          setDeleteModalOpen(false);
          onClose();
          onDeleteSuccess();
        })
        .catch((error) =>
          toast.error(error.data.message || "Delete provider failed", {
            position: "bottom-right",
            transition: Zoom,
          })
        )
        .finally(() => setIsDeleting(false));
    }
  };

  const openDeleteModal = () => setDeleteModalOpen(true);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} sx={{ zIndex: 1200 }}>
      <Box sx={{ width: 400, padding: 3, backgroundColor: "#fff", position: "relative" }}>
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
          <FaTimes size={22} />
        </button>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {provider?.providerName}
        </Typography>

        {provider?.providerImageUrl && (
          <img
            src={provider.providerImageUrl}
            alt={provider?.providerName}
            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }}
          />
        )}

        <Box mt={2}>
          <Typography variant="body1">
            <strong>ID:</strong> {provider?.id}
          </Typography>
          <Typography variant="body1" style={{ wordBreak: "break-word" }}>
            <strong>Email:</strong> {provider?.providerEmail}
          </Typography>
          <Typography variant="body1">
            <strong>Phone:</strong> {provider?.providerPhone}
          </Typography>
          <Typography variant="body1">
            <strong>Address:</strong> {provider?.providerAddress}
          </Typography>
          <Typography variant="body1">
            <strong>Created:</strong> {formatDateTime(provider?.providerCreatedAt)}
          </Typography>
          <Typography variant="body1">
            <strong>Updated:</strong> {formatDateTime(provider?.providerUpdatedAt)}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProviderDrawer;