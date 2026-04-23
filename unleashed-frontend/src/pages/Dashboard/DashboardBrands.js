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

const DashboardBrands = () => {
    const [brands, setBrands] = useState([]);
    const [brandToDelete, setBrandToDelete] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const authUser = useAuthUser();
    const userRole = authUser?.role;
    const varToken = useAuthHeader();

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get("/api/brands", {
                headers: { Authorization: varToken },
            });
            setBrands(Array.isArray(response.data) ? response.data.sort((a, b) => a.brandId - b.brandId) : []);
        } catch (error) {
            toast.error("Error fetching brands.");
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteModal = (brand) => {
        setBrandToDelete(brand);
        setDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setBrandToDelete(null);
    };

    const handleDelete = async () => {
        if (!brandToDelete) return;
        setIsDeleting(true);
        try {
            const response = await apiClient.delete(`/api/brands/${brandToDelete.brandId}`, {
                headers: { Authorization: varToken },
            });
            toast.success(response.data || "Brand deleted successfully.");
            fetchBrands();
        } catch (error) {
            toast.error(error.response?.data || "Failed to delete brand.");
        } finally {
            setIsDeleting(false);
            handleCloseModal();
        }
    };

    const handleViewBrand = (brand) => {
        navigate(`/Dashboard/Brands/${brand.brandId}`, { state: { brand } });
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
                    <td className="px-4 py-3"><Skeleton variant="text" /></td>
                </tr>
            ))}
        </>
    );

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <Typography variant="h4" className="text-3xl font-bold">
                    Brands Management
                </Typography>
                {userRole === "ADMIN" && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        component={Link}
                        to="/Dashboard/Brands/Create"
                    >
                        New Brand
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Logo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Brand Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Website</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : brands.length > 0 ? (
                        brands.map((brand) => (
                            <tr key={brand.brandId} className="hover:bg-gray-50 align-middle">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{brand.brandId}</td>
                                <td className="px-4 py-2">
                                    <Avatar
                                        src={brand.brandImageUrl}
                                        alt={brand.brandName}
                                        variant="rounded"
                                        sx={{ width: 48, height: 48 }}
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{brand.brandName}</td>
                                <td className="px-4 py-3 text-sm max-w-[250px] truncate">
                                    <a
                                        href={brand.brandWebsiteUrl && !brand.brandWebsiteUrl.startsWith('http') ? `https://${brand.brandWebsiteUrl}` : brand.brandWebsiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {brand.brandWebsiteUrl}
                                    </a>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700 max-w-[300px] truncate">{brand.brandDescription}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <Tooltip title="View Details">
                                            <IconButton onClick={() => handleViewBrand(brand)} color="success" size="small">
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        {userRole === "ADMIN" && (
                                            <>
                                                <Tooltip title="Edit">
                                                    <IconButton component={Link} to={`/Dashboard/Brands/Edit/${brand.brandId}`} color="primary" size="small">
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => openDeleteModal(brand)} color="error" size="small" disabled={isDeleting}>
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
                            <td colSpan="6" className="text-center py-10 text-gray-500">
                                No brands found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleDelete}
                name={brandToDelete?.brandName || ""}
            />
        </div>
    );
};

export default DashboardBrands;
