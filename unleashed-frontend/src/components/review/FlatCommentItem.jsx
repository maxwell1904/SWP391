import React, { useState } from 'react';
import { Button, TextField, Box, IconButton, Chip } from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { postReply, updateComment, deleteComment } from '../../service/CommentService';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

const FlatCommentItem = ({ comment, productId, onCommentAction }) => {
    const authHeader = useAuthHeader();
    const authUser = useAuthUser();

    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState({ tag: null, text: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.reviewComment);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const isOwner = authUser?.username === comment.fullName;

    const handleReplyClick = () => {
        if (isReplying) {
            setIsReplying(false);
            setReplyContent({ tag: null, text: '' });
        } else {
            setIsReplying(true);
            setReplyContent({ tag: `@${comment.fullName}`, text: '' });
        }
    };

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
            onCommentAction();
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
        <div className="relative pt-4 pl-14">
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

export default FlatCommentItem;