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
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { getMyReviews } from '../../service/UserService';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';
import useDebounce from '../../components/hooks/useDebounce';

const listItemSx = (theme) => ({
    p: { xs: 1.5, sm: 2 },
    borderRadius: 1,
    borderColor: alpha(theme.palette.text.primary, 0.12),
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
    '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.36),
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        transform: 'translateY(-1px)'
    }
});

const emptyStateSx = (theme) => ({
    mt: 4,
    textAlign: 'center',
    p: 4,
    borderRadius: 1,
    borderStyle: 'dashed',
    borderColor: alpha(theme.palette.text.primary, 0.18)
});

// Skeleton that matches the user list card layout
const ReviewItemSkeleton = () => (
    [...Array(4)].map((_, index) => (
        <Paper key={index} variant="outlined" sx={listItemSx}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="rectangular" sx={{ width: 88, height: 96, borderRadius: 1, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" sx={{ fontSize: '1.2rem' }} />
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="82%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="42%" />
                </Box>
                <Skeleton variant="rounded" sx={{ width: 116, height: 34, display: { xs: 'none', sm: 'block' } }} />
            </Box>
        </Paper>
    ))
);


// Component for the "No Reviews" message
const EmptyReviews = () => (
    <Card variant="outlined" sx={emptyStateSx}>
        <RateReviewOutlined sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
            No Reviews Yet
        </Typography>
        <Typography color="text.secondary">You haven't rated any products yet. Your feedback helps others!</Typography>
    </Card>
);

const ReviewItemCard = ({ review }) => (
    <Paper variant="outlined" sx={listItemSx}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
            <Avatar
                variant="rounded"
                src={review.productImageUrl || '/default-product-image.jpg'}
                alt={review.productName}
                sx={{
                    width: { xs: '100%', sm: 88 },
                    height: { xs: 180, sm: 96 },
                    alignSelf: { xs: 'stretch', sm: 'center' },
                    bgcolor: 'grey.100',
                    '& img': {
                        objectFit: 'cover'
                    }
                }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="subtitle1"
                    component="div"
                    fontWeight={700}
                    sx={{
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {review.productName}
                </Typography>
                <Rating value={review.reviewRating} readOnly size="small" sx={{ my: 0.5 }} />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {review.commentContent || 'No comment provided.'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {review.commentCreatedAt ? `Reviewed on: ${new Date(review.commentCreatedAt).toLocaleDateString()}` : ''}
                </Typography>
            </Box>
            <Button
                component={Link}
                to={`/shop/product/${review.productId}`}
                variant="outlined"
                size="small"
                sx={{
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    alignSelf: { xs: 'stretch', sm: 'center' }
                }}
            >
                View Product
            </Button>
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
