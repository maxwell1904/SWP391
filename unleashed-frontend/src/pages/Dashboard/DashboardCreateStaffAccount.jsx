import React, { useState } from "react";
import { toast, Zoom } from "react-toastify";
import { apiClient } from "../../core/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import LocationSelector from "../../service/LocationService";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const DashboardCreateStaffAccount = () => {
  const varToken = useAuthHeader();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(7, "Username must be at least 7 characters")
      .matches(
        /^[a-zA-Z0-9]*$/,
        "Username cannot contain special characters or spaces"
      ),
    fullName: Yup.string()
      .required("Full Name is required")
      .min(1, "Full Name must be at least 1 character")
      .max(255, "Full Name cannot exceed 255 characters")
      .matches(
        /^[\p{L} .'-]+$/u,
        "Full Name cannot contain special characters or numbers"
      ),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required")
      .min(1, "Email must be at least 1 character")
      .max(255, "Email cannot exceed 255 characters")
      .matches(/^[a-zA-Z0-9@.]+$/, "Email cannot contain special characters"),
    phoneNumber: Yup.string()
      .matches(
        /^(?:\+84|0)\d{9,10}$/,
        "Phone number must start with '+84' or '0' and be 10-11 digits"
      )
      .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      fullName: "",
      phoneNumber: "",
      userAddress: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // console.log(varToken)
        await apiClient.post(
          "/api/admin",
          {
            userEmail: values.email,
            userUsername: values.username,
            userFullname: values.fullName,
            userPhone: values.phoneNumber,
            userAddress: values.userAddress,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: varToken,
            },
          }
        );

        toast.success("Staff account created successfully!", {
          position: "bottom-right",
          transition: Zoom,
        });
        toast.info("A password setup email has been sent to the staff account.", {
          position: "bottom-right",
          transition: Zoom,
        });
        navigate("/Dashboard/Accounts");
      } catch (error) {
        console.error("Error creating staff account:", error);
        const backendMessage =
          error?.response?.data && typeof error.response.data === "string"
            ? error.response.data
            : "Failed to create staff account. Please try again.";
        toast.error(backendMessage, {
          position: "bottom-right",
          transition: Zoom,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Box maxWidth="sm" mx="auto">
      <Typography variant="h4" gutterBottom>
        Create Staff Account
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Password is not set by admin. The staff will receive an email to set a password and activate the account.
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Email"
          {...formik.getFieldProps("email")}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Username"
          {...formik.getFieldProps("username")}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Full Name"
          {...formik.getFieldProps("fullName")}
          error={formik.touched.fullName && Boolean(formik.errors.fullName)}
          helperText={formik.touched.fullName && formik.errors.fullName}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Phone Number"
          {...formik.getFieldProps("phoneNumber")}
          error={
            formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
          }
          helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Box mt={2}>
          <LocationSelector
            onLocationChange={(location) =>
              formik.setFieldValue(
                "userAddress",
                `${location.tinh}, ${location.quan}, ${location.phuong}`
              )
            }
          />
        </Box>

        <Box mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Account"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default DashboardCreateStaffAccount;
