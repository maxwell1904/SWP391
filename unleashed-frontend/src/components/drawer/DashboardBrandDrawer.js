import React, { useState } from "react";
import { Drawer, Button, Typography, Box, CircularProgress } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast, Zoom } from "react-toastify";
import { DateTime } from "luxon"; // Import Luxon để xử lý thời gian

const BrandDrawer = ({ isOpen, onClose, brand, onEdit, onDeleteSuccess }) => {
  const authUser = useAuthUser();
  const userRole = authUser?.role;
  const varToken = useAuthHeader();

  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm định dạng ngày giờ và chuyển sang UTC+7
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return DateTime.fromISO(dateString, { zone: "utc" }) // Chuyển từ UTC gốc
      .setZone("Asia/Ho_Chi_Minh") // Chuyển sang UTC+7
      .toFormat("dd/MM/yyyy, HH:mm:ss a");
  };

  // Xử lý xóa brand
  const handleDelete = () => {
    if (!brand?.id) return;

    setIsDeleting(true);
    apiClient
      .delete(`/api/brands/${brand.id}`, {
        headers: { Authorization: varToken },
      })
      .then(() => {
        toast.success("Brand deleted successfully!", { position: "bottom-right", transition: Zoom });
        onClose(); // Đóng drawer
        onDeleteSuccess(); // Cập nhật danh sách
      })
      .catch((error) => {
        toast.error(error.response?.data || "Failed to delete brand.", { position: "bottom-right", transition: Zoom });
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} sx={{ zIndex: 1200 }}>
      <Box sx={{ width: 400, padding: 3, backgroundColor: "#fff", position: "relative" }}>
        {/* Close Button */}
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

        {/* Brand Info */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {brand?.brandName}
        </Typography>

        {brand?.brandImageUrl && (
          <img
            src={brand.brandImageUrl}
            alt={brand?.brandName}
            style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }}
          />
        )}

        {brand?.brandWebsiteUrl && (
          <a
            href={brand.brandWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginTop: 8, color: "#007bff", wordBreak: "break-all" }}
          >
            {brand.brandWebsiteUrl}
          </a>
        )}

        <Box mt={2}>
          <Typography variant="body1">
            <strong>ID:</strong> {brand?.brandId}
          </Typography>
          <Typography variant="body1" style={{ wordBreak: "break-word" }}>
            <strong>Description:</strong> {brand?.brandDescription}
          </Typography>
          <Typography variant="body1">
            <strong>Total quantity:</strong> {brand?.totalQuantity}
          </Typography>
          <Typography variant="body1">
            <strong>Created:</strong> {formatDateTime(brand?.brandCreatedAt)}
          </Typography>
          <Typography variant="body1">
            <strong>Updated:</strong> {formatDateTime(brand?.brandUpdatedAt)}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default BrandDrawer;
