"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertBarbellLiftSchema = exports.insertNotableSchema = exports.insertHeroWodSchema = exports.insertGirlWodSchema = exports.insertCrossfitWorkoutTypeSchema = exports.insertCommunityMembershipSchema = exports.insertCommunityAnnouncementSchema = exports.insertOlympicLiftSchema = exports.insertBenchmarkWorkoutSchema = exports.insertWorkoutLogSchema = exports.insertWorkoutSchema = exports.insertCommunitySchema = exports.insertAdminSchema = exports.insertUserSchema = exports.adminsRelations = exports.workoutLogsRelations = exports.workoutsRelations = exports.communityMembershipsRelations = exports.communitiesRelations = exports.usersRelations = exports.communityWorkoutAssignments = exports.userWorkoutAssignments = exports.communityGoals = exports.communityAttendance = exports.communityAnnouncements = exports.olympicLifts = exports.benchmarkWorkouts = exports.customUserWorkouts = exports.customCommunityWorkouts = exports.barbellLifts = exports.notables = exports.heroWods = exports.girlWods = exports.crossfitWorkoutTypes = exports.workoutLogs = exports.workouts = exports.workoutBarbellLifts = exports.workoutSourceEnum = exports.liftTypeEnum = exports.liftCategoryEnum = exports.workoutCategoryEnum = exports.workoutTypeEnum = exports.communityMemberships = exports.communities = exports.admins = exports.users = exports.adminRoleEnum = exports.userRoleEnum = exports.accountTypeEnum = exports.sessions = void 0;
exports.insertCommunityWorkoutAssignmentSchema = exports.insertUserWorkoutAssignmentSchema = exports.insertCustomUserWorkoutSchema = exports.insertCustomCommunityWorkoutSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// Session storage table (mandatory for Replit Auth)
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// Account type enum for dual authentication system
exports.accountTypeEnum = (0, pg_core_1.pgEnum)("account_type", ["user", "admin"]);
// User role enum for user console
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["athlete", "athlete_in_community"]);
// Admin role enum for admin console  
exports.adminRoleEnum = (0, pg_core_1.pgEnum)("admin_role", ["coach", "community_manager"]);
// User accounts table (User Console - Athletes)
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    username: (0, pg_core_1.varchar)("username").unique(),
    phoneNumber: (0, pg_core_1.varchar)("phone_number"),
    password: (0, pg_core_1.varchar)("password"),
    occupation: (0, pg_core_1.varchar)("occupation"),
    bodyWeight: (0, pg_core_1.decimal)("body_weight", { precision: 5, scale: 2 }),
    bodyHeight: (0, pg_core_1.decimal)("body_height", { precision: 5, scale: 2 }),
    yearsOfExperience: (0, pg_core_1.integer)("years_of_experience"),
    bio: (0, pg_core_1.text)("bio"),
    socialHandles: (0, pg_core_1.jsonb)("social_handles"),
    role: (0, exports.userRoleEnum)("role").default("athlete"),
    isEmailVerified: (0, pg_core_1.boolean)("is_email_verified").default(false),
    emailVerificationToken: (0, pg_core_1.varchar)("email_verification_token"),
    phoneVerificationToken: (0, pg_core_1.varchar)("phone_verification_token"),
    isPhoneVerified: (0, pg_core_1.boolean)("is_phone_verified").default(false),
    resetPasswordToken: (0, pg_core_1.varchar)("reset_password_token"),
    resetPasswordExpires: (0, pg_core_1.timestamp)("reset_password_expires"),
    isRegistered: (0, pg_core_1.boolean)("is_registered").default(false),
    registeredAt: (0, pg_core_1.timestamp)("registered_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Admin accounts table (Admin Console - Coaches & Community Managers)
exports.admins = (0, pg_core_1.pgTable)("admins", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    username: (0, pg_core_1.varchar)("username").unique(),
    phoneNumber: (0, pg_core_1.varchar)("phone_number"),
    password: (0, pg_core_1.varchar)("password"),
    bio: (0, pg_core_1.text)("bio"),
    certifications: (0, pg_core_1.jsonb)("certifications"), // For coaches
    yearsOfExperience: (0, pg_core_1.integer)("years_of_experience"),
    socialHandles: (0, pg_core_1.jsonb)("social_handles"),
    role: (0, exports.adminRoleEnum)("role").notNull(),
    isEmailVerified: (0, pg_core_1.boolean)("is_email_verified").default(false),
    emailVerificationToken: (0, pg_core_1.varchar)("email_verification_token"),
    phoneVerificationToken: (0, pg_core_1.varchar)("phone_verification_token"),
    isPhoneVerified: (0, pg_core_1.boolean)("is_phone_verified").default(false),
    resetPasswordToken: (0, pg_core_1.varchar)("reset_password_token"),
    resetPasswordExpires: (0, pg_core_1.timestamp)("reset_password_expires"),
    isRegistered: (0, pg_core_1.boolean)("is_registered").default(false),
    registeredAt: (0, pg_core_1.timestamp)("registered_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Communities table
exports.communities = (0, pg_core_1.pgTable)("communities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    location: (0, pg_core_1.varchar)("location", { length: 255 }),
    description: (0, pg_core_1.text)("description"),
    socialHandles: (0, pg_core_1.jsonb)("social_handles"),
    managerId: (0, pg_core_1.varchar)("manager_id").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Community memberships
exports.communityMemberships = (0, pg_core_1.pgTable)("community_memberships", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    communityId: (0, pg_core_1.integer)("community_id").notNull().references(() => exports.communities.id),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    role: (0, pg_core_1.varchar)("role", { length: 50 }).notNull().default("athlete"), // athlete, coach, manager
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow(),
});
// Workout types enum - Expanded based on CrossFit specifications
exports.workoutTypeEnum = (0, pg_core_1.pgEnum)("workout_type", [
    "for_time",
    "amrap",
    "emom",
    "rft", // Rounds for Time
    "chipper",
    "interval",
    "strength",
    "gymnastics_skill_work",
    "endurance",
    "tabata",
    "unbroken",
    "ladder"
]);
// Workout category enum
exports.workoutCategoryEnum = (0, pg_core_1.pgEnum)("workout_category", [
    "girls",
    "heroes",
    "notables",
    "custom_community",
    "custom_user"
]);
// Lift category enum
exports.liftCategoryEnum = (0, pg_core_1.pgEnum)("lift_category", [
    "squat",
    "clean",
    "press",
    "jerk",
    "snatch",
    "deadlift",
    "olympic_lift",
    "other"
]);
// Lift type enum
exports.liftTypeEnum = (0, pg_core_1.pgEnum)("lift_type", [
    "strength",
    "olympic_lift",
    "olympic_variation",
    "olympic_accessory",
    "technique_focused",
    "strength_variant",
    "shoulder_isolation",
    "overhead",
    "mobility",
    "stability",
    "technique",
    "olympic_composite",
    "unilateral_strength",
    "pull",
    "assistance",
    "posterior_chain",
    "hamstring",
    "strength_pull",
    "advanced_olympic",
    "legs",
    "balance",
    "core"
]);
// Workout source enum for assignments
exports.workoutSourceEnum = (0, pg_core_1.pgEnum)("workout_source", [
    "custom_user",
    "custom_community",
    "girl_wod",
    "hero_wod",
    "notable"
]);
// Junction table for workout-barbell lift relationships
exports.workoutBarbellLifts = (0, pg_core_1.pgTable)("workout_barbell_lifts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workoutId: (0, pg_core_1.integer)("workout_id").notNull(),
    barbellLiftId: (0, pg_core_1.integer)("barbell_lift_id").notNull().references(() => exports.barbellLifts.id),
    sourceType: (0, pg_core_1.varchar)("source_type", { length: 50 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => [
    (0, pg_core_1.index)("workout_barbell_lifts_workout_idx").on(table.workoutId, table.sourceType),
    (0, pg_core_1.index)("workout_barbell_lifts_lift_idx").on(table.barbellLiftId),
]);
// Workouts table
exports.workouts = (0, pg_core_1.pgTable)("workouts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, exports.workoutTypeEnum)("type").notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"), // in seconds
    restBetweenIntervals: (0, pg_core_1.integer)("rest_between_intervals"), // in seconds
    totalEffort: (0, pg_core_1.integer)("total_effort"), // calculated value
    relatedBenchmark: (0, pg_core_1.varchar)("related_benchmark", { length: 255 }),
    createdBy: (0, pg_core_1.varchar)("created_by").references(() => exports.users.id),
    communityId: (0, pg_core_1.integer)("community_id").references(() => exports.communities.id),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Workout logs
exports.workoutLogs = (0, pg_core_1.pgTable)("workout_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    workoutId: (0, pg_core_1.integer)("workout_id").notNull().references(() => exports.workouts.id),
    date: (0, pg_core_1.date)("date").notNull(),
    timeTaken: (0, pg_core_1.integer)("time_taken"), // in seconds
    totalEffort: (0, pg_core_1.integer)("total_effort"),
    scaleType: (0, pg_core_1.varchar)("scale_type", { length: 50 }).notNull().default("rx"), // rx, scaled
    scaleDescription: (0, pg_core_1.text)("scale_description"),
    humanReadableScore: (0, pg_core_1.text)("human_readable_score"),
    finalScore: (0, pg_core_1.decimal)("final_score", { precision: 10, scale: 3 }),
    barbellLiftDetails: (0, pg_core_1.jsonb)("barbell_lift_details"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// CrossFit Workout Types - Global Reference Table
exports.crossfitWorkoutTypes = (0, pg_core_1.pgTable)("crossfit_workout_types", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    workoutType: (0, pg_core_1.varchar)("workout_type", { length: 50 }).notNull().unique(),
    description: (0, pg_core_1.text)("description").notNull(),
    commonScoringPatterns: (0, pg_core_1.text)("common_scoring_patterns").notNull(),
    scoreFormat: (0, pg_core_1.varchar)("score_format", { length: 100 }).notNull(),
    examples: (0, pg_core_1.text)("examples").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Girl WODs - Classic CrossFit Benchmark Workouts
exports.girlWods = (0, pg_core_1.pgTable)("girl_wods", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    category: (0, exports.workoutCategoryEnum)("category").notNull().default("girls"),
    workoutType: (0, exports.workoutTypeEnum)("workout_type").notNull(),
    scoring: (0, pg_core_1.varchar)("scoring", { length: 100 }).notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"), // in seconds
    workoutDescription: (0, pg_core_1.text)("workout_description").notNull(),
    totalEffort: (0, pg_core_1.integer)("total_effort").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Hero WODs - Memorial CrossFit Workouts
exports.heroWods = (0, pg_core_1.pgTable)("hero_wods", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    category: (0, exports.workoutCategoryEnum)("category").notNull().default("heroes"),
    workoutType: (0, exports.workoutTypeEnum)("workout_type").notNull(),
    scoring: (0, pg_core_1.varchar)("scoring", { length: 100 }).notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"), // in seconds
    workoutDescription: (0, pg_core_1.text)("workout_description").notNull(),
    totalEffort: (0, pg_core_1.integer)("total_effort").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Notables / Skills / Tests - CrossFit Skills & Tests
exports.notables = (0, pg_core_1.pgTable)("notables", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    category: (0, exports.workoutCategoryEnum)("category").notNull().default("notables"),
    workoutType: (0, exports.workoutTypeEnum)("workout_type").notNull(),
    scoring: (0, pg_core_1.varchar)("scoring", { length: 100 }).notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"), // in seconds
    workoutDescription: (0, pg_core_1.text)("workout_description").notNull(),
    totalEffort: (0, pg_core_1.integer)("total_effort"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Barbell Lifts - CrossFit Movement Database
exports.barbellLifts = (0, pg_core_1.pgTable)("barbell_lifts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    liftName: (0, pg_core_1.varchar)("lift_name", { length: 255 }).notNull().unique(),
    category: (0, exports.liftCategoryEnum)("category").notNull(),
    liftType: (0, exports.liftTypeEnum)("lift_type").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Custom Community Workouts - Community-Level Custom Workouts
exports.customCommunityWorkouts = (0, pg_core_1.pgTable)("custom_community_workouts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    category: (0, exports.workoutCategoryEnum)("category").notNull().default("custom_community"),
    workoutType: (0, exports.workoutTypeEnum)("workout_type").notNull(),
    scoring: (0, pg_core_1.varchar)("scoring", { length: 100 }).notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"), // in seconds
    workoutDescription: (0, pg_core_1.text)("workout_description").notNull(),
    relatedBenchmark: (0, pg_core_1.varchar)("related_benchmark", { length: 255 }),
    communityId: (0, pg_core_1.integer)("community_id").notNull().references(() => exports.communities.id),
    createdBy: (0, pg_core_1.varchar)("created_by").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Custom User Workouts - User-Level Custom Workouts
exports.customUserWorkouts = (0, pg_core_1.pgTable)("custom_user_workouts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    category: (0, exports.workoutCategoryEnum)("category").notNull().default("custom_user"),
    workoutType: (0, exports.workoutTypeEnum)("workout_type").notNull(),
    scoring: (0, pg_core_1.varchar)("scoring", { length: 100 }).notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"), // in seconds
    workoutDescription: (0, pg_core_1.text)("workout_description").notNull(),
    relatedBenchmark: (0, pg_core_1.varchar)("related_benchmark", { length: 255 }),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Legacy Benchmark workouts (keeping for backward compatibility during transition)
exports.benchmarkWorkouts = (0, pg_core_1.pgTable)("benchmark_workouts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    category: (0, pg_core_1.varchar)("category", { length: 50 }).notNull(), // girls, heroes, notable
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, exports.workoutTypeEnum)("type").notNull(),
    timeCap: (0, pg_core_1.integer)("time_cap"),
    story: (0, pg_core_1.text)("story"), // for hero workouts
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Olympic lifts progress
exports.olympicLifts = (0, pg_core_1.pgTable)("olympic_lifts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    liftName: (0, pg_core_1.varchar)("lift_name", { length: 100 }).notNull(),
    repMax: (0, pg_core_1.integer)("rep_max").notNull(), // 1RM, 2RM, etc.
    weight: (0, pg_core_1.decimal)("weight", { precision: 6, scale: 2 }).notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Community announcements
exports.communityAnnouncements = (0, pg_core_1.pgTable)("community_announcements", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    communityId: (0, pg_core_1.integer)("community_id").notNull().references(() => exports.communities.id),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Community daily attendance
exports.communityAttendance = (0, pg_core_1.pgTable)("community_attendance", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    communityId: (0, pg_core_1.integer)("community_id").notNull().references(() => exports.communities.id),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    date: (0, pg_core_1.date)("date").notNull(),
    present: (0, pg_core_1.boolean)("present").default(false),
    markedBy: (0, pg_core_1.varchar)("marked_by").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Community goals
exports.communityGoals = (0, pg_core_1.pgTable)("community_goals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    communityId: (0, pg_core_1.integer)("community_id").notNull().references(() => exports.communities.id),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    goal: (0, pg_core_1.text)("goal").notNull(),
    targetDate: (0, pg_core_1.date)("target_date"),
    achieved: (0, pg_core_1.boolean)("achieved").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// User workout assignments - Maps workouts to dates for individual users
exports.userWorkoutAssignments = (0, pg_core_1.pgTable)("user_workout_assignments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull().references(() => exports.users.id),
    assignedDate: (0, pg_core_1.date)("assigned_date").notNull(),
    workoutId: (0, pg_core_1.integer)("workout_id").notNull(),
    workoutSource: (0, exports.workoutSourceEnum)("workout_source").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Community workout assignments - Maps workouts to dates for communities
exports.communityWorkoutAssignments = (0, pg_core_1.pgTable)("community_workout_assignments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    communityId: (0, pg_core_1.integer)("community_id").notNull().references(() => exports.communities.id),
    assignedDate: (0, pg_core_1.date)("assigned_date").notNull(),
    workoutId: (0, pg_core_1.integer)("workout_id").notNull(),
    workoutSource: (0, exports.workoutSourceEnum)("workout_source").notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by").notNull().references(() => exports.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    communities: many(exports.communities),
    memberships: many(exports.communityMemberships),
    workoutLogs: many(exports.workoutLogs),
    olympicLifts: many(exports.olympicLifts),
    createdWorkouts: many(exports.workouts),
}));
exports.communitiesRelations = (0, drizzle_orm_1.relations)(exports.communities, ({ one, many }) => ({
    manager: one(exports.users, { fields: [exports.communities.managerId], references: [exports.users.id] }),
    memberships: many(exports.communityMemberships),
    workouts: many(exports.workouts),
    announcements: many(exports.communityAnnouncements),
    attendance: many(exports.communityAttendance),
    goals: many(exports.communityGoals),
}));
exports.communityMembershipsRelations = (0, drizzle_orm_1.relations)(exports.communityMemberships, ({ one }) => ({
    community: one(exports.communities, { fields: [exports.communityMemberships.communityId], references: [exports.communities.id] }),
    user: one(exports.users, { fields: [exports.communityMemberships.userId], references: [exports.users.id] }),
}));
exports.workoutsRelations = (0, drizzle_orm_1.relations)(exports.workouts, ({ one, many }) => ({
    creator: one(exports.users, { fields: [exports.workouts.createdBy], references: [exports.users.id] }),
    community: one(exports.communities, { fields: [exports.workouts.communityId], references: [exports.communities.id] }),
    logs: many(exports.workoutLogs),
}));
exports.workoutLogsRelations = (0, drizzle_orm_1.relations)(exports.workoutLogs, ({ one }) => ({
    user: one(exports.users, { fields: [exports.workoutLogs.userId], references: [exports.users.id] }),
    workout: one(exports.workouts, { fields: [exports.workoutLogs.workoutId], references: [exports.workouts.id] }),
}));
// Admin relations
exports.adminsRelations = (0, drizzle_orm_1.relations)(exports.admins, ({ many }) => ({
    managedCommunities: many(exports.communities),
    createdAnnouncements: many(exports.communityAnnouncements),
}));
// Insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertAdminSchema = (0, drizzle_zod_1.createInsertSchema)(exports.admins).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertCommunitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.communities).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.insertWorkoutSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workouts).omit({
    id: true,
    createdAt: true,
});
exports.insertWorkoutLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workoutLogs).omit({
    id: true,
    createdAt: true,
});
exports.insertBenchmarkWorkoutSchema = (0, drizzle_zod_1.createInsertSchema)(exports.benchmarkWorkouts).omit({
    id: true,
    createdAt: true,
});
exports.insertOlympicLiftSchema = (0, drizzle_zod_1.createInsertSchema)(exports.olympicLifts).omit({
    id: true,
    createdAt: true,
});
exports.insertCommunityAnnouncementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityAnnouncements).omit({
    id: true,
    createdAt: true,
});
exports.insertCommunityMembershipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityMemberships).omit({
    id: true,
    joinedAt: true,
});
// New insert schemas for workout tables
exports.insertCrossfitWorkoutTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.crossfitWorkoutTypes).omit({
    id: true,
    createdAt: true,
});
exports.insertGirlWodSchema = (0, drizzle_zod_1.createInsertSchema)(exports.girlWods).omit({
    id: true,
    createdAt: true,
});
exports.insertHeroWodSchema = (0, drizzle_zod_1.createInsertSchema)(exports.heroWods).omit({
    id: true,
    createdAt: true,
});
exports.insertNotableSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notables).omit({
    id: true,
    createdAt: true,
});
exports.insertBarbellLiftSchema = (0, drizzle_zod_1.createInsertSchema)(exports.barbellLifts).omit({
    id: true,
    createdAt: true,
});
exports.insertCustomCommunityWorkoutSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customCommunityWorkouts).omit({
    id: true,
    createdAt: true,
});
exports.insertCustomUserWorkoutSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customUserWorkouts).omit({
    id: true,
    createdAt: true,
});
exports.insertUserWorkoutAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userWorkoutAssignments).omit({
    id: true,
    createdAt: true,
});
exports.insertCommunityWorkoutAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.communityWorkoutAssignments).omit({
    id: true,
    createdAt: true,
});
