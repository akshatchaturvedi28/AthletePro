# ACrossFit - Local Development Setup

This guide will help you run the ACrossFit application locally on your system.

## Prerequisites

Before starting, make sure you have these installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Check version: `node --version`

2. **npm** (comes with Node.js)
   - Check version: `npm --version`

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

## Step 1: Get the Code

### Option A: Download from Replit
1. Download the project files from your Replit workspace
2. Extract to a folder on your computer

### Option B: Clone from Git (if available)
```bash
git clone [your-repo-url]
cd acrossfit
```

## Step 2: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages including:
- React, TypeScript, Vite (frontend)
- Express, Drizzle ORM (backend)
- PostgreSQL drivers
- UI components and styling

## Step 3: Set Up Database

### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `acrossfit`
3. Create a user with appropriate permissions

### Option B: Use Neon Database (Recommended)
1. Go to https://neon.tech/
2. Create a free account
3. Create a new database
4. Copy the connection string

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/acrossfit
# OR for Neon Database:
# DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Authentication (Optional for local development)
REPL_ID=local-development
ISSUER_URL=https://replit.com

# Development
NODE_ENV=development
```

**Important**: Replace the database URL with your actual credentials!

## Step 5: Set Up the Database Schema

Run the database migrations:

```bash
npm run db:push
```

This will create all the necessary tables and relationships in your database.

## Step 6: Start the Application

Start the development server:

```bash
npm run dev
```

The application will start on:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Full App**: http://localhost:5000 (recommended)

## Step 7: Access the Application

1. Open your browser and go to: http://localhost:5000
2. You'll see the ACrossFit landing page
3. Click "Sign In" to access the authentication flow

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check your DATABASE_URL in the `.env` file
   - Ensure your database server is running
   - Verify database credentials

2. **Port Already in Use**
   - Change the port in `server/index.ts` if needed
   - Kill any processes using port 5000: `lsof -ti:5000 | xargs kill`

3. **Authentication Issues**
   - For local development, authentication might not work exactly like on Replit
   - Consider setting up local authentication or using test credentials

4. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

### Development Commands:

```bash
# Start development server
npm run dev

# Push database schema changes
npm run db:push

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
acrossfit/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
├── server/               # Express backend
│   ├── services/         # Business logic
│   ├── routes.ts         # API routes
│   └── index.ts          # Server entry
├── shared/               # Shared types/schema
└── package.json          # Dependencies
```

## Key Features Available:

- **Authentication**: User registration and login
- **Workout Parsing**: AI-powered workout text parsing
- **Progress Tracking**: Performance metrics and analytics
- **Community Features**: Leaderboards and member management
- **Admin Console**: Management tools for coaches/managers
- **Role-Based Access**: Different views for athletes vs coaches

## Next Steps

1. Create your first user account through the registration flow
2. Set up a community/gym
3. Start logging workouts and tracking progress
4. Explore the admin console if you're a coach/manager

## Need Help?

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your environment variables are correct
3. Ensure all dependencies are installed
4. Check that your database is running and accessible

The application should now be running locally on your system!