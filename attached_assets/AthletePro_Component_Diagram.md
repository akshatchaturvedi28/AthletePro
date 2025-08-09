# AthletePro - Complete Component Diagram & Architecture

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend<br/>Vite + TypeScript]
        Auth[Authentication<br/>Replit Auth]
        State[State Management<br/>TanStack Query]
    end

    subgraph "Server Layer"
        API[Express.js API<br/>TypeScript]
        Middleware[Auth Middleware<br/>Session Management]
        Services[Business Services<br/>Workout Parser, Progress Tracker]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL Database<br/>Drizzle ORM)]
        Storage[File Storage<br/>Local/Cloud]
    end

    subgraph "External Services"
        ReplitAuth[Replit Authentication]
        Session[Session Store]
    end

    UI --> API
    Auth --> ReplitAuth
    API --> Middleware
    Middleware --> Services
    Services --> DB
    API --> Session
    State --> API
```

## 🔄 User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant ReplitAuth
    participant Database

    User->>Client: Access Application
    Client->>API: GET /api/auth/user
    API->>ReplitAuth: Validate Session
    
    alt User Not Authenticated
        ReplitAuth-->>API: Unauthorized
        API-->>Client: 401 Response
        Client->>User: Redirect to Login
        User->>ReplitAuth: Login
        ReplitAuth->>API: Auth Callback
        API->>Database: Create/Update User
    else User Authenticated
        ReplitAuth-->>API: Valid Session
        API->>Database: Get User Data
        Database-->>API: User Profile + Membership
        API-->>Client: User Data
        Client->>User: Render Dashboard
    end

    alt User Needs Registration
        Client->>User: Show Registration Form
        User->>Client: Submit Registration
        Client->>API: POST /api/auth/register
        API->>Database: Update User Profile
        Database-->>API: Updated User
        API-->>Client: Registration Success
    end
```

## 📱 Frontend Component Architecture

```mermaid
graph TD
    subgraph "App.tsx - Root Component"
        App[App Component<br/>QueryClientProvider + TooltipProvider]
        Router[Router Component<br/>Role-based Routing]
    end

    subgraph "Authentication & Routing"
        useAuth[useAuth Hook<br/>User State Management]
        Routes{Route Decision}
    end

    subgraph "Public Pages"
        Landing[Landing Page]
        About[About Page]
        Contact[Contact Page]
        Privacy[Privacy Page]
        CommunityLanding[Community Landing]
        Registration[Registration Page]
    end

    subgraph "Athlete Pages"
        AthleteDashboard[Athlete Dashboard<br/>Stats, Today's Workouts, Quick Actions]
        AthleteCalendar[Calendar<br/>Workout Scheduling & Logging]
        AthleteProfile[Profile<br/>Personal Information & Settings]
        AthleteProgress[Progress<br/>Charts, PRs, Insights]
    end

    subgraph "Coach/Manager Pages"
        CoachDashboard[Coach Dashboard<br/>Community Overview, Member Stats]
        CoachCommunity[Community Management<br/>Members, Announcements, Goals]
        CoachLeaderboard[Leaderboard<br/>Rankings, Performance Comparison]
    end

    subgraph "Admin Pages"
        AdminConsole[Admin Console<br/>System Management]
    end

    subgraph "Layout Components"
        Sidebar[Sidebar<br/>Navigation Menu]
        Navbar[Navbar<br/>Top Navigation]
    end

    subgraph "Feature Components"
        WorkoutLog[Workout Log<br/>Exercise Tracking]
        WorkoutParser[Workout Parser<br/>Text to Structured Data]
        ProgressCharts[Progress Charts<br/>Visual Analytics]
        Leaderboard[Leaderboard Component<br/>Rankings Display]
    end

    subgraph "UI Components Library"
        Cards[Card Components]
        Forms[Form Components]
        Tables[Table Components]
        Charts[Chart Components]
        Dialogs[Dialog Components]
        Buttons[Button Components]
        Inputs[Input Components]
    end

    App --> Router
    Router --> useAuth
    useAuth --> Routes

    Routes --> Landing
    Routes --> Registration
    Routes --> AthleteDashboard
    Routes --> CoachDashboard
    Routes --> AdminConsole

    AthleteDashboard --> Sidebar
    AthleteDashboard --> WorkoutLog
    AthleteDashboard --> ProgressCharts

    CoachDashboard --> Sidebar
    CoachDashboard --> Leaderboard
    CoachCommunity --> WorkoutParser

    WorkoutLog --> Cards
    WorkoutLog --> Forms
    ProgressCharts --> Charts
    Leaderboard --> Tables
```

## 🔧 Backend API Architecture

```mermaid
graph TD
    subgraph "Express.js Server"
        Server[server/index.ts<br/>Main Server Entry]
        Routes[server/routes.ts<br/>Route Registration]
        Middleware[Auth Middleware<br/>Session Validation]
    end

    subgraph "Authentication System"
        ReplitAuth[server/replitAuth.ts<br/>Replit OAuth Integration]
        LocalAuth[Development Auth<br/>Mock User for Dev]
        SessionStore[Session Storage<br/>Database Sessions]
    end

    subgraph "Business Services"
        WorkoutParser[WorkoutParser Service<br/>Text → Structured Workout]
        ProgressTracker[ProgressTracker Service<br/>Analytics & Insights]
        Storage[Storage Service<br/>Database Operations]
    end

    subgraph "Data Models & Schema"
        Schema[shared/schema.ts<br/>Drizzle Schema Definitions]
        Models[Data Models<br/>User, Community, Workout, etc.]
    end

    subgraph "Database Tables"
        Users[(users)]
        Communities[(communities)]
        Workouts[(workouts)]
        WorkoutLogs[(workout_logs)]
        Memberships[(community_memberships)]
        BenchmarkWorkouts[(benchmark_workouts)]
        OlympicLifts[(olympic_lifts)]
        Announcements[(community_announcements)]
        Attendance[(community_attendance)]
        Goals[(community_goals)]
    end

    Server --> Routes
    Routes --> Middleware
    Middleware --> ReplitAuth
    Routes --> WorkoutParser
    Routes --> ProgressTracker
    Routes --> Storage

    Storage --> Schema
    Schema --> Users
    Schema --> Communities
    Schema --> Workouts
    Schema --> WorkoutLogs
    Schema --> Memberships
    Schema --> BenchmarkWorkouts
    Schema --> OlympicLifts
    Schema --> Announcements
    Schema --> Attendance
    Schema --> Goals
```

## 🔄 API Endpoints & Data Flow

```mermaid
graph LR
    subgraph "Authentication Endpoints"
        AuthUser[GET /api/auth/user<br/>Get Current User]
        AuthRegister[POST /api/auth/register<br/>Complete Registration]
    end

    subgraph "User Management"
        UserProfile[PATCH /api/user/profile<br/>Update Profile]
    end

    subgraph "Community Management"
        CreateCommunity[POST /api/communities<br/>Create Community]
        GetMyCommunity[GET /api/communities/my<br/>Get User's Community]
        GetCommunity[GET /api/communities/:id<br/>Get Community Details]
        CommunityMembers[GET/POST/DELETE<br/>/api/communities/:id/members]
        CommunityAnnouncements[GET/POST<br/>/api/communities/:id/announcements]
        CommunityAttendance[GET/POST<br/>/api/communities/:id/attendance]
        CommunityGoals[GET/POST<br/>/api/communities/:id/goals]
    end

    subgraph "Workout Management"
        ParseWorkout[POST /api/workouts/parse<br/>Parse Workout Text]
        CreateWorkout[POST /api/workouts<br/>Create Single Workout]
        BulkWorkouts[POST /api/workouts/bulk<br/>Create Multiple Workouts]
        GetMyWorkouts[GET /api/workouts/my<br/>Get User Workouts]
        GetCommunityWorkouts[GET /api/workouts/community/:id<br/>Get Community Workouts]
        GetWorkout[GET /api/workouts/:id<br/>Get Workout Details]
    end

    subgraph "Workout Logging"
        CreateLog[POST /api/workout-logs<br/>Log Workout Results]
        GetMyLogs[GET /api/workout-logs/my<br/>Get User Logs]
        GetCommunityLogs[GET /api/workout-logs/community/:id<br/>Get Community Logs]
    end

    subgraph "Progress & Analytics"
        GetInsights[GET /api/progress/insights<br/>Get Progress Analytics]
        GetLeaderboard[GET /api/leaderboard/community/:id<br/>Get Community Rankings]
        GetBenchmarks[GET /api/benchmark-workouts<br/>Get Benchmark Workouts]
        GetOlympicLifts[GET /api/olympic-lifts/my<br/>Get Olympic Lift Progress]
        GetLiftProgress[GET /api/olympic-lifts/progress/:liftName<br/>Get Specific Lift Progress]
    end

    subgraph "Data Processing"
        WorkoutParserSvc[WorkoutParser Service<br/>Text Analysis & Parsing]
        ProgressTrackerSvc[ProgressTracker Service<br/>Analytics & Scoring]
        StorageSvc[Storage Service<br/>Database Operations]
    end

    ParseWorkout --> WorkoutParserSvc
    CreateLog --> ProgressTrackerSvc
    GetInsights --> ProgressTrackerSvc
    GetLeaderboard --> ProgressTrackerSvc

    WorkoutParserSvc --> StorageSvc
    ProgressTrackerSvc --> StorageSvc
```

## 👥 Role-Based Component Access

```mermaid
graph TB
    subgraph "User Roles"
        Guest[Guest User<br/>Not Authenticated]
        Athlete[Athlete<br/>Basic Member]
        Coach[Coach<br/>Community Leader]
        Manager[Manager<br/>Community Owner]
        Admin[Admin<br/>System Administrator]
    end

    subgraph "Guest Access"
        GuestPages[Landing Page<br/>About<br/>Contact<br/>Privacy<br/>Community Landing]
    end

    subgraph "Athlete Access"
        AthleteFeatures[Dashboard<br/>Calendar<br/>Profile<br/>Progress<br/>Workout Logging]
    end

    subgraph "Coach Access"
        CoachFeatures[Coach Dashboard<br/>Community Management<br/>Member Progress<br/>Leaderboards<br/>Announcements]
    end

    subgraph "Manager Access"
        ManagerFeatures[All Coach Features<br/>Member Administration<br/>Community Settings<br/>Attendance Tracking<br/>Goal Management]
    end

    subgraph "Admin Access"
        AdminFeatures[System Console<br/>User Management<br/>Global Settings<br/>System Analytics]
    end

    Guest --> GuestPages
    Athlete --> AthleteFeatures
    Coach --> CoachFeatures
    Coach --> AthleteFeatures
    Manager --> ManagerFeatures
    Manager --> CoachFeatures
    Manager --> AthleteFeatures
    Admin --> AdminFeatures
    Admin --> ManagerFeatures
    Admin --> CoachFeatures
    Admin --> AthleteFeatures
```

## 🔄 Component Interaction Flows

### Workout Logging Flow
```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant Calendar
    participant WorkoutLog
    participant WorkoutParser
    participant API
    participant Database

    User->>Dashboard: Click "Log Workout"
    Dashboard->>Calendar: Navigate to Calendar
    User->>Calendar: Select Date & Add Workout
    Calendar->>WorkoutLog: Open Workout Log Component
    User->>WorkoutLog: Enter Workout Text
    WorkoutLog->>WorkoutParser: Parse Workout Text
    WorkoutParser-->>WorkoutLog: Return Structured Data
    WorkoutLog->>API: POST /api/workouts/parse
    API-->>WorkoutLog: Validation Response
    User->>WorkoutLog: Submit Workout Results
    WorkoutLog->>API: POST /api/workout-logs
    API->>Database: Save Workout Log
    Database-->>API: Success Response
    API-->>WorkoutLog: Log Created
    WorkoutLog->>Dashboard: Navigate Back
    Dashboard->>API: GET /api/workout-logs/my
    API-->>Dashboard: Updated Workout History
```

### Community Management Flow
```mermaid
sequenceDiagram
    participant Coach
    participant CoachDashboard
    participant CommunityMgmt
    participant API
    participant Database

    Coach->>CoachDashboard: Access Dashboard
    CoachDashboard->>API: GET /api/communities/my
    API-->>CoachDashboard: Community Data
    Coach->>CommunityMgmt: Manage Community
    
    alt Add Member
        Coach->>CommunityMgmt: Add New Member
        CommunityMgmt->>API: POST /api/communities/:id/members
        API->>Database: Add Membership
        Database-->>API: Success
        API-->>CommunityMgmt: Member Added
    else Create Announcement
        Coach->>CommunityMgmt: Create Announcement
        CommunityMgmt->>API: POST /api/communities/:id/announcements
        API->>Database: Save Announcement
        Database-->>API: Success
        API-->>CommunityMgmt: Announcement Created
    else Mark Attendance
        Coach->>CommunityMgmt: Mark Attendance
        CommunityMgmt->>API: POST /api/communities/:id/attendance
        API->>Database: Save Attendance
        Database-->>API: Success
        API-->>CommunityMgmt: Attendance Recorded
    end
```

## 📊 Data Models & Relationships

```mermaid
erDiagram
    USERS {
        varchar id PK
        varchar email
        varchar username
        varchar phone_number
        decimal body_weight
        decimal body_height
        integer years_of_experience
        text bio
        boolean is_registered
        timestamp created_at
    }

    COMMUNITIES {
        serial id PK
        varchar name
        varchar location
        text description
        varchar manager_id FK
        timestamp created_at
    }

    COMMUNITY_MEMBERSHIPS {
        serial id PK
        integer community_id FK
        varchar user_id FK
        varchar role
        timestamp joined_at
    }

    WORKOUTS {
        serial id PK
        varchar name
        text description
        enum type
        integer time_cap
        varchar created_by FK
        integer community_id FK
        boolean is_public
        timestamp created_at
    }

    WORKOUT_LOGS {
        serial id PK
        varchar user_id FK
        integer workout_id FK
        date date
        integer time_taken
        varchar scale_type
        decimal final_score
        text notes
        timestamp created_at
    }

    BENCHMARK_WORKOUTS {
        serial id PK
        varchar name
        varchar category
        text description
        enum type
        integer time_cap
        text story
    }

    OLYMPIC_LIFTS {
        serial id PK
        varchar user_id FK
        varchar lift_name
        integer rep_max
        decimal weight
        date date
        timestamp created_at
    }

    COMMUNITY_ANNOUNCEMENTS {
        serial id PK
        integer community_id FK
        varchar title
        text content
        varchar created_by FK
        timestamp created_at
    }

    USERS ||--o{ COMMUNITIES : "manages"
    USERS ||--o{ COMMUNITY_MEMBERSHIPS : "belongs to"
    COMMUNITIES ||--o{ COMMUNITY_MEMBERSHIPS : "has members"
    USERS ||--o{ WORKOUTS : "creates"
    COMMUNITIES ||--o{ WORKOUTS : "contains"
    USERS ||--o{ WORKOUT_LOGS : "logs"
    WORKOUTS ||--o{ WORKOUT_LOGS : "has logs"
    USERS ||--o{ OLYMPIC_LIFTS : "records"
    COMMUNITIES ||--o{ COMMUNITY_ANNOUNCEMENTS : "has"
    USERS ||--o{ COMMUNITY_ANNOUNCEMENTS : "creates"
```

## 🎯 Key Features & Components Summary

### **Frontend Components:**
- **40+ UI Components** (shadcn/ui library)
- **Role-based Pages** (Athlete, Coach, Admin dashboards)
- **Feature Components** (Workout logging, Progress tracking, Community management)
- **Layout Components** (Sidebar navigation, responsive design)

### **Backend Services:**
- **Authentication System** (Replit OAuth + Session management)
- **Workout Parser** (Text-to-structured workout conversion)
- **Progress Tracker** (Analytics, insights, scoring algorithms)
- **Storage Layer** (Database operations with Drizzle ORM)

### **Database Schema:**
- **11 Main Tables** with relationships
- **Role-based access control** (Athlete → Coach → Manager → Admin)
- **Comprehensive fitness tracking** (Workouts, logs, benchmarks, Olympic lifts)
- **Community features** (Memberships, announcements, attendance, goals)

### **Key Interactions:**
- **Authentication Flow** (OAuth → Registration → Role Assignment)
- **Workout Management** (Creation → Parsing → Logging → Analytics)
- **Community Management** (Members → Announcements → Attendance → Rankings)
- **Progress Tracking** (Personal Records → Insights → Leaderboards)

This architecture supports a scalable fitness tracking platform with role-based access, comprehensive workout management, and strong community features for CrossFit boxes and fitness communities.
