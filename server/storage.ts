import {
  users,
  communities,
  communityMemberships,
  workouts,
  workoutLogs,
  benchmarkWorkouts,
  olympicLifts,
  communityAnnouncements,
  communityAttendance,
  communityGoals,
  type User,
  type UpsertUser,
  type Community,
  type InsertCommunity,
  type Workout,
  type InsertWorkout,
  type WorkoutLog,
  type InsertWorkoutLog,
  type BenchmarkWorkout,
  type InsertBenchmarkWorkout,
  type OlympicLift,
  type InsertOlympicLift,
  type CommunityAnnouncement,
  type InsertCommunityAnnouncement,
  type CommunityMembership,
  type InsertCommunityMembership,
  type CommunityAttendance,
  type CommunityGoal,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Community operations
  createCommunity(community: InsertCommunity): Promise<Community>;
  getCommunity(id: number): Promise<Community | undefined>;
  getCommunityByManager(managerId: string): Promise<Community | undefined>;
  updateCommunity(id: number, data: Partial<Community>): Promise<Community | undefined>;
  
  // Community membership operations
  addCommunityMember(membership: InsertCommunityMembership): Promise<CommunityMembership>;
  removeCommunityMember(communityId: number, userId: string): Promise<void>;
  getCommunityMembers(communityId: number): Promise<(CommunityMembership & { user: User })[]>;
  getUserMembership(userId: string): Promise<(CommunityMembership & { community: Community }) | undefined>;
  
  // Workout operations
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkoutsByName(name: string): Promise<Workout[]>;
  getUserWorkouts(userId: string): Promise<Workout[]>;
  getCommunityWorkouts(communityId: number): Promise<Workout[]>;
  updateWorkout(id: number, data: Partial<Workout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<void>;
  
  // Workout log operations
  createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog>;
  getWorkoutLog(id: number): Promise<WorkoutLog | undefined>;
  getUserWorkoutLogs(userId: string): Promise<(WorkoutLog & { workout: Workout })[]>;
  getWorkoutLogsByDate(date: string): Promise<(WorkoutLog & { workout: Workout; user: User })[]>;
  getCommunityWorkoutLogs(communityId: number, date?: string): Promise<(WorkoutLog & { workout: Workout; user: User })[]>;
  updateWorkoutLog(id: number, data: Partial<WorkoutLog>): Promise<WorkoutLog | undefined>;
  deleteWorkoutLog(id: number): Promise<void>;
  
  // Benchmark workout operations
  createBenchmarkWorkout(workout: InsertBenchmarkWorkout): Promise<BenchmarkWorkout>;
  getBenchmarkWorkouts(): Promise<BenchmarkWorkout[]>;
  getBenchmarkWorkoutsByCategory(category: string): Promise<BenchmarkWorkout[]>;
  
  // Olympic lift operations
  createOlympicLift(lift: InsertOlympicLift): Promise<OlympicLift>;
  getUserOlympicLifts(userId: string): Promise<OlympicLift[]>;
  getUserLiftProgress(userId: string, liftName: string): Promise<OlympicLift[]>;
  updateOlympicLift(userId: string, liftName: string, repMax: number, weight: number, date: string): Promise<void>;
  
  // Community announcement operations
  createCommunityAnnouncement(announcement: InsertCommunityAnnouncement): Promise<CommunityAnnouncement>;
  getCommunityAnnouncements(communityId: number): Promise<(CommunityAnnouncement & { creator: User })[]>;
  
  // Community attendance operations
  markAttendance(communityId: number, userId: string, date: string, present: boolean, markedBy: string): Promise<void>;
  getCommunityAttendance(communityId: number, date: string): Promise<(CommunityAttendance & { user: User })[]>;
  
  // Community goals operations
  createCommunityGoal(goal: Partial<CommunityGoal>): Promise<CommunityGoal>;
  getCommunityGoals(communityId: number): Promise<(CommunityGoal & { user: User })[]>;
  updateCommunityGoal(id: number, achieved: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Community operations
  async createCommunity(community: InsertCommunity): Promise<Community> {
    const [newCommunity] = await db
      .insert(communities)
      .values(community)
      .returning();
    return newCommunity;
  }

  async getCommunity(id: number): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.id, id));
    return community;
  }

  async getCommunityByManager(managerId: string): Promise<Community | undefined> {
    const [community] = await db.select().from(communities).where(eq(communities.managerId, managerId));
    return community;
  }

  async updateCommunity(id: number, data: Partial<Community>): Promise<Community | undefined> {
    const [community] = await db
      .update(communities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communities.id, id))
      .returning();
    return community;
  }

  // Community membership operations
  async addCommunityMember(membership: InsertCommunityMembership): Promise<CommunityMembership> {
    const [newMembership] = await db
      .insert(communityMemberships)
      .values(membership)
      .returning();
    return newMembership;
  }

  async removeCommunityMember(communityId: number, userId: string): Promise<void> {
    await db
      .delete(communityMemberships)
      .where(and(
        eq(communityMemberships.communityId, communityId),
        eq(communityMemberships.userId, userId)
      ));
  }

  async getCommunityMembers(communityId: number): Promise<(CommunityMembership & { user: User })[]> {
    const members = await db
      .select()
      .from(communityMemberships)
      .innerJoin(users, eq(communityMemberships.userId, users.id))
      .where(eq(communityMemberships.communityId, communityId))
      .orderBy(asc(communityMemberships.joinedAt));
    
    return members.map(member => ({
      ...member.community_memberships,
      user: member.users
    }));
  }

  async getUserMembership(userId: string): Promise<(CommunityMembership & { community: Community }) | undefined> {
    const [membership] = await db
      .select()
      .from(communityMemberships)
      .innerJoin(communities, eq(communityMemberships.communityId, communities.id))
      .where(eq(communityMemberships.userId, userId));
    
    if (!membership) return undefined;
    
    return {
      ...membership.community_memberships,
      community: membership.communities
    };
  }

  // Workout operations
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db
      .insert(workouts)
      .values(workout)
      .returning();
    return newWorkout;
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async getWorkoutsByName(name: string): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.name, name));
  }

  async getUserWorkouts(userId: string): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.createdBy, userId))
      .orderBy(desc(workouts.createdAt));
  }

  async getCommunityWorkouts(communityId: number): Promise<Workout[]> {
    return await db
      .select()
      .from(workouts)
      .where(eq(workouts.communityId, communityId))
      .orderBy(desc(workouts.createdAt));
  }

  async updateWorkout(id: number, data: Partial<Workout>): Promise<Workout | undefined> {
    const [workout] = await db
      .update(workouts)
      .set(data)
      .where(eq(workouts.id, id))
      .returning();
    return workout;
  }

  async deleteWorkout(id: number): Promise<void> {
    await db.delete(workouts).where(eq(workouts.id, id));
  }

  // Workout log operations
  async createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog> {
    const [newLog] = await db
      .insert(workoutLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getWorkoutLog(id: number): Promise<WorkoutLog | undefined> {
    const [log] = await db.select().from(workoutLogs).where(eq(workoutLogs.id, id));
    return log;
  }

  async getUserWorkoutLogs(userId: string): Promise<(WorkoutLog & { workout: Workout })[]> {
    const logs = await db
      .select()
      .from(workoutLogs)
      .innerJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.date));
    
    return logs.map(log => ({
      ...log.workout_logs,
      workout: log.workouts
    }));
  }

  async getWorkoutLogsByDate(date: string): Promise<(WorkoutLog & { workout: Workout; user: User })[]> {
    const logs = await db
      .select()
      .from(workoutLogs)
      .innerJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
      .innerJoin(users, eq(workoutLogs.userId, users.id))
      .where(eq(workoutLogs.date, date))
      .orderBy(asc(workoutLogs.finalScore));
    
    return logs.map(log => ({
      ...log.workout_logs,
      workout: log.workouts,
      user: log.users
    }));
  }

  async getCommunityWorkoutLogs(communityId: number, date?: string): Promise<(WorkoutLog & { workout: Workout; user: User })[]> {
    let whereConditions = [eq(communityMemberships.communityId, communityId)];
    
    if (date) {
      whereConditions.push(eq(workoutLogs.date, date));
    }
    
    const logs = await db
      .select()
      .from(workoutLogs)
      .innerJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
      .innerJoin(users, eq(workoutLogs.userId, users.id))
      .innerJoin(communityMemberships, eq(workoutLogs.userId, communityMemberships.userId))
      .where(and(...whereConditions))
      .orderBy(asc(workoutLogs.finalScore));
    
    return logs.map(log => ({
      ...log.workout_logs,
      workout: log.workouts,
      user: log.users
    }));
  }

  async updateWorkoutLog(id: number, data: Partial<WorkoutLog>): Promise<WorkoutLog | undefined> {
    const [log] = await db
      .update(workoutLogs)
      .set(data)
      .where(eq(workoutLogs.id, id))
      .returning();
    return log;
  }

  async deleteWorkoutLog(id: number): Promise<void> {
    await db.delete(workoutLogs).where(eq(workoutLogs.id, id));
  }

  // Benchmark workout operations
  async createBenchmarkWorkout(workout: InsertBenchmarkWorkout): Promise<BenchmarkWorkout> {
    const [newWorkout] = await db
      .insert(benchmarkWorkouts)
      .values(workout)
      .returning();
    return newWorkout;
  }

  async getBenchmarkWorkouts(): Promise<BenchmarkWorkout[]> {
    return await db
      .select()
      .from(benchmarkWorkouts)
      .orderBy(asc(benchmarkWorkouts.category), asc(benchmarkWorkouts.name));
  }

  async getBenchmarkWorkoutsByCategory(category: string): Promise<BenchmarkWorkout[]> {
    return await db
      .select()
      .from(benchmarkWorkouts)
      .where(eq(benchmarkWorkouts.category, category))
      .orderBy(asc(benchmarkWorkouts.name));
  }

  // Olympic lift operations
  async createOlympicLift(lift: InsertOlympicLift): Promise<OlympicLift> {
    const [newLift] = await db
      .insert(olympicLifts)
      .values(lift)
      .returning();
    return newLift;
  }

  async getUserOlympicLifts(userId: string): Promise<OlympicLift[]> {
    return await db
      .select()
      .from(olympicLifts)
      .where(eq(olympicLifts.userId, userId))
      .orderBy(desc(olympicLifts.date));
  }

  async getUserLiftProgress(userId: string, liftName: string): Promise<OlympicLift[]> {
    return await db
      .select()
      .from(olympicLifts)
      .where(and(
        eq(olympicLifts.userId, userId),
        eq(olympicLifts.liftName, liftName)
      ))
      .orderBy(asc(olympicLifts.repMax), desc(olympicLifts.date));
  }

  async updateOlympicLift(userId: string, liftName: string, repMax: number, weight: number, date: string): Promise<void> {
    await db
      .insert(olympicLifts)
      .values({
        userId,
        liftName,
        repMax,
        weight: weight.toString(),
        date
      })
      .onConflictDoUpdate({
        target: [olympicLifts.userId, olympicLifts.liftName, olympicLifts.repMax],
        set: {
          weight: weight.toString(),
          date
        }
      });
  }

  // Community announcement operations
  async createCommunityAnnouncement(announcement: InsertCommunityAnnouncement): Promise<CommunityAnnouncement> {
    const [newAnnouncement] = await db
      .insert(communityAnnouncements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  async getCommunityAnnouncements(communityId: number): Promise<(CommunityAnnouncement & { creator: User })[]> {
    const announcements = await db
      .select()
      .from(communityAnnouncements)
      .innerJoin(users, eq(communityAnnouncements.createdBy, users.id))
      .where(eq(communityAnnouncements.communityId, communityId))
      .orderBy(desc(communityAnnouncements.createdAt));
    
    return announcements.map(announcement => ({
      ...announcement.community_announcements,
      creator: announcement.users
    }));
  }

  // Community attendance operations
  async markAttendance(communityId: number, userId: string, date: string, present: boolean, markedBy: string): Promise<void> {
    await db
      .insert(communityAttendance)
      .values({
        communityId,
        userId,
        date,
        present,
        markedBy
      })
      .onConflictDoUpdate({
        target: [communityAttendance.communityId, communityAttendance.userId, communityAttendance.date],
        set: {
          present,
          markedBy
        }
      });
  }

  async getCommunityAttendance(communityId: number, date: string): Promise<(CommunityAttendance & { user: User })[]> {
    const attendance = await db
      .select()
      .from(communityAttendance)
      .innerJoin(users, eq(communityAttendance.userId, users.id))
      .where(and(
        eq(communityAttendance.communityId, communityId),
        eq(communityAttendance.date, date)
      ));
    
    return attendance.map(record => ({
      ...record.community_attendance,
      user: record.users
    }));
  }

  // Community goals operations
  async createCommunityGoal(goal: Partial<CommunityGoal>): Promise<CommunityGoal> {
    const [newGoal] = await db
      .insert(communityGoals)
      .values(goal as any)
      .returning();
    return newGoal;
  }

  async getCommunityGoals(communityId: number): Promise<(CommunityGoal & { user: User })[]> {
    const goals = await db
      .select()
      .from(communityGoals)
      .innerJoin(users, eq(communityGoals.userId, users.id))
      .where(eq(communityGoals.communityId, communityId))
      .orderBy(desc(communityGoals.createdAt));
    
    return goals.map(goal => ({
      ...goal.community_goals,
      user: goal.users
    }));
  }

  async updateCommunityGoal(id: number, achieved: boolean): Promise<void> {
    await db
      .update(communityGoals)
      .set({ achieved })
      .where(eq(communityGoals.id, id));
  }
}

export const storage = new DatabaseStorage();
