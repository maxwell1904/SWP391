import { Rating, Skeleton } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../format/formats";

const ProductItem = ({ product }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const ratingValue = product.averageRating ?? product.avgRating ?? 0;
    const ratingCount = product.totalRatings ?? product.totalRating ?? 0;
    let voucheredPrice = product.productPrice;

    if (product.promotion?.promotionType?.promotionTypeName === "PERCENTAGE" && product.promotionValue > 0) {
        voucheredPrice = product.productPrice - product.productPrice * (product.promotionValue / 100);
    } else if (product.promotion?.promotionType?.promotionTypeName === "FIXED AMOUNT" && product.promotionValue > 0) {
        voucheredPrice = product.productPrice - product.promotionValue;
    }

    const displayPrice =
        voucheredPrice && voucheredPrice >= 0
            ? formatPrice(voucheredPrice)
            : 0;

    const originalPrice =
        product.productPrice && product.productPrice >= 0
            ? formatPrice(product.productPrice)
            : 0;

    return (
        <article className="group relative overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-red-600/40 hover:bg-[#111111]">
            <Link to={`/shop/product/${product.productId}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                    {!imageLoaded && (
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
                        />
                    )}
                    <img
                        className={`${imageLoaded ? "h-full w-full object-cover transition duration-500 group-hover:scale-105" : "hidden"}`}
                        src={product.productVariationImage || "default_image.jpg"}
                        alt={product.productName || "Product Image"}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(false)}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90" />
                    <div className="absolute inset-x-0 top-0 h-1 bg-red-600 opacity-0 transition duration-300 group-hover:opacity-100" />

                    {product.promotionValue > 0 && (
                        <div className="absolute left-4 top-4 bg-red-600 px-3 py-2 font-['Oswald'] text-xs uppercase tracking-[0.25em] text-white">
                            {product.promotion?.promotionType?.promotionTypeName === "PERCENTAGE"
                                ? `Save ${product.promotionValue}%`
                                : "On Promotion"}
                        </div>
                    )}
                </div>

                <div className="space-y-4 bg-[#0a0a0a] p-5">
                    <div>
                        {product.brand?.brandName && product.brand.brandName.toLowerCase() !== "unleashed" && (
                            <p className="mb-2 font-['Oswald'] text-[11px] uppercase tracking-[0.35em] text-gray-500">
                                {product.brand.brandName}
                            </p>
                        )}
                        <h3 className="line-clamp-2 min-h-[3.5rem] text-xl text-white" style={{ fontFamily: "Bebas Neue, Oswald, sans-serif", letterSpacing: "0.04em" }}>
                            {product.productName || "Unnamed Product"}
                        </h3>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="font-['Oswald'] text-2xl tracking-[0.06em] text-red-500">
                                {displayPrice}
                            </p>
                            {product.promotionValue > 0 && (
                                <p className="mt-1 font-poppins text-sm text-gray-500 line-through">
                                    {originalPrice}
                                </p>
                            )}
                        </div>

                        <div className="text-right">
                            <Rating
                                name="half-rating-read"
                                value={ratingValue}
                                precision={0.5}
                                readOnly
                                size="small"
                                sx={{
                                    color: "#eab308",
                                    "& .MuiRating-iconEmpty": { color: "#4b5563" },
                                }}
                            />
                            <p className="mt-1 font-poppins text-xs text-gray-500">
                                ({ratingCount})
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default ProductItem;
