import { Router, Request, Response } from 'express';
import { Subreddit } from '../models/Subreddit';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all subreddits
router.get('/', async (req: Request, res: Response) => {
    try {
        const subreddits = await Subreddit.find()
            .populate('creator', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ subreddits });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subreddits' });
    }
});

// Get subreddit by name
router.get('/:name', async (req: Request, res: Response) => {
    try {
        const subreddit = await Subreddit.findOne({ name: req.params.name.toLowerCase() })
            .populate('creator', 'username avatar')
            .populate('members', 'username avatar');

        if (!subreddit) {
            return res.status(404).json({ error: 'Subreddit not found' });
        }

        res.json({ subreddit });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subreddit' });
    }
});

// Create subreddit (auth required)
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        // Check if subreddit already exists
        const existing = await Subreddit.findOne({ name: name.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'Subreddit already exists' });
        }

        const subreddit = await Subreddit.create({
            name: name.toLowerCase(),
            description,
            creator: (req.user as any)._id,
            members: [(req.user as any)._id],
        });

        await subreddit.populate('creator', 'username avatar');

        res.status(201).json({ subreddit });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create subreddit' });
    }
});

// Join subreddit (auth required)
router.post('/:name/join', requireAuth, async (req: Request, res: Response) => {
    try {
        const subreddit = await Subreddit.findOne({ name: req.params.name.toLowerCase() });

        if (!subreddit) {
            return res.status(404).json({ error: 'Subreddit not found' });
        }

        const userId = (req.user as any)._id;

        // Check if already a member
        if (subreddit.members.includes(userId)) {
            return res.status(400).json({ error: 'Already a member' });
        }

        subreddit.members.push(userId);
        await subreddit.save();

        res.json({ message: 'Joined subreddit successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join subreddit' });
    }
});

// Leave subreddit (auth required)
router.post('/:name/leave', requireAuth, async (req: Request, res: Response) => {
    try {
        const subreddit = await Subreddit.findOne({ name: req.params.name.toLowerCase() });

        if (!subreddit) {
            return res.status(404).json({ error: 'Subreddit not found' });
        }

        const userId = (req.user as any)._id;

        subreddit.members = subreddit.members.filter(
            (memberId) => memberId.toString() !== userId.toString()
        );
        await subreddit.save();

        res.json({ message: 'Left subreddit successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to leave subreddit' });
    }
});

export default router;
