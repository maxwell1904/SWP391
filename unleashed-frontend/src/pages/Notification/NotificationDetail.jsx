import React, { useState, useEffect } from 'react';
import { Typography, Divider, Paper, Box, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Forum } from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { getAllNotifications, markNotificationAsViewed } from '../../service/UserService';

const NotificationDetailPage = () => {
    const { notificationId } = useParams();
    const navigate = useNavigate();
    const authHeader = useAuthHeader();
    const user = useAuthUser();

    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndMarkNotification = async () => {
            if (!user?.username || !notificationId) return;
            setLoading(true);
            try {
                const data = await getAllNotifications(authHeader, user.username, 0, 100);
                const foundNotification = data.content.find(n => n.notificationId.toString() === notificationId);

                if (foundNotification) {
                    setNotification(foundNotification);
                    if (!foundNotification.notificatonViewed) {
                        await markNotificationAsViewed(foundNotification.notificationId, authHeader, user.username);
                    }
                } else {
                    toast.error("Notification not found.");
                    navigate('/user/notifications');
                }
            } catch (error) {
                toast.error("Failed to load notification details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndMarkNotification();
    }, [notificationId, user, authHeader, navigate]);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/user/notifications')}
                >
                    Back to Notifications
                </Button>
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Notification Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : notification ? (
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {notification.notificationTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {format(new Date(notification.createdAt), "PPP p")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        From: <strong>{notification.userName}</strong>
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {notification.notificationContent}
                    </Typography>
                    {notification.notificationLink && (
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                component={Link}
                                to={notification.notificationLink}
                                startIcon={<Forum />}
                            >
                                View Conversation
                            </Button>
                        </Box>
                    )}
                </Paper>
            ) : (
                <Typography>Notification could not be loaded.</Typography>
            )}
        </Box>
    );
};

export default NotificationDetailPage;