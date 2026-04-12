import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    TextField,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    Skeleton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { apiClient } from '../../core/api';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { toast } from 'react-toastify';

const convertToOffsetDateTime = (value) => {
    if (!value) return '';
    if (value.length === 16) {
        return value + ':00Z';
    }
    return value;
};

const validationSchema = Yup.object({
    saleType: Yup.string().required('Sale type is required').oneOf(['PERCENTAGE', 'FIXED AMOUNT'], 'Invalid sale type'),
    saleValue: Yup.number().required('Sale value is required').min(0, 'Sale value cannot be negative').when('saleType', {
        is: 'PERCENTAGE',
        then: (schema) => schema.max(100, 'Percentage cannot exceed 100'),
    }).max(999999999, 'Sale value is too large'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
});

const EditSaleSkeleton = () => (
    <div className="p-4">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="text" width={250} height={50} />
            <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
        <Paper sx={{ p: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12}><Skeleton variant="rectangular" height={56} /></Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton variant="rectangular" width={150} height={40} />
                </Grid>
            </Grid>
        </Paper>
    </div>
);

const DashboardEditSale = () => {
    const [initialValues, setInitialValues] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { saleId } = useParams();
    const varToken = useAuthHeader();

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    useEffect(() => {
        setLoading(true);
        apiClient.get(`/api/sales/${saleId}`, { headers: { Authorization: varToken } })
            .then((response) => {
                const sale = response.data;
                setInitialValues({
                    saleType: sale.saleType.saleTypeName,
                    saleValue: sale.saleValue,
                    startDate: formatDateTime(sale.saleStartDate),
                    endDate: formatDateTime(sale.saleEndDate),
                    saleStatus: sale.saleStatus.saleStatusName,
                });
            })
            .catch((error) => {
                toast.error("Failed to fetch sale details.");
                console.error('Error fetching sale details:', error);
            })
            .finally(() => setLoading(false));
    }, [saleId, varToken]);

    const handleSubmit = (values, { setSubmitting }) => {
        const payload = {
            saleType: { saleTypeName: values.saleType },
            saleValue: values.saleValue,
            saleStartDate: convertToOffsetDateTime(values.startDate),
            saleEndDate: convertToOffsetDateTime(values.endDate),
        };
        apiClient.put(`/api/sales/${saleId}`, payload, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success('Sale updated successfully');
                navigate('/Dashboard/Sales');
            })
            .catch((error) => {
                toast.error(error.response?.data?.message || 'Update sale failed');
                console.error('Error updating sale:', error);
            })
            .finally(() => setSubmitting(false));
    };

    if (loading || !initialValues) {
        return <EditSaleSkeleton />;
    }

    return (
        <div className="p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" className="text-3xl font-bold">
                    Edit Sale #{saleId}
                </Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate("/Dashboard/Sales")} variant="outlined">
                    Back to Sales
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
                                    <Field as={TextField} name="saleType" label="Sale Type" fullWidth disabled />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field as={TextField} name="saleValue" label="Sale Value" type="number" fullWidth required
                                           error={touched.saleValue && Boolean(errors.saleValue)}
                                           helperText={touched.saleValue && errors.saleValue} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field as={TextField} name="startDate" label="Start Date" type="datetime-local" fullWidth required
                                           InputLabelProps={{ shrink: true }}
                                           error={touched.startDate && Boolean(errors.startDate)}
                                           helperText={touched.startDate && errors.startDate} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field as={TextField} name="endDate" label="End Date" type="datetime-local" fullWidth required
                                           InputLabelProps={{ shrink: true }}
                                           error={touched.endDate && Boolean(errors.endDate)}
                                           helperText={touched.endDate && errors.endDate} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField name="saleStatus" label="Current Status" value={values.saleStatus} fullWidth disabled
                                               InputLabelProps={{ shrink: true }} />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" color="secondary" onClick={() => navigate('/Dashboard/Sales')}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24} /> : 'Update Sale'}
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default DashboardEditSale;