import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../core/api";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { toast, Zoom } from "react-toastify";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Skeleton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Tooltip,
    Box // Box is a useful layout component from MUI
} from "@mui/material";
import { Edit, Delete, Visibility, Storefront, PlaylistAdd } from "@mui/icons-material";

const DashboardWarehouse = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStock, setCurrentStock] = useState({ id: null, stockName: "", stockAddress: "" });

    const navigate = useNavigate();
    const varToken = useAuthHeader();
    const auth = useAuthUser();

    // ... (All handler functions: fetchStocks, handleViewDetail, handleOpenModal, etc. remain exactly the same) ...
    const fetchStocks = () => {
        setLoading(true);
        apiClient
            .get("/api/stocks", { headers: { Authorization: varToken } })
            .then((response) => setStocks(response.data))
            .catch((error) => console.error("Error fetching stocks:", error))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const handleViewDetail = (stock) => navigate(`/Dashboard/Warehouse/${stock.id}`);
    const handleOpenModal = (stock = null) => {
        setIsEditing(!!stock);
        setCurrentStock(stock ? { ...stock } : { id: null, stockName: "", stockAddress: "" });
        setModalOpen(true);
    };
    const handleCloseModal = () => setModalOpen(false);

    const handleSave = () => {
        const promise = isEditing
            ? apiClient.put(`/api/stocks/${currentStock.id}`, currentStock, { headers: { Authorization: varToken } })
            : apiClient.post("/api/stocks", currentStock, { headers: { Authorization: varToken } });

        promise.then(() => {
            toast.success(`Warehouse ${isEditing ? 'updated' : 'created'} successfully!`, { position: 'bottom-right', transition: Zoom });
            fetchStocks();
            handleCloseModal();
        }).catch(error => {
            toast.error(`Error ${isEditing ? 'updating' : 'creating'} warehouse.`, { position: 'bottom-right', transition: Zoom });
        });
    };

    const handleOpenDeleteModal = (stock) => {
        setCurrentStock(stock);
        setDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => setDeleteModalOpen(false);

    const confirmDelete = () => {
        apiClient.delete(`/api/stocks/${currentStock.id}`, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success("Warehouse deleted successfully!", { position: 'bottom-right', transition: Zoom });
                fetchStocks();
                handleCloseDeleteModal();
            })
            .catch(error => {
                toast.error("Error deleting warehouse.", { position: 'bottom-right', transition: Zoom });
            });
    };

    const TableSkeleton = () => (
        [...Array(5)].map((_, index) => (
            <TableRow key={index}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
            </TableRow>
        ))
    );

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <Typography variant="h4" component="h1" className="font-bold">
                    Warehouse Management
                </Typography>
                {auth?.role === 'ADMIN' && (
                    <Button variant="contained" startIcon={<FaPlus />} onClick={() => handleOpenModal()}>
                        Add Warehouse
                    </Button>
                )}
            </div>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650, tableLayout: 'fixed' }}> {/* Use fixed layout for consistent column widths */}
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Warehouse Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '35%', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? <TableSkeleton /> : stocks.length > 0 ? (
                            stocks.map((stock) => (
                                <TableRow key={stock.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>{stock.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{stock.stockName}</TableCell>
                                    {/* --- IMPROVEMENT: Constrained width with tooltip --- */}
                                    <TableCell>
                                        <Tooltip title={stock.stockAddress} placement="bottom-start">
                                            <Typography noWrap sx={{ maxWidth: '350px' }}>
                                                {stock.stockAddress}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    {/* --- IMPROVEMENT: Text buttons instead of icon buttons --- */}
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Button size="small" variant="outlined" startIcon={<PlaylistAdd />} onClick={() => navigate(`/Dashboard/Warehouse/${stock.id}/Import`)}>
                                                Import
                                            </Button>
                                            <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => handleViewDetail(stock)}>
                                                View
                                            </Button>
                                            {auth?.role === 'ADMIN' && (
                                                <>
                                                    <Button size="small" variant="outlined" color="secondary" startIcon={<Edit />} onClick={() => handleOpenModal(stock)}>
                                                        Edit
                                                    </Button>
                                                    <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => handleOpenDeleteModal(stock)}>
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                    <Storefront sx={{ fontSize: 60, color: 'grey.400' }} />
                                    <Typography variant="h6" color="text.secondary">No warehouses found.</Typography>
                                    {auth?.role === 'ADMIN' && <Typography color="text.secondary">Click "Add Warehouse" to get started.</Typography>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- Modals remain unchanged --- */}
            <Dialog open={modalOpen} onClose={handleCloseModal}>
                <DialogTitle>{isEditing ? "Edit Warehouse" : "Create New Warehouse"}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Warehouse Name" type="text" fullWidth variant="outlined" value={currentStock.stockName} onChange={(e) => setCurrentStock({ ...currentStock, stockName: e.target.value })} />
                    <TextField margin="dense" label="Warehouse Address" type="text" fullWidth variant="outlined" value={currentStock.stockAddress} onChange={(e) => setCurrentStock({ ...currentStock, stockAddress: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{isEditing ? "Save Changes" : "Create"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the warehouse "{currentStock.stockName}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteModal}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DashboardWarehouse;