import { Router, Request, Response } from 'express';
import { Post } from '../models/Post';
import { Subreddit } from '../models/Subreddit';

const router = Router();

// Search posts, subreddits, and users
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, type = 'all' } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const searchRegex = new RegExp(q, 'i'); // Case-insensitive search
        const results: any = {};

        // Search posts
        if (type === 'all' || type === 'posts') {
            const posts = await Post.find({
                $or: [
                    { title: searchRegex },
                    { content: searchRegex },
                ],
            })
                .populate('author', 'username avatar')
                .populate('subreddit', 'name')
                .sort({ createdAt: -1 })
                .limit(20);

            results.posts = posts;
        }

        // Search subreddits
        if (type === 'all' || type === 'subreddits') {
            const subreddits = await Subreddit.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                ],
            })
                .populate('creator', 'username avatar')
                .limit(10);

            results.subreddits = subreddits;
        }

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
