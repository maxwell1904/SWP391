  import React, { useState, useEffect } from "react";
  import {
    Modal,
    Box,
    Button,
    TextField,
    Avatar,
    IconButton,
  } from "@mui/material";
  import { apiClient } from "../../core/api";
  import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
  import { toast, Zoom } from "react-toastify";
  import { PhotoCamera } from "@mui/icons-material";
  import useAuthUser from "react-auth-kit/hooks/useAuthUser";
  import { Formik, Form, Field } from "formik";
  import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .min(1, "Email must be at least 1 character")
    .max(255, "Email cannot exceed 255 characters")
    .matches(/^[a-zA-Z0-9@.]+$/, "Email cannot contain special characters"),
  fullName: Yup.string()
    .required("Full Name is required")
    .min(1, "Full Name must be at least 1 character")
    .max(255, "Full Name cannot exceed 255 characters")
    .matches(
      /^[\p{L} .'-]+$/u,
      "Full Name cannot contain special characters or numbers"
    ),
  phoneNumber: Yup.string()
    .matches(
      /^(?:\+84|0)\d{9,10}$/,
      "Phone number must start with '+84' or '0' and be 10-11 digits"
    )
    .required("Phone number is required"),
});

  const ManagerSettings = ({ open, onClose, onImageUpdate, onFullNameUpdate }) => {
    const [userData, setUserData] = useState(null);
    const role = useAuthUser().role;
    const varToken = useAuthHeader();

 
    useEffect(() => {
      if (open) {
        apiClient
          .get("/api/account/me", { headers: { Authorization: varToken } })
          .then((response) => {
           // console.log(" API Response:", response.data);
            const data = response.data;
    
            if (data) {
              setUserData({
                userId: data.userId,  
                username: data.username,
                email: data.email || data.userEmail || "",
                fullName: data.fullName || "",
                phoneNumber: data.phoneNumber || data.userPhone || "",
                userImage: data.userImage || "",
              });
            } else {
              console.error("Missing fields in API response.");
              toast.error("Error: Failed to load user data.");
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load user data.");
          });
      }
    }, [open, varToken]);
    
    
    const handleImageUpload = async (e, setFieldValue) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(
          "https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912",
          { method: "POST", body: formData }
        );

        const data = await response.json();
        if (data.success) {
          setFieldValue("userImage", data.data.url);
          setUserData((prev) => ({ ...prev, userImage: data.data.url }));
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };
    const handleUpdate = async (values) => {
      // console.log("SENDING UPDATE REQUEST:", {
      //   userId: userData?.userId,
      //   email: values.email,
      //   fullName: values.fullName,
      //   phoneNumber: values.phoneNumber,
      //   userImage: values.userImage
      // });
    
      try {
        await apiClient.put("/api/user/updateprofile", {
          userId: userData?.userId, 
          email: values.email,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          userImage: values.userImage
        }, {
          headers: {
            "Authorization": varToken,
            "Content-Type": "application/json"
          },
        });
    
        toast.success("Profile updated successfully!", { position: "bottom-right", transition: Zoom });
        onImageUpdate(values.userImage);
        localStorage.setItem("userImage", values.userImage);
        localStorage.setItem("userFullName", values.fullName);
        onFullNameUpdate(values.fullName);
        onClose();
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Error updating profile.", { position: "bottom-right", transition: Zoom });
      }
    };
    
    if (!userData) return null;

    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            maxWidth: 400,
            mx: "auto",
            my: "5vh",
            p: 4,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            textAlign: "center",
          }}
        >
          <Formik
            initialValues={{
              email: userData.email,
              fullName: userData.fullName,
              phoneNumber: userData.phoneNumber,
              userImage: userData.userImage,
            }}
            enableReinitialize 
            validationSchema={validationSchema}
            onSubmit={(values) => handleUpdate(values)}
          >
            {({ values, handleChange, setFieldValue, errors, touched }) => (
              <Form>
                {/* Ảnh đại diện */}
                <Box sx={{ position: "relative", width: 80, height: 80, mx: "auto", mb: 2 }}>
                  <Avatar
                    src={values.userImage}
                    alt={values.fullName}
                    sx={{
                      width: 80,
                      height: 80,
                      border: "3px solid #eee",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                    style={{ display: "none" }}
                    id="upload-avatar"
                    disabled={role === "STAFF"}
                  />
                  <label htmlFor="upload-avatar">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        opacity: 0,
                        transition: "opacity 0.3s ease-in-out",
                        "&:hover": { opacity: 1 },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <PhotoCamera sx={{ color: "gray" }} />
                    </IconButton>
                  </label>
                </Box>

                {/* Username (không chỉnh sửa) */}
                <TextField label="Username" fullWidth margin="normal" value={userData.username} disabled />

                {/* Email */}
                <Field
    as={TextField}
    label="Email"
    name="email"
    fullWidth
    margin="normal"
    onChange={handleChange} 
    error={touched.email && !!errors.email}
    helperText={touched.email && errors.email}
  />


                {/* Full Name */}
                <Field
                  as={TextField}
                  label="Full Name"
                  name="fullName"
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  disabled={role === "STAFF"}
                  error={touched.fullName && !!errors.fullName}
                  helperText={touched.fullName && errors.fullName}
                />

                {/* Phone Number */}
                <Field
                  as={TextField}
                  label="Phone Number"
                  name="phoneNumber"
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                  disabled={role === "STAFF"}
                  error={touched.phoneNumber && !!errors.phoneNumber}
                  helperText={touched.phoneNumber && errors.phoneNumber }
                />

                {/* Nút cập nhật */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                  {role !== "STAFF" && (
                    <Button type="submit" variant="contained" color="primary">
                      Update
                    </Button>
                  )}
                  <Button variant="outlined" color="secondary" onClick={onClose}>
                    Close
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
    );
  };

  export default ManagerSettings;
