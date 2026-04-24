import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Skeleton,
  InputAdornment,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast } from "react-toastify";

const convertToOffsetDateTime = (value) => {
  if (!value) return "";
  if (value.length === 16) {
    return value + ":00Z";
  }
  return value;
};

const validationSchema = Yup.object({
  promotionType: Yup.string()
    .required("Promotion type is required")
    .oneOf(["PERCENTAGE", "FIXED AMOUNT"], "Invalid promotion type"),
  promotionValue: Yup.number()
    .required("Promotion value is required")
    .min(0, "Promotion value cannot be negative")
    .when("promotionType", {
      is: "PERCENTAGE",
      then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
    })
    .max(999999999, "Promotion value is too large"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date must be after start date"),
});

const getPromotionStatusFromDates = (startDateValue, endDateValue) => {
  if (!startDateValue || !endDateValue) return "N/A";

  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
  const now = new Date();

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "N/A";
  }

  if (endDate < now) return "EXPIRED";
  if (startDate <= now && endDate >= now) return "ACTIVE";
  return "INACTIVE";
};

const EditPromotionSkeleton = () => (
  <div className="p-4">
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4,
      }}
    >
      <Skeleton variant="text" width={250} height={50} />
      <Skeleton variant="rectangular" width={100} height={40} />
    </Box>
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={56} />
        </Grid>
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Skeleton variant="rectangular" width={150} height={40} />
        </Grid>
      </Grid>
    </Paper>
  </div>
);

const DashboardEditPromotion = () => {
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { promotionId } = useParams();
  const varToken = useAuthHeader();

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/api/promotions/${promotionId}`, { headers: { Authorization: varToken } })
      .then((response) => {
        const promotion = response.data;
        setInitialValues({
          promotionType: promotion.promotionType.promotionTypeName,
          promotionValue: promotion.promotionValue,
          startDate: formatDateTime(promotion.promotionStartDate),
          endDate: formatDateTime(promotion.promotionEndDate),
          promotionStatus: promotion.promotionStatus.promotionStatusName,
        });
      })
      .catch((error) => {
        toast.error("Failed to fetch promotion details.");
        console.error("Error fetching promotion details:", error);
      })
      .finally(() => setLoading(false));
  }, [promotionId, varToken]);

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      promotionType: { promotionTypeName: values.promotionType },
      promotionValue: values.promotionValue,
      promotionStartDate: convertToOffsetDateTime(values.startDate),
      promotionEndDate: convertToOffsetDateTime(values.endDate),
    };
    apiClient
      .put(`/api/promotions/${promotionId}`, payload, {
        headers: { Authorization: varToken },
      })
      .then(() => {
        toast.success("Promotion updated successfully");
        navigate("/Dashboard/Promotions");
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Update promotion failed");
        console.error("Error updating promotion:", error);
      })
      .finally(() => setSubmitting(false));
  };

  if (loading || !initialValues) {
    return <EditPromotionSkeleton />;
  }

  return (
    <div className="p-4">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" className="text-3xl font-bold">
          Edit Promotion #{promotionId}
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/Dashboard/Promotions")}
          variant="outlined"
        >
          Back to Promotions
        </Button>
      </Box>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values, isSubmitting }) => (
          <Form>
            <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="promotionType"
                    label="Promotion Type"
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="promotionValue"
                    label="Promotion Value"
                    type="number"
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {values.promotionType === "PERCENTAGE" ? "%" : "₫"}
                        </InputAdornment>
                      ),
                    }}
                    error={touched.promotionValue && Boolean(errors.promotionValue)}
                    helperText={touched.promotionValue && errors.promotionValue}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="startDate"
                    label="Start Date"
                    type="datetime-local"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    error={touched.startDate && Boolean(errors.startDate)}
                    helperText={touched.startDate && errors.startDate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="endDate"
                    label="End Date"
                    type="datetime-local"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    error={touched.endDate && Boolean(errors.endDate)}
                    helperText={touched.endDate && errors.endDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="promotionStatus"
                    label="Current Status"
                    value={getPromotionStatusFromDates(
                      values.startDate,
                      values.endDate,
                    )}
                    fullWidth
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/Dashboard/Promotions")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : "Update Promotion"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DashboardEditPromotion;
