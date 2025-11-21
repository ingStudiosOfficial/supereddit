# Supereddit

A modern Reddit clone built with Vue 3, Express, TypeScript, and MongoDB Atlas. Features Discord OAuth authentication, subreddits, posts, nested comments, and voting.

## Features

- 🔐 **Discord OAuth Authentication** - Login with your Discord account
- 🏘️ **Subreddits** - Create and join communities
- 📝 **Posts** - Share content with rich text
- 💬 **Nested Comments** - Threaded discussions with unlimited depth
- ⬆️ **Voting System** - Upvote and downvote posts and comments
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Fast build tool
- **Vanilla CSS** - Custom design system

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **Passport Discord** - OAuth authentication
- **Express Session** - Session management

## Project Structure

```
Supereddit/
├── backend/              # Express API server
│   ├── src/
│   │   ├── config/      # Database & Passport config
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth middleware
│   │   └── server.ts    # Entry point
│   └── package.json
├── frontend/            # Vue 3 SPA
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── views/       # Page views
│   │   ├── router/      # Vue Router
│   │   ├── stores/      # State management
│   │   ├── styles/      # CSS design system
│   │   └── main.ts      # Entry point
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or connection string)
- Discord Application (for OAuth)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - The `.env` file is already configured with your credentials
   - Update if needed for production deployment

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Running the Application

1. **Start the backend** (in one terminal):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage

1. **Login** - Click "Login with Discord" to authenticate
2. **Create a Subreddit** - Use the sidebar to create a new community
3. **Create a Post** - Click "Create Post" and select a subreddit
4. **Comment** - Click on a post to view and add comments
5. **Vote** - Use the up/down arrows to vote on posts and comments

## API Endpoints

### Authentication
- `GET /api/auth/discord` - Initiate Discord OAuth
- `GET /api/auth/discord/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Subreddits
- `GET /api/subreddits` - List all subreddits
- `POST /api/subreddits` - Create subreddit (auth required)
- `GET /api/subreddits/:name` - Get subreddit details
- `POST /api/subreddits/:name/join` - Join subreddit (auth required)
- `POST /api/subreddits/:name/leave` - Leave subreddit (auth required)

### Posts
- `GET /api/posts` - List posts (with filters)
- `POST /api/posts` - Create post (auth required)
- `GET /api/posts/:id` - Get post details
- `POST /api/posts/:id/vote` - Vote on post (auth required)

### Comments
- `GET /api/posts/:postId/comments` - Get comments for post
- `POST /api/posts/:postId/comments` - Create comment (auth required)
- `POST /api/comments/:id/vote` - Vote on comment (auth required)

## Environment Variables

### Backend (.env)
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
```

## Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URL: `http://localhost:3000/api/auth/discord/callback`
5. Copy Client ID and Client Secret to `.env`

## License

MIT
