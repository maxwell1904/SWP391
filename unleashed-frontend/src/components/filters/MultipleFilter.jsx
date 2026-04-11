import { Rating } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { RadioCommon } from "../inputs/Radio";
import { getBrand, getCategory } from "../../service/ShopService";

const sectionLabelClass = "mb-4 block border-b border-white/10 pb-3 font-['Oswald'] text-xs uppercase tracking-[0.35em] text-gray-400";

const FilterComponent = ({ onFilter }) => {
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [priceOrder, setPriceOrder] = useState("");
    const [rating, setRating] = useState(0);

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const isInitialMount = useRef(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const categoryList = await getCategory() || [];
            setCategories(categoryList);
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            const brandList = await getBrand() || [];
            const sortedBrandList = brandList.sort((a, b) =>
                (a.brandName || "").localeCompare(b.brandName || "")
            );
            setBrands(sortedBrandList);
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else if (typeof onFilter === "function") {
            onFilter({ category, brand, priceOrder, rating });
        }
    }, [category, brand, priceOrder, rating, onFilter]);

    const handleReset = () => {
        setCategory("");
        setBrand("");
        setPriceOrder("");
        setRating(0);
    };

    return (
        <div className="sticky top-28 border border-white/10 bg-white/[0.03] p-6 text-white backdrop-blur-sm">
            <div className="mb-8">
                <p className="font-['Oswald'] text-sm uppercase tracking-[0.4em] text-red-500">Filter</p>
                <h3 className="mt-2 text-3xl text-white" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif" }}>
                    Refine The Drop
                </h3>
            </div>

            <form className="space-y-8">
                <div>
                    <label className={sectionLabelClass}>Category</label>
                    <div className="space-y-3 font-poppins text-sm text-gray-200">
                        <RadioCommon
                            context="All Categories"
                            current={category}
                            value=""
                            id="category-all"
                            handleChecked={() => setCategory("")}
                        />
                        {categories.length > 0 ? (
                            categories.map((categoryItem) => (
                                <RadioCommon
                                    key={categoryItem.id}
                                    context={categoryItem.categoryName}
                                    current={category}
                                    id={`category-${categoryItem.id}`}
                                    value={categoryItem.categoryName}
                                    handleChecked={() => setCategory(categoryItem.categoryName)}
                                />
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">Loading categories...</div>
                        )}
                    </div>
                </div>

                <div>
                    <label className={sectionLabelClass}>Brand</label>
                    <div className="space-y-3 font-poppins text-sm text-gray-200">
                        <RadioCommon
                            context="All Brands"
                            current={brand}
                            value=""
                            id="brand-all"
                            handleChecked={() => setBrand("")}
                        />
                        {brands.length > 0 ? (
                            brands.map((brandItem) => (
                                <RadioCommon
                                    key={brandItem.id}
                                    context={brandItem.brandName}
                                    current={brand}
                                    id={`brand-${brandItem.id}`}
                                    value={brandItem.brandName}
                                    handleChecked={() => setBrand(brandItem.brandName)}
                                />
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">Loading brands...</div>
                        )}
                    </div>
                </div>

                <div>
                    <label className={sectionLabelClass}>Price</label>
                    <div className="space-y-3 font-poppins text-sm text-gray-200">
                        <RadioCommon
                            context="Default"
                            current={priceOrder}
                            value=""
                            id="price-default"
                            handleChecked={() => setPriceOrder("")}
                        />
                        <RadioCommon
                            context="Low to High"
                            current={priceOrder}
                            value="asc"
                            id="price-asc"
                            handleChecked={() => setPriceOrder("asc")}
                        />
                        <RadioCommon
                            context="High to Low"
                            current={priceOrder}
                            value="desc"
                            id="price-desc"
                            handleChecked={() => setPriceOrder("desc")}
                        />
                    </div>
                </div>

                <div>
                    <label className={sectionLabelClass}>Rating</label>
                    <div className="rounded-none border border-white/10 bg-black/30 px-4 py-4">
                        <Rating
                            value={rating}
                            sx={{
                                color: "#eab308",
                                "& .MuiRating-iconEmpty": { color: "#4b5563" },
                            }}
                            onChange={(event, newRating) => {
                                setRating(newRating === rating ? 0 : newRating || 0);
                            }}
                        />
                        <p className="mt-2 font-poppins text-xs text-gray-500">
                            {rating > 0 ? `Showing ${rating}+ stars` : "Select a minimum rating"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="w-full border border-red-600 bg-red-600 px-4 py-3 font-['Oswald'] text-sm uppercase tracking-[0.35em] text-white transition hover:bg-red-500"
                    onClick={handleReset}
                >
                    Reset Filter
                </button>
            </form>
        </div>
    );
};

export default FilterComponent;
