import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import { toast, Zoom } from "react-toastify";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const DashboardEditCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await apiClient.get(`/api/categories/${categoryId}`, {
          headers: { Authorization: varToken },
        });
        const { categoryName, categoryDescription, categoryImageUrl } = response.data;
        setCategoryName(categoryName);
        setCategoryDescription(categoryDescription);
        setCategoryImageUrl(categoryImageUrl);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };
    fetchCategory();
  }, [categoryId, varToken]);

  const validationSchema = Yup.object({
    categoryName: Yup.string()
      .max(32, "Category name must be at most 32 characters")
      .required("Category name is required"),
    categoryDescription: Yup.string()
      .max(150, "Description must be at most 150 characters")
      .required("Category description is required"),
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      let updatedImageUrl = categoryImageUrl;

      if (logoFile) {
        const formData = new FormData();
        formData.append("image", logoFile);
        const uploadResponse = await fetch(
          "https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912",
          { method: "POST", body: formData }
        );
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          updatedImageUrl = uploadData.data.display_url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      await apiClient.put(
        `/api/categories/${categoryId}`,
        {
          id: categoryId,
          categoryName: values.categoryName,
          categoryDescription: values.categoryDescription,
          categoryImageUrl: updatedImageUrl,
        },
        { headers: { Authorization: varToken } }
      );

      toast.success("Category updated successfully", {
        position: "bottom-right",
        transition: Zoom,
      });
      navigate("/Dashboard/Categories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update category failed", {
        position: "bottom-right",
        transition: Zoom,
      });
        } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed!", { position: "bottom-right" });
            return;
          }
          setLogoFile(file);
          setNewImagePreview(URL.createObjectURL(file));
        }
      };
    
      const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          setLogoFile(file);
          setNewImagePreview(URL.createObjectURL(file));
        } else {
          toast.error("Only image files are allowed!", { position: "bottom-right" });
        }
      };
  return (
    <Container maxWidth="sm" sx={{ p: 4, backgroundColor: "white", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Category
      </Typography>
      <Formik
        initialValues={{ categoryName, categoryDescription }}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form>
            <TextField
              label="Category Name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="categoryName"
              value={values.categoryName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.categoryName && !!errors.categoryName}
              helperText={touched.categoryName && errors.categoryName}
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              name="categoryDescription"
              value={values.categoryDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.categoryDescription && Boolean(errors.categoryDescription)}
              helperText={touched.categoryDescription && errors.categoryDescription}
            />

            <Typography variant="h6" gutterBottom mt={3}>
              Upload Logo Image
            </Typography>

            <Box
              mt={2}
              className="border-dashed border-2 border-gray-400 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition"
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLogoFile(file);
                    setNewImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
               <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
              <CloudUploadIcon fontSize="large" className="text-gray-500 mb-2" />
              <p className="text-gray-600">Drop or select file</p>
            </Box>

            <Box mt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
              <img src={newImagePreview || categoryImageUrl} alt="Category" style={{ width: 150, height: 150, objectFit: "cover", borderRadius: 8 }} />
              <Typography variant="body2" color="textSecondary" mt={2}>
                {newImagePreview ? "New Image Preview" : "Current Image"}
              </Typography>
            </Box>

            <Box mt={3}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Update category"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default DashboardEditCategory;