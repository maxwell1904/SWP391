import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import { toast } from "react-toastify";
import { apiClient } from "../../core/api";
import {
    Typography,
    Button,
    TextField,
    Chip,
    IconButton,
    Tooltip,
    Skeleton,
    Avatar,
} from "@mui/material";
import { Add, Edit, Visibility, Delete } from "@mui/icons-material";
import useDebounce from "../../components/hooks/useDebounce";
import EnhancedPagination from "../../components/pagination/EnhancedPagination";

const DashboardAccounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToDelete, setUserToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const navigate = useNavigate();
    const varToken = useAuthHeader();
    const isInitialMount = useRef(true);
    const pageSize = 10;

    const fetchUsers = useCallback(async (page, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get("/api/admin/searchUsers", {
                params: { searchTerm: search, page, size: pageSize },
                headers: { Authorization: varToken },
            });
            setUsers(response.data.users || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            console.error("Error fetching users:", error.response?.data || error.message);
            toast.error("Error fetching users.");
        } finally {
            setLoading(false);
        }
    }, [varToken, pageSize]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchUsers(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchUsers]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    const handleDelete = () => {
        if (!userToDelete) return;
        apiClient
            .delete(`/api/admin/${userToDelete.userId}`, { headers: { Authorization: varToken } })
            .then((response) => {
                toast.success(response.data || "User deleted successfully.");
                fetchUsers(currentPage, debouncedSearchTerm);
            })
            .catch(() => {
                toast.error("Failed to delete user.");
            })
            .finally(() => {
                handleCloseModal();
            });
    };

    const getRoleChip = (role) => {
        switch (role) {
            case "ADMIN": return <Chip label="Admin" color="error" size="small" />;
            case "STAFF": return <Chip label="Staff" color="warning" size="small" />;
            case "CUSTOMER": return <Chip label="Customer" color="info" size="small" />;
            default: return <Chip label="Unknown" size="small" />;
        }
    };

    const getStatusChip = (isEnable) => {
        return isEnable
            ? <Chip label="Enabled" color="success" variant="outlined" size="small" />
            : <Chip label="Disabled" color="error" variant="outlined" size="small" />;
    };

    const TableSkeleton = () => (
        <>
            {[...Array(pageSize)].map((_, index) => (
                <tr key={index}>
                    <td className="px-4 py-2"><Skeleton variant="circular" width={40} height={40} /></td>
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
            <div className="flex items-center justify-between mb-4">
                <Typography variant="h4" className="text-3xl font-bold">
                    Accounts Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/Dashboard/Accounts/Create"
                >
                    Create Staff Account
                </Button>
            </div>

            <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow">
                <TextField
                    label="Search by username or email..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full"
                />
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-16">Avatar</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Username</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <TableSkeleton />
                    ) : users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.userId} className="hover:bg-gray-50 align-middle">
                                <td className="px-4 py-2">
                                    <Avatar
                                        src={user.userImage}
                                        alt={user.username}
                                        sx={{ width: 40, height: 40 }}
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{user.userEmail}</td>
                                <td className="px-4 py-3 text-sm">{getRoleChip(user.role.roleName)}</td>
                                <td className="px-4 py-3 text-sm">{getStatusChip(user.enable)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <Tooltip title="View Details">
                                            <IconButton onClick={() => navigate(`/Dashboard/Accounts/${user.userId}`)} color="success" size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton component={Link} to={`/Dashboard/Accounts/Edit/${user.userId}`} color="primary" size="small">
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton onClick={() => openDeleteModal(user)} color="error" size="small">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-10 text-gray-500">
                                No accounts found.
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
                isLoading={loading}
            />

            <DeleteConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleDelete}
                name={userToDelete?.username}
            />
        </div>
    );
};

export default DashboardAccounts;