import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import MainLayout from '../../layouts/MainLayout';
import { useProduct } from '../../components/Providers/Product';
import ReviewItem from '../../components/review/ReviewItem';
import ReviewInputBox from '../../components/review/ReviewInputBox';
import { getProductReviews } from '../../service/ReviewService';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const AllReviewsPage = () => {
    const { productId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const { products } = useProduct();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (products && products.length > 0) {
            const currentProduct = products.find(prod => prod.productId === productId);
            setProduct(currentProduct);
        }
    }, [productId, products]);

    const fetchAllProductReviews = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const response = await getProductReviews(productId, currentPage, 5);
            setReviews(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchAllProductReviews(page);
    }, [page, fetchAllProductReviews]);

    const handleRefreshReviews = () => {
        // Fetch from the first page to see new/edited content immediately
        if (page === 0) {
            fetchAllProductReviews(0);
        } else {
            setPage(0);
        }
    };

    return (
        <MainLayout>
            <div className="AllReviewsPage font-montserrat pt-20 pb-10" style={{ marginTop: 20 }}>
                <div className='headerBreadcums flex items-center h-32 bg-beluBlue'>
                    <div className='pl-16'>
                        <Breadcrumbs sx={{ fontFamily: 'Poppins' }}>
                            <Link to={'/'}>Home</Link>
                            <Link to={'/shop'}>Shop</Link>
                            <Link to={`/shop/product/${productId}`}>{product?.productName}</Link>
                            <Typography color="textPrimary" className="font-poppins">All Reviews</Typography>
                        </Breadcrumbs>
                    </div>
                </div>
                <h1 className="text-3xl font-bold pt-10 mb-6 text-center">All Reviews for "{product?.productName}"</h1>

                <Box className='content px-6 border-2 border-gray-300 rounded-lg p-6' style={{ margin: 40 }}>
                    <ReviewInputBox productId={productId} onReviewPosted={handleRefreshReviews} />

                    {loading && <Typography>Loading reviews...</Typography>}

                    {!loading && reviews.length > 0 ? (
                        reviews.map((review) => (
                            <ReviewItem key={review.reviewId} review={review} productId={productId} onCommentAction={handleRefreshReviews} />
                        ))
                    ) : (
                        !loading && <div className="text-center"><h1 className="text-xl font-semibold">No reviews yet. Be the first!</h1></div>
                    )}

                    {totalPages > 1 && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <EnhancedPagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(newPage) => setPage(newPage)}
                                isLoading={loading}
                            />
                        </Box>
                    )}
                </Box>
            </div>
        </MainLayout>
    );
};

export default AllReviewsPage;