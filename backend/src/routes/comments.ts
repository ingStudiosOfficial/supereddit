import { Router, Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get comments for a post
router.get('/posts/:postId/comments', async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username avatar discriminator')
            .sort({ createdAt: -1 });

        res.json({ comments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Create comment (auth required)
router.post('/posts/:postId/comments', requireAuth, async (req: Request, res: Response) => {
    try {
        const { content, parentComment } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await Comment.create({
            content,
            author: (req.user as any)._id,
            post: req.params.postId,
            parentComment: parentComment || null,
        });

        await comment.populate('author', 'username avatar discriminator');

        res.status(201).json({ comment });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Vote on comment (auth required)
router.post('/comments/:id/vote', requireAuth, async (req: Request, res: Response) => {
    try {
        const { vote } = req.body; // 1 for upvote, -1 for downvote

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({ error: 'Vote must be 1 or -1' });
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = (req.user as any)._id;
        const existingVote = comment.voters.find(
            (v) => v.user.toString() === userId.toString()
        );

        if (existingVote) {
            // Update existing vote
            if (existingVote.vote === vote) {
                // Remove vote if clicking same button
                comment.votes -= vote;
                comment.voters = comment.voters.filter(
                    (v) => v.user.toString() !== userId.toString()
                );
            } else {
                // Change vote
                comment.votes -= existingVote.vote;
                comment.votes += vote;
                existingVote.vote = vote;
            }
        } else {
            // New vote
            comment.votes += vote;
            comment.voters.push({ user: userId, vote });
        }

        await comment.save();

        res.json({ votes: comment.votes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to vote on comment' });
    }
});

export default router;
