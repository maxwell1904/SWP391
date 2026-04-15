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
  const [userImage, setUserImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Password must contain one uppercase, one lowercase, and one number"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      fullName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      userAddress: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        let imageUrl = "";

        if (userImage) {
          const formData = new FormData();
          formData.append("image", userImage);

          const uploadResponse = await fetch(
            "https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912",
            { method: "POST", body: formData }
          );
          const uploadData = await uploadResponse.json();

          if (uploadData.success) {
            imageUrl = uploadData.data.display_url;
          } else {
            throw new Error("Image upload failed");
          }
        }
        // console.log(varToken)
        await apiClient.post(
          "/api/admin",
          {
            userEmail: values.email,
            userUsername: values.username,
            userFullname: values.fullName,
            userPhone: values.phoneNumber,
            userPassword: values.password,
            userImage: imageUrl,
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
        navigate("/Dashboard/Accounts");
      } catch (error) {
        console.error("Error creating staff account:", error);
        toast.error("Failed to create staff account. Please try again.", {
          position: "bottom-right",
          transition: Zoom,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div maxWidth="sm" mx="auto">
      <Typography variant="h4" gutterBottom>
        Create Staff Account
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
        <TextField
          label="Password"
          type="password"
          {...formik.getFieldProps("password")}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Confirm Password"
          type="password"
          {...formik.getFieldProps("confirmPassword")}
          error={
            formik.touched.confirmPassword &&
            Boolean(formik.errors.confirmPassword)
          }
          helperText={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
          variant="outlined"
          fullWidth
          margin="normal"
        />

        <Box mt={2}>
          <Button variant="outlined" component="label">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </Button>
        </Box>
        {previewImage != null || (
          <div className="text-red-500">Image is required</div>
        )}

        {previewImage && (
          <Box mt={2}>
            <img
              src={previewImage}
              alt="User Image Preview"
              className="w-32 h-32 object-cover rounded"
            />
          </Box>
        )}

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
    </div>
  );
};

export default DashboardCreateStaffAccount;
