import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';

const router = Router();

// Get user profile by username
router.get('/:username', async (req: Request, res: Response) => {
    try {
        const { username } = req.params;

        // Find user
        const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's posts
        const posts = await Post.find({ author: user._id })
            .populate('author', 'username avatar')
            .populate('subreddit', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        // Get user's comments
        const comments = await Comment.find({ author: user._id })
            .populate('author', 'username avatar')
            .populate('post', 'title _id')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                discriminator: user.discriminator,
                createdAt: user.createdAt,
                loginCount: user.loginCount,
                lastLogin: user.lastLogin,
            },
            posts,
            comments,
        });
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

export default router;
