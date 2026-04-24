import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  MenuItem,
  Box,
  Paper,
  Grid,
  InputAdornment,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const DashboardCreatePromotion = () => {
  const navigate = useNavigate();
  const varToken = useAuthHeader();

  const addOffset = (dateString) => {
    if (!dateString) return null;
    return dateString + ":00+07:00";
  };

  const promotionTypes = [
    { id: 1, promotionTypeName: "PERCENTAGE" },
    { id: 2, promotionTypeName: "FIXED AMOUNT" },
  ];

  const validationSchema = Yup.object({
    promotionType: Yup.number().required("Promotion type is required"),
    promotionValue: Yup.number()
      .required("Promotion value is required")
      .min(0, "Promotion value cannot be negative")
      .max(99999999, "Promotion value is too large")
      .when("promotionType", {
        is: 1,
        then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
      }),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date()
      .required("End date is required")
      .min(Yup.ref("startDate"), "End date must be after start date"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const payload = {
      promotionType: { id: values.promotionType },
      promotionValue: values.promotionValue,
      promotionStartDate: addOffset(values.startDate),
      promotionEndDate: addOffset(values.endDate),
    };

    apiClient
      .post("/api/promotions", payload, { headers: { Authorization: varToken } })
      .then(() => {
        toast.success("Promotion created successfully");
        navigate("/Dashboard/Promotions");
      })
      .catch((error) => {
        toast.error("Failed to create promotion.");
        console.error("Error creating promotion:", error);
      })
      .finally(() => {
        setSubmitting(false);
      });
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
          Create New Promotion
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
        initialValues={{
          promotionType: 1,
          promotionValue: "",
          startDate: "",
          endDate: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form>
            <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="promotionType"
                    label="Promotion Type"
                    select
                    fullWidth
                    required
                    error={touched.promotionType && Boolean(errors.promotionType)}
                    helperText={touched.promotionType && errors.promotionType}
                  >
                    {promotionTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.promotionTypeName}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12} md={6}>
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
                          {values.promotionType === 1 ? "%" : "₫"}
                        </InputAdornment>
                      ),
                    }}
                    error={touched.promotionValue && Boolean(errors.promotionValue)}
                    helperText={touched.promotionValue && errors.promotionValue}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Promotion"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DashboardCreatePromotion;
