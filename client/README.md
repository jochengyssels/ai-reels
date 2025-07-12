# AI Reels Generator - Frontend

This is the React TypeScript frontend for the AI Reels Generator application.

## Features

- **Dashboard**: Main interface with tabbed navigation
- **Video Generation**: Form to create new videos with AI optimization
- **Queue Management**: View and manage video generation queue
- **Analytics**: Performance metrics and insights
- **Settings**: Instagram connection and user preferences

## Technology Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── VideoGenerationForm.tsx
│   ├── VideoQueue.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component
├── index.tsx           # App entry point
└── index.css           # Global styles
```

## API Integration

The frontend communicates with the backend API running on port 5000. All API calls include authentication headers and proper error handling.

## Development

- The app uses React hooks for state management
- Tailwind CSS for responsive design
- TypeScript for type safety
- Proxy configuration for API calls during development

## Environment Variables

The frontend is configured to proxy API calls to the backend server. Make sure the backend is running on `http://localhost:5000`. 