import { Router, Request, Response } from 'express';
import { Post } from '../models/Post';
import { Subreddit } from '../models/Subreddit';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get posts (with optional subreddit filter)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { subreddit, sort = 'new' } = req.query;

        let query: any = {};

        if (subreddit) {
            const subredditDoc = await Subreddit.findOne({ name: subreddit as string });
            if (subredditDoc) {
                query.subreddit = subredditDoc._id;
            }
        }

        let sortOption: any = { createdAt: -1 };
        if (sort === 'top') {
            sortOption = { votes: -1, createdAt: -1 };
        }

        const posts = await Post.find(query)
            .populate('author', 'username avatar')
            .populate('subreddit', 'name')
            .sort(sortOption)
            .limit(50);

        res.json({ posts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get single post
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username avatar discriminator')
            .populate('subreddit', 'name description');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create post (auth required)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { title, content, subreddit } = req.body;

        if (!title || !content || !subreddit) {
            return res.status(400).json({ error: 'Title, content, and subreddit are required' });
        }

        const subredditDoc = await Subreddit.findOne({ name: subreddit.toLowerCase() });
        if (!subredditDoc) {
            return res.status(404).json({ error: 'Subreddit not found' });
        }

        const post = await Post.create({
            title,
            content,
            author: (req.user as any)._id,
            subreddit: subredditDoc._id,
        });

        await post.populate('author', 'username avatar');
        await post.populate('subreddit', 'name');

        res.status(201).json({ post });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Vote on post (auth required)
router.post('/:id/vote', requireAuth, async (req: Request, res: Response) => {
    try {
        const { vote } = req.body; // 1 for upvote, -1 for downvote

        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({ error: 'Vote must be 1 or -1' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userId = (req.user as any)._id;
        const existingVote = post.voters.find(
            (v) => v.user.toString() === userId.toString()
        );

        if (existingVote) {
            // Update existing vote
            if (existingVote.vote === vote) {
                // Remove vote if clicking same button
                post.votes -= vote;
                post.voters = post.voters.filter(
                    (v) => v.user.toString() !== userId.toString()
                );
            } else {
                // Change vote
                post.votes -= existingVote.vote;
                post.votes += vote;
                existingVote.vote = vote;
            }
        } else {
            // New vote
            post.votes += vote;
            post.voters.push({ user: userId, vote });
        }

        await post.save();

        res.json({ votes: post.votes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to vote on post' });
    }
});

export default router;
