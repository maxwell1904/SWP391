import { useState, useEffect, useRef } from 'react';
import { GoBell } from 'react-icons/go';
import {
    Badge, Box, Button, CircularProgress, Divider, IconButton, Tooltip, Typography
} from '@mui/material';
import {
    getLatestNotifications,
    markNotificationAsViewed
} from '../../service/UserService';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationIcon() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const authHeader = useAuthHeader();
    const user = useAuthUser();
    const navigate = useNavigate();
    const notificationMenuRef = useRef(null);

    const loadNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getLatestNotifications(authHeader, user.username);
            setNotifications(data);
            const unread = data.filter(n => !n.notificatonViewed).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [user, authHeader]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
                setIsPopupOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePopup = () => {
        if (!isPopupOpen) {
            loadNotifications();
        }
        setIsPopupOpen(prev => !prev);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.notificatonViewed) {
            try {
                await markNotificationAsViewed(notification.notificationId, authHeader, user.username);
                // THE FIX: Refresh the notification state immediately after marking as read.
                loadNotifications();
            } catch (error) {
                console.error("Failed to mark as read on click");
            }
        }
        setIsPopupOpen(false);
        navigate(`/user/notifications/${notification.notificationId}`);
    };

    return (
        <div className='relative'>
            <Tooltip title='Notifications'>
                <IconButton onClick={togglePopup} className='group'>
                    <Badge color="error" badgeContent={unreadCount} max={9}>
                        <GoBell className='text-3xl text-white transform transition-transform duration-200 ease-in-out group-hover:animate-ring' />
                    </Badge>
                </IconButton>
            </Tooltip>

            {isPopupOpen && (
                <div
                    ref={notificationMenuRef}
                    className='absolute right-0 top-full w-96 bg-white shadow-lg rounded-md z-50'
                >
                    <div className='p-4 flex justify-between items-center border-b'>
                        <h2 className='text-lg font-semibold'>Notifications</h2>
                        <button onClick={() => setIsPopupOpen(false)} className='text-gray-500 hover:text-gray-700'>✕</button>
                    </div>
                    <div className='max-h-[400px] overflow-y-auto'>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : notifications.length > 0 ? (
                            notifications.map((item) => (
                                <Box
                                    key={item.notificationId}
                                    sx={{
                                        p: 2,
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        backgroundColor: item.notificatonViewed ? 'transparent' : '#f5f5f5',
                                        '&:hover': { backgroundColor: '#e0e0e0' }
                                    }}
                                    onClick={() => handleNotificationClick(item)}
                                >
                                    <Typography variant="body2" fontWeight={item.notificatonViewed ? 'normal' : 'bold'}>
                                        {item.notificationTitle}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {item.notificationContent}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                        From: <strong>{item.userName}</strong> • {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                You have no new notifications.
                            </Typography>
                        )}
                    </div>
                    <Divider />
                    <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Button fullWidth onClick={() => { setIsPopupOpen(false); navigate('/user/notifications'); }}>
                            View All Notifications
                        </Button>
                    </Box>
                </div>
            )}
        </div>
    );
}