import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';
import { connectDatabase } from './config/database';
import { configurePassport } from './config/passport';

// Import routes
import authRoutes from './routes/auth';
import subredditRoutes from './routes/subreddits';
import postRoutes from './routes/posts';
import commentRoutes from './routes/comments';
import searchRoutes from './routes/search';
import redditRoutes from './routes/reddit';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Create MongoStore BEFORE setting up session middleware
        const mongoStore = await MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions',
            ttl: 1000 * 60 * 60 * 24 * 7, // 1 week
        });

        // Session configuration - NOW WITH INITIALIZED STORE
        app.use(
            session({
                secret: process.env.SESSION_SECRET || 'supereddit_secret',
                resave: false,
                saveUninitialized: false,
                store: mongoStore,
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax', // IMPORTANT: Add this for cross-domain cookies
                },
            })
        );

        // Passport initialization
        app.use(passport.initialize());
        app.use(passport.session());
        configurePassport();

        // Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/subreddits', subredditRoutes);
        app.use('/api/posts', postRoutes);
        app.use('/api', commentRoutes);
        app.use('/api', searchRoutes);
        app.use('/api/reddit', redditRoutes);
        app.use('/api/users', userRoutes);

        // Health check
        app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', message: 'Supereddit API is running' });
        });

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();