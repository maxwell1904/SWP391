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
  InputAdornment,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast } from "react-toastify";

const formatDateTimeForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  } catch (error) {
    return "";
  }
};

const convertToOffsetDateTime = (localDateTime) => {
  if (!localDateTime) return null;
  return new Date(localDateTime).toISOString();
};

const validationSchema = Yup.object({
  voucherType: Yup.number().required("Type is required").oneOf([1, 2]),
  voucherValue: Yup.number()
    .required("Value is required")
    .min(0)
    .when("voucherType", {
      is: 1,
      then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
    }),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date must be after start"),
  voucherDescription: Yup.string().nullable(),
  minimumOrderValue: Yup.number().min(0).nullable(),
  maximumVoucherValue: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value,
    )
    .min(0)
    .nullable()
    .when("voucherType", {
      is: 2,
      then: (schema) =>
        schema.test(
          "is-null",
          "Max value must be empty for Fixed Amount",
          (v) => v === null || v === undefined || v === "",
        ),
    }),
  usageLimit: Yup.number().required("Usage limit is required").min(1),
  voucherRank: Yup.number()
    .required("Rank is required")
    .oneOf([1, 2, 3, 4, 5]),
});

const EditVoucherSkeleton = () => (
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
    <Grid container spacing={4}>
      <Grid item xs={12} md={7}>
        <Skeleton variant="rectangular" height={300} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Skeleton variant="rectangular" height={200} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={150} />
      </Grid>
    </Grid>
  </div>
);

const DashboardEditVoucher = () => {
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { voucherId } = useParams();
  const varToken = useAuthHeader();

  useEffect(() => {
    if (voucherId) {
      setLoading(true);
      apiClient
        .get(`/api/vouchers/${voucherId}`, {
          headers: { Authorization: varToken },
        })
        .then((response) => {
          const d = response.data;
          setInitialValues({
            voucherCode: d.voucherCode || "",
            voucherType: d.voucherType?.id || 1,
            voucherValue: d.voucherValue || "",
            startDate: formatDateTimeForInput(d.startDate),
            endDate: formatDateTimeForInput(d.endDate),
            voucherStatusName: d.voucherStatus?.voucherStatusName || "N/A",
            voucherDescription: d.voucherDescription || "",
            minimumOrderValue: d.minimumOrderValue || "",
            maximumVoucherValue:
              d.voucherType?.id === 2 ? "" : (d.maximumVoucherValue ?? ""),
            usageLimit: d.usageLimit || "",
            voucherRank: d.rank?.id || 1,
            usageCount: d.usageCount || 0,
          });
        })
        .catch(() => toast.error("Failed to load voucher details."))
        .finally(() => setLoading(false));
    }
  }, [voucherId, varToken]);

  const handleSubmit = (values, { setSubmitting }) => {
    const requestBody = {
      voucherCode: values.voucherCode,
      voucherType: { id: values.voucherType },
      voucherValue: values.voucherValue,
      startDate: convertToOffsetDateTime(values.startDate),
      endDate: convertToOffsetDateTime(values.endDate),
      voucherDescription: values.voucherDescription,
      minimumOrderValue: values.minimumOrderValue || null,
      maximumVoucherValue:
        values.voucherType === 2 ? null : values.maximumVoucherValue || null,
      usageLimit: values.usageLimit,
      rank: { id: values.voucherRank },
      usageCount: values.usageCount,
    };
    apiClient
      .put(`/api/vouchers/${voucherId}`, requestBody, {
        headers: { Authorization: varToken },
      })
      .then(() => {
        toast.success("Voucher updated successfully!");
        navigate("/Dashboard/Vouchers");
      })
      .catch(() => toast.error("Failed to update voucher."))
      .finally(() => setSubmitting(false));
  };

  if (loading || !initialValues) {
    return <EditVoucherSkeleton />;
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
          Edit Voucher #{voucherId}
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/Dashboard/Vouchers")}
          variant="outlined"
        >
          Back to Vouchers
        </Button>
      </Box>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          errors,
          touched,
          values,
          isSubmitting,
          setFieldValue,
          setFieldTouched,
        }) => (
          <Form>
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Paper
                  sx={{ p: 4 }}
                  className="bg-white rounded-lg shadow h-full"
                >
                  <Typography variant="h6" className="font-semibold mb-4">
                    Core Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="voucherCode"
                        label="Voucher Code"
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="voucherStatusName"
                        label="Current Status"
                        value={values.voucherStatusName}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="voucherType"
                        label="Voucher Type"
                        select
                        fullWidth
                        required
                        onChange={(e) => {
                          const selectedType = Number(e.target.value);
                          setFieldValue("voucherType", selectedType);

                          if (selectedType === 2) {
                            setFieldValue("maximumVoucherValue", "");
                            setFieldTouched(
                              "maximumVoucherValue",
                              false,
                              false,
                            );
                          }
                        }}
                        error={touched.voucherType && !!errors.voucherType}
                        helperText={touched.voucherType && errors.voucherType}
                      >
                        <MenuItem value={1}>Percentage</MenuItem>
                        <MenuItem value={2}>Fixed Amount</MenuItem>
                      </Field>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="voucherValue"
                        label="Voucher Value"
                        type="number"
                        fullWidth
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {values.voucherType === 1 ? "%" : "₫"}
                            </InputAdornment>
                          ),
                        }}
                        error={touched.voucherValue && !!errors.voucherValue}
                        helperText={
                          touched.voucherValue && errors.voucherValue
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="voucherDescription"
                        label="Description"
                        multiline
                        rows={3}
                        fullWidth
                        error={
                          touched.voucherDescription &&
                          !!errors.voucherDescription
                        }
                        helperText={
                          touched.voucherDescription &&
                          errors.voucherDescription
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  sx={{ p: 4 }}
                  className="bg-white rounded-lg shadow h-full"
                >
                  <Typography variant="h6" className="font-semibold mb-4">
                    Scheduling
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="startDate"
                        label="Start Date"
                        type="datetime-local"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={touched.startDate && !!errors.startDate}
                        helperText={touched.startDate && errors.startDate}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="endDate"
                        label="End Date"
                        type="datetime-local"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={touched.endDate && !!errors.endDate}
                        helperText={touched.endDate && errors.endDate}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Rules & Conditions
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="minimumOrderValue"
                        label="Minimum Order Value"
                        type="number"
                        fullWidth
                        error={
                          touched.minimumOrderValue &&
                          !!errors.minimumOrderValue
                        }
                        helperText={
                          touched.minimumOrderValue && errors.minimumOrderValue
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="maximumVoucherValue"
                        label="Maximum Voucher Value"
                        type="number"
                        fullWidth
                        disabled={values.voucherType === 2}
                        error={
                          touched.maximumVoucherValue &&
                          !!errors.maximumVoucherValue
                        }
                        helperText={
                          touched.maximumVoucherValue &&
                          errors.maximumVoucherValue
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="usageLimit"
                        label="Total Usage Limit"
                        type="number"
                        required
                        fullWidth
                        error={touched.usageLimit && !!errors.usageLimit}
                        helperText={touched.usageLimit && errors.usageLimit}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Field type="hidden" name="voucherRank" />

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
                onClick={() => navigate("/Dashboard/Vouchers")}
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
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Update Voucher"
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DashboardEditVoucher;
