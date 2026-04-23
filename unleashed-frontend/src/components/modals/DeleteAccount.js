import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { Zoom } from "react-toastify";
import { RequestDeleteAccount } from "../../service/UserService";

const DeleteAccountButton = ({ authHeader, onDeleteSuccess, isGoogleAccount = false }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [password, setPassword] = useState("");

  const handleRequestDelete = () => {
    setOpenDialog(true); // Open the confirmation dialog
  };

  const handleCloseDialog = () => {
    setPassword("");
    setOpenDialog(false); // Close dialog
  };

  const handleDeleteAccount = async () => {
    setLoadingDelete(true);
    try {
      const response = await RequestDeleteAccount(authHeader, password);
      toast.success(response.data?.message || "Your account has been deleted.", {
        position: "top-center",
        transition: Zoom,
      });

      setTimeout(() => {
        onDeleteSuccess?.();
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          "Could not delete your account.",
        {
        position: "top-center",
        transition: Zoom,
        }
      );
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
              Are you sure you want to delete your account?
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
              You will be signed out immediately and will not be able to log in
              again unless support reactivates your account.
            </Typography>
            {!isGoogleAccount && (
              <TextField
                type="password"
                label="Confirm your password"
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your current password"
              />
            )}
            {isGoogleAccount && (
              <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
                This Google-linked account does not require password confirmation.
              </Typography>
            )}
            <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
              Account deletion is only allowed when you have no ongoing
              orders being processed.
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
            disabled={loadingDelete || (!isGoogleAccount && !password.trim())}
          >
            {loadingDelete ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccountButton;
