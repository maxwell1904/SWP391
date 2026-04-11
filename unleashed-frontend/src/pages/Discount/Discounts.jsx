import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress, Grid, Alert } from "@mui/material";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { apiClient } from '../../core/api';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import DiscountCard from './DiscountItem';

const DISCOUNT_TYPE_IDS = {
    PERCENTAGE: 1,
    FLAT: 2
};

const DiscountPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statuses, setStatuses] = useState([]);
    const [types, setTypes] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [sortConfig, setSortConfig] = useState("default");

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const authHeader = useAuthHeader();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        apiClient.get('/api/discounts/discount-statuses', { headers: { Authorization: authHeader } }).then(res => setStatuses(res.data));
        apiClient.get('/api/discounts/discount-types', { headers: { Authorization: authHeader } }).then(res => setTypes(res.data));

        const intervalId = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(intervalId);
    }, [authHeader]);

    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearchTerm, selectedStatus, selectedType, sortConfig]);

    useEffect(() => {
        const fetchDiscounts = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    size: 9,
                    search: debouncedSearchTerm,
                    statusId: selectedStatus || null,
                };

                if (sortConfig.startsWith('flat')) {
                    const [, sortOrderValue] = sortConfig.split('_');
                    params.sortBy = 'amount';
                    params.sortOrder = sortOrderValue;
                    params.typeId = DISCOUNT_TYPE_IDS.FLAT;
                } else if (sortConfig.startsWith('percentage')) {
                    const [, sortOrderValue] = sortConfig.split('_');
                    params.sortBy = 'amount';
                    params.sortOrder = sortOrderValue;
                    params.typeId = DISCOUNT_TYPE_IDS.PERCENTAGE;
                } else {
                    params.typeId = selectedType || null;
                }

                const response = await apiClient.get('/api/discounts/me', {
                    headers: { Authorization: authHeader },
                    params: params
                });
                setDiscounts(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            } catch (err) {
                console.error("Error fetching discounts:", err);
                setDiscounts([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscounts();
    }, [currentPage, debouncedSearchTerm, selectedStatus, selectedType, sortConfig, authHeader]);

    const formatRemainingTime = useCallback((endDate) => {
        const remainingTime = new Date(endDate) - currentTime;
        if (remainingTime <= 0) return "Expired";
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        if (days > 1) return `${days} days left`;
        if (days === 1) return `1 day left`;
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${hours} hours left`;
    }, [currentTime]);

    const isTypeFilterDisabled = sortConfig.startsWith('flat') || sortConfig.startsWith('percentage');

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                My Vouchers
            </Typography>

            <Paper elevation={2} sx={{ p: 2, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <TextField
                    label="Search by Code or Description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                />
                <FormControl size="small" fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={selectedStatus} label="Status" onChange={(e) => setSelectedStatus(e.target.value)}>
                        <MenuItem value=""><em>All Statuses</em></MenuItem>
                        {statuses.map((s) => <MenuItem key={s.id} value={s.id}>{s.discountStatusName}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth disabled={isTypeFilterDisabled}>
                    <InputLabel>Type</InputLabel>
                    <Select value={isTypeFilterDisabled ? '' : selectedType} label="Type" onChange={(e) => setSelectedType(e.target.value)}>
                        <MenuItem value=""><em>All Types</em></MenuItem>
                        {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.discountTypeName}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortConfig} label="Sort By" onChange={(e) => setSortConfig(e.target.value)}>
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="flat_desc">Amount: High to Low</MenuItem>
                        <MenuItem value="flat_asc">Amount: Low to High</MenuItem>
                        <MenuItem value="percentage_desc">Percentage: High to Low</MenuItem>
                        <MenuItem value="percentage_asc">Percentage: Low to High</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : discounts.length === 0 ? (
                <Alert severity="info" sx={{ mt: 4 }}>
                    You have no vouchers matching the current filters.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {discounts.map((discount) => (
                        <Grid item xs={12} sm={6} md={4} key={discount.discountId}>
                            <DiscountCard
                                discountId={discount.discountId}
                                discountCode={discount.discountCode}
                                discountValue={discount.discountValue}
                                discountTypeName={discount.discountTypeName}
                                statusName={discount.discountStatusName}
                                expiry={formatRemainingTime(discount.endDate)}
                                minimumOrderValue={discount.minimumOrderValue}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {totalPages > 1 && (
                <EnhancedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    isLoading={loading}
                />
            )}
        </Box>
    );
};

export default DiscountPage;