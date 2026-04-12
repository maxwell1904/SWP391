import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { TextField, Button, Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const DashboardCreateCategory = () => {
  const [categoryImage, setCategoryImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const formik = useFormik({
    initialValues: {
      categoryName: "",
      categoryDescription: "",
    },
    validationSchema: Yup.object({
      categoryName: Yup.string()
        .max(32, "Category name must be at most 32 characters")
        .required("Category name is required"),
      categoryDescription: Yup.string()
        .max(150, "Description must be at most 150 characters")
        .required("Category description is required"),
    }),
    onSubmit: async (values) => {
      if (!categoryImage) {
        toast.error("You must upload an image before creating the category!", {
          position: "bottom-right",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const formData = new FormData();
        formData.append("image", categoryImage);

        const response = await fetch(
          "https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error("Image upload failed");
        }

        const categoryImageUrl = data.data.display_url;

        await apiClient.post(
          "/api/categories",
          {
            categoryName: values.categoryName,
            categoryDescription: values.categoryDescription,
            categoryImageUrl,
          },
          {
            headers: {
              Authorization: varToken,
            },
          }
        );

        toast.success("Category created successfully!", {
          position: "bottom-right",
        });
        navigate("/Dashboard/Categories");
      }catch (error) {
        toast.error(error.response?.data.message || "Create category failed", {
          position: "bottom-right",
        });         
      }   finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCategoryImage(file);
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
        setCategoryImage(file);
      }
    };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Create New Category</h1>
      <form onSubmit={formik.handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <TextField
          label="Category name"
          fullWidth
          name="categoryName"
          value={formik.values.categoryName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.categoryName && Boolean(formik.errors.categoryName)}
          helperText={formik.touched.categoryName && formik.errors.categoryName}
          margin="normal"
        />
        <TextField
          label="Description"
          fullWidth
          name="categoryDescription"
          value={formik.values.categoryDescription}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.categoryDescription && Boolean(formik.errors.categoryDescription)}
          helperText={formik.touched.categoryDescription && formik.errors.categoryDescription}
          margin="normal"
        />
        {!categoryImage && (
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

        {categoryImage && (
          <Box mt={2} className="flex justify-center">
            <img src={URL.createObjectURL(categoryImage)} alt="Category" className="w-32 h-32 object-cover rounded" />
          </Box>
        )}
        <div className="flex items-center justify-center mt-4">
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DashboardCreateCategory;