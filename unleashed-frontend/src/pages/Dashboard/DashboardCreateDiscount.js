import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Paper,
  Grid,
} from "@mui/material";
import { CheckCircle, ErrorOutline, ArrowBack } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../../core/api";
import { useNavigate } from "react-router-dom";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useDebounce from "../../components/hooks/useDebounce";

const DashboardCreateDiscount = () => {
  const [codeToCheck, setCodeToCheck] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isCodeAvailable, setIsCodeAvailable] = useState(true);
  const debouncedCode = useDebounce(codeToCheck, 500);
  const varToken = useAuthHeader();
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedCode && debouncedCode.length >= 3) {
      setIsCheckingCode(true);
      setIsCodeAvailable(false);
      apiClient
        .get(`/api/discounts/check-code?code=${debouncedCode}`, {
          headers: { Authorization: varToken },
        })
        .then((response) => setIsCodeAvailable(!response.data))
        .catch(() => setIsCodeAvailable(false))
        .finally(() => setIsCheckingCode(false));
    } else {
      setIsCodeAvailable(true);
    }
  }, [debouncedCode, varToken]);

  const validationSchema = Yup.object({
    discountCode: Yup.string()
      .required("Discount code is required")
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code cannot exceed 20 characters")
      .matches(/^[a-zA-Z0-9]*$/, "No special characters allowed"),
    discountType: Yup.number().required("Type is required").oneOf([1, 2]),
    discountValue: Yup.number()
      .required("Value is required")
      .min(1, "Value must be at least 1")
      .max(99999999, "Value is too large")
      .when("discountType", {
        is: 1,
        then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
      }),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date()
      .required("End date is required")
      .min(Yup.ref("startDate"), "End date must be after start"),
    discountDescription: Yup.string().nullable(),
    minimumOrderValue: Yup.number().min(0).max(99999999999999999).nullable(),
    maximumDiscountValue: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null ? null : value,
      )
      .min(0)
      .max(99999999999999999)
      .nullable()
      .when("discountType", {
        is: 2,
        then: (schema) =>
          schema.test(
            "is-null",
            "Max value must be empty for Fixed Amount",
            (v) => v === null || v === undefined || v === "",
          ),
      }),
    usageLimit: Yup.number()
      .min(1)
      .max(99999999999999999)
      .required("Usage limit is required"),
    discountRank: Yup.number().required().oneOf([1, 2, 3, 4, 5]),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!isCodeAvailable) {
      toast.error("This discount code is already taken.");
      setSubmitting(false);
      return;
    }
    const requestBody = {
      discountCode: values.discountCode,
      discountType: { id: values.discountType },
      discountValue: values.discountValue,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      discountDescription: values.discountDescription,
      minimumOrderValue: values.minimumOrderValue || null,
      maximumDiscountValue:
        values.discountType === 2 ? null : values.maximumDiscountValue || null,
      usageLimit: values.usageLimit,
      rank: { id: values.discountRank },
    };
    try {
      await apiClient.post("/api/discounts", requestBody, {
        headers: { Authorization: varToken },
      });
      toast.success("Discount created successfully!");
      navigate("/Dashboard/Discounts");
    } catch (error) {
      toast.error("Create discount failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCodeFeedback = () => {
    if (isCheckingCode)
      return (
        <InputAdornment position="end">
          <CircularProgress size={20} />
        </InputAdornment>
      );
    if (codeToCheck.length >= 3) {
      return isCodeAvailable ? (
        <InputAdornment position="end">
          <CheckCircle color="success" />
        </InputAdornment>
      ) : (
        <InputAdornment position="end">
          <ErrorOutline color="error" />
        </InputAdornment>
      );
    }
    return null;
  };

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
          Create New Discount
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/Dashboard/Discounts")}
          variant="outlined"
        >
          Back to Discounts
        </Button>
      </Box>

      <Formik
        initialValues={{
          discountCode: "",
          discountType: 1,
          discountValue: "",
          startDate: "",
          endDate: "",
          discountDescription: "",
          minimumOrderValue: "",
          maximumDiscountValue: "",
          usageLimit: "",
          discountRank: 1,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, touched, errors, values, setFieldValue }) => (
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
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="discountCode"
                        label="Discount Code"
                        fullWidth
                        required
                        error={
                          (touched.discountCode &&
                            Boolean(errors.discountCode)) ||
                          !isCodeAvailable
                        }
                        helperText={
                          (touched.discountCode && errors.discountCode) ||
                          (!isCodeAvailable
                            ? "This code is already in use."
                            : "")
                        }
                        onChange={(e) => {
                          const upperCaseCode = e.target.value.toUpperCase();
                          setFieldValue("discountCode", upperCaseCode);
                          setCodeToCheck(upperCaseCode);
                        }}
                        InputProps={{ endAdornment: renderCodeFeedback() }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="discountType"
                        label="Discount Type"
                        select
                        fullWidth
                        required
                        onChange={(e) => {
                          const selectedType = Number(e.target.value);
                          setFieldValue("discountType", selectedType);

                          if (selectedType === 2) {
                            setFieldValue("maximumDiscountValue", "");
                          }
                        }}
                        error={
                          touched.discountType && Boolean(errors.discountType)
                        }
                        helperText={touched.discountType && errors.discountType}
                      >
                        <MenuItem value={1}>Percentage</MenuItem>
                        <MenuItem value={2}>Fixed Amount</MenuItem>
                      </Field>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        name="discountValue"
                        label="Discount Value"
                        fullWidth
                        required
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {values.discountType === 1 ? "%" : "₫"}
                            </InputAdornment>
                          ),
                        }}
                        error={
                          touched.discountValue && Boolean(errors.discountValue)
                        }
                        helperText={
                          touched.discountValue && errors.discountValue
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="discountDescription"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        error={
                          touched.discountDescription &&
                          Boolean(errors.discountDescription)
                        }
                        helperText={
                          touched.discountDescription &&
                          errors.discountDescription
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
                        error={touched.startDate && Boolean(errors.startDate)}
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
                        error={touched.endDate && Boolean(errors.endDate)}
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
                        fullWidth
                        type="number"
                        error={
                          touched.minimumOrderValue &&
                          Boolean(errors.minimumOrderValue)
                        }
                        helperText={
                          touched.minimumOrderValue && errors.minimumOrderValue
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="maximumDiscountValue"
                        label="Maximum Discount Value"
                        fullWidth
                        type="number"
                        disabled={values.discountType === 2}
                        error={
                          touched.maximumDiscountValue &&
                          Boolean(errors.maximumDiscountValue)
                        }
                        helperText={
                          touched.maximumDiscountValue &&
                          errors.maximumDiscountValue
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        as={TextField}
                        name="usageLimit"
                        label="Total Usage Limit"
                        fullWidth
                        type="number"
                        required
                        error={touched.usageLimit && Boolean(errors.usageLimit)}
                        helperText={touched.usageLimit && errors.usageLimit}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            <Field type="hidden" name="discountRank" />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting || isCheckingCode || !isCodeAvailable}
              >
                {isSubmitting ? "Creating..." : "Create Discount"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DashboardCreateDiscount;
