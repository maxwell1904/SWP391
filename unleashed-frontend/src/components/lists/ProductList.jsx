import React from "react";
import ProductItem from "../items/ProductItem";

const ProductList = ({ products }) => {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-6 py-3 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <ProductItem key={product.productId} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductList;
