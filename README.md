# AI Reels - Instagram Reels Generator

A full-stack application for generating viral Instagram Reels using AI-powered video generation with RunwayML.

## Features

- 🤖 **AI Video Generation**: Create videos from text prompts using RunwayML
- 📱 **Instagram Integration**: Automated posting to Instagram via Graph API
- 📊 **Analytics Dashboard**: Track performance and engagement metrics
- 🔄 **Batch Processing**: Queue multiple videos for generation
- ⚙️ **Customizable Settings**: Configure Instagram accounts and generation parameters
- 📈 **Performance Tracking**: Monitor video performance and optimize content

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Video Generation**: RunwayML API
- **Social Media**: Instagram Graph API
- **Authentication**: JWT + bcrypt

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- RunwayML API key
- Instagram Graph API credentials

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ai-reels
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your API keys and database URL
   ```

3. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_reels"

# JWT Secret
JWT_SECRET="your-jwt-secret"

# RunwayML API
RUNWAY_API_KEY="your-runwayml-api-key"

# Instagram Graph API
INSTAGRAM_APP_ID="your-instagram-app-id"
INSTAGRAM_APP_SECRET="your-instagram-app-secret"
INSTAGRAM_ACCESS_TOKEN="your-instagram-access-token"

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Project Structure

```
ai-reels/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── prisma/           # Database schema and migrations
│   └── uploads/          # Generated video storage
└── shared/               # Shared types and utilities
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Video Generation
- `POST /api/videos/generate` - Generate new video
- `GET /api/videos` - Get user's videos
- `GET /api/videos/:id` - Get specific video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Instagram Integration
- `POST /api/instagram/connect` - Connect Instagram account
- `POST /api/instagram/post` - Post video to Instagram
- `GET /api/instagram/analytics` - Get Instagram analytics

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 