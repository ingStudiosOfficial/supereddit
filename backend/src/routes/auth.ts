import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Initiate Discord OAuth
router.get('/discord', passport.authenticate('discord'));

// Discord OAuth callback
router.get(
    '/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: process.env.FRONTEND_URL + '/?error=auth_failed',
    }),
    (req, res) => {
        // Successful authentication, redirect to frontend
        res.redirect(process.env.FRONTEND_URL + '/?auth=success');
    }
);

// Get current user
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

export default router;
