import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Divider, Paper, IconButton, Skeleton, Card, Box, Stack, Tooltip
} from '@mui/material';
import { NotificationsNoneOutlined, NotificationsOff, DeleteOutline } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { toast } from 'react-toastify';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import { getAllNotifications, deleteNotificationForCustomer } from '../../service/UserService';

const listItemSx = (theme) => ({
    p: { xs: 1.5, sm: 2 },
    borderRadius: 1,
    borderColor: alpha(theme.palette.text.primary, 0.12),
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
    cursor: 'pointer',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.36),
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        transform: 'translateY(-1px)'
    },
    '&:focus-visible': {
        outline: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
        outlineOffset: 2
    }
});

const emptyStateSx = (theme) => ({
    mt: 4,
    textAlign: 'center',
    p: 4,
    borderRadius: 1,
    borderStyle: 'dashed',
    borderColor: alpha(theme.palette.text.primary, 0.18)
});

const NotificationSkeleton = () => (
    <Stack spacing={2}>
        {[...Array(5)].map((_, i) => (
            <Paper key={i} variant="outlined" sx={listItemSx}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={44} height={44} sx={{ flexShrink: 0 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="56%" sx={{ fontSize: '1.1rem' }} />
                        <Skeleton variant="text" width="86%" />
                        <Skeleton variant="text" width="36%" />
                    </Box>
                    <Skeleton variant="circular" width={38} height={38} />
                </Box>
            </Paper>
        ))}
    </Stack>
);

const EmptyNotifications = () => (
    <Card variant="outlined" sx={emptyStateSx}>
        <NotificationsOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>No Notifications</Typography>
        <Typography color="text.secondary">You don't have any notifications right now.</Typography>
    </Card>
);

const NotificationItemCard = ({ item, onClick, onDelete }) => {
    const isViewed = item.notificatonViewed;

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(item.notificationId);
        }
    };

    return (
        <Paper
            variant="outlined"
            role="button"
            tabIndex={0}
            onClick={() => onClick(item.notificationId)}
            onKeyDown={handleKeyDown}
            sx={(theme) => ({
                ...listItemSx(theme),
                backgroundColor: isViewed ? 'background.paper' : alpha(theme.palette.primary.main, 0.04)
            })}
        >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box
                    sx={(theme) => ({
                        width: 44,
                        height: 44,
                        borderRadius: 1,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isViewed ? 'text.secondary' : 'primary.main',
                        bgcolor: isViewed ? alpha(theme.palette.text.primary, 0.06) : alpha(theme.palette.primary.main, 0.1)
                    })}
                >
                    <NotificationsNoneOutlined fontSize="small" />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!isViewed && (
                            <Box
                                component="span"
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    flexShrink: 0
                                }}
                            />
                        )}
                        <Typography
                            variant="subtitle1"
                            fontWeight={isViewed ? 600 : 700}
                            sx={{
                                lineHeight: 1.35,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {item.notificationTitle}
                        </Typography>
                    </Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {item.notificationContent}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                        From: <strong>{item.userName}</strong> - {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                    </Typography>
                </Box>

                <Tooltip title="Delete notification">
                    <IconButton
                        aria-label="delete notification"
                        onClick={(event) => onDelete(event, item.notificationId)}
                        onKeyDown={(event) => event.stopPropagation()}
                        sx={(theme) => ({
                            flexShrink: 0,
                            color: 'error.main',
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.14)
                            }
                        })}
                    >
                        <DeleteOutline fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

const NotificationPage = () => {
    const authHeader = useAuthHeader();
    const user = useAuthUser();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchNotifications = useCallback(async (currentPage) => {
        if (!user?.username) {
            setLoading(false);
            return;
        }
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
    }, [authHeader, user?.username]);

    useEffect(() => {
        fetchNotifications(page);
    }, [page, fetchNotifications]);

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

            {loading ? (
                <NotificationSkeleton />
            ) : notifications.length > 0 ? (
                <Stack spacing={2}>
                    {notifications.map((item) => (
                        <NotificationItemCard
                            key={item.notificationId}
                            item={item}
                            onClick={handleNotificationClick}
                            onDelete={handleDelete}
                        />
                    ))}
                </Stack>
            ) : (
                <EmptyNotifications />
            )}

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
