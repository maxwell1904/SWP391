import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { Zoom } from "react-toastify";
import { RequestDeleteAccount } from "../../service/UserService";

const DeleteAccountButton = ({ authHeader, onDeleteSuccess }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleRequestDelete = () => {
    setOpenDialog(true); // Open the confirmation dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
  };

  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    try {
      // Call your delete account API
      await RequestDeleteAccount(authHeader);
      toast.success("Account deletion requested successfully.", {
        position: "top-center",
        transition: Zoom,
      });

      // Execute the onDeleteSuccess function to trigger any further actions
      setTimeout(() => {
        onDeleteSuccess(); // This could handle sign-out, redirection, etc.
      }, 3000);
    } catch (error) {
      toast.error("Error requesting account deletion.", {
        position: "top-center",
        transition: Zoom,
      });
    } finally {
      setLoadingDelete(false);
      handleCloseDialog();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        sx={{
          fontFamily: "Montserrat",
          width: "170px",
          textTransform: "none",
          borderRadius: "8px",
          backgroundColor: "#d32f2f",
          "&:hover": {
            backgroundColor: "#c62828",
          },
        }}
        onClick={handleRequestDelete}
      >
        Delete Account
      </Button>

      {/* Confirmation Dialog for account deletion */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            padding: "20px",
            minWidth: "400px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: "600", fontSize: "1.2rem", color: "#333" }}
        >
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Typography sx={{ color: "#444", fontSize: "1rem" }}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
              Your account will be permanently deleted after 1 week. During this
              time, you can still recover your account if needed.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            onClick={handleCloseDialog}
            color="primary"
            sx={{
              fontWeight: "bold",
              color: "#007BFF",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "transparent",
                borderColor: "#007BFF",
                color: "#0056b3",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            sx={{
              fontWeight: "bold",
              backgroundColor: "#d32f2f",
              color: "#fff",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#c62828",
              },
            }}
            disabled={loadingDelete}
          >
            {loadingDelete ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccountButton;
