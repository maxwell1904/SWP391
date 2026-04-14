import {
    Box,
    Card,
    Divider,
    Typography,
    Skeleton,
    Rating,
    Button,
    Avatar,
    Paper,
    Stack
} from '@mui/material';
import { RateReviewOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { getMyReviews } from '../../service/UserService';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import useDebounce from '../../components/hooks/useDebounce';

// New Skeleton that matches the "feed-style" layout
const ReviewItemSkeleton = () => (
    [...Array(4)].map((_, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rectangular" sx={{ width: 80, height: 80, borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" sx={{ fontSize: '1.2rem' }} />
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="90%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="80%" />
                </Box>
            </Box>
        </Paper>
    ))
);


// Component for the "No Reviews" message
const EmptyReviews = () => (
    <Card variant="outlined" sx={{ mt: 4, textAlign: 'center', p: 4, borderStyle: 'dashed' }}>
        <RateReviewOutlined sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
            No Reviews Yet
        </Typography>
        <Typography color="text.secondary">You haven't rated any products yet. Your feedback helps others!</Typography>
    </Card>
);

// New component for rendering a single review in a feed-style card
const ReviewItemCard = ({ review }) => (
    <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Avatar
                variant="rounded"
                src={review.productImageUrl || '/default-product-image.jpg'}
                alt={review.productName}
                sx={{ width: 80, height: 80, alignSelf: 'center' }}
            />
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" component="div" fontWeight="bold">
                    {review.productName}
                </Typography>
                <Rating value={review.reviewRating} readOnly size="small" sx={{ my: 0.5 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                    {review.commentContent || 'No comment provided.'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {review.commentCreatedAt ? `Reviewed on: ${new Date(review.commentCreatedAt).toLocaleDateString()}` : ''}
                    </Typography>
                    <Button
                        component={Link}
                        to={`/shop/product/${review.productId}`}
                        variant="outlined"
                        size="small"
                    >
                        View Product
                    </Button>
                </Box>
            </Box>
        </Box>
    </Paper>
);


const ReviewHistory = () => {
    const authHeader = useAuthHeader();
    const user = useAuthUser();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const debouncedPage = useDebounce(page, 500);

    useEffect(() => {
        const fetchReviews = async () => {
            if (user?.username) {
                setLoading(true);
                try {
                    const response = await getMyReviews(authHeader, user.username, debouncedPage, 5);
                    if (response?.data) {
                        setReviews(response.data.content);
                        setTotalPages(response.data.totalPages);
                    }
                } catch (error) {
                    console.error('Error fetching reviews:', error);
                    setReviews([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setReviews([]);
            }
        };
        fetchReviews();
    }, [authHeader, user, debouncedPage]);

    const handlePageChange = (newPage) => setPage(newPage);

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Review History
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
                {loading ? (
                    <ReviewItemSkeleton />
                ) : reviews.length > 0 ? (
                    reviews.map((review) => <ReviewItemCard key={review.id} review={review} />)
                ) : (
                    <EmptyReviews />
                )}
            </Stack>

            {totalPages > 1 && (
                <EnhancedPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                />
            )}
        </Box>
    );
};

export default ReviewHistory;