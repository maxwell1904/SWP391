import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Paper, TextField, Box, Button, Checkbox,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Avatar, ListItemText, Alert
} from '@mui/material';
import { apiClient } from '../../core/api';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import { toast, Zoom } from 'react-toastify';

const DashboardAssignDiscount = () => {
    const { discountId } = useParams();
    const navigate = useNavigate();
    const varToken = useAuthHeader();

    const [discount, setDiscount] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [assignedUserIds, setAssignedUserIds] = useState(new Set());
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());

    useEffect(() => {
        const fetchDiscountDetails = async () => {
            try {
                const res = await apiClient.get(`/api/discounts/${discountId}`, { headers: { Authorization: varToken } });
                setDiscount(res.data);
            } catch (error) {
                toast.error("Failed to load discount details.");
            }
        };

        const fetchAssignedUsers = async () => {
            try {
                const res = await apiClient.get(`/api/discounts/${discountId}/users`, { headers: { Authorization: varToken } });
                setAssignedUserIds(new Set(res.data.allowedUserIds || []));
            } catch (error) {
                toast.error("Failed to load assigned users.");
            }
        };

        Promise.all([fetchDiscountDetails(), fetchAssignedUsers()]);
    }, [discountId, varToken]);

    useEffect(() => {
        setLoading(true);
        apiClient.get('/api/users/search', {
            headers: { Authorization: varToken },
            params: {
                page: currentPage,
                size: 10,
                searchTerm: debouncedSearchTerm,
            }
        })
            .then(response => {
                setUsers(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch(error => toast.error("Failed to search for users."))
            .finally(() => setLoading(false));
    }, [debouncedSearchTerm, currentPage, varToken]);


    const handleSelectUser = (userId) => {
        setSelectedUserIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(userId)) {
                newSelection.delete(userId);
            } else {
                newSelection.add(userId);
            }
            return newSelection;
        });
    };

    const handleSelectAllOnPage = () => {
        const allPageUserIds = users.map(u => u.userId);
        const unassignedOnPage = allPageUserIds.filter(id => !assignedUserIds.has(id));

        const currentSelection = new Set(selectedUserIds);
        const allSelectedOnPage = unassignedOnPage.every(id => currentSelection.has(id));

        if (allSelectedOnPage) {
            unassignedOnPage.forEach(id => currentSelection.delete(id));
        } else {
            unassignedOnPage.forEach(id => currentSelection.add(id));
        }
        setSelectedUserIds(currentSelection);
    };

    const newAssignments = useMemo(() => {
        return Array.from(selectedUserIds).filter(id => !assignedUserIds.has(id));
    }, [selectedUserIds, assignedUserIds]);

    const handleSaveChanges = async () => {
        if (newAssignments.length === 0) {
            toast.info("No new users were selected for assignment.");
            return;
        }

        try {
            await apiClient.post(`/api/discounts/${discountId}/users`, newAssignments, {
                headers: { Authorization: varToken }
            });
            toast.success(`${newAssignments.length} user(s) have been assigned the discount.`);
            navigate('/Dashboard/Discounts');
        } catch (error) {
            toast.error("An error occurred while saving assignments.");
        }
    };

    const isAllOnPageSelected = useMemo(() => {
        const unassignedOnPage = users.filter(u => !assignedUserIds.has(u.userId));
        if (unassignedOnPage.length === 0) return true;
        return unassignedOnPage.every(u => selectedUserIds.has(u.userId));
    }, [users, selectedUserIds, assignedUserIds]);


    return (
        <Container maxWidth="lg" sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Assign Users to Discount
            </Typography>

            {discount && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    You are assigning users to the discount code: <strong>{discount.discountCode}</strong> ({discount.discountTypeName}).
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <TextField
                        label="Search by Username, Email, or Full Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveChanges}
                        disabled={newAssignments.length === 0}
                    >
                        Save Assignments ({newAssignments.length})
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/Dashboard/Discounts')}>
                        Cancel
                    </Button>
                </Box>
            </Paper>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={!isAllOnPageSelected && users.some(u => selectedUserIds.has(u.userId) && !assignedUserIds.has(u.userId))}
                                    checked={isAllOnPageSelected}
                                    onChange={handleSelectAllOnPage}
                                    disabled={users.every(u => assignedUserIds.has(u.userId))}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Assignment Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : users.map((user) => {
                            const isAssigned = assignedUserIds.has(user.userId);
                            const isSelected = selectedUserIds.has(user.userId);

                            return (
                                <TableRow key={user.userId} hover selected={isSelected && !isAssigned}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isSelected || isAssigned}
                                            onChange={() => handleSelectUser(user.userId)}
                                            disabled={isAssigned}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar src={user.userImage} sx={{ width: 40, height: 40, mr: 2 }} />
                                            <ListItemText primary={user.fullName} secondary={user.email} />
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>
                                        {isAssigned ? (
                                            <Typography variant="body2" color="success.main" fontWeight="medium">
                                                Already Assigned
                                            </Typography>
                                        ) : isSelected ? (
                                            <Typography variant="body2" color="primary.main" fontWeight="medium">
                                                Selected for Assignment
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Not Assigned
                                            </Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <EnhancedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                    isLoading={loading}
                />
            )}
        </Container>
    );
};

export default DashboardAssignDiscount;