import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { getProductList } from "../../service/ShopService"; // Import the API service
import useDebounce from "../../components/hooks/useDebounce";
import {toast} from "react-toastify"; // Import the debounce hook

export function ErrorNotFound() {
    // State for the user's direct input
    const [query, setQuery] = useState("");
    // Debounced version of the query, which will trigger the API call
    const debouncedQuery = useDebounce(query, 300); // 300ms delay

    // State for the live search results
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const searchContainerRef = useRef(null);

    // This useEffect hook performs the live search when the debounced query changes
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const fetchLiveResults = async () => {
            setIsLoading(true);
            try {
                // Fetch the top 5 results for a quick preview
                const data = await getProductList(1, 5, { query: debouncedQuery });
                setSearchResults(data.content || []);
            } catch (error) {
                console.error("Error fetching live search results:", error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLiveResults();
    }, [debouncedQuery]);

    // This useEffect handles clicks outside the search area to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setQuery(""); // Clear query to hide the dropdown
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?query=${query}`);
        } else {
            toast.warn("Please enter a search query.", {
                position: "top-center",
                autoClose: 2000,
            });
        }
    };

    const truncateProductName = (name, maxLength) => {
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + "...";
        }
        return name;
    };

    return (
        <div className="bg-white h-screen flex flex-col items-center justify-center text-center p-4 sm:p-6 font-poppins">
            <h1 className="text-8xl sm:text-9xl font-extrabold text-gray-800 tracking-wider">
                404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mt-4">
                Oops! The page you're looking for was not found.
            </h2>
            <p className="text-md sm:text-lg text-gray-500 mt-2 max-w-2xl">
                Maybe it was moved, deleted, or you just want to try a search?
            </p>

            {/* Container for the search bar and its results dropdown */}
            <div ref={searchContainerRef} className="mt-8 w-full max-w-lg relative">
                <form
                    onSubmit={handleSearchSubmit}
                    className="w-full flex items-center"
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter keywords to search..."
                        className="w-full px-5 py-3 text-lg border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-r-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800 flex items-center"
                    >
                        <FiSearch className="mr-2" />
                        Search
                    </button>
                </form>

                {/* Live Search Dropdown */}
                {query && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                        <ul className="max-h-72 overflow-y-auto">
                            {isLoading && (
                                <li className="px-4 py-3 text-gray-500">Searching...</li>
                            )}
                            {!isLoading && searchResults.length === 0 && debouncedQuery && (
                                <li className="px-4 py-3 text-gray-500">No results found.</li>
                            )}
                            {!isLoading && searchResults.map((product) => (
                                <li key={product.productId}>
                                    <Link
                                        to={`/shop/product/${product.productId}`}
                                        className="flex items-center py-3 px-4 hover:bg-blue-50 cursor-pointer w-full text-left"
                                    >
                                        <img
                                            src={product.productVariationImage}
                                            alt={product.productName}
                                            className="w-12 h-12 mr-4 rounded-md object-cover"
                                        />
                                        <span title={product.productName}>
                                            {truncateProductName(product.productName, 40)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <p className="mt-8 text-md text-gray-600">
                Or you can just <Link className="text-blue-600 hover:underline font-semibold" to="/">go back home</Link>.
            </p>
        </div>
    );
}