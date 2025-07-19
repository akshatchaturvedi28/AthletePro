# AthletePro Component Architecture

## Overview
AthletePro is a full-stack fitness application built with React/TypeScript frontend and Node.js/Express backend, using PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

```mermaid
graph TB
    subgraph "Frontend (React/TypeScript)"
        A[Client App] --> B[Pages]
        A --> C[Components]
        A --> D[Hooks]
        A --> E[Lib/Utils]
        
        B --> B1[Landing]
        B --> B2[Registration]
        B --> B3[Athlete Pages]
        B --> B4[Coach Pages]
        B --> B5[Admin Pages]
        
        C --> C1[Layout Components]
        C --> C2[UI Components]
        C --> C3[Workout Components]
        C --> C4[Community Components]
        C --> C5[Progress Components]
        
        D --> D1[useAuth]
        D --> D2[useToast]
        D --> D3[useMobile]
        
        E --> E1[Auth Utils]
        E --> E2[Query Client]
        E --> E3[Utils]
    end
    
    subgraph "Backend (Node.js/Express)"
        F[Server] --> G[Routes]
        F --> H[Services]
        F --> I[Data Layer]
        F --> J[Auth System]
        
        G --> G1[Auth Routes]
        G --> G2[User Routes]
        G --> G3[Community Routes]
        G --> G4[Workout Routes]
        G --> G5[Progress Routes]
        
        H --> H1[Workout Parser]
        H --> H2[Progress Tracker]
        
        I --> I1[Storage Layer]
        I --> I2[Database]
        
        J --> J1[Replit Auth]
        J --> J2[Local Auth]
    end
    
    subgraph "Database"
        K[PostgreSQL] --> L[Schema]
        L --> L1[Users]
        L --> L2[Communities]
        L --> L3[Workouts]
        L --> L4[Workout Logs]
        L --> L5[Olympic Lifts]
        L --> L6[Attendance]
        L --> L7[Announcements]
    end
    
    A --> F
    I1 --> K
```

## Frontend Component Structure

### Pages Layer
- **Landing Pages**: Marketing and informational pages
- **Auth Pages**: Registration and login flows
- **Athlete Dashboard**: Personal workout tracking and progress
- **Coach Dashboard**: Community management and athlete oversight
- **Admin Console**: System administration

### Component Hierarchy

```mermaid
graph TD
    A[App.tsx] --> B[Layout Components]
    A --> C[Page Components]
    
    B --> B1[Navbar]
    B --> B2[Sidebar]
    
    C --> C1[Athlete Pages]
    C --> C2[Coach Pages]
    C --> C3[Admin Pages]
    
    C1 --> C1a[Dashboard]
    C1 --> C1b[Calendar]
    C1 --> C1c[Profile]
    C1 --> C1d[Progress]
    
    C2 --> C2a[Dashboard]
    C2 --> C2b[Community]
    C2 --> C2c[Leaderboard]
    
    C3 --> C3a[Console]
    
    D[UI Components] --> D1[shadcn/ui Base]
    D --> D2[Custom Extensions]
    
    E[Workout Components] --> E1[Workout Log]
    E --> E2[Workout Parser]
    
    F[Community Components] --> F1[Leaderboard]
    
    G[Progress Components] --> G1[Progress Charts]
```

### Key Frontend Features

1. **Authentication System**
   - useAuth hook for authentication state
   - Automatic redirect handling
   - User registration flow

2. **Workout Management**
   - Workout parsing from text input
   - Workout logging with timing and performance
   - Benchmark workout tracking

3. **Community Features**
   - Community creation and management
   - Member management
   - Leaderboards and rankings

4. **Progress Tracking**
   - Personal progress insights
   - Olympic lift tracking
   - Performance analytics

## Backend Architecture

### Service Layer

```mermaid
graph LR
    A[API Routes] --> B[Services]
    B --> C[Storage Layer]
    C --> D[Database]
    
    B --> B1[Workout Parser]
    B --> B2[Progress Tracker]
    
    B1 --> B1a[Parse Text Workouts]
    B1 --> B1b[Extract Movements]
    B1 --> B1c[Calculate Scores]
    
    B2 --> B2a[Generate Insights]
    B2 --> B2b[Track Olympic Lifts]
    B2 --> B2c[Community Rankings]
```

### API Endpoints

#### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/register` - Register new user
- `GET /api/login` - Local development login
- `GET /api/logout` - Logout

#### Communities
- `POST /api/communities` - Create community
- `GET /api/communities/my` - Get user's community
- `GET /api/communities/:id` - Get community details
- `GET /api/communities/:id/members` - Get community members
- `POST /api/communities/:id/members` - Add member
- `DELETE /api/communities/:id/members/:userId` - Remove member

#### Workouts
- `POST /api/workouts/parse` - Parse workout text
- `POST /api/workouts` - Create workout
- `POST /api/workouts/bulk` - Create multiple workouts
- `GET /api/workouts/my` - Get user workouts
- `GET /api/workouts/community/:id` - Get community workouts

#### Workout Logs
- `POST /api/workout-logs` - Log workout completion
- `GET /api/workout-logs/my` - Get user logs
- `GET /api/workout-logs/community/:id` - Get community logs

#### Progress & Leaderboard
- `GET /api/progress/insights` - Get progress insights
- `GET /api/leaderboard/community/:id` - Get community leaderboard

## Database Schema

### Core Tables

```mermaid
erDiagram
    USERS {
        text id PK
        text username
        text email
        text phone_number
        text occupation
        integer body_weight
        integer body_height
        integer years_of_experience
        text bio
        boolean is_registered
        timestamp registered_at
        timestamp created_at
        timestamp updated_at
    }
    
    COMMUNITIES {
        serial id PK
        text name
        text description
        text manager_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    COMMUNITY_MEMBERSHIPS {
        serial id PK
        integer community_id FK
        text user_id FK
        text role
        timestamp joined_at
    }
    
    WORKOUTS {
        serial id PK
        text name
        text type
        text movements
        integer time_cap
        text description
        text created_by FK
        integer community_id FK
        timestamp created_at
    }
    
    WORKOUT_LOGS {
        serial id PK
        integer workout_id FK
        text user_id FK
        integer time_taken
        integer total_effort
        text final_score
        json barbell_lift_details
        timestamp completed_at
    }
    
    OLYMPIC_LIFTS {
        serial id PK
        text user_id FK
        text lift_name
        integer weight
        integer reps
        timestamp performed_at
    }
    
    USERS ||--o{ COMMUNITIES : manages
    USERS ||--o{ COMMUNITY_MEMBERSHIPS : belongs_to
    COMMUNITIES ||--o{ COMMUNITY_MEMBERSHIPS : has
    USERS ||--o{ WORKOUTS : creates
    COMMUNITIES ||--o{ WORKOUTS : contains
    WORKOUTS ||--o{ WORKOUT_LOGS : logged_as
    USERS ||--o{ WORKOUT_LOGS : performs
    USERS ||--o{ OLYMPIC_LIFTS : performs
```

## Key Features & Interactions

### 1. User Registration Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>F: Access application
    F->>B: GET /api/auth/user
    B->>D: Check user exists
    D-->>B: User not registered
    B-->>F: needsRegistration: true
    F->>U: Show registration form
    U->>F: Submit registration
    F->>B: POST /api/auth/register
    B->>D: Update user record
    D-->>B: User updated
    B-->>F: Registration complete
    F->>U: Redirect to dashboard
```

### 2. Workout Logging Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant P as Workout Parser
    participant D as Database
    
    U->>F: Enter workout text
    F->>B: POST /api/workouts/parse
    B->>P: Parse workout text
    P-->>B: Parsed workout data
    B-->>F: Structured workout
    F->>U: Show parsed workout
    U->>F: Confirm and log workout
    F->>B: POST /api/workout-logs
    B->>D: Store workout log
    D-->>B: Log created
    B-->>F: Log confirmation
    F->>U: Show completion
```

### 3. Community Leaderboard
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant T as Progress Tracker
    participant D as Database
    
    U->>F: View leaderboard
    F->>B: GET /api/leaderboard/community/:id
    B->>T: Calculate rankings
    T->>D: Query workout logs
    D-->>T: Log data
    T->>T: Calculate scores & rankings
    T-->>B: Ranked results
    B-->>F: Leaderboard data
    F->>U: Display rankings
```

## Development Setup Issues Fixed

### Missing Dependencies
- Added `dotenv` for environment variable management
- Added `nanoid` for unique ID generation

### Missing Files  
- Created `server/localAuth.ts` for local development authentication

### Configuration
- Updated package.json with missing dependencies
- Configured local development authentication flow
- Set up proper database connection handling

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui for component library
- Framer Motion for animations
- React Hook Form for form handling
- Recharts for data visualization
- Wouter for routing

### Backend
- Node.js with Express
- TypeScript for type safety
- Drizzle ORM for database interactions
- PostgreSQL (Neon) for data storage
- Express Session for session management
- Zod for validation

### Development Tools
- ESBuild for production builds
- TSX for TypeScript execution
- Drizzle Kit for database migrations
- Replit integration for cloud development

## Recommended Next Steps

1. **Start Development Server**: `npm run dev`
2. **Access Application**: `http://localhost:5000`
3. **Database Setup**: `npm run db:push`
4. **Local Authentication**: Visit `/api/login` for development login

The application is now ready for local development with all dependencies resolved and missing files created.
