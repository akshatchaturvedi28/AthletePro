# ACrossFit - CrossFit Community Management Platform

## Overview

ACrossFit is a modern CrossFit community management platform that combines AI-powered workout logging with comprehensive community features. The application serves both individual athletes and gym managers/coaches, providing tools for workout tracking, progress analysis, leaderboards, and community engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 3, 2025 - Production Deployment Authentication Fixes**
- **Conditional Replit Authentication**: Made Replit auth optional for deployment flexibility
  - Added `isReplitAuthAvailable()` function to detect if Replit auth variables are configured
  - Implemented graceful fallback when `REPL_ID` or `REPLIT_DOMAINS` are missing
  - Updated environment variable validation to make Replit auth optional in production
  
- **Production Authentication Fallback**: Created guest mode for external deployments
  - Built `productionAuth.ts` module for non-Replit deployments
  - Automatic guest user creation when Replit auth is unavailable
  - Full application functionality available in guest mode
  - Session-based authentication with PostgreSQL storage
  
- **Enhanced Error Handling**: Improved authentication error management
  - Added try-catch blocks around OIDC discovery calls
  - Proper error messages when authentication services are unavailable
  - Graceful degradation without breaking application startup
  
- **Deployment Documentation**: Created comprehensive deployment guide
  - Documented environment variable requirements for different deployment scenarios
  - Added troubleshooting section for common authentication issues
  - Clear instructions for both Replit and external platform deployments

**July 19, 2025 - Complete MVP Implementation with Authentication System**
- **Comprehensive Authentication System**: Built complete auth flow for users and admins
  - Created separate sign-in/sign-up pages for athletes and admin users (coaches/managers)
  - Added multi-step registration with email/phone verification simulation
  - Implemented password reset functionality with OTP verification
  - Added role-based authentication with proper security measures
  - Support for both email and phone-based authentication methods
  
- **Complete Admin Console & Community Management**: Full-featured admin dashboard
  - **Admin Console**: Real-time dashboard with community metrics and analytics
  - **Community Management**: Comprehensive member management, announcements system
  - **Coach Dashboard**: Athlete tracking, workout creation, attendance management
  - **Admin Account Management**: Profile settings, security, and community configuration
  - **Create Community**: Multi-step community creation wizard for new gym owners
  
- **Enhanced Athlete Experience**: Complete user account and profile system
  - **Athlete Account**: Full profile management with body stats, goals, and social links
  - **Public Profiles**: Shareable athlete profiles with workout history and achievements
  - **Account Settings**: Privacy controls, linked accounts, and data management
  - **Personal Goals**: Goal tracking with progress visualization
  
- **Password Reset & Security**: Enterprise-grade security features
  - Multi-method password reset (email/SMS) with OTP verification
  - Encrypted password storage using Bcrypt algorithm
  - Account linking (Google, social media integration)
  - Two-factor authentication ready infrastructure
  
- **MVP Component Completeness**: All Level 1 & Level 2 PRD requirements implemented
  - Role-based access control for athletes, coaches, and community managers
  - Community creation and management workflows
  - Comprehensive authentication flows with proper error handling
  - User preference management and privacy controls

**July 17, 2025 - Major Feature Enhancements**
- **Authentication System Overhaul**: Added proper registration requirement before sign-in
  - Added `isRegistered` and `registeredAt` fields to user schema
  - Created comprehensive registration page with user profile setup
  - Modified authentication flow to require registration completion
  - Updated useAuth hook to handle registration status
- **Navigation Improvements**: Added logout functionality and Home links
  - Added logout option in user dropdown menu 
  - Added Home navigation link to return to landing page
  - Improved mobile navigation with consistent logout access
- **Workout Parser Enhancement**: Implemented multi-workout entity parsing
  - Parser now splits single WOD text into multiple distinct workout entities
  - Added intelligent workout separators (Workout A/B, Strength/Metcon, etc.)
  - Created bulk workout creation API endpoint for parsed workouts
  - Enhanced workout parsing to handle complex workout structures
- **Database Schema Updates**: Added registration tracking and validation
  - Updated user table with registration status fields
  - Applied database migrations for new schema
  - Added environment variable validation for production deployment

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
- **Flexible Authentication Modes**: Supports both Replit OAuth and guest mode
  - **Replit Authentication**: Full OAuth integration for Replit deployments
  - **Guest Mode**: Fallback authentication for external deployments
  - **Conditional Setup**: Automatically detects available authentication methods
- **Multi-Channel Authentication**: Support for email and phone-based sign-in/sign-up
- **Role-Based Access Control**: Separate authentication flows for athletes and admin users
- **Password Security**: Bcrypt encryption with password reset via email/SMS OTP
- **Registration Flow**: Multi-step user onboarding with profile completion
- **Admin Authentication**: Dedicated admin sign-in with community management access
- **Session Management**: PostgreSQL-backed sessions with automatic user creation

### Community Management System
- **Admin Console**: Comprehensive dashboard with real-time metrics and community oversight
- **Member Management**: Add/remove members, role assignment, member activity tracking
- **Announcement System**: Community-wide communication with categorized messaging
- **Coach Dashboard**: Athlete management, workout creation, attendance tracking
- **Community Creation**: Multi-step wizard for new gym/community setup

### User Profile & Account Management
- **Athlete Profiles**: Complete profile management with body stats, goals, and achievements
- **Public Profiles**: Shareable athlete profiles with workout history and PR tracking
- **Account Settings**: Privacy controls, linked accounts, notification preferences
- **Personal Goals**: Goal setting and progress tracking with completion visualization
- **Social Integration**: Instagram, Strava, and website linking capabilities

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
- **REPL_ID**: Replit environment identifier (optional - enables Replit OAuth)
- **REPLIT_DOMAINS**: Comma-separated allowed domains (optional - required with REPL_ID)
- **ISSUER_URL**: OpenID Connect issuer (defaults to Replit)

### Deployment Modes
1. **Replit Mode**: When `REPL_ID` and `REPLIT_DOMAINS` are provided
   - Full Replit OAuth integration
   - Multi-user authentication with proper user isolation
   - Production-ready for Replit deployments

2. **Guest Mode**: When Replit auth variables are missing
   - Automatic guest user creation
   - Full application functionality available
   - Suitable for demos and external deployments
   - Falls back gracefully without breaking the application

The application is designed to be deployment-ready on Replit with automatic database provisioning and authentication integration. The modular architecture allows for easy scaling and feature additions while maintaining clean separation of concerns between frontend, backend, and data layers.