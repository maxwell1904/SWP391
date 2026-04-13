import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Box, Typography, Rating } from "@mui/material";

function ReviewModal({ open, handleClose, productId, name, image, variationSingleId, userId, handleSubmitReview }) {
  const [reviewText, setReviewText] = useState(""); // State for review text input
  const [rating, setRating] = useState(0); // State for rating
  const [commentError, setCommentError] = useState(""); // State for comment length error
  const [submitDisabled, setSubmitDisabled] = useState(true); // State to disable submit button

  const handleReviewChange = (e) => {
    setReviewText(e.target.value);
    if (e.target.value.length > 500) {
      setCommentError("Comment must be 500 characters or less.");
      setSubmitDisabled(true); // Disable submit if comment is too long
    } else {
      setCommentError("");
      setSubmitDisabled(rating === 0); // Re-enable submit if rating is also valid
    }
  };

  const handleRatingChange = (e, newValue) => {
    setRating(newValue);
    setSubmitDisabled(newValue === null || newValue === 0 || reviewText.length > 500); // Disable submit if rating is 0 or comment is too long
  };

  useEffect(() => {
    setSubmitDisabled(rating === 0 || rating === null || reviewText.length > 500); // **Sửa đổi điều kiện disable**
  }, [open, rating, reviewText]);

  const handleReviewSubmit = () => {
    if (rating === 0) {
      alert("Please provide a rating."); // Alert if rating is 0
      return;
    }
    if (reviewText.length > 500) {
      alert("Comment must be 500 characters or less."); // Alert if comment too long (should already be disabled, but for extra safety)
      return;
    }

    const review = {
      productId: productId,
      reviewComment: reviewText,
      reviewRating: rating,
      variationSingleId: variationSingleId,
      userId: userId
    };
    // console.log("Review: ", review);
    handleSubmitReview(productId, review);
    clearFields();
  };

  const clearFields = () => {
    setReviewText(""); // Clear review text
    setRating(0); // Reset rating
    setCommentError(""); // Clear comment error
    setSubmitDisabled(true); // Disable submit after cancel/submit
  };

  const handleCancel = () => {
    clearFields(); // Clear fields when canceled
    handleClose(); // Close the modal
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="sm" 
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "16px",
          padding: "16px",
          fontFamily: "Poppins",
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          fontFamily: "Poppins", 
          fontSize: "1.5rem" 
        }}
      >
        Add Review for {name}
      </DialogTitle>
      <DialogContent 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 2, 
          alignItems: "center",
          px: 4,
          pb: 3
        }}
      >
        {/* Product details */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2,
            width: "100%", 
            mb: 2, 
          }}
        >
          <img 
            src={image} 
            alt={name} 
            style={{ 
              width: 80, 
              height: 80, 
              objectFit: "cover", 
              borderRadius: "12px", 
              border: "2px solid #ddd",
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: "Poppins", 
              fontWeight: "bold",
              fontSize: "1.2rem", 
              textOverflow: "ellipsis", 
              overflow: "hidden", 
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Typography>
        </Box>

        {/* Rating */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1, 
            width: "100%",
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              fontFamily: "Poppins", 
              fontSize: "1rem", 
            }}
          >
            Rating:
          </Typography>
          <Rating 
            value={rating} 
            onChange={handleRatingChange} 
            size="large" 
            sx={{
              color: "#fbc02d", // Gold color for rating stars
            }}
          />
        </Box>

        {/* Review text area */}
        <TextField
          label="Your Review"
          multiline
          fullWidth
          rows={4}
          value={reviewText}
          onChange={handleReviewChange}
          error={!!commentError} // Show error state if commentError is not empty
          helperText={commentError || `${reviewText.length}/500 characters`} // Show error message or character count
          sx={{
            mt: 2,
            "& .MuiInputBase-root": {
              fontFamily: "Poppins",
            },
            "& .MuiInputLabel-root": {
              fontFamily: "Poppins",
              fontSize: "0.9rem",
            },
          }}
        />
      </DialogContent>
      <DialogActions 
        sx={{
          display: "flex", 
          justifyContent: "space-between", 
          px: 3,
        }}
      >
        <Button 
          onClick={handleCancel} 
          color="secondary"
          sx={{
            textTransform: "none",
            fontFamily: "Poppins",
            fontSize: "0.9rem",
            padding: "6px 16px",
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleReviewSubmit} 
          color="primary"
          variant="contained"
          disabled={submitDisabled} // Disable button based on submitDisabled state
          sx={{
            textTransform: "none",
            fontFamily: "Poppins",
            fontSize: "0.9rem",
            padding: "6px 16px",
            borderRadius: "8px",
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReviewModal;
