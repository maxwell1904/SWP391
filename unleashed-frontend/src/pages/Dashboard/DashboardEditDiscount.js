import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    CircularProgress,
    Grid,
    MenuItem,
    Paper,
    TextField,
    Typography,
    Box,
    Skeleton,
    Chip,
    FormControl,
    InputLabel
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast } from "react-toastify";

const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    } catch (error) {
        return '';
    }
};

const convertToOffsetDateTime = (localDateTime) => {
    if (!localDateTime) return null;
    return new Date(localDateTime).toISOString();
};

const validationSchema = Yup.object({
    discountType: Yup.number().required("Type is required").oneOf([1, 2]),
    discountValue: Yup.number().required("Value is required").min(0).when("discountType", {
        is: 1, then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
    }),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().required("End date is required").min(Yup.ref("startDate"), "End date must be after start"),
    discountDescription: Yup.string().nullable(),
    minimumOrderValue: Yup.number().min(0).nullable(),
    maximumDiscountValue: Yup.number().min(0).nullable().when("discountType", {
        is: 2, then: (schema) => schema.test("is-null", "Max value must be empty for Fixed Amount", (v) => v === null || v === undefined || v === ''),
    }),
    usageLimit: Yup.number().required("Usage limit is required").min(1),
    discountRank: Yup.number().required("Rank is required").oneOf([1, 2, 3, 4, 5]),
});

const EditDiscountSkeleton = () => (
    <div className="p-4">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="text" width={250} height={50} />
            <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
        <Grid container spacing={4}>
            <Grid item xs={12} md={7}><Skeleton variant="rectangular" height={300} /></Grid>
            <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={200} /></Grid>
            <Grid item xs={12}><Skeleton variant="rectangular" height={150} /></Grid>
        </Grid>
    </div>
);

const DashboardEditDiscount = () => {
    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { discountId } = useParams();
    const varToken = useAuthHeader();

    useEffect(() => {
        if (discountId) {
            setLoading(true);
            apiClient.get(`/api/discounts/${discountId}`, { headers: { Authorization: varToken } })
                .then((response) => {
                    const d = response.data;
                    setInitialValues({
                        discountCode: d.discountCode || "",
                        discountType: d.discountType?.id || 1,
                        discountValue: d.discountValue || "",
                        startDate: formatDateTimeForInput(d.startDate),
                        endDate: formatDateTimeForInput(d.endDate),
                        discountStatusName: d.discountStatus?.discountStatusName || "N/A",
                        discountDescription: d.discountDescription || "",
                        minimumOrderValue: d.minimumOrderValue || "",
                        maximumDiscountValue: d.maximumDiscountValue || "",
                        usageLimit: d.usageLimit || "",
                        discountRank: d.rank?.id || 1,
                        usageCount: d.usageCount || 0,
                    });
                })
                .catch(() => toast.error("Failed to load discount details."))
                .finally(() => setLoading(false));
        }
    }, [discountId, varToken]);

    const handleSubmit = (values, { setSubmitting }) => {
        const requestBody = {
            discountCode: values.discountCode,
            discountType: { id: values.discountType },
            discountValue: values.discountValue,
            startDate: convertToOffsetDateTime(values.startDate),
            endDate: convertToOffsetDateTime(values.endDate),
            discountDescription: values.discountDescription,
            minimumOrderValue: values.minimumOrderValue || null,
            maximumDiscountValue: values.maximumDiscountValue || null,
            usageLimit: values.usageLimit,
            rank: { id: values.discountRank },
            usageCount: values.usageCount
        };
        apiClient.put(`/api/discounts/${discountId}`, requestBody, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success("Discount updated successfully!");
                navigate("/Dashboard/Discounts");
            })
            .catch(() => toast.error("Failed to update discount."))
            .finally(() => setSubmitting(false));
    };

    if (loading || !initialValues) {
        return <EditDiscountSkeleton />;
    }

    return (
        <div className="p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Edit Discount #{discountId}
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/Dashboard/Discounts")} variant="outlined">
                    Back to Discounts
                </Button>
            </Box>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ errors, touched, values, isSubmitting }) => (
                    <Form>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={7}>
                                <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow h-full">
                                    <Typography variant="h6" className="font-semibold mb-4">Core Details</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Field as={TextField} name="discountCode" label="Discount Code" fullWidth disabled />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField name="discountStatusName" label="Current Status" value={values.discountStatusName} fullWidth disabled />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field as={TextField} name="discountType" label="Discount Type" select fullWidth required
                                                   error={touched.discountType && !!errors.discountType} helperText={touched.discountType && errors.discountType}>
                                                <MenuItem value={1}>Percentage</MenuItem>
                                                <MenuItem value={2}>Fixed Amount</MenuItem>
                                            </Field>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field as={TextField} name="discountValue" label="Discount Value" type="number" fullWidth required
                                                   error={touched.discountValue && !!errors.discountValue} helperText={touched.discountValue && errors.discountValue} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Field as={TextField} name="discountDescription" label="Description" multiline rows={3} fullWidth
                                                   error={touched.discountDescription && !!errors.discountDescription} helperText={touched.discountDescription && errors.discountDescription} />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow h-full">
                                    <Typography variant="h6" className="font-semibold mb-4">Scheduling</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Field as={TextField} name="startDate" label="Start Date" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }}
                                                   error={touched.startDate && !!errors.startDate} helperText={touched.startDate && errors.startDate} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Field as={TextField} name="endDate" label="End Date" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }}
                                                   error={touched.endDate && !!errors.endDate} helperText={touched.endDate && errors.endDate} />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
                                    <Typography variant="h6" className="font-semibold mb-4">Rules & Conditions</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={4}>
                                            <Field as={TextField} name="minimumOrderValue" label="Minimum Order Value" type="number" fullWidth
                                                   error={touched.minimumOrderValue && !!errors.minimumOrderValue} helperText={touched.minimumOrderValue && errors.minimumOrderValue} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Field as={TextField} name="maximumDiscountValue" label="Maximum Discount Value" type="number" fullWidth disabled={values.discountType === 2}
                                                   error={touched.maximumDiscountValue && !!errors.maximumDiscountValue} helperText={touched.maximumDiscountValue && errors.maximumDiscountValue} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Field as={TextField} name="usageLimit" label="Total Usage Limit" type="number" required fullWidth
                                                   error={touched.usageLimit && !!errors.usageLimit} helperText={touched.usageLimit && errors.usageLimit} />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Field type="hidden" name="discountRank" />

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" color="secondary" onClick={() => navigate('/Dashboard/Discounts')}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24} /> : "Update Discount"}
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DashboardEditDiscount;