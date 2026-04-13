import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Box, CircularProgress, Typography, IconButton, Chip } from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import ReviewStars from '../reviewStars/ReviewStars';
import CommentItem from './CommentItem';
import { postReply, getReplies, updateComment, deleteComment } from '../../service/CommentService';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

const ReviewItem = ({ review, productId, onCommentAction, expansionPath, targetId }) => {
    const authHeader = useAuthHeader();
    const authUser = useAuthUser();
    const itemRef = useRef(null);

    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState({ tag: null, text: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(review.reviewComment);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const [replies, setReplies] = useState([]);
    const [repliesPage, setRepliesPage] = useState(0);
    const [hasMoreReplies, setHasMoreReplies] = useState(true);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    const needsToExpand = expansionPath && expansionPath[0] === review.commentId;
    const isTarget = targetId === review.commentId;

    const [areRepliesVisible, setAreRepliesVisible] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(isTarget);

    const isOwner = authUser?.username === review.fullName;

    const fetchReplies = async (pageToFetch) => {
        if (!hasMoreReplies && pageToFetch > 0 && pageToFetch !== 0) return;
        setIsLoadingReplies(true);
        try {
            const data = await getReplies(review.commentId, pageToFetch, 5);
            setReplies(prev => pageToFetch === 0 ? data.content : [...prev, ...data.content]);
            setHasMoreReplies(!data.last);
            setRepliesPage(pageToFetch);
        } catch (error) {
            console.error("Failed to fetch replies.");
        } finally {
            setIsLoadingReplies(false);
        }
    };

    const handleReplyAction = () => { fetchReplies(0); };

    useEffect(() => {
        if (needsToExpand) {
            setAreRepliesVisible(true);
        }
    }, [needsToExpand]);

    useEffect(() => {
        if(areRepliesVisible && replies.length === 0){
            fetchReplies(0);
        }
    }, [areRepliesVisible]);

    useEffect(() => {
        if (isTarget && itemRef.current) {
            itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const timer = setTimeout(() => setIsHighlighted(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isTarget]);

    const handleReplyClick = () => {
        if (isReplying) {
            setIsReplying(false);
            setReplyContent({ tag: null, text: '' });
        } else {
            setIsReplying(true);
            setReplyContent({ tag: `@${review.fullName}`, text: '' });
        }
    };

    const handleToggleReplies = () => { setAreRepliesVisible(!areRepliesVisible); };
    const handleLoadMoreReplies = () => fetchReplies(repliesPage + 1);

    const handleSubmitReply = async () => {
        const finalComment = (replyContent.tag ? `${replyContent.tag} ` : '') + replyContent.text.trim();
        if (!finalComment.trim()) return;

        const newCommentData = {
            commentParentId: review.commentId,
            productId: productId,
            comment: { commentContent: finalComment },
        };
        try {
            await postReply(newCommentData, authHeader);
            setIsReplying(false);
            setReplyContent({ tag: null, text: '' });
            setAreRepliesVisible(true);
            handleReplyAction();
        } catch (error) { /* Handled by service */ }
    };

    const handleSaveEdit = async () => {
        if (!editedContent.trim()) return;
        try {
            await updateComment(review.commentId, authUser.username, editedContent, authHeader);
            setIsEditing(false);
            onCommentAction();
        } catch (error) { /* Handled by service */ }
    };

    const handleDelete = async () => {
        try {
            await deleteComment(review.commentId, authUser.username, authHeader);
            setDeleteModalOpen(false);
            onCommentAction();
        } catch (error) { /* Handled by service */ }
    };

    return (
        <div ref={itemRef} className={`py-6 border-b border-gray-200 last:border-b-0 rounded-lg transition-colors duration-1000 ${isHighlighted ? 'bg-yellow-100' : 'bg-transparent'}`}>
            <div className='flex items-start space-x-4'>
                <img src={review.userImage || 'https://placehold.co/48x48'} alt={`${review.fullName}'s Profile`} className='w-12 h-12 rounded-full object-cover' />
                <div className='flex-1'>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className='font-semibold text-gray-800'>{review.fullName}</p>
                            <p className='text-xs text-gray-500'>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        {review.reviewRating != null && review.reviewRating > 0 && <ReviewStars rating={review.reviewRating} />}
                    </div>
                    {isEditing ? (
                        <Box sx={{ mt: 2 }}>
                            <TextField fullWidth multiline rows={3} value={editedContent} onChange={(e) => setEditedContent(e.target.value)} variant="outlined" size="small" />
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSaveEdit}>Save</Button>
                                <Button variant="outlined" size="small" startIcon={<Cancel />} onClick={() => setIsEditing(false)}>Cancel</Button>
                            </Box>
                        </Box>
                    ) : ( review.reviewComment && <p className='text-gray-700 break-words mt-2 text-base'>{review.reviewComment}</p> )}
                    <div className='mt-3 flex items-center gap-2 text-xs'>
                        {authUser && <button className="font-semibold text-gray-600 hover:underline" onClick={handleReplyClick}>{isReplying ? 'Cancel' : 'Reply'}</button>}
                        <button className="font-semibold text-gray-600 hover:underline" onClick={handleToggleReplies}>{areRepliesVisible ? 'Hide Replies' : `View Replies`}</button>
                        {isOwner && !isEditing && (
                            <>
                                <IconButton size="small" onClick={() => { setIsEditing(true); setEditedContent(review.reviewComment); }}><Edit fontSize="inherit" /></IconButton>
                                <IconButton size="small" onClick={() => setDeleteModalOpen(true)}><Delete fontSize="inherit" color="error" /></IconButton>
                            </>
                        )}
                    </div>
                    {isReplying && (
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                label="Write your reply..."
                                value={replyContent.text}
                                onChange={(e) => setReplyContent(prev => ({ ...prev, text: e.target.value }))}
                                variant="outlined"
                                size="small"
                                autoFocus
                                InputProps={{
                                    startAdornment: replyContent.tag && (
                                        <Chip
                                            label={replyContent.tag}
                                            onDelete={() => setReplyContent(prev => ({ ...prev, tag: null }))}
                                            color="primary"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                    ),
                                }}
                            />
                            <Button sx={{ mt: 1 }} variant="contained" size="small" onClick={handleSubmitReply}>Submit Reply</Button>
                        </Box>
                    )}
                    {areRepliesVisible && (
                        <div className='mt-4'>
                            {replies.map((reply) => (
                                <CommentItem
                                    key={reply.commentId}
                                    comment={reply}
                                    productId={productId}
                                    onCommentAction={handleReplyAction}
                                    expansionPath={needsToExpand ? expansionPath.slice(1) : []}
                                    targetId={targetId}
                                    depth={1}
                                />
                            ))}
                            {isLoadingReplies && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
                            {hasMoreReplies && !isLoadingReplies && replies.length > 0 && <Button size="small" sx={{ mt: 1 }} onClick={handleLoadMoreReplies}>Load More Replies</Button>}
                            {!isLoadingReplies && replies.length === 0 && <Typography variant="caption" color="text.secondary">No replies yet.</Typography>}
                        </div>
                    )}
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                name="this review"
            />
        </div>
    );
};

export default ReviewItem;