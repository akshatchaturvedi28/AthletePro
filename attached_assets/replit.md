# ACrossFit - CrossFit Community Management Platform

## Overview
ACrossFit is a modern CrossFit community management platform designed for individual athletes and gym managers/coaches. It integrates AI-powered workout logging with comprehensive community features, offering tools for workout tracking, progress analysis, leaderboards, and community engagement. The vision is to provide a robust platform for CrossFit enthusiasts to track their fitness journey, connect with their community, and optimize their performance.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM (schema-first approach)
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit Auth with OpenID Connect

### Key Components

#### Authentication System
- **Flexible Modes**: Supports Replit OAuth and a guest mode for external deployments, automatically detecting available methods.
- **Multi-Channel**: Email and phone-based sign-in/sign-up.
- **Role-Based Access Control**: Separate flows for athletes and admin users.
- **Security**: Bcrypt encryption, password reset via OTP, multi-step registration.
- **Session Management**: PostgreSQL-backed sessions.

#### Community Management System
- **Admin Console**: Dashboard with real-time metrics and oversight.
- **Member Management**: Add/remove members, role assignment, activity tracking.
- **Announcement System**: Community-wide communication.
- **Coach Dashboard**: Athlete management, workout creation, attendance tracking.
- **Community Creation**: Multi-step wizard for new gym/community setup.

#### User Profile & Account Management
- **Athlete Profiles**: Comprehensive profile management including body stats, goals, and achievements.
- **Public Profiles**: Shareable profiles with workout history and PR tracking.
- **Account Settings**: Privacy controls, linked accounts, notification preferences.
- **Personal Goals**: Goal setting and progress tracking with visualization.
- **Social Integration**: Instagram, Strava, and website linking.

#### AI-Powered Features
- **Workout Parser**: Intelligent parsing of workout descriptions to extract details like type, time caps, and movements.
- **Progress Tracker**: Automatic calculation of performance metrics and personal records.
- **Benchmark Recognition**: Integration with standard CrossFit benchmark workouts.

#### Community Features
- **Membership Management**: Role-based access control (athlete, coach, manager).
- **Announcements**: Community-wide communication system.
- **Leaderboards**: Workout-specific and overall performance rankings.
- **Attendance Tracking**: Session participation monitoring.

### System Design Choices
- **Data Flow**: Authentication -> Session; Text input -> AI parsing -> Structured data -> DB; Historical logs -> Trend analysis; User actions -> Real-time updates.
- **UI/UX Decisions**: Utilizes `shadcn/ui` on Radix UI for consistent, modern interface. Tailwind CSS for flexible styling.
- **Feature Specifications**: Comprehensive MVP implementation includes role-based access control, community creation/management, and a robust authentication system.

## External Dependencies

- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **Authentication**: Replit Auth system with OpenID Connect
- **Session Store**: PostgreSQL session storage
- **WebSocket**: Node.js WebSocket for Neon Database connection
- **Component Library**: Radix UI primitives with shadcn/ui wrapper
- **Charts**: Recharts for progress visualization
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: `date-fns` for date manipulation
- **Build**: Vite with React plugin
- **Database Migrations**: Drizzle Kit for schema management
- **TypeScript**: Strict configuration
- **Linting**: ESLint with React and TypeScript rules