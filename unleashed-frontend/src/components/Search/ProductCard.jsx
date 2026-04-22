import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../format/formats';
import {Rating} from '@mui/material'

const ProductCard = ({ product }) => {
    const ratingValue = product.averageRating ?? product.avgRating ?? 0;
    const ratingCount = product.totalRatings ?? product.totalRating ?? 0;

    // Function to truncate product name
    const truncateProductName = (name, maxLength) => {
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + "...";
        }
        return name;
    };

    const truncatedName = truncateProductName(product.productName, 40); // Gọi hàm truncate

    return (
        <div className="product-card p-4 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:scale-105 flex-col">
            <Link to={`/shop/product/${product.productId}`}>
                <img
                    src={product.productVariationImage}
                    alt={product.productName}
                    className="product-image rounded-t-lg"
                />
                <div className="p-4">
                    <h3 className="product-name text-lg font-semibold mb-2" title={product.productName}> {/* Thêm title để hiển thị full name khi hover */}
                        {truncatedName} {/* Hiển thị tên đã rút gọn */}
                    </h3>
                    <p className="product-price text-blue-700">{formatPrice(product.productPrice)}</p>
                    <div className="product-rating mt-2 mb-2 flex items-center justify-left">
                        <Rating name="half-rating-read" precision={0.5} readOnly value={ratingValue} />
                        <span className="text-sm text-gray-500 ml-2">({ratingCount})</span>
                    </div>
                    {/* <p className="product-total-reviews text-sm text-gray-500">
                        {product.totalRatings} Customer Reviews
                    </p> */}
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;