import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Helper to get the right auth middleware based on environment
const getAuthMiddleware = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, use a simple middleware that doesn't require real auth
    return (req: any, res: any, next: any) => {
      // Create a mock user if none exists
      if (!req.user) {
        req.user = {
          claims: {
            sub: 'local-dev-user',
            name: 'Local Dev User',
            email: 'dev@localhost.com'
          }
        };
      }
      next();
    };
  }
  return isAuthenticated;
};
import { WorkoutParser } from "./services/workoutParser";
import { ProgressTracker } from "./services/progressTracker";
import { BENCHMARK_WORKOUTS } from "./data/benchmarkWorkouts";
import { 
  insertCommunitySchema,
  insertWorkoutSchema,
  insertWorkoutLogSchema,
  insertCommunityAnnouncementSchema,
  insertCommunityMembershipSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - use local auth for development
  if (process.env.NODE_ENV === 'development') {
    const { setupLocalAuth } = await import("./localAuth.js");
    setupLocalAuth(app);
  } else {
    await setupAuth(app);
  }

  // Seed benchmark workouts on startup
  (async () => {
    try {
      const existingWorkouts = await storage.getBenchmarkWorkouts();
      if (existingWorkouts.length === 0) {
        for (const workout of BENCHMARK_WORKOUTS) {
          await storage.createBenchmarkWorkout(workout);
        }
        console.log(`Seeded ${BENCHMARK_WORKOUTS.length} benchmark workouts`);
      }
    } catch (error) {
      console.error("Error seeding benchmark workouts:", error);
    }
  })();

  // Get auth middleware
  const authMiddleware = getAuthMiddleware();

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For development, always create a mock user
      if (process.env.NODE_ENV === 'development') {
        if (!req.user) {
          req.user = {
            claims: {
              sub: 'local-dev-user',
              name: 'Local Dev User',
              email: 'dev@localhost.com'
            }
          };
        }
      }
      
      // Check if user is authenticated
      if (process.env.NODE_ENV !== 'development' && (!req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // For development mode, create user if doesn't exist
      if (!user && process.env.NODE_ENV === 'development') {
        user = await storage.upsertUser({
          id: userId,
          username: 'LocalDevUser',
          email: 'dev@localhost.com',
          phoneNumber: '+1234567890',
          occupation: 'Developer',
          bodyWeight: '70',
          bodyHeight: '175',
          yearsOfExperience: 2,
          bio: 'Local development user for testing',
          isRegistered: true,
          registeredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // For development, always consider user as registered
      if (process.env.NODE_ENV === 'development' && !user.isRegistered) {
        const updatedUser = await storage.updateUser(userId, {
          isRegistered: true,
          registeredAt: new Date()
        });
        if (updatedUser) {
          user = updatedUser;
        }
      }
      
      // Check if user is properly registered (skip for development)
      if (process.env.NODE_ENV !== 'development' && !user.isRegistered) {
        return res.status(403).json({ message: "User not registered", needsRegistration: true });
      }
      
      // Get user's community membership
      const membership = await storage.getUserMembership(userId);
      
      res.json({
        ...user,
        membership: membership || null
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User registration endpoint
  app.post('/api/auth/register', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username, phoneNumber, occupation, bodyWeight, bodyHeight, yearsOfExperience, bio } = req.body;
      
      // Check if user already exists and is registered
      const existingUser = await storage.getUser(userId);
      if (existingUser?.isRegistered) {
        return res.status(400).json({ message: "User already registered" });
      }
      
      // Update user with registration information
      const updatedUser = await storage.updateUser(userId, {
        username,
        phoneNumber,
        occupation,
        bodyWeight,
        bodyHeight,
        yearsOfExperience,
        bio,
        isRegistered: true,
        registeredAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Registration completed successfully", user: updatedUser });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Community routes
  app.post('/api/communities', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const communityData = insertCommunitySchema.parse({
        ...req.body,
        managerId: userId
      });
      
      const community = await storage.createCommunity(communityData);
      
      // Add manager as a member with manager role
      await storage.addCommunityMember({
        communityId: community.id,
        userId: userId,
        role: "manager"
      });
      
      res.json(community);
    } catch (error) {
      console.error("Error creating community:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create community" });
    }
  });

  app.get('/api/communities/my', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const community = await storage.getCommunityByManager(userId);
      
      if (!community) {
        return res.status(404).json({ message: "No community found" });
      }
      
      res.json(community);
    } catch (error) {
      console.error("Error fetching user's community:", error);
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });

  app.get('/api/communities/:id', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const community = await storage.getCommunity(communityId);
      
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      
      res.json(community);
    } catch (error) {
      console.error("Error fetching community:", error);
      res.status(500).json({ message: "Failed to fetch community" });
    }
  });

  app.get('/api/communities/:id/members', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const members = await storage.getCommunityMembers(communityId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post('/api/communities/:id/members', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const membershipData = insertCommunityMembershipSchema.parse({
        ...req.body,
        communityId
      });
      
      const membership = await storage.addCommunityMember(membershipData);
      res.json(membership);
    } catch (error) {
      console.error("Error adding community member:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add member" });
    }
  });

  app.delete('/api/communities/:id/members/:userId', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.params.userId;
      
      await storage.removeCommunityMember(communityId, userId);
      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing community member:", error);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  // Workout routes
  app.post('/api/workouts/parse', authMiddleware, async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText) {
        return res.status(400).json({ message: "Raw text is required" });
      }
      
      const parsedWorkouts = WorkoutParser.parseWorkout(rawText);
      res.json({
        workouts: parsedWorkouts,
        count: parsedWorkouts.length
      });
    } catch (error) {
      console.error("Error parsing workout:", error);
      res.status(500).json({ message: "Failed to parse workout" });
    }
  });

  app.post('/api/workouts', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workoutData = insertWorkoutSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error) {
      console.error("Error creating workout:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  // Bulk workout creation from parsed data
  app.post('/api/workouts/bulk', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { parsedWorkouts, communityId } = req.body;
      
      if (!parsedWorkouts || !Array.isArray(parsedWorkouts)) {
        return res.status(400).json({ message: "parsedWorkouts array is required" });
      }
      
      const createdWorkouts = [];
      for (const parsed of parsedWorkouts) {
        const workoutData = WorkoutParser.createWorkoutFromParsed(
          parsed,
          userId,
          communityId
        );
        
        const workout = await storage.createWorkout(workoutData);
        createdWorkouts.push(workout);
      }
      
      res.json({
        workouts: createdWorkouts,
        count: createdWorkouts.length
      });
    } catch (error) {
      console.error("Error creating bulk workouts:", error);
      res.status(500).json({ message: "Failed to create workouts" });
    }
  });

  app.get('/api/workouts/my', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workouts = await storage.getUserWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching user workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/community/:id', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const workouts = await storage.getCommunityWorkouts(communityId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching community workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/:id', authMiddleware, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.json(workout);
    } catch (error) {
      console.error("Error fetching workout:", error);
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  // Workout log routes
  app.post('/api/workout-logs', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertWorkoutLogSchema.parse({
        ...req.body,
        userId
      });
      
      // Calculate final score
      const workout = await storage.getWorkout(logData.workoutId);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      const finalScore = ProgressTracker.calculateFinalScore(
        workout.type,
        logData.timeTaken || 0,
        logData.totalEffort || 0,
        workout.timeCap || 0,
        logData.totalEffort || 0
      );
      
      const workoutLog = await storage.createWorkoutLog({
        ...logData,
        finalScore: finalScore.toString()
      });
      
      // Update Olympic lift progress if applicable
      if (logData.barbellLiftDetails) {
        await ProgressTracker.updateOlympicLiftProgress(
          workoutLog,
          logData.barbellLiftDetails as any
        );
      }
      
      res.json(workoutLog);
    } catch (error) {
      console.error("Error creating workout log:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout log" });
    }
  });

  app.get('/api/workout-logs/my', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getUserWorkoutLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user workout logs:", error);
      res.status(500).json({ message: "Failed to fetch workout logs" });
    }
  });

  app.get('/api/workout-logs/community/:id', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const date = req.query.date as string;
      
      const logs = await storage.getCommunityWorkoutLogs(communityId, date);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching community workout logs:", error);
      res.status(500).json({ message: "Failed to fetch workout logs" });
    }
  });

  // Progress and leaderboard routes
  app.get('/api/progress/insights', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await ProgressTracker.generateProgressInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error generating progress insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.get('/api/leaderboard/community/:id', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const workoutName = req.query.workout as string;
      const date = req.query.date as string;
      
      const rankings = await ProgressTracker.getCommunityRankings(
        communityId,
        workoutName,
        date
      );
      
      res.json(rankings);
    } catch (error) {
      console.error("Error fetching community leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Benchmark workout routes
  app.get('/api/benchmark-workouts', async (req, res) => {
    try {
      const category = req.query.category as string;
      const workouts = category 
        ? await storage.getBenchmarkWorkoutsByCategory(category)
        : await storage.getBenchmarkWorkouts();
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching benchmark workouts:", error);
      res.status(500).json({ message: "Failed to fetch benchmark workouts" });
    }
  });

  // Olympic lift routes
  app.get('/api/olympic-lifts/my', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lifts = await storage.getUserOlympicLifts(userId);
      res.json(lifts);
    } catch (error) {
      console.error("Error fetching user Olympic lifts:", error);
      res.status(500).json({ message: "Failed to fetch Olympic lifts" });
    }
  });

  app.get('/api/olympic-lifts/progress/:liftName', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const liftName = req.params.liftName;
      const progress = await storage.getUserLiftProgress(userId, liftName);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching lift progress:", error);
      res.status(500).json({ message: "Failed to fetch lift progress" });
    }
  });

  // Community announcement routes
  app.post('/api/communities/:id/announcements', authMiddleware, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const announcementData = insertCommunityAnnouncementSchema.parse({
        ...req.body,
        communityId,
        createdBy: userId
      });
      
      const announcement = await storage.createCommunityAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.get('/api/communities/:id/announcements', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const announcements = await storage.getCommunityAnnouncements(communityId);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Community attendance routes
  app.post('/api/communities/:id/attendance', authMiddleware, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { date, attendanceRecords } = req.body;
      
      for (const record of attendanceRecords) {
        await storage.markAttendance(
          communityId,
          record.userId,
          date,
          record.present,
          userId
        );
      }
      
      res.json({ message: "Attendance marked successfully" });
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  app.get('/api/communities/:id/attendance', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }
      
      const attendance = await storage.getCommunityAttendance(communityId, date);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Community goals routes
  app.post('/api/communities/:id/goals', authMiddleware, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const goalData = {
        ...req.body,
        communityId,
        userId
      };
      
      const goal = await storage.createCommunityGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating community goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.get('/api/communities/:id/goals', authMiddleware, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const goals = await storage.getCommunityGoals(communityId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching community goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.patch('/api/goals/:id', authMiddleware, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const { achieved } = req.body;
      
      await storage.updateCommunityGoal(goalId, achieved);
      res.json({ message: "Goal updated successfully" });
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
