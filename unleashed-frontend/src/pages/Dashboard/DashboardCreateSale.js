import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Box, Paper, Grid } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { apiClient } from '../../core/api';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const DashboardCreateSale = () => {
    const navigate = useNavigate();
    const varToken = useAuthHeader();

    const addOffset = (dateString) => {
        if (!dateString) return null;
        return dateString + ':00+07:00';
    };

    const saleTypes = [
        { id: 1, saleTypeName: 'PERCENTAGE' },
        { id: 2, saleTypeName: 'FIXED AMOUNT' },
    ];

    const validationSchema = Yup.object({
        saleType: Yup.number().required('Sale type is required'),
        saleValue: Yup.number()
            .required('Sale value is required')
            .min(0, 'Sale value cannot be negative')
            .max(99999999, 'Sale value is too large')
            .when('saleType', {
                is: 1,
                then: (schema) => schema.max(100, 'Percentage cannot exceed 100'),
            }),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
    });

    const handleSubmit = (values, { setSubmitting }) => {
        const payload = {
            saleType: { id: values.saleType },
            saleValue: values.saleValue,
            saleStartDate: addOffset(values.startDate),
            saleEndDate: addOffset(values.endDate),
        };

        apiClient.post('/api/sales', payload, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success('Sale created successfully');
                navigate('/Dashboard/Sales');
            })
            .catch((error) => {
                toast.error('Failed to create sale.');
                console.error('Error creating sale:', error);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    return (
        <div className="p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Create New Sale
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/Dashboard/Sales")} variant="outlined">
                    Back to Sales
                </Button>
            </Box>

            <Formik
                initialValues={{ saleType: 1, saleValue: '', startDate: '', endDate: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form>
                        <Paper sx={{ p: 4 }} className="bg-white rounded-lg shadow">
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Field
                                        as={TextField}
                                        name="saleType"
                                        label="Sale Type"
                                        select
                                        fullWidth
                                        required
                                        error={touched.saleType && Boolean(errors.saleType)}
                                        helperText={touched.saleType && errors.saleType}
                                    >
                                        {saleTypes.map((type) => (
                                            <MenuItem key={type.id} value={type.id}>
                                                {type.saleTypeName}
                                            </MenuItem>
                                        ))}
                                    </Field>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field
                                        as={TextField}
                                        name="saleValue"
                                        label="Sale Value"
                                        type="number"
                                        fullWidth
                                        required
                                        error={touched.saleValue && Boolean(errors.saleValue)}
                                        helperText={touched.saleValue && errors.saleValue}
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

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Sale'}
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DashboardCreateSale;