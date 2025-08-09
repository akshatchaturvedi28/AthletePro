# Component Mapping Analysis: PRD vs Current Implementation

## PRD Component Requirements vs Current Status

Based on the PRD Component table, here's the detailed mapping of what exists vs what needs to be implemented:

## Component Status Matrix

| Component Name | Acronym | Current Status | Implementation Priority | Notes |
|---|---|---|---|---|
| Primary Landing Page | PLP | 🟡 Basic exists | 🔴 Critical | Needs major enhancements |
| About Us Page | AUP | 🟡 Basic exists | 🟡 Important | Needs content updates |
| Contact Us Page | CUP | 🟡 Basic exists | 🔴 Critical | Missing suggestion form |
| Privacy Policy Page | PPP | 🟡 Basic exists | 🔴 Critical | Missing specific content |
| Community Landing Page | CLP | 🟡 Basic exists | 🔴 Critical | Missing key features |
| User Sign-in | USI | ✅ Implemented | 🟢 Complete | Working |
| User Sign Up | USU | ✅ Implemented | 🟡 Important | Missing OTP verification |
| User Reset Password | URP | ❌ Missing | 🔴 Critical | Not implemented |
| Admin Sign-in | ASI | ✅ Implemented | 🟢 Complete | Working |
| Admin Sign Up | ASU | ✅ Implemented | 🟡 Important | Missing OTP verification |
| Admin Reset Password | ARP | ❌ Missing | 🔴 Critical | Not implemented |
| Create Community Page | CCP | ✅ Implemented | 🟢 Complete | Working |
| Athlete Home Page | AHP | 🟡 Basic exists | 🔴 Critical | Missing WOD display |
| Manage Community Page | MCP | 🟡 Basic exists | 🟡 Important | Missing sections |
| Coach Home Page | CHP | 🟡 Basic exists | 🟡 Important | Missing athlete list |
| Athlete Performance Tracking | APT | 🟡 Basic exists | 🔴 Critical | Missing 3 categories |
| Athlete Calendar Page | ACP | 🟡 Basic exists | 🔴 Critical | Missing full functionality |
| My User Account Page | UAP | 🟡 Basic exists | 🟡 Important | Missing key features |
| My Admin Account Page | AAP | 🟡 Basic exists | 🟡 Important | Missing key features |
| Athlete Profile | AP | ❌ Missing | 🔴 Critical | Not implemented |
| Community Announcements Section | CAS | 🟡 Backend exists | 🟡 Important | Missing frontend |
| Community Leaderboard Section | CLS | 🟡 Basic exists | 🟡 Important | Needs enhancements |
| Community Goals Section | CGS | 🟡 Backend exists | 🟡 Important | Missing frontend |
| Community Overview Section | COS | ❌ Missing | 🟡 Important | Not implemented |
| Community Blogs Section | CBS | ❌ Missing | 🟢 Nice to have | Not implemented |
| Community Calendar | CC | ❌ Missing | 🔴 Critical | Not implemented |
| Community Daily Attendance Page | CDAP | 🟡 Backend exists | 🟡 Important | Missing frontend |
| Add Community Today's WOD | ACW | 🟡 Backend exists | 🔴 Critical | Missing frontend |

## Detailed Implementation Requirements

### 🔴 Critical Priority Components

#### 1. User Reset Password (URP) & Admin Reset Password (ARP)
**Status**: ❌ Missing
**Requirements**:
- Email-based password reset flow
- OTP verification for password reset
- New password confirmation
- Security measures (rate limiting, etc.)

**Implementation Needed**:
```typescript
// Components to create:
- client/src/pages/auth/reset-password.tsx
- client/src/components/auth/PasswordReset.tsx
- client/src/components/auth/OTPVerification.tsx

// Backend endpoints to add:
POST /api/auth/forgot-password
POST /api/auth/verify-reset-otp
POST /api/auth/reset-password
```

#### 2. Athlete Profile (AP)
**Status**: ❌ Missing
**Requirements**: 
- Public profile viewable by all users
- Editable by athlete only
- Display: Picture, socials, occupation, PRs, experience, community

**Implementation Needed**:
```typescript
// Components to create:
- client/src/pages/athlete/public-profile.tsx
- client/src/components/profile/PublicProfile.tsx
- client/src/components/profile/ProfileEditor.tsx
- client/src/components/profile/PRShowcase.tsx
```

#### 3. Athlete Performance Tracking (APT) - Three Categories
**Status**: 🟡 Basic exists
**Missing**: Three specific categories tracking
- CrossFit Benchmark Workouts (Girls, Heroes, etc.)
- Olympic Lifts (1RM, 2RM, etc.)  
- CrossFit Competitions (Opens, Mayhem, etc.)

**Implementation Needed**:
```typescript
// Components to enhance:
- client/src/components/progress/BenchmarkProgress.tsx
- client/src/components/progress/OlympicLiftProgress.tsx
- client/src/components/progress/CompetitionProgress.tsx
- client/src/components/progress/ProgressDashboard.tsx
```

#### 4. Athlete Calendar Page (ACP) - Full Functionality
**Status**: 🟡 Basic exists
**Missing**:
- Create/view/edit personal workouts for any date
- Score logging integration
- Past and future workout management

**Implementation Needed**:
```typescript
// Components to enhance:
- client/src/pages/athlete/calendar.tsx
- client/src/components/calendar/WorkoutCalendar.tsx
- client/src/components/calendar/WorkoutCreator.tsx
- client/src/components/calendar/WorkoutEditor.tsx
```

#### 5. Community Calendar (CC)
**Status**: ❌ Missing
**Requirements**: 
- Coaches create/view/edit community workouts
- Calendar view for past and future dates
- Workout scheduling interface

**Implementation Needed**:
```typescript
// Components to create:
- client/src/pages/coach/calendar.tsx
- client/src/components/community/CommunityCalendar.tsx
- client/src/components/community/CommunityWorkoutCreator.tsx
```

#### 6. Add Community Today's WOD (ACW)
**Status**: 🟡 Backend exists
**Missing**: Frontend interface for coaches to add today's workout

**Implementation Needed**:
```typescript
// Components to create:
- client/src/components/community/TodaysWOD.tsx
- client/src/components/community/WODCreator.tsx
```

#### 7. Enhanced Landing Pages (PLP & CLP)
**Status**: 🟡 Basic exists
**Missing**: All PRD requirements for enticing first-time visitors

**PLP Requirements**:
- User count display
- User testimonials carousel
- Product screenshots gallery
- USP highlighting
- AI/LLM capabilities showcase
- "Free Sign Up" call-to-action

**CLP Requirements**:
- Registered gyms showcase
- Pricing table (free tier promotion)
- "Get a Quote" form
- Community features with screenshots

### 🟡 Important Priority Components

#### 1. My User Account Page (UAP) & My Admin Account Page (AAP)
**Status**: 🟡 Basic exists
**Missing**:
- Username updates
- Password reset integration
- Gmail linking
- Body profile management (weight, height)
- Occupation updates

#### 2. Community Management Sections
**Missing Frontend Interfaces**:
- **Community Overview Section (COS)**: Gym details, classes, coach bios
- **Community Announcements Section (CAS)**: Schedule changes, events
- **Community Goals Section (CGS)**: Individual and group goals
- **Community Daily Attendance Page (CDAP)**: Attendance tracking UI

#### 3. Enhanced Athlete Home Page (AHP)
**Status**: 🟡 Basic exists  
**Missing**:
- Workout of the Day display
- Quick logging interface  
- Daily activity summary
- Community announcements feed

### 🟢 Nice to Have Components

#### 1. Community Blogs Section (CBS)
**Status**: ❌ Missing
**Requirements**: Content management for community blogs/newsletters

#### 2. Coach Notes on Athletes
**Requirements**: Private notes coaches can maintain about athletes

## Implementation Roadmap

### Week 1-2: Authentication & Core Pages
- [ ] Implement URP & ARP (password reset flows)
- [ ] Add OTP verification system
- [ ] Enhance USU & ASU with OTP
- [ ] Complete Contact Us page with suggestion form
- [ ] Update Privacy Policy with specific content

### Week 3-4: Workout Management Core
- [ ] Implement full ACP (Athlete Calendar Page)
- [ ] Create CC (Community Calendar)
- [ ] Build ACW (Add Community Today's WOD)
- [ ] Enhance AHP (Athlete Home Page) with WOD display

### Week 5-6: Profiles & Progress
- [ ] Create AP (Athlete Profile) - public profiles
- [ ] Complete APT (Athlete Performance Tracking) - 3 categories
- [ ] Enhance UAP & AAP (Account pages)
- [ ] Implement profile picture upload

### Week 7-8: Community Features & Polish
- [ ] Build community management sections (COS, CAS, CGS, CDAP)
- [ ] Enhance CLS (Community Leaderboard Section)
- [ ] Complete PLP & CLP with all requirements
- [ ] Implement coach notes functionality
- [ ] Testing and bug fixes

## Database Schema Updates Required

```sql
-- Add new tables for missing functionality
CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  code VARCHAR(6) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'email' or 'sms' or 'password_reset'
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  goal TEXT NOT NULL,
  target_date DATE,
  achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coach_athlete_notes (
  id SERIAL PRIMARY KEY,
  coach_id VARCHAR REFERENCES users(id),
  athlete_id VARCHAR REFERENCES users(id),
  community_id INTEGER REFERENCES communities(id),
  notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_blogs (
  id SERIAL PRIMARY KEY,
  community_id INTEGER REFERENCES communities(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR REFERENCES users(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhance existing tables
ALTER TABLE users 
ADD COLUMN profile_picture_url VARCHAR(500),
ADD COLUMN social_handles JSONB,
ADD COLUMN personal_records JSONB;

ALTER TABLE communities 
ADD COLUMN overview_content TEXT,
ADD COLUMN class_schedule JSONB,
ADD COLUMN coach_bios JSONB;
```

## Success Criteria

For each component to be considered "complete" for MVP:

### Functional Requirements
- [ ] All CRUD operations working
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Responsive design
- [ ] Accessibility standards met

### User Experience Requirements  
- [ ] Intuitive navigation
- [ ] Clear visual feedback
- [ ] Form validation with helpful messages
- [ ] Consistent styling with design system
- [ ] Performance optimized (< 3s load times)

### Technical Requirements
- [ ] TypeScript types defined
- [ ] API integration complete
- [ ] Database queries optimized
- [ ] Security measures implemented
- [ ] Testing coverage > 70%

This mapping provides a clear roadmap for implementing all Phase 1 MVP components according to the PRD specifications while building on the existing architecture foundation.
