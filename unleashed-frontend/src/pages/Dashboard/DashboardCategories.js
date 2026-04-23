import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { toast } from "react-toastify";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import {
    Typography,
    Button,
    IconButton,
    Tooltip,
    Skeleton,
    Avatar,
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";

const DashboardCategories = () => {
    const [categories, setCategories] = useState([]);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const authUser = useAuthUser();
    const userRole = authUser.role;
    const varToken = useAuthHeader();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setIsLoading(true);
        apiClient
            .get("/api/categories", { headers: { Authorization: varToken } })
            .then((response) => {
                setCategories(response.data.sort((a, b) => a.id - b.id));
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
                toast.error("Failed to fetch categories.");
            })
            .finally(() => setIsLoading(false));
    };

    const openDeleteModal = (category) => {
        setCategoryToDelete(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;
        apiClient
            .delete(`/api/categories/${categoryToDelete.id}`, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success("Category deleted successfully.");
                fetchCategories(); // Refetch the list
            })
            .catch((error) =>
                toast.error(error.response?.data?.message || "Error deleting category.")
            )
            .finally(() => {
                handleCloseModal();
            });
    };

    const handleViewCategory = (category) => {
        navigate(`/Dashboard/Categories/${category.id}`, { state: { category } });
    };

    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <tr key={index}>
                    <td className="px-4 py-3"><Skeleton variant="text" width={20} /></td>
                    <td className="px-4 py-2"><Skeleton variant="circular" width={48} height={48} /></td>
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
                    Categories Management
                </Typography>
                {userRole === "ADMIN" && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        component={Link}
                        to="/Dashboard/Categories/Create"
                    >
                        New Category
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : categories.length > 0 ? (
                        categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 align-middle">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.id}</td>
                                <td className="px-4 py-2">
                                    <Avatar
                                        src={category.categoryImageUrl}
                                        alt={category.categoryName}
                                        variant="rounded"
                                        sx={{ width: 48, height: 48 }}
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 max-w-[250px] truncate">{category.categoryName}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 max-w-[350px] truncate">{category.categoryDescription}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <Tooltip title="View Details">
                                            <IconButton onClick={() => handleViewCategory(category)} color="success" size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        {userRole === "ADMIN" && (
                                            <>
                                                <Tooltip title="Edit">
                                                    <IconButton component={Link} to={`/Dashboard/Categories/Edit/${category.id}`} color="primary" size="small">
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => openDeleteModal(category)} color="error" size="small">
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-10 text-gray-500">
                                No categories found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <DeleteConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleDelete}
                name={categoryToDelete?.categoryName || ""}
            />
        </div>
    );
};
export default DashboardCategories;
