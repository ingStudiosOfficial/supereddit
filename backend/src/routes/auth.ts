import { Router } from 'express';
import passport from 'passport';
import { IUser } from '../models/User';

const router = Router();

// Initiate Discord OAuth
router.get('/discord', passport.authenticate('discord'));

// Discord OAuth callback - FIXED: Save session before redirect
router.get(
    '/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: process.env.FRONTEND_URL + '/?error=auth_failed',
    }),
    (req, res) => {
        console.log('✅ Discord callback - User authenticated:', (req.user as IUser)?.username);

        // CRITICAL: Save session to MongoDB before redirecting
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save failed:', err);
                return res.redirect(process.env.FRONTEND_URL + '/?error=session_failed');
            }

            console.log('✅ Session saved with ID:', req.sessionID);
            res.redirect(process.env.FRONTEND_URL + '/?auth=success');
        });
    }
);

// Get current user
router.get('/user', (req, res) => {
    console.log('GET /user - Session ID:', req.sessionID, 'Authenticated:', req.isAuthenticated());

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

        // Also destroy session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Session destruction failed' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });
});

export default router;