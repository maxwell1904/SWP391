import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Avatar,
    Typography,
    Box,
    IconButton,
    Grid,
    CircularProgress,
    Paper,
    Divider,
} from "@mui/material";
import { PhotoCamera, Save } from "@mui/icons-material";
import { GetUserInfo, UpdateUserInfo } from "../../service/UserService";
import { toast } from "react-toastify";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import UserChangePassword from "./UserChangePassword";
import userDefault from "../../assets/images/userdefault.webp";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useFormik } from "formik";
import * as Yup from "yup";
import DeleteAccountButton from "../../components/modals/DeleteAccount";
import { jwtDecode } from "jwt-decode";

const validationSchema = Yup.object({
    username: Yup.string()
        .required("Username is required")
        .min(5, "Username must be at least 5 characters long"),
    fullName: Yup.string()
        .required("Full name is required")
        .matches(/^[a-zA-Z\s'-]+$/, "Full name can only contain valid characters"),
    userPhone: Yup.string()
        .matches(/^(|0\d{9,11})$/, "Phone number must start with '0' and be 10 or 12 digits")
        .nullable(),
    userAddress: Yup.string().nullable(),
});

export const UserProfile = () => {
    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    const signOut = useSignOut();
    const signIn = useSignIn();

    const [profileImage, setProfileImage] = useState(userDefault);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGoogleAccount, setIsGoogleAccount] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
            username: "",
            fullName: "",
            userPhone: "",
            userAddress: "",
            userImage: "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setSubmitting(true);
            try {
                let imageUrl = values.userImage;
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("image", selectedFile);
                    const uploadPromise = fetch('https://api.imgbb.com/1/upload?key=387abfba10f808a7f6ac4abb89a3d912', {
                        method: 'POST',
                        body: formData,
                    }).then((res) => res.json());

                    const uploadResponse = await toast.promise(uploadPromise, {
                        pending: 'Uploading image...',
                        success: 'Image uploaded!',
                        error: 'Image upload failed.',
                    });

                    if (uploadResponse.success) {
                        imageUrl = uploadResponse.data.display_url;
                    } else {
                        throw new Error(uploadResponse.error.message);
                    }
                }

                const updatedData = { ...values, userImage: imageUrl };
                const response = await UpdateUserInfo(updatedData, authHeader);

                if (response && response.data && response.data.token) {
                    const newToken = response.data.token;
                    const decodedToken = jwtDecode(newToken);

                    const userState = {
                        username: decodedToken.sub,
                        fullName: decodedToken.fullName,
                        email: decodedToken.userEmail,
                        userImage: decodedToken.image,
                        address: decodedToken.address
                    };

                    signIn({
                        auth: { token: newToken, type: 'Bearer' },
                        userState: userState
                    });

                    toast.success("Profile updated successfully!");
                    setSelectedFile(null);

                    formik.resetForm({
                        values: {
                            ...values,
                            username: userState.username,
                            fullName: userState.fullName,
                            userImage: userState.userImage || userDefault,
                            userAddress: userState.address || '',
                            email: userState.email || ''
                        }
                    });

                } else {
                    throw new Error(response.data.message || "Failed to update session.");
                }

            } catch (error) {
                console.error("Error updating profile:", error);
                const errorMessage = error.response?.data?.message || error.message;
                toast.error(`Update failed: ${errorMessage}`);
            } finally {
                setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            setLoading(true);
            try {
                const response = await GetUserInfo(authHeader);
                const userInfo = response.data;

                setIsGoogleAccount(!!userInfo.userGoogleId);

                const initialData = {
                    email: userInfo.userEmail || "",
                    username: userInfo.username || "",
                    fullName: userInfo.fullName || "",
                    userAddress: userInfo.userAddress || "",
                    userPhone: userInfo.userPhone || "",
                    userImage: userInfo.userImage || userDefault,
                };
                formik.resetForm({ values: initialData });
                setProfileImage(initialData.userImage);
            } catch (error) {
                toast.error("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };
        if(authHeader) fetchUserInfo();
    }, [authHeader]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error("Please select a valid image file.");
        }
    };

    const handleDeleteSuccess = () => {
        signOut();
        navigate("/");
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 4, mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar src={profileImage} sx={{ width: 100, height: 100 }} />
                        <IconButton
                            color="primary"
                            component="label"
                            sx={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                backgroundColor: 'white',
                                '&:hover': { backgroundColor: 'grey.200' },
                            }}
                        >
                            <PhotoCamera />
                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </IconButton>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            {formik.values.fullName || "User"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {formik.values.email}
                        </Typography>
                    </Box>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
                    <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                        Account Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Username" name="username" {...formik.getFieldProps("username")}
                                       error={formik.touched.username && Boolean(formik.errors.username)}
                                       helperText={formik.touched.username && formik.errors.username}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Full Name" name="fullName" {...formik.getFieldProps("fullName")}
                                       error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                       helperText={formik.touched.fullName && formik.errors.fullName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone Number" name="userPhone" {...formik.getFieldProps("userPhone")}
                                       error={formik.touched.userPhone && Boolean(formik.errors.userPhone)}
                                       helperText={formik.touched.userPhone && formik.errors.userPhone}
                                       placeholder="e.g., 0123456789"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Address" name="userAddress" {...formik.getFieldProps("userAddress")}
                                       error={formik.touched.userAddress && Boolean(formik.errors.userAddress)}
                                       helperText={formik.touched.userAddress && formik.errors.userAddress}
                                       placeholder="e.g., 123 Main St, District 1, HCMC"
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save />}
                                disabled={!formik.dirty || !formik.isValid || formik.isSubmitting}
                                sx={{
                                    fontFamily: "Montserrat",
                                    width: "170px",
                                    textTransform: "none",
                                    borderRadius: "8px",
                                }}
                            >
                                Save Changes
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {!isGoogleAccount && (
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mt: 3 }}>
                    <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                        Security
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Change your password</Typography>
                        <UserChangePassword />
                    </Box>
                </Paper>
            )}

            <Paper elevation={3} sx={{ p: 3, borderRadius: 4, mt: 3, border: 1, borderColor: 'error.main' }}>
                <Typography variant="h6" component="h2" gutterBottom fontWeight="bold" color="error">
                    Danger Zone
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography fontWeight="medium">Delete your account</Typography>
                        <Typography variant="body2" color="text.secondary">Once deleted, your account is gone forever. Please be certain.</Typography>
                    </Box>
                    <DeleteAccountButton authHeader={authHeader} onDeleteSuccess={handleDeleteSuccess} />
                </Box>
            </Paper>
        </Box>
    );
};

export default UserProfile;