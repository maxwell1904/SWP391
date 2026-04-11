import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProductList } from "../../service/ShopService";
import useDebounce from "../hooks/useDebounce";
import { useSearchBar } from "../hooks/SearchHook";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { isSearchOpen, toggleSearchBar } = useSearchBar();

    const searchBarRef = useRef(null);
    const inputRef = useRef(null);
    const searchResultsRef = useRef(null);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const fetchSearchResults = async () => {
            setIsLoading(true);
            try {
                const data = await getProductList(1, 5, { query: debouncedQuery });
                setSearchResults(data.content || []);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSearchResults();
    }, [debouncedQuery]);

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/shop?query=${query}`);
            toggleSearchBar();
            setQuery("");
        }
    };

    const truncateProductName = (name, maxLength) => {
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + "...";
        }
        return name;
    };

    const handleClickOutside = (e) => {
        if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
            toggleSearchBar();
        }
    };

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current.focus();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        if (isSearchOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSearchOpen]);

    const handleKeyDownInput = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <>
            <div
                ref={searchBarRef}
                className={`fixed left-1/2 transform -translate-x-1/2 z-50 bg-white p-2 max-w-[40rem] rounded-full shadow-lg flex items-center gap-3
                           transition-all duration-300 ease-in-out
                           ${isSearchOpen ? 'top-44 opacity-100' : 'top-32 opacity-0 pointer-events-none'}`}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Find..."
                    className="border border-gray-300 rounded-full px-4 py-2 w-[25rem]"
                    onKeyDown={handleKeyDownInput}
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
                >
                    Find
                </button>
            </div>

            {query && isSearchOpen && (
                <div
                    ref={searchResultsRef}
                    className="fixed top-[15rem] left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg border-t border-gray-200 mt-2 w-[31rem]"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <ul className="max-h-64 overflow-y-auto">
                        {isLoading && (
                            <li className="px-4 py-3 text-gray-500">Searching...</li>
                        )}
                        {!isLoading && searchResults.length === 0 && debouncedQuery && (
                            <li className="px-4 py-3 text-gray-500">No results found.</li>
                        )}
                        {!isLoading && searchResults.map((product, index) => (
                            <Link
                                tabIndex={index}
                                to={`/shop/product/${product.productId}`}
                                key={product.productId}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSearchBar();
                                    setQuery("");
                                }}
                            >
                                <li className="flex items-center py-3 px-4 hover:bg-blue-100 cursor-pointer">
                                    <img
                                        src={product.productVariationImage}
                                        alt={product.productName}
                                        className="w-12 h-12 mr-4 rounded-full object-cover"
                                    />
                                    <span title={product.productName}>
                                        {truncateProductName(product.productName, 40)}
                                    </span>
                                </li>
                            </Link>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default SearchBar;