import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { toast } from "react-toastify";
import { formatPrice } from "../../components/format/formats";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal";
import useDebounce from "../../components/hooks/useDebounce";
import {
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Tooltip,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { Edit, Delete, Visibility, PersonAdd, Add } from "@mui/icons-material";
import EnhancedPagination from "../../components/pagination/EnhancedPagination";

const DashboardDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [types, setTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const varToken = useAuthHeader();
  const authUser = useAuthUser();
  const userRole = authUser?.role;
  const isInitialMount = useRef(true);

  useEffect(() => {
    apiClient
      .get("/api/discounts/discount-statuses", {
        headers: { Authorization: varToken },
      })
      .then((res) => setStatuses(res.data));
    apiClient
      .get("/api/discounts/discount-types", {
        headers: { Authorization: varToken },
      })
      .then((res) => setTypes(res.data));
  }, [varToken]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setCurrentPage(0);
    }
  }, [debouncedSearchTerm, selectedStatus, selectedType]);

  useEffect(() => {
    fetchDiscounts();
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedStatus,
    selectedType,
    varToken,
  ]);

  const fetchDiscounts = () => {
    setLoading(true);
    apiClient
      .get("/api/discounts", {
        headers: { Authorization: varToken },
        params: {
          page: currentPage,
          size: 10,
          search: debouncedSearchTerm,
          statusId: selectedStatus || null,
          typeId: selectedType || null,
        },
      })
      .then((response) => {
        setDiscounts(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => console.error("Error fetching discounts:", error))
      .finally(() => setLoading(false));
  };

  const openDeleteModal = (discount) => {
    setDiscountToDelete(discount);
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleDelete = () => {
    apiClient
      .delete(`/api/discounts/${discountToDelete.discountId}`, {
        headers: { Authorization: varToken },
      })
      .then(() => {
        fetchDiscounts();
        toast.success("Discount deleted successfully");
      })
      .catch(() => toast.error("Failed to delete discount"))
      .finally(() => handleClose());
  };

  const getStatusChipColor = (statusName) => {
    switch (statusName?.toUpperCase()) {
      case "ACTIVE":
        return "success";
      case "EXPIRED":
        return "error";
      case "INACTIVE":
        return "default";
      case "USED":
        return "secondary";
      default:
        return "primary";
    }
  };

  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index}>
          <td className="px-4 py-3">
            <Skeleton variant="text" />
          </td>
          <td className="px-4 py-3">
            <Skeleton variant="text" />
          </td>
          <td className="px-4 py-3">
            <Skeleton variant="text" />
          </td>
          <td className="px-4 py-3">
            <Skeleton variant="text" />
          </td>
          <td className="px-4 py-3">
            <Skeleton variant="text" />
          </td>
          <td className="px-4 py-3">
            <Skeleton variant="text" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h4" className="text-3xl font-bold">
          Discount Management
        </Typography>
        {userRole === "ADMIN" && (
          <Button
            component={Link}
            to="/Dashboard/Discounts/Create"
            variant="contained"
            startIcon={<Add />}
          >
            Create Discount
          </Button>
        )}
      </div>

      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow gap-4">
        <TextField
          label="Search by Code or Description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          className="w-1/2"
        />
        <FormControl size="small" className="w-1/4">
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            {statuses.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.discountStatusName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" className="w-1/4">
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            {types.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.discountTypeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Usage
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton />
            ) : discounts.length > 0 ? (
              discounts.map((d) => (
                <tr
                  key={d.discountId}
                  className="hover:bg-gray-50 align-middle"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {d.discountCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {d.discountTypeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {d.discountTypeName === "PERCENTAGE"
                      ? `${d.discountValue}%`
                      : formatPrice(d.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Chip
                      label={d.discountStatusName}
                      color={getStatusChipColor(d.discountStatusName)}
                      size="small"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{`${d.usageCount} / ${d.usageLimit}`}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip title="View Details">
                        <IconButton
                          component={Link}
                          to={`/Dashboard/Discounts/${d.discountId}`}
                          color="success"
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Discount">
                        <IconButton
                          component={Link}
                          to={`/Dashboard/Discounts/Edit/${d.discountId}`}
                          color="primary"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign to Users">
                        <IconButton
                          component={Link}
                          to={`/Dashboard/Discounts/${d.discountId}/Assign`}
                          color="secondary"
                          size="small"
                        >
                          <PersonAdd />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => openDeleteModal(d)}
                        >
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
                  No discounts found.
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
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleDelete}
        name={discountToDelete?.discountCode || ""}
      />
    </div>
  );
};

export default DashboardDiscounts;
