import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiClient } from '../../core/api';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import {
    Typography,
    Button,
    IconButton,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const DashboardNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);
    const navigate = useNavigate();
    const varToken = useAuthHeader();
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/api/notifications/as', {
                    headers: { Authorization: varToken },
                });
                const filtered = response.data?.filter(n => !n.isNotificationDraft) || [];
                setNotifications(filtered);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                toast.error("Failed to fetch notifications.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, [varToken]);

    const openDeleteModal = (notification) => {
        setNotificationToDelete(notification);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNotificationToDelete(null);
    };

    const handleDelete = async () => {
        if (!notificationToDelete) return;
        try {
            const response = await apiClient.delete(
                `/api/notifications/${notificationToDelete.notificationId}`,
                { headers: { Authorization: varToken } }
            );
            toast.success(response.data.message || 'Notification deleted successfully.');
            setNotifications(prev => prev.filter(n => n.notificationId !== notificationToDelete.notificationId));
        } catch (error) {
            toast.error('Failed to delete notification.');
        } finally {
            handleCloseModal();
        }
    };

    const handleViewNotification = (notification) => {
        navigate(`/Dashboard/Notifications/${notification.notificationId}`, { state: { notification } });
    };

    const currentNotifications = notifications.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );
    const totalPages = Math.ceil(notifications.length / itemsPerPage);

    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <tr key={index}>
                    <td className="px-4 py-3"><Skeleton variant="text" width={30} /></td>
                    <td className="px-4 py-3"><Skeleton variant="text" /></td>
                    <td className="px-4 py-3"><Skeleton variant="text" /></td>
                    <td className="px-4 py-3"><Skeleton variant="text" /></td>
                    <td className="px-4 py-3"><Skeleton variant="text" /></td>
                    <td className="px-4 py-3"><Skeleton variant="text" /></td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="p-4">
            <div className='flex items-center justify-between mb-4'>
                <Typography variant="h4" className="text-3xl font-bold">
                    Notifications Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to='/Dashboard/Notifications/Create'
                >
                    Create Notification
                </Button>
            </div>

            <div className='overflow-x-auto bg-white rounded-lg shadow'>
                <table className='min-w-full table-auto'>
                    <thead className='bg-gray-100'>
                    <tr>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>ID</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Title</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Message</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Sender</th>
                        <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Created At</th>
                        <th className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : currentNotifications.length > 0 ? (
                        currentNotifications.map((notification) => (
                            <tr key={notification.notificationId} className='hover:bg-gray-50 align-middle'>
                                <td className='px-4 py-3 text-sm font-medium text-gray-900'>{notification.notificationId}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{notification.notificationTitle}</td>
                                <td className='px-4 py-3 text-sm text-gray-700 max-w-md'>
                                    <Tooltip title={notification.notificationContent}>
                                        <p className="truncate">
                                            {notification.notificationContent}
                                        </p>
                                    </Tooltip>
                                </td>
                                <td className='px-4 py-3 text-sm text-gray-700'>{notification.userName || 'System'}</td>
                                <td className='px-4 py-3 text-sm text-gray-700'>
                                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}
                                </td>
                                <td className='px-4 py-3'>
                                    <div className="flex items-center justify-center gap-2">
                                        <Tooltip title="View Details">
                                            <IconButton onClick={() => handleViewNotification(notification)} color="success" size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => openDeleteModal(notification)} color="error" size="small">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='6' className='text-center py-10 text-gray-500'>
                                No notifications found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <EnhancedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
            />

            <DeleteConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleDelete}
                name={notificationToDelete?.notificationTitle || 'this notification'}
            />
        </div>
    );
};

export default DashboardNotifications;