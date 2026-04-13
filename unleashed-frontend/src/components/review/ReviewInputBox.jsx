import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, TextField, Button, Alert, Skeleton } from '@mui/material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { getReviewEligibility, postReview } from '../../service/ReviewService';

const ReviewInputBox = ({ productId, onReviewPosted }) => {
    const authHeader = useAuthHeader();
    const authUser = useAuthUser();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [eligibility, setEligibility] = useState({
        isEligible: false,
        isLoading: true,
        eligibleOrderId: null,
        message: 'Checking your eligibility to review...'
    });

    useEffect(() => {
        if (!authUser) {
            setEligibility({
                isEligible: false,
                isLoading: false,
                eligibleOrderId: null,
                message: 'You must be logged in to leave a review.'
            });
            return;
        }

        const checkEligibility = async () => {
            try {
                const response = await getReviewEligibility(productId, authHeader);
                if (response && response.length > 0) {
                    setEligibility({
                        isEligible: true,
                        isLoading: false,
                        eligibleOrderId: response[0].orderId, // Use the first eligible order
                        message: ''
                    });
                } else {
                    setEligibility({
                        isEligible: false,
                        isLoading: false,
                        eligibleOrderId: null,
                        message: 'You can only review products you have purchased from a completed order.'
                    });
                }
            } catch (error) {
                setEligibility({
                    isEligible: false,
                    isLoading: false,
                    eligibleOrderId: null,
                    message: 'You have already reviewed this product for all eligible orders.'
                });
            }
        };

        checkEligibility();
    }, [productId, authHeader, authUser]);

    const handleSubmitReview = async () => {
        if (rating === 0) {
            alert("A star rating is required.");
            return;
        }

        const reviewPayload = {
            productId: productId,
            reviewComment: comment,
            reviewRating: rating,
            userId: authUser.userId,
            orderId: eligibility.eligibleOrderId
        };

        try {
            await postReview(reviewPayload, authHeader);
            setRating(0);
            setComment('');
            onReviewPosted(); // Notify parent to refresh the review list
        } catch (error) {
            // Error is handled by the service toast
        }
    };

    if (eligibility.isLoading) {
        return <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }}/>;
    }

    return (
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Leave a Review</Typography>
            {!eligibility.isEligible ? (
                <Alert severity="info">{eligibility.message}</Alert>
            ) : (
                <>
                    <Typography component="legend">Your Rating*</Typography>
                    <Rating
                        name="review-rating"
                        value={rating}
                        onChange={(event, newValue) => { setRating(newValue); }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Your Review"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        variant="outlined"
                        margin="normal"
                    />
                    <Button
                        variant="contained"
                        onClick={handleSubmitReview}
                        disabled={rating === 0}
                    >
                        Submit Review
                    </Button>
                </>
            )}
        </Box>
    );
};

export default ReviewInputBox;