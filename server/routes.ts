import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import dualRoutes, { requireUserAuth, requireAdminAuth, requireCommunityManager, requireCoachOrManager } from "./dualRoutes.js";
import { WorkoutParser } from "./services/workoutParser";
import { ProgressTracker } from "./services/progressTracker";
import { BENCHMARK_WORKOUTS } from "./data/benchmarkWorkouts";
import { verificationRouter } from "./routes/verification.js";
import { 
  insertCommunitySchema,
  insertWorkoutSchema,
  insertWorkoutLogSchema,
  insertCommunityAnnouncementSchema,
  insertCommunityMembershipSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Setup session management (from the old auth system)
  setupAuth(app);

  // Use the new dual authentication routes
  app.use('/api/auth', dualRoutes);

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

  // Legacy logout route for backward compatibility
  app.get('/api/logout', async (req: any, res) => {
    try {
      if (req.session) {
        req.session.destroy((err: any) => {
          if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Failed to logout' });
          }
          res.clearCookie('connect.sid');
          res.redirect('/');
        });
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Get authenticated user info (unified endpoint for both user and admin)
  app.get('/api/user', async (req: any, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const sessionUser = req.session.user;
      const userId = sessionUser.id;

      if (sessionUser.accountType === 'user') {
        let user = await storage.getUser(userId);
        
        // Create demo user if doesn't exist (for backward compatibility)
        if (!user) {
          const userData = {
            id: userId,
            username: 'Demo',
            email: sessionUser.email || 'demo@athletepro.com',
            firstName: 'Demo',
            lastName: 'User',
            phoneNumber: '+1234567890',
            occupation: 'Athlete',
            bodyWeight: '70',
            bodyHeight: '175',
            yearsOfExperience: 2,
            bio: 'Demo user for AthletePro',
            isRegistered: true,
            registeredAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          user = await storage.upsertUser(userData);
        }
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Get user's community membership
        const membership = await storage.getUserMembership(userId);
        
        res.json({
          ...user,
          membership: membership || null
        });
      } else if (sessionUser.accountType === 'admin') {
        // For admin users, return admin info in user format for compatibility
        res.json({
          id: userId,
          email: sessionUser.email,
          username: `admin_${sessionUser.role}`,
          firstName: 'Admin',
          lastName: 'User',
          role: sessionUser.role,
          isRegistered: true,
          accountType: 'admin'
        });
      } else {
        return res.status(401).json({ message: 'Invalid account type' });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes (User Console only)
  app.patch('/api/user/profile', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  // Community routes (Admin Console - Community Managers)
  app.post('/api/communities', requireCommunityManager, async (req: any, res) => {
    try {
      const userId = req.admin.id;
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

  app.get('/api/communities/my', requireCommunityManager, async (req: any, res) => {
    try {
      const userId = req.admin.id;
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

  app.get('/api/communities/:id', requireUserAuth, async (req, res) => {
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

  app.get('/api/communities/:id/members', requireUserAuth, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const members = await storage.getCommunityMembers(communityId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching community members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post('/api/communities/:id/members', requireCoachOrManager, async (req, res) => {
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

  app.delete('/api/communities/:id/members/:userId', requireCoachOrManager, async (req, res) => {
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

  // Workout routes (Both User and Admin Console)
  app.post('/api/workouts/parse', requireUserAuth, async (req, res) => {
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

  app.post('/api/workouts', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/workouts/bulk', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.get('/api/workouts/my', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const workouts = await storage.getUserWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching user workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  // Community workouts
  app.get('/api/workouts/community', requireUserAuth, async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching community workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/community/:id', requireUserAuth, async (req, res) => {
    try {
      const idParam = req.params.id;
      
      if (!idParam || idParam === 'undefined' || idParam === 'null' || idParam === '') {
        return res.json([]);
      }
      
      const communityId = parseInt(idParam);
      
      if (isNaN(communityId)) {
        return res.json([]);
      }
      
      const workouts = await storage.getCommunityWorkouts(communityId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching community workouts:", error);
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get('/api/workouts/:id', requireUserAuth, async (req, res) => {
    try {
      const workoutId = parseInt(req.params.id);
      
      if (isNaN(workoutId)) {
        return res.status(400).json({ message: "Invalid workout ID" });
      }
      
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

  // Workout log routes (User Console)
  app.post('/api/workout-logs', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.get('/api/workout-logs/my', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage.getUserWorkoutLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user workout logs:", error);
      res.status(500).json({ message: "Failed to fetch workout logs" });
    }
  });

  app.get('/api/workout-logs/community/:id', requireUserAuth, async (req, res) => {
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

  // Progress and leaderboard routes (User Console)
  app.get('/api/progress/insights', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const insights = await ProgressTracker.generateProgressInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error generating progress insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.get('/api/leaderboard/community/:id', requireUserAuth, async (req, res) => {
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

  // Benchmark workout routes (Public)
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

  // Olympic lift routes (User Console)
  app.get('/api/olympic-lifts/my', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const lifts = await storage.getUserOlympicLifts(userId);
      res.json(lifts);
    } catch (error) {
      console.error("Error fetching user Olympic lifts:", error);
      res.status(500).json({ message: "Failed to fetch Olympic lifts" });
    }
  });

  app.get('/api/olympic-lifts/progress/:liftName', requireUserAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const liftName = req.params.liftName;
      const progress = await storage.getUserLiftProgress(userId, liftName);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching lift progress:", error);
      res.status(500).json({ message: "Failed to fetch lift progress" });
    }
  });

  // Community announcement routes (Admin Console - Coaches & Community Managers)
  app.post('/api/communities/:id/announcements', requireCoachOrManager, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.admin.id;
      
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

  app.get('/api/communities/:id/announcements', requireUserAuth, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const announcements = await storage.getCommunityAnnouncements(communityId);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Community attendance routes (Admin Console - Coaches & Community Managers)
  app.post('/api/communities/:id/attendance', requireCoachOrManager, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.admin.id;
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

  app.get('/api/communities/:id/attendance', requireUserAuth, async (req, res) => {
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

  // Verification routes
  app.use('/api/verification', verificationRouter);

  // Community goals routes (Admin Console - Coaches & Community Managers)
  app.post('/api/communities/:id/goals', requireCoachOrManager, async (req: any, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const userId = req.admin.id;
      
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

  app.get('/api/communities/:id/goals', requireUserAuth, async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      const goals = await storage.getCommunityGoals(communityId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching community goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.patch('/api/goals/:id', requireCoachOrManager, async (req, res) => {
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

  // Email routes for contact form and feedback (Public)
  app.post('/api/send-email', async (req, res) => {
    try {
      const { name, email, subject, message, type } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check if SendGrid is available
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(503).json({ error: 'Email service not configured' });
      }

      const mailServiceModule = await import('@sendgrid/mail');
      const mailService = mailServiceModule.default;
      mailService.setApiKey(process.env.SENDGRID_API_KEY);

      const emailContent = {
        to: 'akshatchaturvedi17@gmail.com',
        from: 'noreply@acrossfit.com',
        subject: type === 'feedback' ? `Anonymous Feedback: ${subject || 'No Subject'}` : `Contact Form: ${subject || 'No Subject'}`,
        text: type === 'feedback' 
          ? `Anonymous Feedback:\n\n${message}`
          : `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: type === 'feedback'
          ? `<h3>Anonymous Feedback</h3><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
          : `<h3>Contact Form Submission</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br>')}</p>`
      };

      await mailService.send(emailContent);
      
      res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('SendGrid email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
