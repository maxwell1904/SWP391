import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { toast, Zoom } from "react-toastify";
import { apiClient } from "../../core/api";
import { formatPrice } from "../../components/format/formats";
import { Card, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { FilterList, PersonSearch } from "@mui/icons-material";
import { format } from 'date-fns';

const DashboardMembership = () => {
    const [userRanks, setUserRanks] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState(0);

    const navigate = useNavigate();
    const authUser = useAuthUser();
    const currentUser = authUser.username;
    const varToken = useAuthHeader();

    useEffect(() => {
        fetchUsers(currentPage, pageSize, searchTerm, filter);
    }, [currentPage, searchTerm, pageSize, filter, navigate]);

    const fetchUsers = async (page, size, search = "", filter) => {
        try {
            const response = await apiClient.get("/api/ranks/dashboard/memberships", {
                params: {
                    search: search,
                    page,
                    size,
                    filter: filter
                },
                headers: { Authorization: varToken },
            });
            setUserRanks(response.data);
            setTotalPages(Math.ceil(response.data.length / size));
        } catch (error) {
            console.error(" Error fetching users:", error.response?.data || error.message);
            toast.error("Error fetching users.");
        }
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };




    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 mx-1 border border-gray-300 rounded-lg ${currentPage === i ? "bg-blue-500 text-white" : ""
                        }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    const rankBackgroundColor = (rankId) => {
        const colors = {
            2: '#E6B89C', // Lighter Bronze
            3: '#D3D3D3', // Lighter Silver (Light Gray)
            4: '#FFE180', // Lighter Gold
            5: '#F0F0F0', // Lighter Diamond (Very Light Gray)
        };
        return colors[rankId];
    };
    const filterOptions = [
        { id: 0, filterOption: "All" },
        { id: 1, filterOption: "Active" },
        { id: -1, filterOption: "Deactive" }
    ];

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold mb-6">Memberships</h1>
            </div>

            {/* Search Bar and Filter */}
            <div className="mb-2">
                <TextField
                    variant="outlined"
                    label={<span><PersonSearch /> Search by username</span>}
                    value={searchTerm}
                    onChange={handleSearchChange}

                />
                <FormControl style={{ marginLeft: '10px' }}>
                    <InputLabel ><FilterList /></InputLabel>
                    <Select
                        value={filter}
                        label="Age"
                        onChange={handleFilterChange}
                    >
                        {filterOptions.map(option =>
                            <MenuItem value={option.id}>{option.filterOption}</MenuItem>
                        )}

                    </Select>
                </FormControl>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse">
                    <thead className="border border-gray-300">
                        <tr>
                            <th className="px-4 py-2 text-left">Username</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Rank</th>
                            <th className="px-4 py-2 text-left">Money spent</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Register Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userRanks.map((userRank) => (
                            <tr key={userRank.user.username} className="hover:bg-gray-50 space-y-2">
                                <td className="px-4 py-2">{userRank.user.username}</td>
                                <td className="px-4 py-2">{userRank.user.userEmail}</td>
                                <td className="px-4 py-2">
                                    <Card style={{
                                        textAlign: 'center',
                                        background: rankBackgroundColor(userRank.rank.id),
                                        padding: '10px'
                                    }}>
                                        <Typography variant="h10" component="div" style={{
                                            fontWeight: 'bold',
                                        }}>
                                            {userRank.rank.rankName}
                                        </Typography>

                                    </Card>
                                </td>
                                <td className="px-4 py-2"> {formatPrice(userRank.moneySpent)}</td>
                                <td className="px-4 py-2">{userRank.rankStatus === 1 ? 'Active' : 'Deactive'}  </td>
                                <td className="px-4 py-2">{format(userRank.rankCreatedDate, 'dd/MM/yyyy')} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className="px-4 py-2 mx-1 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                {renderPageNumbers()}
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 mx-1 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default DashboardMembership;

