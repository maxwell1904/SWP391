import React, { useState, useEffect } from 'react';
import {
    Typography, Divider, Paper, List, ListItem, ListItemText,
    IconButton, Skeleton, Card, Box
} from '@mui/material';
import { NotificationsOff, Delete } from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { toast } from 'react-toastify';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import { getAllNotifications, deleteNotificationForCustomer } from '../../service/UserService';

const NotificationSkeleton = () => (
    <>
        {[...Array(5)].map((_, i) => (
            <ListItem key={i} divider>
                <ListItemText
                    primary={<Skeleton variant="text" width="60%" />}
                    secondary={<Skeleton variant="text" width="80%" />}
                />
                <Skeleton variant="circular" width={40} height={40} />
            </ListItem>
        ))}
    </>
);

const EmptyNotifications = () => (
    <Card variant="outlined" sx={{ mt: 4, textAlign: 'center', p: 4, borderStyle: 'dashed' }}>
        <NotificationsOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>No Notifications</Typography>
        <Typography color="text.secondary">You don't have any notifications right now.</Typography>
    </Card>
);

const NotificationPage = () => {
    const authHeader = useAuthHeader();
    const user = useAuthUser();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchNotifications = async (currentPage) => {
        if (!user?.username) return;
        setLoading(true);
        try {
            const data = await getAllNotifications(authHeader, user.username, currentPage, 10);
            setNotifications(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(page);
    }, [page, user, authHeader]);

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        try {
            await deleteNotificationForCustomer(notificationId, authHeader, user.username);
            toast.success("Notification deleted.");
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
        } catch (error) {
            toast.error("Failed to delete notification.");
        }
    };

    const handleNotificationClick = (notificationId) => {
        navigate(`/user/notifications/${notificationId}`);
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Notifications
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Paper variant="outlined">
                <List sx={{ padding: 0 }}>
                    {loading ? (
                        <NotificationSkeleton />
                    ) : notifications.length > 0 ? (
                        notifications.map((item) => (
                            <ListItem
                                key={item.notificationId}
                                divider
                                button
                                onClick={() => handleNotificationClick(item.notificationId)}
                                sx={{
                                    backgroundColor: item.notificatonViewed ? 'transparent' : 'action.hover',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" fontWeight={item.notificatonViewed ? 'normal' : 'bold'}>
                                            {item.notificationTitle}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {item.notificationContent}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                From: <strong>{item.userName}</strong> • {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                                            </Typography>
                                        </>
                                    }
                                />
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={(e) => handleDelete(e, item.notificationId)}
                                >
                                    <Delete color="error" />
                                </IconButton>
                            </ListItem>
                        ))
                    ) : (
                        <EmptyNotifications />
                    )}
                </List>
            </Paper>

            {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <EnhancedPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(newPage) => setPage(newPage)}
                        isLoading={loading}
                    />
                </Box>
            )}
        </Box>
    );
};

export default NotificationPage;