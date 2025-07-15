import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  phoneNumber: varchar("phone_number"),
  occupation: varchar("occupation"),
  bodyWeight: decimal("body_weight", { precision: 5, scale: 2 }),
  bodyHeight: decimal("body_height", { precision: 5, scale: 2 }),
  yearsOfExperience: integer("years_of_experience"),
  bio: text("bio"),
  socialHandles: jsonb("social_handles"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communities table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  socialHandles: jsonb("social_handles"),
  managerId: varchar("manager_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community memberships
export const communityMemberships = pgTable("community_memberships", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("athlete"), // athlete, coach, manager
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Workout types enum
export const workoutTypeEnum = pgEnum("workout_type", [
  "for_time",
  "amrap",
  "emom",
  "tabata",
  "strength",
  "interval",
  "endurance",
  "chipper",
  "ladder",
  "unbroken"
]);

// Workouts table
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: workoutTypeEnum("type").notNull(),
  timeCap: integer("time_cap"), // in seconds
  restBetweenIntervals: integer("rest_between_intervals"), // in seconds
  totalEffort: integer("total_effort"), // calculated value
  relatedBenchmark: varchar("related_benchmark", { length: 255 }),
  barbellLifts: jsonb("barbell_lifts"), // array of lift names
  createdBy: varchar("created_by").references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout logs
export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutId: integer("workout_id").notNull().references(() => workouts.id),
  date: date("date").notNull(),
  timeTaken: integer("time_taken"), // in seconds
  totalEffort: integer("total_effort"),
  scaleType: varchar("scale_type", { length: 50 }).notNull().default("rx"), // rx, scaled
  scaleDescription: text("scale_description"),
  humanReadableScore: text("human_readable_score"),
  finalScore: decimal("final_score", { precision: 10, scale: 3 }),
  barbellLiftDetails: jsonb("barbell_lift_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Benchmark workouts (Girls, Heroes, etc.)
export const benchmarkWorkouts = pgTable("benchmark_workouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(), // girls, heroes, notable
  description: text("description").notNull(),
  type: workoutTypeEnum("type").notNull(),
  timeCap: integer("time_cap"),
  story: text("story"), // for hero workouts
  createdAt: timestamp("created_at").defaultNow(),
});

// Olympic lifts progress
export const olympicLifts = pgTable("olympic_lifts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  liftName: varchar("lift_name", { length: 100 }).notNull(),
  repMax: integer("rep_max").notNull(), // 1RM, 2RM, etc.
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community announcements
export const communityAnnouncements = pgTable("community_announcements", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community daily attendance
export const communityAttendance = pgTable("community_attendance", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  present: boolean("present").default(false),
  markedBy: varchar("marked_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community goals
export const communityGoals = pgTable("community_goals", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  goal: text("goal").notNull(),
  targetDate: date("target_date"),
  achieved: boolean("achieved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  communities: many(communities),
  memberships: many(communityMemberships),
  workoutLogs: many(workoutLogs),
  olympicLifts: many(olympicLifts),
  createdWorkouts: many(workouts),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  manager: one(users, { fields: [communities.managerId], references: [users.id] }),
  memberships: many(communityMemberships),
  workouts: many(workouts),
  announcements: many(communityAnnouncements),
  attendance: many(communityAttendance),
  goals: many(communityGoals),
}));

export const communityMembershipsRelations = relations(communityMemberships, ({ one }) => ({
  community: one(communities, { fields: [communityMemberships.communityId], references: [communities.id] }),
  user: one(users, { fields: [communityMemberships.userId], references: [users.id] }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  creator: one(users, { fields: [workouts.createdBy], references: [users.id] }),
  community: one(communities, { fields: [workouts.communityId], references: [communities.id] }),
  logs: many(workoutLogs),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  user: one(users, { fields: [workoutLogs.userId], references: [users.id] }),
  workout: one(workouts, { fields: [workoutLogs.workoutId], references: [workouts.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBenchmarkWorkoutSchema = createInsertSchema(benchmarkWorkouts).omit({
  id: true,
  createdAt: true,
});

export const insertOlympicLiftSchema = createInsertSchema(olympicLifts).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityAnnouncementSchema = createInsertSchema(communityAnnouncements).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityMembershipSchema = createInsertSchema(communityMemberships).omit({
  id: true,
  joinedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type BenchmarkWorkout = typeof benchmarkWorkouts.$inferSelect;
export type InsertBenchmarkWorkout = z.infer<typeof insertBenchmarkWorkoutSchema>;
export type OlympicLift = typeof olympicLifts.$inferSelect;
export type InsertOlympicLift = z.infer<typeof insertOlympicLiftSchema>;
export type CommunityAnnouncement = typeof communityAnnouncements.$inferSelect;
export type InsertCommunityAnnouncement = z.infer<typeof insertCommunityAnnouncementSchema>;
export type CommunityMembership = typeof communityMemberships.$inferSelect;
export type InsertCommunityMembership = z.infer<typeof insertCommunityMembershipSchema>;
export type CommunityAttendance = typeof communityAttendance.$inferSelect;
export type CommunityGoal = typeof communityGoals.$inferSelect;
