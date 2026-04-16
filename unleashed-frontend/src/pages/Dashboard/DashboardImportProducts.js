import React, { useEffect, useState, useRef } from "react";
import { apiClient } from "../../core/api";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Zoom } from "react-toastify";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
    TextField,
    Typography,
    Paper,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Divider,
    IconButton } from "@mui/material";
import { AddShoppingCart, RemoveCircleOutline } from "@mui/icons-material";
import useDebounce from "../../components/hooks/useDebounce";
import { formatPrice } from "../../components/format/formats";
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const DashboardImportProducts = () => {
    // State for data and UI control
    const [variations, setVariations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [showProviderModal, setShowProviderModal] = useState(false);

    // State for the new Import List panel
    const [importList, setImportList] = useState({}); // { variationId: { details..., quantity } }
    const [importTotals, setImportTotals] = useState({ totalQuantity: 0, totalPrice: 0 });

    // State for pagination and search
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Hooks and context
    const authUser = useAuthUser();
    const varToken = useAuthHeader();
    const { stockId } = useParams();
    const navigate = useNavigate();
    const isInitialMount = useRef(true);

    // --- DATA FETCHING ---
    useEffect(() => {
        apiClient.get("/api/providers", { headers: { Authorization: varToken } })
            .then((response) => setProviders(response.data))
            .catch((error) => console.error("Error fetching providers:", error));
    }, [varToken]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchVariations();
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        const calculateTotals = () => {
            let totalQuantity = 0;
            let totalPrice = 0;
            for (const item of Object.values(importList)) {
                totalQuantity += item.quantity;
                totalPrice += item.variationPrice * item.quantity;
            }
            setImportTotals({ totalQuantity, totalPrice });
        };
        calculateTotals();
    }, [importList]);

    const fetchVariations = () => {
        setLoading(true);
        apiClient.get("/api/products/all", {
            headers: { Authorization: varToken },
            params: {
                page: currentPage,
                size: 10,
                search: debouncedSearchTerm,
                stockId: stockId,
            },
        })
            .then((response) => {
                if (response.data && Array.isArray(response.data.content)) {
                    setVariations(response.data.content);
                    setTotalPages(response.data.totalPages);
                }
            })
            .catch((error) => console.error("Error fetching product variations:", error))
            .finally(() => setLoading(false));
    };

    // --- HANDLER FUNCTIONS ---
    const handleAddToImportList = (variation) => {
        setImportList(prev => ({
            ...prev,
            [variation.id]: {
                ...variation,
                quantity: 1
            }
        }));
    };

    const handleRemoveFromList = (variationId) => {
        setImportList(prev => {
            const newList = { ...prev };
            delete newList[variationId];
            return newList;
        });
    };

    const handleQuantityChangeInList = (variationId, quantity) => {
        const numQuantity = parseInt(quantity, 10) || 0;
        if (numQuantity <= 0) {
            handleRemoveFromList(variationId);
        } else {
            setImportList(prev => ({
                ...prev,
                [variationId]: {
                    ...prev[variationId],
                    quantity: numQuantity
                }
            }));
        }
    };

    const handleImportClick = () => {
        if (Object.keys(importList).length === 0) {
            toast.warn("Your import list is empty. Please add products to import.", { position: "bottom-right", transition: Zoom });
            return;
        }
        setShowProviderModal(true);
    };

    const confirmImport = (providerId) => {
        setShowProviderModal(false);
        const payload = {
            stockId: parseInt(stockId),
            username: authUser.username,
            providerId,
            variations: Object.entries(importList).map(([id, item]) => ({
                productVariationId: parseInt(id),
                quantity: item.quantity,
            })),
        };

        apiClient.post("/api/stock-transactions", payload, { headers: { Authorization: varToken } })
            .then(() => {
                toast.success("Products imported successfully!", { position: "bottom-right", transition: Zoom });
                navigate(`/Dashboard/Warehouse/${stockId}`);
            })
            .catch((error) => {
                toast.error("Import failed. Please try again.", { position: "bottom-right", transition: Zoom });
                console.error("Import error:", error);
            });
    };

    // --- RENDER COMPONENTS ---
    const TableSkeleton = () => (
        [...Array(10)].map((_, index) => (
            <tr key={index}>
                {[...Array(5)].map((_, cellIndex) => (
                    <td key={cellIndex} className='px-4 py-2'><Skeleton variant="text" height={40} /></td>
                ))}
            </tr>
        ))
    );

    return (
        <div className="p-4">
            <Typography variant='h4' className='text-3xl font-bold mb-4'>
                Import Products into Warehouse #{stockId}
            </Typography>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-2/3">
                    <Paper elevation={2} className="p-3 mb-4">
                        <TextField
                            label="Search by Product, Brand, Color, Size..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                        />
                    </Paper>

                    <div className='overflow-x-auto bg-white rounded-lg shadow'>
                        <table className='min-w-full table-fixed'>
                            <thead className='bg-gray-100'>
                            <tr>
                                <th style={{ width: '40%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Product</th>
                                <th style={{ width: '25%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Details</th>
                                <th style={{ width: '15%' }} className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Price</th>
                                <th style={{ width: '10%' }} className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>In Stock</th>
                                <th style={{ width: '10%' }} className='px-4 py-3 text-center text-sm font-semibold text-gray-600'>Action</th>
                            </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                            {loading ? <TableSkeleton /> : variations.map((v) => {
                                {/* --- THIS IS THE FIXED BLOCK --- */}
                                const inStock = v.currentStock || 0;
                                const isInList = !!importList[v.id]; // Check against the new importList state

                                return (
                                    <tr key={v.id} className={`align-middle transition-colors ${isInList ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <img src={v.variationImage || '/images/placeholder.png'} alt={v.productName} className="h-12 w-12 object-cover rounded-md" />
                                                <span className="font-semibold text-sm">{v.productName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            <div>{v.brandName}</div>
                                            <div className="text-xs text-gray-500">{v.sizeName} / {v.colorName}</div>
                                        </td>
                                        <td className="px-4 py-2 text-sm">{formatPrice(v.variationPrice)}</td>
                                        <td className={`px-4 py-2 text-center text-sm font-bold ${inStock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {inStock}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<AddShoppingCart />}
                                                onClick={() => handleAddToImportList(v)} // Use the correct handler
                                                disabled={isInList}
                                            >
                                                {isInList ? 'Added' : 'Add'}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                                {/* --- END OF FIXED BLOCK --- */}
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div className='flex justify-center items-center mt-4'>
                        <EnhancedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            isLoading={loading}
                        />
                    </div>
                </div>

                {/* --- RIGHT PANEL: IMPORT LIST --- */}
                <div className="w-full md:w-1/3">
                    <Paper elevation={2} className="p-4 sticky top-4">
                        <Typography variant="h6" className="font-bold mb-3 border-b pb-2">Import List</Typography>
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            {Object.keys(importList).length === 0 ? (
                                <Typography className="text-center text-gray-500 py-10">Your list is empty.<br />Add products from the left.</Typography>
                            ) : (
                                Object.values(importList).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 mb-3 border-b pb-3">
                                        <img src={item.variationImage} alt={item.productName} className="h-12 w-12 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                                            <p className="text-xs text-gray-500">{item.sizeName} / {item.colorName}</p>
                                            <p className="text-xs font-medium">{formatPrice(item.variationPrice)}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <TextField
                                                type="number"
                                                size="small"
                                                variant="outlined"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChangeInList(item.id, e.target.value)}
                                                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                                className="w-20"
                                            />
                                        </div>
                                        <IconButton size="small" onClick={() => handleRemoveFromList(item.id)}><RemoveCircleOutline color="error" /></IconButton>
                                    </div>
                                ))
                            )}
                        </div>
                        {Object.keys(importList).length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Items:</span>
                                    <span>{importTotals.totalQuantity.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-2">
                                    <span>Grand Total:</span>
                                    <span>{formatPrice(importTotals.totalPrice)}</span>
                                </div>
                                <Button fullWidth variant="contained" color="primary" size="large" onClick={handleImportClick} className="mt-4">
                                    Select Provider & Import
                                </Button>
                            </div>
                        )}
                    </Paper>
                </div>
            </div>

            {/* Provider Selection Modal */}
            <Dialog open={showProviderModal} onClose={() => setShowProviderModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select a Provider</DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {providers.length > 0 ? (
                        <List>
                            {providers.map((provider, index) => (
                                <React.Fragment key={provider.id}>
                                    <ListItemButton onClick={() => confirmImport(provider.id)}>
                                        <ListItemAvatar>
                                            <Avatar src={provider.providerImageUrl} alt={provider.providerName} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={provider.providerName}
                                            primaryTypographyProps={{ fontWeight: 'medium' }}
                                        />
                                    </ListItemButton>
                                    {index < providers.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            No providers found.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowProviderModal(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DashboardImportProducts;