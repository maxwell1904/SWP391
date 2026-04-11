import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import { toast, Zoom } from "react-toastify";
import { Container, Typography, TextField, Button, Box, CircularProgress } from "@mui/material";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocationSelector from "../../service/LocationService";
const DashboardEditProvider = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const [providerData, setProviderData] = useState({
    providerName: "",
    providerEmail: "",
    providerPhone: "",
    providerAddress: "",
  });
  const [providerImage, setProviderImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await apiClient.get(`/api/providers/${providerId}`, {
          headers: { Authorization: varToken },
        });
        const { providerName, providerEmail, providerPhone, providerAddress, providerImageUrl } = response.data;
        setProviderData({ providerName, providerEmail, providerPhone, providerAddress });
        setCurrentImageUrl(providerImageUrl);
      } catch (error) {
        toast.error("Error fetching provider data", { position: "bottom-right" });
      }
    };
    fetchProvider();
  }, [providerId, varToken]);

  const validationSchema = Yup.object({
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
       .required("Address is required"),
   });
 
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      let providerImageUrl = currentImageUrl;
      if (providerImage) {
        const formData = new FormData();
        formData.append("image", providerImage);
        const uploadResponse = await fetch("https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          providerImageUrl = uploadData.data.display_url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      await apiClient.put(
        `/api/providers/${providerId}`,
        { id: providerId, ...values, providerImageUrl },
        { headers: { Authorization: varToken } }
      );

      toast.success("Provider updated successfully", { position: "bottom-right", transition: Zoom });
      navigate("/Dashboard/Providers");
    } catch (error) {
          toast.error(error.response?.data?.message || "Update provider failed", {
            position: "bottom-right"
          });
            } finally {
      setIsSubmitting(false);
    }
  };
  
      const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setProviderImage(file);
          setNewImagePreview(URL.createObjectURL(file));
        } else {
          toast.error("Only image files are allowed!", { position: "bottom-right" });
        }
      };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setProviderImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    } else {
      toast.error("Only image files are allowed!", { position: "bottom-right" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ p: 4, backgroundColor: "white", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Provider
      </Typography>
      <Formik initialValues={providerData} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form>
            <TextField label="Provider Name" fullWidth name="providerName" value={values.providerName} onChange={handleChange} onBlur={handleBlur} error={touched.providerName && Boolean(errors.providerName)} helperText={touched.providerName && errors.providerName} margin="normal" />
            <TextField label="Email" fullWidth name="providerEmail" value={values.providerEmail} onChange={handleChange} onBlur={handleBlur} error={touched.providerEmail && Boolean(errors.providerEmail)} helperText={touched.providerEmail && errors.providerEmail} margin="normal" />
            <TextField label="Phone" fullWidth name="providerPhone" value={values.providerPhone} onChange={handleChange} onBlur={handleBlur} error={touched.providerPhone && Boolean(errors.providerPhone)} helperText={touched.providerPhone && errors.providerPhone} margin="normal" />
            <TextField label="Address" fullWidth name="providerAddress" value={values.providerAddress} onChange={handleChange} onBlur={handleBlur} error={touched.providerAddress && Boolean(errors.providerAddress)} helperText={touched.providerAddress && errors.providerAddress} margin="normal" />
            <Box mt={2} className="border-dashed border-2 border-gray-400 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100 transition" onClick={() => fileInputRef.current.click()}  onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}>
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
                            currentImageUrl && (
                            <Box mt={2} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                              <img
                                src={currentImageUrl}
                                alt="Current Image Url"
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
            <Box mt={3}><Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>{isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Update Provider"}</Button></Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default DashboardEditProvider;
