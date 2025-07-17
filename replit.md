# ACrossFit - CrossFit Community Management Platform

## Overview

ACrossFit is a modern CrossFit community management platform that combines AI-powered workout logging with comprehensive community features. The application serves both individual athletes and gym managers/coaches, providing tools for workout tracking, progress analysis, leaderboards, and community engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 17, 2025 - Deployment Fixes Applied**
- Updated server startup to use standard Express app.listen method for Cloud Run compatibility
- Added PORT environment variable support with fallback to 5000 for local development
- Implemented comprehensive environment variable validation for production
- Added graceful shutdown handling for SIGTERM and SIGINT signals
- Enhanced error handling for server startup issues
- Fixed port configuration to properly parse and validate port numbers
- Server now compatible with Cloud Run/Autoscale deployments

**July 15, 2025 - Authentication System Fixed**
- Fixed authentication loop issue that was preventing application from loading
- Updated useAuth hook to properly handle 401 responses for unauthenticated users
- Fixed database query errors in storage layer for community workout logs
- Resolved TypeScript compilation errors with user membership types
- Application now properly displays landing page for unauthenticated users
- Login flow tested and working with session storage in PostgreSQL
- All core features functional: workout logging, progress tracking, leaderboards

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with schema-first approach
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit Auth with OpenID Connect

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on login
- **Role-Based Access**: Support for athlete, coach, and manager roles

### Database Schema
- **Users**: Profile management with fitness-specific fields (body weight, height, experience)
- **Communities**: Gym/box management with member relationships
- **Workouts**: Custom and benchmark workout definitions
- **Workout Logs**: Performance tracking with AI-powered parsing
- **Olympic Lifts**: Strength progression tracking
- **Leaderboards**: Community ranking and competition features

### AI-Powered Features
- **Workout Parser**: Intelligent parsing of workout descriptions to extract type, time caps, and movements
- **Progress Tracker**: Automatic calculation of performance metrics and personal records
- **Benchmark Recognition**: Integration with standard CrossFit benchmark workouts ("The Girls", "Heroes")

### Community Features
- **Membership Management**: Role-based access control (athlete, coach, manager)
- **Announcements**: Community-wide communication system
- **Leaderboards**: Workout-specific and overall performance rankings
- **Attendance Tracking**: Session participation monitoring

## Data Flow

1. **User Authentication**: Replit Auth → User profile creation/update → Session establishment
2. **Workout Logging**: Text input → AI parsing → Structured data → Performance calculation → Database storage
3. **Progress Tracking**: Historical logs → Trend analysis → Personal records → Progress insights
4. **Community Interaction**: User actions → Real-time updates → Leaderboard recalculation → Notifications

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL) via @neondatabase/serverless
- **Authentication**: Replit Auth system with OpenID Connect
- **Session Store**: PostgreSQL session storage
- **WebSocket**: Node.js WebSocket for Neon Database connection

### UI Dependencies
- **Component Library**: Radix UI primitives with shadcn/ui wrapper
- **Charts**: Recharts for progress visualization
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Build**: Vite with React plugin
- **Database Migrations**: Drizzle Kit for schema management
- **TypeScript**: Strict configuration with path aliases
- **Linting**: ESLint with React and TypeScript rules

## Deployment Strategy

### Development Environment
- **Server**: tsx for TypeScript execution in development
- **Client**: Vite dev server with HMR
- **Database**: Automatic migrations on startup
- **Session**: In-memory for development

### Production Build
- **Server**: esbuild bundling to ESM format
- **Client**: Vite production build with asset optimization
- **Database**: Manual migration deployment via drizzle-kit
- **Session**: PostgreSQL-backed persistent sessions

### Environment Requirements
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit environment identifier (required for auth)
- **ISSUER_URL**: OpenID Connect issuer (defaults to Replit)

The application is designed to be deployment-ready on Replit with automatic database provisioning and authentication integration. The modular architecture allows for easy scaling and feature additions while maintaining clean separation of concerns between frontend, backend, and data layers.