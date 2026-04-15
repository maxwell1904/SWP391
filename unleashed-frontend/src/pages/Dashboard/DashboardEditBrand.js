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

const DashboardEditBrand = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [brandWebsiteUrl, setbrandWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await apiClient.get(`/api/brands/${brandId}`, {
          headers: { Authorization: varToken },
        });
        const { brandName, brandDescription, brandWebsiteUrl, brandImageUrl } =
          response.data;
        setBrandName(brandName);
        setBrandDescription(brandDescription);
        setbrandWebsiteUrl(brandWebsiteUrl);
        setCurrentLogoUrl(brandImageUrl);
      } catch (error) {
        console.error("Error fetching brand data:", error);
      }
    };
    fetchBrand();
  }, [brandId, varToken]);

  const validationSchema = Yup.object({
    brandName: Yup.string()
      .max(32, "Brand name must be at most 32 characters")
      .required("Brand name is required"),
    brandDescription: Yup.string()
      .max(150, "Description must be at most 150 characters")
      .required("Brand Description is required"),
      brandWebsiteUrl: Yup.string()
      .matches(
        /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[a-z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?$/i,
        "Enter a valid URL"
      )
      .required("Website URL is required"),
  });

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      let brandImageUrl = currentLogoUrl;
      if (logoFile) {
        const formData = new FormData();
        formData.append("image", logoFile);
        const uploadResponse = await fetch(
          "https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912",
          { method: "POST", body: formData }
        );
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          brandImageUrl = uploadData.data.display_url;
        } else {
          throw new Error("Image upload failed");
        }
      }
      //console.log("Brand:", {brandId, values});
      await apiClient.put(
        `/api/brands/${brandId}`,
        {
          id: brandId,
          brandName: values.brandName,
          brandDescription: values.brandDescription,
          brandWebsiteUrl: values.brandWebsiteUrl,
          brandImageUrl,
        },
        { headers: { Authorization: varToken } }
      );
      toast.success("Brand updated successfully", {
        position: "bottom-right",
        transition: Zoom,
      });
      navigate("/Dashboard/Brands");
    } catch (error) {
      toast.error(error.response?.data || "Update brand failed", {
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
    <Container
      maxWidth="sm"
      sx={{ p: 4, backgroundColor: "white", borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Edit Brand
      </Typography>
      <Formik
        initialValues={{
          brandName,
          brandDescription,
          brandWebsiteUrl,
        }}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form>
            <TextField
              label="Brand name"
              variant="outlined"
              fullWidth
              margin="normal"
              name="brandName"
              value={values.brandName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.brandName && !!errors.brandName}
              helperText={touched.brandName && errors.brandName}
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              margin="normal"
              name="brandDescription"
              value={values.brandDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.brandDescription && Boolean(errors.brandDescription)}
              helperText={touched.brandDescription && errors.brandDescription}
            />
            <TextField
              label="Website URL"
              variant="outlined"
              fullWidth
              margin="normal"
              name="brandWebsiteUrl"
              value={values.brandWebsiteUrl}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              error={touched.brandWebsiteUrl && Boolean(errors.brandWebsiteUrl)}
              helperText={touched.brandWebsiteUrl && errors.brandWebsiteUrl}
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
            {newImagePreview ? (
              <Box mt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                <img
                  src={newImagePreview}
                  alt="New Logo Preview"
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <Typography variant="body2" color="textSecondary" mt={2}>
                  New Image Preview
                </Typography>
              </Box>
            ) : (
              currentLogoUrl && (
                <Box mt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                  <img
                    src={currentLogoUrl}
                    alt="Current Logo"
                    style={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <Typography variant="body2" color="textSecondary" mt={2}>
                    Current Image
                  </Typography>
                </Box>
              )
            )}
            <Box mt={3}>
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
                  "Update brand"
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
export default DashboardEditBrand;
