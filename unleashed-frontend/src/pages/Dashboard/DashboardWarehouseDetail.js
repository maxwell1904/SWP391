import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../core/api";
import { FaPlus } from "react-icons/fa";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { formatPrice } from "../../components/format/formats";
import { Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Skeleton } from "@mui/material";
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

    const varToken = useAuthHeader();
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

    // Main effect to fetch paginated and filtered data
    useEffect(() => {
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
    }, [stockId, varToken, currentPage, debouncedSearchTerm, selectedBrandId, selectedCategoryId, showOnlyLowStock]);

    const TableSkeleton = () => (
        [...Array(10)].map((_, index) => (
            <tr key={index}>
                {[...Array(4)].map((_, cellIndex) => <td key={cellIndex} className='p-3'><Skeleton variant="text" /></td>)}
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
                        <th className="p-3 text-center text-sm font-semibold text-gray-600 w-1/5">Quantity In Stock</th>
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
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center py-10 text-gray-500">
                                {isInitialMount.current ? "Loading..." : "No products found for the selected filters."}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </Paper>

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