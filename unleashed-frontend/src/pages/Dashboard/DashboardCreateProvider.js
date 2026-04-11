import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const DashboardCreateProvider = () => {
  const [providerImage, setProviderImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const formik = useFormik({
    initialValues: {
      providerName: "",
      providerEmail: "",
      providerPhone: "",
      providerAddress: "",
    },
    validationSchema: Yup.object({
      providerName: Yup.string()
            .required("Provider name is required")
            .min(3, "Provider name must be at least 3 character")
            .max(32, "Provider name cannot exceed 32 characters")
            .matches(
              /^[\p{L} .'-]+$/u,
              "Provider name cannot contain special characters or numbers"
            ),
            providerEmail: Yup.string()
            .email("Invalid email format")
            .required("Email is required")
            .min(6, "Email must be at least 6 characters")
            .max(255, "Email cannot exceed 255 characters")
            .matches(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              "Email must be a valid email address!"
            ),
      providerPhone: Yup.string()
            .matches(
              /^(?:\+84|0)\d{9,10}$/,
              "Phone number must start with '+84' or '0' and be 10-11 digits"
            )
            .required("Phone number is required"),
      providerAddress: Yup.string()
        .max(255, "Address must be at most 255 characters")
        .required("Provider address is required"),
    }),
    onSubmit: async (values) => {
      if (!providerImage) {
        toast.error("You must upload an image before creating the provider!", { position: "bottom-right" });
        return;
      }

      setIsSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("image", providerImage);

        const response = await fetch("https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!data.success) {
          throw new Error("Image upload failed");
        }

        const providerImageUrl = data.data.display_url;

        await apiClient.post(
          "/api/providers",
          {
            providerName: values.providerName,
            providerEmail: values.providerEmail,
            providerPhone: values.providerPhone,
            providerAddress: values.providerAddress,
            providerImageUrl,
          },
          { headers: { Authorization: varToken } }
        );

        toast.success("Provider created successfully!", { position: "bottom-right" });
        navigate("/Dashboard/Providers");
      } catch (error) {
        const errorMessage = error.response?.data || "Failed to create provider";

        if (error.response?.status === 400) {
          if (errorMessage.includes("Email already exists")) {
            toast.error("This email already exists!", { position: "bottom-right" });
          } else if (errorMessage.includes("Phone number already exists")) {
            toast.error("This phone number already exists!", { position: "bottom-right" });
          } else {
            toast.error(errorMessage, { position: "bottom-right" });
          }
        } else {
          toast.error("An unexpected error occurred!", { position: "bottom-right" });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

 const handleFileChange = (e) => {
     const file = e.target.files[0];
     if (file && file.type.startsWith("image/")) {
      setProviderImage(file);
     } else {
       toast.error("Only image files are allowed!", { position: "bottom-right" });
     }
   };
   const handleDrop = (event) => {
       event.preventDefault();
       const file = event.dataTransfer.files[0];
       if (file) {
         if (!file.type.startsWith("image/")) {
           toast.error("Only image files are allowed!", { position: "bottom-right" });
           return;
         }
         setProviderImage(file);
       }
     };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Create New Provider</h1>
      <form onSubmit={formik.handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <TextField label="Provider name" fullWidth name="providerName" {...formik.getFieldProps("providerName")} error={formik.touched.providerName && Boolean(formik.errors.providerName)} helperText={formik.touched.providerName && formik.errors.providerName} margin="normal" />
        <TextField label="Email" fullWidth name="providerEmail" {...formik.getFieldProps("providerEmail")} error={formik.touched.providerEmail && Boolean(formik.errors.providerEmail)} helperText={formik.touched.providerEmail && formik.errors.providerEmail} margin="normal" />
        <TextField label="Phone" fullWidth name="providerPhone" {...formik.getFieldProps("providerPhone")} error={formik.touched.providerPhone && Boolean(formik.errors.providerPhone)} helperText={formik.touched.providerPhone && formik.errors.providerPhone} margin="normal" />
        <TextField label="Address" fullWidth name="providerAddress" {...formik.getFieldProps("providerAddress")} error={formik.touched.providerAddress && Boolean(formik.errors.providerAddress)} helperText={formik.touched.providerAddress && formik.errors.providerAddress} margin="normal" />
        {!providerImage && (
        <Box
          mt={2}
          className="border-dashed border-2 border-gray-400 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition"
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          <CloudUploadIcon fontSize="large" className="text-gray-500 mb-2" />
          <p className="text-gray-600">Drop or select file</p>
        </Box>
        )}

        {providerImage && <Box mt={2} className="flex justify-center"><img src={URL.createObjectURL(providerImage)} alt="Provider" className="w-32 h-32 object-cover rounded" /></Box>}
        <div className="flex items-center justify-center mt-4">
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Create Provider"}</Button>
        </div>
      </form>
    </div>
  );
};

export default DashboardCreateProvider;