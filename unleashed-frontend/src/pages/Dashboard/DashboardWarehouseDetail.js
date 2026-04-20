import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../core/api";
import { FaPlus } from "react-icons/fa";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { toast, Zoom } from "react-toastify";
import { formatPrice } from "../../components/format/formats";
import { Button, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import useDebounce from "../../components/hooks/useDebounce";
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const DashboardWarehouseDetail = () => {
    const { stockId } = useParams();
    const [warehouseInfo, setWarehouseInfo] = useState({ name: '', address: '' });
    const [stockVariations, setStockVariations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    // State for pagination and filters
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [quantityChange, setQuantityChange] = useState("");
    const [adjustReason, setAdjustReason] = useState("");
    const [isAdjusting, setIsAdjusting] = useState(false);

    const varToken = useAuthHeader();
    const authUser = useAuthUser();
    const isInitialMount = useRef(true);

    // Fetch static data (warehouse info, brands, categories) once
    useEffect(() => {
        apiClient.get(`/api/stocks/info/${stockId}`, { headers: { Authorization: varToken } })
            .then(res => setWarehouseInfo({ name: res.data.stockName, address: res.data.stockAddress }))
            .catch(err => console.error("Error fetching warehouse info:", err));

        apiClient.get("/api/brands", { headers: { Authorization: varToken } })
            .then(res => setBrands(res.data))
            .catch(err => console.error("Error fetching brands:", err));

        apiClient.get("/api/categories", { headers: { Authorization: varToken } })
            .then(res => setCategories(res.data))
            .catch(err => console.error("Error fetching categories:", err));
    }, [stockId, varToken]);

    // Effect to reset page when any filter changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setCurrentPage(0);
        }
    }, [debouncedSearchTerm, selectedBrandId, selectedCategoryId, showOnlyLowStock]);

    const fetchStockVariations = () => {
        setLoading(true);
        apiClient.get(`/api/stocks/${stockId}`, {
            headers: { Authorization: varToken },
            params: {
                page: currentPage,
                size: 10,
                search: debouncedSearchTerm,
                brandId: selectedBrandId || null,
                categoryId: selectedCategoryId || null,
                isLowStock: showOnlyLowStock,
            },
        })
            .then((response) => {
                setStockVariations(response.data.content || []);
                setTotalPages(response.data.totalPages || 1);
            })
            .catch((error) => console.error("Error fetching stock details:", error))
            .finally(() => setLoading(false));
    };

    // Main effect to fetch paginated and filtered data
    useEffect(() => {
        fetchStockVariations();
    }, [stockId, varToken, currentPage, debouncedSearchTerm, selectedBrandId, selectedCategoryId, showOnlyLowStock]);

    const openAdjustModal = (variation, presetQuantity = "") => {
        setSelectedVariation(variation);
        setQuantityChange(presetQuantity === "" ? "" : String(presetQuantity));
        setAdjustReason("");
        setShowAdjustModal(true);
    };

    const closeAdjustModal = () => {
        if (isAdjusting) return;
        setShowAdjustModal(false);
        setSelectedVariation(null);
        setQuantityChange("");
        setAdjustReason("");
    };

    const submitStockAdjustment = () => {
        const parsedQuantity = parseInt(quantityChange, 10);
        const normalizedReason = adjustReason.trim();

        if (!selectedVariation) {
            toast.error("Please select a product variation to adjust.", { position: "bottom-right", transition: Zoom });
            return;
        }

        if (Number.isNaN(parsedQuantity) || parsedQuantity === 0) {
            toast.error("Quantity change must be a non-zero integer.", { position: "bottom-right", transition: Zoom });
            return;
        }

        if (!normalizedReason) {
            toast.error("Please enter a reason for this stock adjustment.", { position: "bottom-right", transition: Zoom });
            return;
        }

        const username = authUser?.username || "";
        if (!username) {
            toast.error("Cannot detect logged in username.", { position: "bottom-right", transition: Zoom });
            return;
        }

        setIsAdjusting(true);
        apiClient.post(
            "/api/stock-transactions/adjust",
            {
                stockId: parseInt(stockId, 10),
                variationId: selectedVariation.variationId,
                quantityChange: parsedQuantity,
                username,
                reason: normalizedReason,
            },
            { headers: { Authorization: varToken } }
        )
            .then(() => {
                toast.success("Stock adjusted successfully.", { position: "bottom-right", transition: Zoom });
                closeAdjustModal();
                fetchStockVariations();
            })
            .catch((error) => {
                const serverMessage = error?.response?.data;
                toast.error(serverMessage || "Failed to adjust stock.", { position: "bottom-right", transition: Zoom });
            })
            .finally(() => setIsAdjusting(false));
    };

    const TableSkeleton = () => (
        [...Array(10)].map((_, index) => (
            <tr key={index}>
                {[...Array(5)].map((_, cellIndex) => <td key={cellIndex} className='p-3'><Skeleton variant="text" /></td>)}
            </tr>
        ))
    );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Typography variant="h4" className="font-bold">{warehouseInfo.name || <Skeleton width={250} />}</Typography>
                    <Typography className="text-gray-600">{warehouseInfo.address || <Skeleton width={400} />}</Typography>
                </div>
                <Link to={`/Dashboard/Warehouse/${stockId}/Import`}>
                    <button className="text-blue-600 border border-blue-500 px-4 py-2 rounded-lg flex items-center">
                        <FaPlus className="mr-2" /> Import Product
                    </button>
                </Link>
            </div>

            <Paper elevation={2} className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <TextField label="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} variant="outlined" size="small" className="flex-grow" />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Brand</InputLabel>
                    <Select value={selectedBrandId} label="Brand" onChange={(e) => setSelectedBrandId(e.target.value)}>
                        <MenuItem value=""><em>All Brands</em></MenuItem>
                        {brands.map((brand) => <MenuItem key={brand.brandId} value={brand.brandId}>{brand.brandName}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select value={selectedCategoryId} label="Category" onChange={(e) => setSelectedCategoryId(e.target.value)}>
                        <MenuItem value=""><em>All Categories</em></MenuItem>
                        {categories.map((cat) => <MenuItem key={cat.id} value={cat.id}>{cat.categoryName}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControlLabel control={<Checkbox checked={showOnlyLowStock} onChange={(e) => setShowOnlyLowStock(e.target.checked)} />} label="Low Stock Only (< 10)" />
            </Paper>

            <Paper elevation={2} className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-600 w-2/5">Product</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-600 w-1/5">Details</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-600 w-1/5">Price</th>
                        <th className="p-3 text-center text-sm font-semibold text-gray-600 w-1/6">Quantity In Stock</th>
                        <th className="p-3 text-center text-sm font-semibold text-gray-600 w-1/6">Adjust</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? <TableSkeleton /> : stockVariations.length > 0 ? (
                        stockVariations.map((v) => (
                            <tr key={v.variationId} className="hover:bg-gray-50">
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <img src={v.productVariationImage || "/images/placeholder.png"} alt={v.productName} className="w-12 h-12 object-cover rounded-md" />
                                        <div>
                                            <div className="font-semibold">{v.productName}</div>
                                            <div className="text-xs text-gray-500">Brand: {v.brandName}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 text-sm"><div>Size: {v.sizeName}</div><div>Color: {v.colorName}</div></td>
                                <td className="p-3 text-sm">{formatPrice(v.productPrice)}</td>
                                <td className={`p-3 text-center font-bold text-lg ${v.quantity < 10 ? "text-red-500" : "text-gray-800"}`}>
                                    {v.quantity}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => openAdjustModal(v, -1)}
                                        >
                                            -1
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="success"
                                            onClick={() => openAdjustModal(v, 1)}
                                        >
                                            +1
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => openAdjustModal(v)}
                                        >
                                            Custom
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-10 text-gray-500">
                                {isInitialMount.current ? "Loading..." : "No products found for the selected filters."}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </Paper>

            <Dialog open={showAdjustModal} onClose={closeAdjustModal} maxWidth="sm" fullWidth>
                <DialogTitle>Adjust Stock Quantity</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-4 pt-2">
                        <TextField
                            label="Product"
                            value={selectedVariation ? `${selectedVariation.productName} (${selectedVariation.sizeName || "N/A"} / ${selectedVariation.colorName || "N/A"})` : ""}
                            InputProps={{ readOnly: true }}
                            fullWidth
                        />
                        <TextField
                            label="Quantity Change"
                            placeholder="Use positive to add, negative to subtract"
                            type="number"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Reason"
                            value={adjustReason}
                            onChange={(e) => setAdjustReason(e.target.value)}
                            fullWidth
                            multiline
                            minRows={2}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeAdjustModal} disabled={isAdjusting}>Cancel</Button>
                    <Button onClick={submitStockAdjustment} variant="contained" disabled={isAdjusting}>
                        {isAdjusting ? "Saving..." : "Confirm Adjustment"}
                    </Button>
                </DialogActions>
            </Dialog>

            {totalPages > 1 && (
                <EnhancedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isLoading={loading}
                />
            )}
        </div>
    );
};

export default DashboardWarehouseDetail;