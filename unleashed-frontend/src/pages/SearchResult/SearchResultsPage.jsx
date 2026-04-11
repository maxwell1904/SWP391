import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/Search/ProductCard';
import { getProductList } from '../../service/ShopService'; // Import the unified service
import { Pagination, CircularProgress, Typography } from '@mui/material'; // Import MUI components

const SearchResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State for the data of the current page
    const [searchResults, setSearchResults] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    // State for UI and query management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get search query and page number from the URL
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('query') || '';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 16; // Number of products to display per page

    // This is the primary data-fetching effect.
    // It runs whenever the URL search string changes (e.g., new query or new page).
    useEffect(() => {
        if (!query) {
            setSearchResults([]);
            setTotalPages(0);
            setLoading(false);
            return;
        }

        const fetchSearchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use our single, powerful getProductList function.
                // It now handles both searching and pagination on the server.
                const data = await getProductList(currentPage, pageSize, { query });

                setSearchResults(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                console.error("Error fetching search results:", err);
                setError(err);
                setSearchResults([]);
                setTotalPages(0);
            } finally {
                setLoading(false);
                window.scrollTo(0, 0); // Scroll to top after fetching new results
            }
        };

        fetchSearchResults();
    }, [location.search]); // Depend on the entire search string for simplicity and robustness


    // This handler updates the URL, which in turn triggers the useEffect to fetch new data.
    const handlePageChange = (event, newPage) => {
        navigate(`/search?query=${query}&page=${newPage}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '80vh' }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div className="text-center mt-20">Error loading search results: {error.message}</div>;
    }

    return (
        <div className="px-4 md:px-8 lg:px-16 xl:px-10 py-10">
            {searchResults.length > 0 ? (
                <div>
                    <Typography variant="h4" component="h2" align="center" fontWeight="bold" gutterBottom>
                        Search results for: "{query}"
                    </Typography>

                    {totalPages > 1 && (
                        <div className="flex justify-center my-8">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
                        {searchResults.map(product => (
                            <ProductCard key={product.productId} product={product} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-10">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center mt-20">
                    <Typography variant="h5" component="p" align="center" fontWeight="bold">
                        No products found for "{query}".
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;