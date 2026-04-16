import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import ReviewItem from '../../components/review/ReviewItem';
import { Typography } from '@mui/material';
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { getDashboardProductReviews } from '../../service/ReviewService';
import { jwtDecode } from "jwt-decode";
import { useProduct } from '../../components/Providers/Product';

const DashboardReviewProduct = () => {
    const { productId } = useParams();
    const [allProductReviews, setAllProductReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const authHeaderString = useAuthHeader();
    const [decodedToken, setDecodedToken] = useState(null);
    // const [isAdminOrStaff, setIsAdminOrStaff] = useState(false); // Không cần state này nữa
    const [product, setProduct] = useState(null);

    const { products } = useProduct();
    const navigate = useNavigate();

    useEffect(() => {
        if (products && products.length > 0) {
            const currentProduct = products.find(prod => prod.productId === productId);
            if (currentProduct) {
                setProduct(currentProduct);
            } else {
                console.error(`Product with id ${productId} not found in products list.`);
                setProduct(null);
            }
        }
    }, [productId, products]);

    useEffect(() => {
        const fetchAllProductReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                const reviews = await getDashboardProductReviews(productId, authHeaderString);
                setAllProductReviews(reviews);
            } catch (error) {
                console.error("Lỗi fetch all reviews dashboard:", error);
                setError(error);
                setAllProductReviews([]);
            } finally {
                setLoading(false);
            }
        };

        // **Kết hợp kiểm tra vai trò và hành động vào cùng một useEffect**
        if (authHeaderString) {
            let isAdminOrStaff = false; // Biến local để kiểm tra vai trò
            try {
                const token = authHeaderString.split(' ')[1];
                const decoded = jwtDecode(token);
                setDecodedToken(decoded);
                // console.log("Decoded Token in Combined useEffect:", decoded);

                if (decoded?.role) {
                    const roles = decoded.role.map(roleObj => roleObj.authority);
                    isAdminOrStaff = roles.includes('ADMIN') || roles.includes('STAFF');
                }

            } catch (error) {
                console.error("Error decoding token:", error);
                setDecodedToken(null);
                isAdminOrStaff = false; // Mặc định là false nếu decode lỗi
            }

            if (isAdminOrStaff) {
                fetchAllProductReviews(); // Fetch data nếu có quyền
            } else {
                navigate('/'); // Chuyển hướng nếu không có quyền
            }

        } else {
            navigate('/'); // Chuyển hướng nếu không có authHeaderString (chưa đăng nhập hoặc lỗi)
        }


    }, [productId, authHeaderString, navigate]); // Loại bỏ isAdminOrStaff khỏi dependency array


    if (loading) {
        return <MainLayout><div>Loading reviews for product...</div></MainLayout>;
    }

    if (error) {
        return <MainLayout><div>Error loading reviews: {error.message}</div></MainLayout>;
    }


    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-6 text-center">Reviews for : {product?.productName}</h1>

                <div className='content px-6 border-2 border-gray-300 rounded-lg p-6' style={{
                    margin: 40
                }}>
                    {allProductReviews && allProductReviews.length > 0 ? (
                        allProductReviews.map((review, index) => (
                            <ReviewItem key={index} review={review} />
                        ))
                    ) : (
                        <div className="text-center">
                            <Typography>No reviews available for this product.</Typography>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default DashboardReviewProduct;