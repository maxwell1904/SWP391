import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Pagination, CircularProgress, Breadcrumbs, Typography } from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import ProductList from "../../components/lists/ProductList";
import FilterComponent from "../../components/filters/MultipleFilter";
import { getProductList } from "../../service/ShopService";
import useDebounce from "../../components/hooks/useDebounce";
import superlogo from "../../assets/images/superlogo.png";

const itemsPerPage = 12;

const collections = [
    {
        title: "STREET ELITE",
        image: "https://images.unsplash.com/photo-1762666167416-72b1540a76b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        price: "$129",
    },
    {
        title: "URBAN REBEL",
        image: "https://images.unsplash.com/photo-1756276900419-868625adff43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        price: "$159",
    },
    {
        title: "DARK RIDER",
        image: "https://images.unsplash.com/photo-1768084356884-22bb77e76931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        price: "$189",
    },
    {
        title: "GRUNGE ICON",
        image: "https://images.unsplash.com/photo-1761073490980-ecd40e9bec57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        price: "$179",
    },
];

export function Shop() {
    const location = useLocation();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState(() => {
        const params = new URLSearchParams(location.search);
        return {
            brand: "",
            category: "",
            priceOrder: "",
            rating: 0,
            query: params.get("query") || "",
        };
    });
    const [searchTerm, setSearchTerm] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get("query") || "";
    });
    const [products, setProducts] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const productListRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryFromUrl = params.get("query") || "";
        setSearchTerm(queryFromUrl);
    }, [location.search]);

    const handleFilterChange = useCallback((filterUpdate) => {
        setFilter((currentFilter) => ({
            ...currentFilter,
            ...filterUpdate,
        }));
        setPage(1);
    }, []);

    useEffect(() => {
        handleFilterChange({ query: debouncedSearchTerm });
    }, [debouncedSearchTerm, handleFilterChange]);

    useEffect(() => {
        const fetchProductsFromServer = async () => {
            if (filter.query === "" && searchTerm !== "") {
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await getProductList(page, itemsPerPage, filter, true);
                setProducts(data.content || []);
                setPageCount(data.totalPages || 0);
                setTotalProducts(data.totalElements || 0);
            } catch (e) {
                setError("Failed to fetch products. Please try again later.");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsFromServer();
    }, [page, filter, searchTerm]);

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: productListRef.current?.offsetTop || 0, behavior: "smooth" });
    };

    return (
        <MainLayout>
            <div className="min-h-screen overflow-x-hidden bg-[#090909] text-white">
                <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />

                <section className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-red-600/10">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/35 to-[#090909]" />
                        <img
                            src="https://images.unsplash.com/photo-1657549813236-9772dc7feaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
                            alt="Shop hero"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-24 md:px-10 lg:py-32">
                        <motion.img
                            src={superlogo}
                            alt="Logo"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="h-24 w-fit object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)] md:h-60"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="max-w-4xl"
                        >
                            <p className="mb-4 font-['Oswald'] text-sm uppercase tracking-[0.6em] text-red-500">
                                Curated Streetwear
                            </p>
                            <h1 className="text-[4.25rem] leading-[0.88] text-white md:text-[6.5rem]" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}>
                                UNLEASH
                                <span className="block text-red-600">YOUR REBEL</span>
                            </h1>
                            <p className="mt-6 max-w-2xl font-['Oswald'] text-lg tracking-wide text-gray-300 md:text-xl">
                                More than clothes. It&apos;s attitude, texture, and movement. Browse the newest drops and filter exactly the look you want.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <a
                                href="#shop-grid"
                                className="inline-flex items-center justify-center bg-red-600 px-8 py-4 font-['Oswald'] text-sm uppercase tracking-[0.35em] text-white transition hover:bg-red-500"
                            >
                                Shop Now
                            </a>
                            <a
                                href="#collections"
                                className="inline-flex items-center justify-center border border-white/60 px-8 py-4 font-['Oswald'] text-sm uppercase tracking-[0.35em] text-white transition hover:border-white hover:bg-white hover:text-black"
                            >
                                Lookbook
                            </a>
                        </motion.div>
                    </div>
                </section>

                <section id="collections" className="mx-auto max-w-7xl px-6 py-20 md:px-10">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <p className="mb-3 font-['Oswald'] text-sm uppercase tracking-[0.5em] text-red-500">Lookbook</p>
                        <h2 className="text-5xl text-white md:text-7xl" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}>
                            NEW DROP
                        </h2>
                        <div className="mt-4 h-1 w-24 bg-red-600" />
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
                        {collections.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 36 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className={`group relative cursor-pointer overflow-hidden ${
                                    index === 0 ? "lg:col-span-7" :
                                    index === 1 ? "lg:col-span-5" :
                                    index === 2 ? "lg:col-span-5" : "lg:col-span-7"
                                }`}
                            >
                                <div className="relative aspect-[3/4] overflow-hidden">
                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                                    <div className="absolute inset-x-0 top-0 h-1 origin-left bg-red-600 transition duration-500 group-hover:scale-x-100" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 className="text-3xl text-white md:text-4xl" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}>
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 font-['Oswald'] text-lg tracking-[0.25em] text-red-500">{item.price}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section id="shop-grid" className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
                    <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <Breadcrumbs aria-label="breadcrumb" sx={{ color: "#d1d5db", "& .MuiBreadcrumbs-separator": { color: "#ef4444" } }}>
                                <Link to="/" className="font-poppins text-sm text-gray-300 transition hover:text-white">
                                    Home
                                </Link>
                                <Typography sx={{ color: "#ffffff", fontFamily: "Poppins" }}>Shop</Typography>
                            </Breadcrumbs>
                            <h2 className="mt-4 text-4xl text-white md:text-5xl" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}>
                                {filter.query ? "SEARCH RESULTS" : "SHOP ALL"}
                            </h2>
                            <p className="mt-2 font-['Oswald'] text-sm uppercase tracking-[0.35em] text-gray-400">
                                {filter.query ? `Found ${totalProducts} matching items` : `${totalProducts} products available`}
                            </p>
                        </div>

                        <div className="w-full md:max-w-md">
                            <label htmlFor="shop-search" className="mb-3 block font-['Oswald'] text-xs uppercase tracking-[0.35em] text-gray-400">
                                Search Product
                            </label>
                            <div className="flex items-center border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm transition focus-within:border-red-500">
                                <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    id="shop-search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Type product name..."
                                    className="w-full bg-transparent font-poppins text-sm text-white outline-none placeholder:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-4 xl:col-span-3">
                            <FilterComponent onFilter={handleFilterChange} />
                        </div>

                        <div className="lg:col-span-8 xl:col-span-9" ref={productListRef}>
                            {loading ? (
                                <div className="flex min-h-[24rem] items-center justify-center border border-white/10 bg-white/[0.03]">
                                    <CircularProgress sx={{ color: "#dc2626" }} />
                                </div>
                            ) : error ? (
                                <div className="flex min-h-[24rem] items-center justify-center border border-red-500/30 bg-red-500/5 p-8 text-center">
                                    <p className="font-poppins text-xl font-semibold text-red-400">{error}</p>
                                </div>
                            ) : products.length > 0 ? (
                                <div className="space-y-8">
                                    <ProductList products={products} />
                                    {pageCount > 1 && (
                                        <div className="flex justify-center">
                                            <Pagination
                                                count={pageCount}
                                                page={page}
                                                onChange={handlePageChange}
                                                shape="rounded"
                                                showFirstButton
                                                showLastButton
                                                sx={{
                                                    "& .MuiPaginationItem-root": {
                                                        color: "#f3f4f6",
                                                        borderColor: "rgba(255,255,255,0.16)",
                                                        fontFamily: "Poppins",
                                                    },
                                                    "& .Mui-selected": {
                                                        backgroundColor: "#dc2626 !important",
                                                        color: "#ffffff",
                                                    },
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex min-h-[24rem] items-center justify-center border border-white/10 bg-white/[0.03] p-8 text-center">
                                    <p className="font-poppins text-2xl font-semibold text-white">No products found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}

export default Shop;
