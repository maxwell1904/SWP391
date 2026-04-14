import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Box, CircularProgress, Typography, IconButton, Chip } from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { postReply, getReplies, updateComment, deleteComment, getDescendantReplies } from '../../service/CommentService';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';
import FlatCommentItem from './FlatCommentItem';

const CommentItem = ({ comment, productId, onCommentAction, expansionPath, targetId, depth = 1 }) => {
    const authHeader = useAuthHeader();
    const authUser = useAuthUser();
    const itemRef = useRef(null);

    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState({ tag: null, text: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.reviewComment);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const [replies, setReplies] = useState([]);
    const [repliesPage, setRepliesPage] = useState(0);
    const [hasMoreReplies, setHasMoreReplies] = useState(true);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    const [flatReplies, setFlatReplies] = useState([]);
    const [flatRepliesPage, setFlatRepliesPage] = useState(0);
    const [hasMoreFlatReplies, setHasMoreFlatReplies] = useState(true);
    const [isLoadingFlatReplies, setIsLoadingFlatReplies] = useState(false);

    const needsToExpand = expansionPath && expansionPath[0] === comment.commentId;
    const isTarget = targetId === comment.commentId;

    const [areRepliesVisible, setAreRepliesVisible] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(isTarget);

    const isOwner = authUser?.username === comment.fullName;
    const MAX_DEPTH = 2;
    const isAtMaxDepth = depth >= MAX_DEPTH;

    const fetchNestedReplies = async (pageToFetch) => {
        if (!hasMoreReplies && pageToFetch > 0 && pageToFetch !== 0) return;
        setIsLoadingReplies(true);
        try {
            const data = await getReplies(comment.commentId, pageToFetch, 5);
            setReplies(prev => pageToFetch === 0 ? data.content : [...prev, ...data.content]);
            setHasMoreReplies(!data.last);
            setRepliesPage(pageToFetch);
        } catch (error) {
            console.error("Failed to fetch replies.");
        } finally {
            setIsLoadingReplies(false);
        }
    };

    const fetchFlatReplies = async (pageToFetch) => {
        if (!hasMoreFlatReplies && pageToFetch > 0) return;
        setIsLoadingFlatReplies(true);
        try {
            const data = await getDescendantReplies(comment.commentId, pageToFetch, 10);
            setFlatReplies(prev => pageToFetch === 0 ? data.content : [...prev, ...data.content]);
            setHasMoreFlatReplies(!data.last);
            setFlatRepliesPage(pageToFetch);
        } catch (error) {
            console.error("Failed to fetch descendant replies.");
        } finally {
            setIsLoadingFlatReplies(false);
        }
    };

    const handleReplyAction = () => {
        if (isAtMaxDepth) {
            fetchFlatReplies(0);
        } else {
            fetchNestedReplies(0);
        }
    };

    useEffect(() => {
        if (needsToExpand) {
            setAreRepliesVisible(true);
        }
    }, [needsToExpand]);

    useEffect(() => {
        if(areRepliesVisible && replies.length === 0 && !isAtMaxDepth){
            fetchNestedReplies(0);
        }
        if(areRepliesVisible && flatReplies.length === 0 && isAtMaxDepth){
            fetchFlatReplies(0);
        }
    }, [areRepliesVisible, isAtMaxDepth]);

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
            setReplyContent({ tag: `@${comment.fullName}`, text: '' });
        }
    };

    const handleToggleReplies = () => { setAreRepliesVisible(!areRepliesVisible); };
    const handleLoadMoreNestedReplies = () => fetchNestedReplies(repliesPage + 1);
    const handleLoadMoreFlatReplies = () => fetchFlatReplies(flatRepliesPage + 1);

    const handleSubmitReply = async () => {
        const finalComment = (replyContent.tag ? `${replyContent.tag} ` : '') + replyContent.text.trim();
        if (!finalComment.trim()) return;

        const newCommentData = {
            commentParentId: comment.commentId,
            productId: productId,
            comment: { commentContent: finalComment },
        };
        try {
            await postReply(newCommentData, authHeader);
            setReplyContent({ tag: null, text: '' });
            setIsReplying(false);
            setAreRepliesVisible(true);
            handleReplyAction();
        } catch (error) { /* Handled by service */ }
    };

    const handleSaveEdit = async () => {
        if (!editedContent.trim()) return;
        try {
            await updateComment(comment.commentId, authUser.username, editedContent, authHeader);
            setIsEditing(false);
            onCommentAction();
        } catch (error) { /* Handled by service */ }
    };

    const handleDelete = async () => {
        try {
            await deleteComment(comment.commentId, authUser.username, authHeader);
            setDeleteModalOpen(false);
            onCommentAction();
        } catch (error) { /* Handled by service */ }
    };

    return (
        <div ref={itemRef} className={`relative pt-4 rounded-lg transition-colors duration-1000 ${isHighlighted ? 'bg-yellow-100' : 'bg-transparent'} pl-14`}>
            <div className="absolute top-0 left-6 h-full w-0.5 bg-gray-200"></div>
            <div className="absolute top-8 left-6 w-8 h-0.5 bg-gray-200"></div>

            <div className='flex items-start space-x-4'>
                <img src={comment.userImage || 'https://placehold.co/40x40'} alt={`${comment.fullName}'s Profile`} className='w-10 h-10 rounded-full object-cover z-10' />
                <div className='flex-1'>
                    <div>
                        <p className='font-semibold text-gray-800 text-sm'>{comment.fullName}</p>
                        <p className='text-xs text-gray-500'>{new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    {isEditing ? (
                        <Box sx={{ mt: 2 }}>
                            <TextField fullWidth multiline rows={2} value={editedContent} onChange={(e) => setEditedContent(e.target.value)} variant="outlined" size="small" />
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSaveEdit}>Save</Button>
                                <Button variant="outlined" size="small" startIcon={<Cancel />} onClick={() => setIsEditing(false)}>Cancel</Button>
                            </Box>
                        </Box>
                    ) : ( <p className='text-gray-700 break-words mt-2 text-base'>{comment.reviewComment}</p> )}
                    <div className='mt-3 flex items-center gap-2 text-xs'>
                        {authUser && <button className="font-semibold text-gray-600 hover:underline" onClick={handleReplyClick}>{isReplying ? 'Cancel Reply' : 'Reply'}</button>}
                        <button className="font-semibold text-gray-600 hover:underline" onClick={handleToggleReplies}>{areRepliesVisible ? 'Hide Replies' : `View Replies`}</button>
                        {isOwner && !isEditing && (
                            <>
                                <IconButton size="small" onClick={() => setIsEditing(true)}><Edit fontSize="inherit" /></IconButton>
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
                            {isAtMaxDepth ? (
                                <>
                                    {flatReplies.map((reply) => (
                                        <FlatCommentItem
                                            key={reply.commentId}
                                            comment={reply}
                                            productId={productId}
                                            onCommentAction={handleReplyAction}
                                        />
                                    ))}
                                    {isLoadingFlatReplies && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
                                    {hasMoreFlatReplies && !isLoadingFlatReplies && <Button size="small" onClick={handleLoadMoreFlatReplies}>Load More</Button>}
                                </>
                            ) : (
                                <>
                                    {replies.map((reply) => (
                                        <CommentItem
                                            key={reply.commentId}
                                            comment={reply}
                                            productId={productId}
                                            onCommentAction={handleReplyAction}
                                            expansionPath={needsToExpand ? expansionPath.slice(1) : []}
                                            targetId={targetId}
                                            depth={depth + 1}
                                        />
                                    ))}
                                    {isLoadingReplies && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
                                    {hasMoreReplies && !isLoadingReplies && replies.length > 0 && <Button size="small" onClick={handleLoadMoreNestedReplies}>Load More Replies</Button>}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                name="this comment"
            />
        </div>
    );
};

export default CommentItem;