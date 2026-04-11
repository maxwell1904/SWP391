import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../core/api';
import ReviewStars from '../../components/reviewStars/ReviewStars';
import { jwtDecode } from 'jwt-decode';
import {
    Typography,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
} from '@mui/material';
import MainLayout from '../../layouts/MainLayout';
import { getDashboardReviews } from '../../service/ReviewService';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useDebounce from '../../components/hooks/useDebounce';
import EnhancedPagination from '../../components/pagination/EnhancedPagination';

const DashboardReview = () => {
    const [dashboardReviews, setDashboardReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentParentId, setCommentParentId] = useState(null);
    const authHeader = useAuthHeader();
    const token = authHeader ? authHeader.split(' ')[1] : null;
    const username = token ? jwtDecode(token).sub : null;
    const [productIdReply, setProductIdReply] = useState();
    const [commentError, setCommentError] = useState('');

    // --- NEW STATE FROM ORDERS PAGE ---
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('date_desc');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isInitialMount = useRef(true);

    const cleanImageUrl = (url) => {
        if (!url) return '';
        if (url.includes('lh3.googleusercontent.com')) {
            return url.split('=')[0];
        }
        return url;
    };

    // --- REFACTORED DATA FETCHING ---
    const fetchDashboardReviews = async () => {
        if (!authHeader) return;
        setLoading(true);
        try {
            const data = await getDashboardReviews(page, 10, authHeader, debouncedSearchTerm, sortOrder);
            setDashboardReviews(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching dashboard reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setPage(0);
        }
    }, [debouncedSearchTerm, sortOrder]);

    useEffect(() => {
        fetchDashboardReviews();
    }, [page, debouncedSearchTerm, sortOrder, authHeader]);

    const handlePostComment = async () => {
        try {
            if (!newComment.trim()) {
                setCommentError('Comment content cannot be empty.');
                return;
            }
            await apiClient.post(
                'api/comments/admin',
                {
                    username: username,
                    commentParentId: commentParentId,
                    productId: productIdReply,
                    comment: {
                        id: 0,
                        commentContent: newComment,
                    },
                },
                { headers: { Authorization: authHeader } }
            );
            setOpenDialog(false);
            setNewComment('');
            setCommentParentId(null);
            fetchDashboardReviews(); // Re-fetch reviews after replying
        } catch (error) {
            console.error('Error posting comment:', error);
            setCommentError('Failed to post comment. Please try again.');
        }
    };

    const ListSkeleton = () => (
        <ul className='space-y-4'>
            {[...Array(5)].map((_, index) => (
                <li key={index} className='border p-4 rounded-md shadow-sm grid grid-cols-3 gap-4'>
                    <div className='flex flex-col gap-2'>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="100%" />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="60%" />
                    </div>
                    <div className='flex justify-center items-center'>
                        <Skeleton variant="rectangular" width={128} height={128} />
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <MainLayout>
            <div className='container mx-auto px-4 py-8'>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-4xl font-bold'>Product Reviews</h1>
                </div>

                {/* --- NEW CONTROLS BAR --- */}
                <Paper elevation={2} className='flex justify-between items-center mb-6 p-4 rounded-lg'>
                    <TextField
                        label="Search by product, user, or comment..."
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-1/2"
                    />
                    <FormControl variant="outlined" size="small" className="w-1/4">
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            label="Sort By"
                        >
                            <MenuItem value="date_desc">Newest First</MenuItem>
                            <MenuItem value="date_asc">Oldest First</MenuItem>
                        </Select>
                    </FormControl>
                </Paper>

                {loading ? (
                    <ListSkeleton />
                ) : dashboardReviews && dashboardReviews.length > 0 ? (
                    <ul className='space-y-4'>
                        {dashboardReviews.map((review) => (
                            <li key={review.commentId} className='border p-4 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 bg-white'>
                                <div className='flex flex-col'>
                                    <div className='flex items-center mb-2'>
                                        {review.userImage && (
                                            <img
                                                src={cleanImageUrl(review.userImage)}
                                                className='w-10 h-10 rounded-full mr-3'
                                                referrerPolicy='no-referrer'
                                                alt={review.fullName}
                                            />
                                        )}
                                        <div>
                                            <p className='font-semibold'>{review.fullName}</p>
                                            <p className='text-sm text-gray-500'>
                                                {new Date(review.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className='mt-2 break-words'>
                                        <span className='font-medium text-gray-600'>Comment:</span> {review.commentContent}
                                    </p>
                                    <div className='mt-auto pt-2'>
                                        <Button
                                            variant='outlined'
                                            size='small'
                                            onClick={() => {
                                                setProductIdReply(review.productId);
                                                setCommentParentId(review.commentId);
                                                setOpenDialog(true);
                                            }}
                                            disabled={review.maxReply}
                                        >
                                            Reply
                                        </Button>
                                        {review.maxReply && (
                                            <Typography variant="caption" color="error" className='ml-2'>Max replies reached</Typography>
                                        )}
                                    </div>
                                </div>
                                <div className='flex flex-col justify-center border-l border-r px-4'>
                                    <p className='font-semibold text-blue-600 hover:underline'>
                                        <Link to={`/Dashboard/Product-Reviews/${review.productId}`}>
                                            {review.productName}
                                        </Link>
                                    </p>
                                    {review.reviewRating !== null && (
                                        <div className='flex items-center mt-1'>
                                            <span className='font-medium mr-2'>Rating:</span>
                                            <ReviewStars rating={review.reviewRating} />
                                        </div>
                                    )}
                                    {review.parentCommentContent && (
                                        <p className='text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded'>
                                            <span className='font-medium'>In reply to:</span> "{review.parentCommentContent}"
                                        </p>
                                    )}
                                </div>
                                <div className='flex justify-center items-center'>
                                    <Link to={`/Dashboard/Product-Reviews/${review.productId}`}>
                                        {review.variationImage && (
                                            <img
                                                src={review.variationImage}
                                                alt={`Variation for ${review.productName}`}
                                                className='w-32 h-32 object-cover rounded-md'
                                            />
                                        )}
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Paper className="text-center py-10 text-gray-500">
                        <Typography>No reviews found matching your criteria.</Typography>
                    </Paper>
                )}

                <EnhancedPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    isLoading={loading}
                />
            </div>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Post a Reply</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label='Your Reply'
                        value={newComment}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length > 500) {
                                setCommentError('Comment content must not exceed 500 characters.');
                            } else {
                                setCommentError('');
                                setNewComment(value);
                            }
                        }}
                        autoFocus
                        variant='outlined'
                        error={!!commentError}
                        helperText={commentError}
                    />
                    <Typography variant='caption' align='right' display='block' className='mt-2'>
                        {newComment.length}/500
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(false); setNewComment(''); }}>Cancel</Button>
                    <Button onClick={handlePostComment} color='primary' variant='contained'>Post Reply</Button>
                </DialogActions>
            </Dialog>
        </MainLayout>
    );
};

export default DashboardReview;