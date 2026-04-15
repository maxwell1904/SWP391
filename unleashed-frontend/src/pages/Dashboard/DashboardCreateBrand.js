import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { toast, Zoom } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const DashboardCreateBrand = () => {
  const [logoFile, setLogoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const formik = useFormik({
    initialValues: {
      brandName: "",
      brandDescription: "",
      brandWebsiteUrl: "",
    },
    validationSchema: Yup.object({
      brandName: Yup.string()
        .max(32, "Brand name must be at most 32 characters")
        .required("Brand name is required"),
      brandDescription: Yup.string()
        .max(150, "Description must be at most 150 characters")
        .required("Brand description is required"),
      brandWebsiteUrl: Yup.string()
        .matches(
          /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[a-z0-9\-._~:\/?#[\]@!$&'()*+,;=]*)?$/i,
          "Enter a valid URL"
        )
        .required("Website URL is required"),
    }),
    onSubmit: async (values) => {
      if (!logoFile) {
        toast.error("You must upload an image before creating", { position: "bottom-right" });
        return;
      }
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("image", logoFile);

        const response = await fetch("https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (!data.success) {
          throw new Error("Image upload failed");
        }

        const brandImageUrl = data.data.display_url;

        await apiClient.post(
          "/api/brands",
          {
            brandName: values.brandName,
            brandDescription: values.brandDescription,
            brandWebsiteUrl: values.brandWebsiteUrl,
            brandImageUrl,
          },
          {
            headers: { Authorization: varToken },
          }
        );
        toast.success("Brand created successfully!", { position: "bottom-right" });
        navigate("/Dashboard/Brands");
      } catch (error) {
        toast.error(error.response?.data || "Create brand failed", { position: "bottom-right", transition: Zoom });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed!", { position: "bottom-right" });
        return;
      }
      setLogoFile(file);
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
      setLogoFile(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Create New Brand</h1>
      <form onSubmit={formik.handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <TextField
          label="Brand name"
          fullWidth
          name="brandName"
          value={formik.values.brandName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.brandName && Boolean(formik.errors.brandName)}
          helperText={formik.touched.brandName && formik.errors.brandName}
          margin="normal"
        />
        <TextField
          label="Description"
          fullWidth
          name="brandDescription"
          value={formik.values.brandDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.brandDescription && Boolean(formik.errors.brandDescription)}
          helperText={formik.touched.brandDescription && formik.errors.brandDescription}
          margin="normal"
        />
        <TextField
          label="Website URL"
          fullWidth
          name="brandWebsiteUrl"
          value={formik.values.brandWebsiteUrl}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.brandWebsiteUrl && Boolean(formik.errors.brandWebsiteUrl)}
          helperText={formik.touched.brandWebsiteUrl && formik.errors.brandWebsiteUrl}
          margin="normal"
        />
        {!logoFile && (
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
        {logoFile && (
          <Box mt={2} className="flex justify-center">
            <img src={URL.createObjectURL(logoFile)} alt="Brand" className="w-32 h-32 object-cover rounded" />
          </Box>
        )}
        <div className="flex items-center justify-center mt-4">
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Create Brand"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DashboardCreateBrand;
