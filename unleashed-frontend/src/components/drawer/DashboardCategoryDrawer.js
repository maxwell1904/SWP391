import React, { useState } from "react";
import { Drawer, Typography, Box, Button, CircularProgress } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { apiClient } from "../../core/api";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { toast, Zoom } from "react-toastify";
import { DateTime } from "luxon"; // Import Luxon để xử lý thời gian

const CategoryDrawer = ({ isOpen, onClose, category, onEdit, onDeleteSuccess }) => {
  const authUser = useAuthUser();
  const varToken = useAuthHeader();
  // console.log("Category Data:", category);

  const userRole = authUser.role;
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm định dạng ngày giờ và chuyển sang UTC+7
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return DateTime.fromISO(dateString, { zone: "utc" }) // Chuyển từ UTC gốc
      .setZone("Asia/Ho_Chi_Minh") // Chuyển sang UTC+7
      .toFormat("dd/MM/yyyy, HH:mm:ss a");
  };

  const handleDelete = (categoryId) => {
    if (categoryId) {
      setIsDeleting(true);
      apiClient
        .delete(`/api/categories/${categoryId}`, {
          headers: {
            Authorization: varToken,
          },
        })
        .then((response) => {
          toast.success(response.data.message || "Delete category successfully", {
            position: "bottom-right",
            transition: Zoom,
          });
          setDeleteModalOpen(false);
          onClose();
          onDeleteSuccess();
        })
        .catch((error) =>
          toast.error(error.data.message || "Delete category failed", {
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
          {category?.categoryName}
        </Typography>

        {category?.categoryImageUrl && (
          <img
            src={category.categoryImageUrl}
            alt={category?.categoryName}
            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }}
          />
        )}

        <Box mt={2}>
          <Typography variant="body1">
            <strong>ID:</strong> {category?.id}
          </Typography>
          <Typography variant="body1" style={{ wordBreak: "break-word" }}>
            <strong>Description:</strong> {category?.categoryDescription}
          </Typography>
          <Typography variant="body1">
            <strong>Total quantity:</strong> {category?.totalQuantity}
          </Typography>
          <Typography variant="body1">
            <strong>Created:</strong> {formatDateTime(category?.categoryCreatedAt)}
          </Typography>
          <Typography variant="body1">
            <strong>Updated:</strong> {formatDateTime(category?.categoryUpdatedAt)}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CategoryDrawer;
