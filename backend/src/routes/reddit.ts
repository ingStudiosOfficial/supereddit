import { Router, Request, Response } from 'express';
import axios from 'axios';
import { Subreddit } from '../models/Subreddit';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = Router();

interface RedditPost {
    data: {
        title: string;
        selftext: string;
        author: string;
        created_utc: number;
        ups: number;
        num_comments: number;
        permalink: string;
        url: string;
        post_hint?: string;
        is_video?: boolean;
        preview?: {
            images: Array<{
                source: {
                    url: string;
                };
            }>;
        };
    };
}

interface RedditResponse {
    data: {
        children: RedditPost[];
    };
}

// Import posts from Reddit
router.post('/import', requireAuth, async (req: Request, res: Response) => {
    try {
        const { redditSubreddit, targetSubreddit } = req.body;

        if (!redditSubreddit || !targetSubreddit) {
            return res.status(400).json({
                error: 'Both redditSubreddit and targetSubreddit are required',
            });
        }

        // Check if target subreddit exists
        const subreddit = await Subreddit.findOne({ name: targetSubreddit.toLowerCase() });
        if (!subreddit) {
            return res.status(404).json({ error: 'Target subreddit not found' });
        }

        // Fetch posts from Reddit
        const redditUrl = `https://www.reddit.com/r/${redditSubreddit}.json?limit=30`;
        const response = await axios.get<RedditResponse>(redditUrl, {
            headers: {
                'User-Agent': 'Supereddit/1.0',
            },
        });

        const redditPosts = response.data.data.children;

        if (!redditPosts || redditPosts.length === 0) {
            return res.status(404).json({ error: 'No posts found on Reddit subreddit' });
        }

        // Create a system user for imported posts
        let systemUser = await User.findOne({ username: 'RedditImporter' });
        if (!systemUser) {
            systemUser = await User.create({
                discordId: 'system_reddit_importer',
                username: 'RedditImporter',
                discriminator: '0000',
                avatar: 'default',
            });
        }

        const importedPosts = [];

        // Import each post
        for (const redditPost of redditPosts) {
            const postData = redditPost.data;

            // Skip if no content
            if (!postData.selftext && !postData.title) continue;

            // Extract image URL if available
            let imageUrl: string | undefined;

            // Check if post has an image
            if (postData.post_hint === 'image' && postData.url) {
                imageUrl = postData.url.replace(/&amp;/g, '&');
            } else if (postData.preview?.images?.[0]?.source?.url) {
                imageUrl = postData.preview.images[0].source.url.replace(/&amp;/g, '&');
            }

            // Create post
            const post = await Post.create({
                title: postData.title.substring(0, 300), // Limit to 300 chars
                content: postData.selftext || `Imported from Reddit\n\nOriginal author: u/${postData.author}\nOriginal post: https://reddit.com${postData.permalink}`,
                imageUrl: imageUrl,
                author: systemUser._id,
                subreddit: subreddit._id,
                votes: Math.floor(postData.ups / 10), // Scale down votes
                createdAt: new Date(postData.created_utc * 1000), // Convert Unix timestamp
            });

            importedPosts.push(post);
        }

        await Promise.all(
            importedPosts.map((post) =>
                post.populate('author', 'username avatar').then(() => post.populate('subreddit', 'name'))
            )
        );

        res.json({
            message: `Successfully imported ${importedPosts.length} posts`,
            count: importedPosts.length,
            posts: importedPosts,
        });
    } catch (error: any) {
        console.error('Reddit import error:', error);

        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'Reddit subreddit not found' });
        }

        res.status(500).json({
            error: 'Failed to import from Reddit',
            details: error.message,
        });
    }
});

export default router;
