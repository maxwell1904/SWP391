import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    Autocomplete,
    Box,
    Paper,
    Stack,
    FormGroup,
    Divider,
} from '@mui/material';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { apiClient } from '../../core/api';
import { toast, Zoom } from 'react-toastify';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';

const DashboardCreateNotification = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [userNames, setUserNames] = useState([]);
    const [sendToAllUsers, setSendToAllUsers] = useState(false);
    const [sendToAllStaff, setSendToAllStaff] = useState(false);
    const [touched, setTouched] = useState({
        title: false,
        message: false,
    });

    const [users, setUsers] = useState([]);
    const authUser = useAuthUser();
    const navigate = useNavigate();
    const varToken = useAuthHeader();
    const [currentPage, setPage] = useState(0);
    const [pageSize, setSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers(currentPage, pageSize, searchTerm);
    }, [currentPage, pageSize, searchTerm]);

    const fetchUsers = (page, size, search = '') => {
        apiClient
            .get(`/api/admin?page=${page}&size=${size}&search=${search}`, {
                headers: {
                    Authorization: varToken,
                },
            })
            .then((response) => {
                setUsers(response.data.content || []);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
            });
    };

    const handleUserSelection = (roleName, checked) => {
        if (checked) {
            const selectedUsers = users
                .filter((user) => user.role.roleName === roleName)
                .map((user) => user.userUsername);
            setUserNames((prev) => [...new Set([...prev, ...selectedUsers])]);
        } else {
            setUserNames((prev) =>
                prev.filter(
                    (username) =>
                        !users.some(
                            (user) =>
                                user.userUsername === username &&
                                user.role.roleName === roleName
                        )
                )
            );
        }
    };

    const isTitleValid = title.trim().length > 5;
    const isMessageValid = message.trim().length > 5;

    // Derived state to disable the manual user selection
    const isAutocompleteDisabled = sendToAllUsers || sendToAllStaff;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ title: true, message: true });

        if (!isTitleValid || !isMessageValid) return;

        const payload = {
            notificationTitle: title,
            notificationContent: message.trim(),
            userName: authUser?.username,
            userNames: userNames,
        };

        try {
            await apiClient.post('/api/notifications', payload, {
                headers: { Authorization: varToken },
            });
            toast.success('Notification created successfully!', {
                position: 'bottom-right',
                transition: Zoom,
            });
            navigate('/Dashboard/Notifications');
        } catch (error) {
            toast.error('Failed to create notification', {
                position: 'bottom-right',
                transition: Zoom,
            });
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant='h4' component="h1" gutterBottom>
                    Create Notification
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={3}>
                        {/* Section 1: Notification Content */}
                        <Box>
                            <Typography variant='h6' component="h2" sx={{ mb: 2 }}>
                                Notification Content
                            </Typography>
                            <Stack spacing={3}>
                                <TextField
                                    label='Title'
                                    variant='outlined'
                                    fullWidth
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                                    error={touched.title && !isTitleValid}
                                    helperText={touched.title && !isTitleValid ? 'Title must be longer than 5 characters.' : ' '}
                                    required
                                />
                                <TextField
                                    label='Message'
                                    variant='outlined'
                                    fullWidth
                                    multiline
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
                                    error={touched.message && !isMessageValid}
                                    helperText={touched.message && !isMessageValid ? 'Message must be longer than 5 characters.' : ' '}
                                    required
                                />
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Section 2: Recipients */}
                        <Box>
                            <Typography variant='h6' component="h2" sx={{ mb: 2 }}>
                                Select Recipients
                            </Typography>
                            <Stack spacing={2}>
                                <Autocomplete
                                    multiple
                                    disabled={isAutocompleteDisabled} // IMPROVEMENT: Disable instead of hiding
                                    options={users
                                        .filter((user) => user.role.roleName === 'CUSTOMER')
                                        .map((user) => user.userUsername)}
                                    renderInput={(params) => (
                                        <TextField {...params} label='Select Individual Users' variant='outlined' />
                                    )}
                                    onChange={(event, newValue) => setUserNames(newValue)}
                                    value={userNames}
                                />
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={sendToAllUsers}
                                                onChange={(e) => {
                                                    setSendToAllUsers(e.target.checked);
                                                    handleUserSelection('CUSTOMER', e.target.checked);
                                                }}
                                            />
                                        }
                                        label='Send to all customers'
                                    />
                                    {/*<FormControlLabel*/}
                                    {/*    control={*/}
                                    {/*        <Checkbox*/}
                                    {/*            checked={sendToAllStaff}*/}
                                    {/*            onChange={(e) => {*/}
                                    {/*                setSendToAllStaff(e.target.checked);*/}
                                    {/*                // Assuming 'STAFF' is a role name, based on the function*/}
                                    {/*                handleUserSelection('STAFF', e.target.checked);*/}
                                    {/*            }}*/}
                                    {/*        />*/}
                                    {/*    }*/}
                                    {/*    label='Send to all STAFF users'*/}
                                    {/*/>*/}
                                </FormGroup>
                            </Stack>
                        </Box>

                        {/* Section 3: Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                            <Button type='submit' variant='contained' color='primary' size="large">
                                Create Notification
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default DashboardCreateNotification;