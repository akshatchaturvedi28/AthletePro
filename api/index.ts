import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { eq, desc, and } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Import all shared schemas and types (inline for Vercel compatibility)
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  serial,
  integer,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

// Define schema tables inline for Vercel compatibility
const userRoleEnum = pgEnum("user_role", ["athlete", "athlete_in_community"]);
const adminRoleEnum = pgEnum("admin_role", ["coach", "community_manager"]);
const workoutTypeEnum = pgEnum("workout_type", [
  "for_time", "amrap", "emom", "tabata", "strength", "interval", "endurance", "chipper", "ladder", "unbroken"
]);

const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  username: varchar("username").unique(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password"),
  occupation: varchar("occupation"),
  bio: varchar("bio"),
  role: userRoleEnum("role").default("athlete"),
  isRegistered: boolean("is_registered").default(false),
  registeredAt: timestamp("registered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const admins = pgTable("admins", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  username: varchar("username").unique(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password"),
  bio: varchar("bio"),
  role: adminRoleEnum("role").notNull(),
  isRegistered: boolean("is_registered").default(false),
  registeredAt: timestamp("registered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  managerId: varchar("manager_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: workoutTypeEnum("type").notNull(),
  timeCap: integer("time_cap"),
  totalEffort: integer("total_effort"),
  createdBy: varchar("created_by"),
  communityId: integer("community_id"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  workoutId: integer("workout_id").notNull(),
  date: varchar("date").notNull(),
  timeTaken: integer("time_taken"),
  totalEffort: integer("total_effort"),
  scaleType: varchar("scale_type").notNull().default("rx"),
  finalScore: varchar("final_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

const olympicLifts = pgTable("olympic_lifts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  liftName: varchar("lift_name", { length: 100 }).notNull(),
  weight: integer("weight").notNull(),
  repMax: integer("rep_max").notNull(),
  date: varchar("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Tables (inline for production)
const girlWods = pgTable("girl_wods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  workoutDescription: text("workout_description").notNull(),
  workoutType: varchar("workout_type", { length: 50 }).notNull(),
  scoring: varchar("scoring", { length: 100 }).notNull(),
  timeCap: integer("time_cap"),
  totalEffort: integer("total_effort"),
  createdAt: timestamp("created_at").defaultNow(),
});

const heroWods = pgTable("hero_wods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  workoutDescription: text("workout_description").notNull(),
  workoutType: varchar("workout_type", { length: 50 }).notNull(),
  scoring: varchar("scoring", { length: 100 }).notNull(),
  timeCap: integer("time_cap"),
  totalEffort: integer("total_effort"),
  createdAt: timestamp("created_at").defaultNow(),
});

const notables = pgTable("notables", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  workoutDescription: text("workout_description").notNull(),
  workoutType: varchar("workout_type", { length: 50 }).notNull(),
  scoring: varchar("scoring", { length: 100 }).notNull(),
  timeCap: integer("time_cap"),
  totalEffort: integer("total_effort"),
  createdAt: timestamp("created_at").defaultNow(),
});

const barbellLifts = pgTable("barbell_lifts", {
  id: serial("id").primaryKey(),
  liftName: varchar("lift_name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  liftType: varchar("lift_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for workout-barbell lift relationships
const workoutBarbellLifts = pgTable("workout_barbell_lifts", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  barbellLiftId: integer("barbell_lift_id").notNull(),
  sourceType: varchar("source_type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Barbell Lifts Progress table for tracking user's 1RM-5RM progress
const barbellLiftsProgress = pgTable("barbell_lifts_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  barbellLiftId: integer("barbell_lift_id").notNull(),
  liftName: varchar("lift_name", { length: 100 }).notNull(),
  oneRm: jsonb("one_rm").default({}),
  twoRm: jsonb("two_rm").default({}),
  threeRm: jsonb("three_rm").default({}),
  fourRm: jsonb("four_rm").default({}),
  fiveRm: jsonb("five_rm").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout source enum for assignments
const workoutSourceEnum = pgEnum("workout_source", [
  "custom_user",
  "custom_community", 
  "girl_wod",
  "hero_wod",
  "notable"
]);

// Custom User Workouts - User-Level Custom Workouts
const customUserWorkouts = pgTable("custom_user_workouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  scoring: varchar("scoring", { length: 100 }).notNull(),
  timeCap: integer("time_cap"), // in seconds
  workoutDescription: text("workout_description").notNull(),
  relatedBenchmark: varchar("related_benchmark", { length: 255 }),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Community Workouts - Community-Level Custom Workouts
const customCommunityWorkouts = pgTable("custom_community_workouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  scoring: varchar("scoring", { length: 100 }).notNull(),
  timeCap: integer("time_cap"), // in seconds
  workoutDescription: text("workout_description").notNull(),
  relatedBenchmark: varchar("related_benchmark", { length: 255 }),
  communityId: integer("community_id").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User workout assignments - Maps workouts to dates for individual users
const userWorkoutAssignments = pgTable("user_workout_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  assignedDate: varchar("assigned_date").notNull(),
  workoutId: integer("workout_id").notNull(),
  workoutSource: workoutSourceEnum("workout_source").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community workout assignments - Maps workouts to dates for communities
const communityWorkoutAssignments = pgTable("community_workout_assignments", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  assignedDate: varchar("assigned_date").notNull(),
  workoutId: integer("workout_id").notNull(),
  workoutSource: workoutSourceEnum("workout_source").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Validation schemas (inline for production)
const insertWorkoutSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["for_time", "amrap", "emom", "tabata", "strength", "interval", "endurance", "chipper", "ladder", "unbroken"]),
  timeCap: z.number().nullable().optional(),
  totalEffort: z.number().nullable().optional(),
  createdBy: z.string(),
  communityId: z.number().nullable().optional(),
  isPublic: z.boolean().optional(),
});

const insertWorkoutLogSchema = z.object({
  userId: z.string(),
  workoutId: z.number(),
  date: z.string(),
  timeTaken: z.number().optional(),
  totalEffort: z.number().optional(),
  scaleType: z.string().default("rx"),
  finalScore: z.string().optional(),
  notes: z.string().optional(),
});

// Database initialization
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// CORS middleware
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://athlete-pro.vercel.app' : 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper functions for authentication
function createAuthToken(user: any, accountType: 'user' | 'admin') {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      accountType
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

function getAuthToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/auth-token=([^;]+)/);
    if (match) return match[1];
  }
  
  return null;
}

function setAuthCookie(res: VercelResponse, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';
  const sameSite = isProduction ? '; SameSite=None' : '; SameSite=Lax';
  
  res.setHeader('Set-Cookie', [
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}${secure}${sameSite}`,
  ]);
}

function clearAuthCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', [
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
  ]);
}

// Workout Parsing Algorithm (Production Version)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Enhanced Multi-Entity Workout Parsing for Production
async function parseWorkout(rawText: string, userId: string) {
  try {
    console.log('🚀 Starting Enhanced Multi-Entity Workout Parsing...');
    
    // Load workout database tables
    const girlWodsList = await db.select({
      id: girlWods.id,
      name: girlWods.name,
      workoutDescription: girlWods.workoutDescription,
      workoutType: girlWods.workoutType,
      scoring: girlWods.scoring,
      timeCap: girlWods.timeCap,
      totalEffort: girlWods.totalEffort,
      createdAt: girlWods.createdAt
    }).from(girlWods);
    
    const heroWodsList = await db.select({
      id: heroWods.id,
      name: heroWods.name,
      workoutDescription: heroWods.workoutDescription,
      workoutType: heroWods.workoutType,
      scoring: heroWods.scoring,
      timeCap: heroWods.timeCap,
      totalEffort: heroWods.totalEffort,
      createdAt: heroWods.createdAt
    }).from(heroWods);
    
    const notablesList = await db.select({
      id: notables.id,
      name: notables.name,
      workoutDescription: notables.workoutDescription,
      workoutType: notables.workoutType,
      scoring: notables.scoring,
      timeCap: notables.timeCap,
      totalEffort: notables.totalEffort,
      createdAt: notables.createdAt
    }).from(notables);
    
    const barbellLiftsList = await db.select().from(barbellLifts);

    // Step 1: Enhanced Input Preprocessing
    const cleanedInput = rawText.trim()
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+(?=\n)/g, '')
      .replace(/\n{3,}/g, '\n\n');

    if (!cleanedInput) {
      return {
        workoutFound: false,
        confidence: 0,
        matchedCategory: 'unknown',
        errors: ['Invalid or empty input provided'],
        suggestedWorkouts: []
      };
    }

    // Step 2: Enhanced Date Extraction
    const extractedDate = extractDateEnhanced(cleanedInput);

    // Step 3: Split into Entities using Enhanced Algorithm
    const entities = splitWODIntoEntitiesEnhanced(cleanedInput);
    console.log(`📊 Found ${entities.length} workout entities`);

    if (entities.length === 0) {
      return {
        workoutFound: false,
        confidence: 0,
        matchedCategory: 'unknown',
        errors: ['No workout entities could be identified'],
        suggestedWorkouts: []
      };
    }

    // Step 4: Parse Each Entity
    const parsedEntities: any[] = [];
    let overallConfidence = 0;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      // Parse as custom workout
      const customWorkout = parseAsCustomWorkoutEnhanced(entity, extractedDate, barbellLiftsList);
      parsedEntities.push(customWorkout);
      overallConfidence += 0.8;
    }

    const finalConfidence = Math.min(overallConfidence / entities.length, 1.0);

    // Maintain backward compatibility with single entity response
    const response: any = {
      workoutFound: true,
      confidence: finalConfidence,
      matchedCategory: parsedEntities.length === 1 ? parsedEntities[0].category || 'custom_user' : 'multi_entity',
      workoutEntities: parsedEntities,
      extractedDate,
      suggestedWorkouts: generateSuggestions(rawText, [...girlWodsList, ...heroWodsList, ...notablesList])
    };

    // For backward compatibility, add workoutData for single entity
    if (parsedEntities.length === 1) {
      response.workoutData = {
        name: parsedEntities[0].name,
        workoutDescription: parsedEntities[0].workoutDescription,
        workoutType: parsedEntities[0].workoutType,
        scoring: parsedEntities[0].scoring,
        timeCap: parsedEntities[0].timeCap,
        totalEffort: parsedEntities[0].totalEffort,
        barbellLifts: parsedEntities[0].barbellLifts,
        sourceTable: parsedEntities[0].sourceTable,
        databaseId: parsedEntities[0].databaseId
      };
    }

    return response;

  } catch (error) {
    console.error('Enhanced workout parsing error:', error);
    return {
      workoutFound: false,
      confidence: 0,
      matchedCategory: 'unknown',
      errors: [(error as Error).message],
      suggestedWorkouts: []
    };
  }
}

// Enhanced helper functions for production API
function extractDateEnhanced(input: string): string | undefined {
  let dateMatch: RegExpMatchArray | null = null;
  const lines = input.split('\n');
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (!dateMatch) {
      dateMatch = lines[i].match(/(\d{1,2}-\w+-\d{4})/) || lines[i].match(/\*(\d{2}-\w+-\d{4})/);
      if (dateMatch && dateMatch[2]) dateMatch[1] = dateMatch[2];
    }
  }

  return dateMatch ? dateMatch[1] : undefined;
}

function splitWODIntoEntitiesEnhanced(input: string): any[] {
  console.log('🚀 ENTITY SPLITTING: Starting enhanced multi-entity parsing');
  
  const lines = input.split('\n');
  const entities: any[] = [];
  
  // Remove date/day lines from the beginning
  let startIndex = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (isDateLineEnhanced(line) || line === '') {
      startIndex = i + 1;
    } else {
      break;
    }
  }

  console.log(`📋 Processing lines ${startIndex} to ${lines.length - 1}`);

  // Step 1: Identify all section boundaries
  const sectionBoundaries: Array<{
    index: number;
    name: string;
    type: string;
    line: string;
  }> = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.trim();
    
    if (!cleanLine || isDateLineEnhanced(cleanLine)) continue;
    
    // Check for section patterns
    let sectionName = '';
    let sectionType = '';
    
    // 1. Exact section headers: STRENGTH, WORKOUT, etc.
    if (cleanLine.match(/^(STRENGTH|WORKOUT|SKILL|GYMNASTICS|MINI-PUMP|ACCESSORY|METCON|WOD|CONDITIONING)$/i)) {
      sectionName = cleanLine.toUpperCase();
      sectionType = 'section_header';
      console.log(`🎯 Found section header at line ${i}: "${sectionName}"`);
    }
    // 2. Named workout pattern: "Workout : Name"
    else if (cleanLine.match(/^(workout|wod)\s*:\s*(.+)$/i)) {
      const match = cleanLine.match(/^(workout|wod)\s*:\s*(.+)$/i);
      sectionName = match![2].trim();
      sectionType = 'named_workout';
      console.log(`🎯 Found named workout at line ${i}: "${sectionName}"`);
    }
    // 3. All caps headers (selective)
    else if (cleanLine.match(/^[A-Z][A-Z\s&-]{2,}:?\s*$/) && 
             cleanLine.length > 3 && cleanLine.length < 50 &&
             !cleanLine.match(/\d+/) && 
             !cleanLine.match(/(REPS?|ROUNDS?|MINUTES?|SECONDS?)/)) {
      sectionName = cleanLine.replace(/[:\s]*$/, '').trim();
      sectionType = 'caps_header';
      console.log(`🎯 Found caps header at line ${i}: "${sectionName}"`);
    }
    
    if (sectionName && sectionType) {
      sectionBoundaries.push({
        index: i,
        name: sectionName,
        type: sectionType,
        line: cleanLine
      });
    }
  }

  console.log(`📋 Found ${sectionBoundaries.length} section boundaries:`);
  sectionBoundaries.forEach((boundary, idx) => {
    console.log(`   ${idx + 1}. Line ${boundary.index}: "${boundary.name}" (${boundary.type})`);
  });

  // Step 2: Create entities from sections
  console.log(`📋 Creating entities from ${sectionBoundaries.length} detected boundaries`);
  
  if (sectionBoundaries.length === 0) {
    // No sections found, treat entire input as one entity
    console.log('📋 No sections detected, creating single entity');
    const cleanText = lines.slice(startIndex).join('\n').trim();
    if (cleanText) {
      entities.push({
        rawText: cleanText,
        detectedName: extractWorkoutName(cleanText) || 'Custom Workout',
        sectionType: 'full_content'
      });
    }
  } else {
    // Handle multiple sections (including single section case)
    for (let i = 0; i < sectionBoundaries.length; i++) {
      const currentBoundary = sectionBoundaries[i];
      const nextBoundary = sectionBoundaries[i + 1];
      
      console.log(`📝 Processing boundary ${i + 1}/${sectionBoundaries.length}: "${currentBoundary.name}" at line ${currentBoundary.index}`);
      
      // Handle content before first section (only for first boundary)
      if (i === 0) {
        const preContentLines = lines.slice(startIndex, currentBoundary.index);
        const hasPreContent = preContentLines.some(line => line.trim() && !isDateLineEnhanced(line.trim()));
        
        if (hasPreContent) {
          const preContent = preContentLines.join('\n').trim();
          if (preContent) {
            const preEntityName = extractWorkoutName(preContent) || 'Pre-Section Content';
            entities.push({
              rawText: preContent,
              detectedName: preEntityName,
              sectionType: 'pre_content'
            });
            console.log(`📝 ✅ Created pre-section entity: "${preEntityName}"`);
          }
        }
      }
      
      // Create entity for current section
      const endIndex = nextBoundary ? nextBoundary.index : lines.length;
      const sectionLines = lines.slice(currentBoundary.index, endIndex);
      const sectionContent = sectionLines.join('\n').trim();
      
      if (sectionContent) {
        // Clean section content for better processing
        const cleanedSectionContent = sectionLines
          .filter(line => !isDateLineEnhanced(line.trim()))
          .join('\n')
          .trim();
          
        if (cleanedSectionContent) {
          entities.push({
            rawText: cleanedSectionContent,
            detectedName: currentBoundary.name,
            sectionType: currentBoundary.type
          });
          console.log(`📝 ✅ Created section entity: "${currentBoundary.name}"`);
          console.log(`   Content preview: "${cleanedSectionContent.substring(0, 100)}..."`);
        }
      }
    }
  }

  console.log(`✅ ENTITY SPLITTING COMPLETED: ${entities.length} entities created`);
  entities.forEach((entity, index) => {
    console.log(`   ${index + 1}. "${entity.detectedName}" (${entity.sectionType})`);
    console.log(`      Content: "${entity.rawText.substring(0, 100)}..."`);
  });

  return entities;
}

function isDateLineEnhanced(line: string): boolean {
  const datePatterns = [
    /\d{1,2}[-\/]\w+[-\/]\d{4}/i,
    /\w+\s+\d{1,2},?\s+\d{4}/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/,
    /\*\d{2}-\w+-\d{4}\|\w+\*/,
    /\d{1,2}-\w+-\d{4}\|\s*\w+/i
  ];

  return datePatterns.some(pattern => pattern.test(line));
}

function looksLikeWorkoutNameEnhanced(line: string, index: number, lines: string[]): boolean {
  if (line.length > 50) return false;
  if (/^\d/.test(line)) return false;
  if (/(reps|rounds|for time|amrap|emom|minutes?|seconds?|build to|cap:)/i.test(line)) return false;

  const isCapitalized = /^[A-Z]/.test(line);
  const hasWorkoutContentBelow = index + 1 < lines.length && 
    /(reps|rounds|for time|amrap|emom|\d+|build to)/i.test(lines[index + 1]);

  const isWorkoutNamePattern = /^[A-Z][a-zA-Z\s]+$/.test(line) && line.length < 30;

  return (isCapitalized && hasWorkoutContentBelow) || isWorkoutNamePattern;
}

async function identifyBenchmarkWorkoutEnhanced(input: string, girlWods: any[], heroWods: any[], notables: any[]) {
  const inputLower = input.toLowerCase();

  // Check Girl WODs first
  for (const workout of girlWods) {
    const nameMatch = calculateNameSimilarity(inputLower, workout.name.toLowerCase());
    const descMatch = calculateDescriptionSimilarity(inputLower, workout.workoutDescription.toLowerCase());
    
    if (nameMatch > 0.8 || descMatch > 0.7) {
      // Get barbell lifts from junction table
      const workoutLifts = await db.select({
        liftName: barbellLifts.liftName
      })
      .from(workoutBarbellLifts)
      .innerJoin(barbellLifts, eq(workoutBarbellLifts.barbellLiftId, barbellLifts.id))
      .where(and(
        eq(workoutBarbellLifts.workoutId, workout.id),
        eq(workoutBarbellLifts.sourceType, 'girl_wods')
      ));

      return {
        found: true,
        data: {
          name: workout.name,
          workoutDescription: workout.workoutDescription,
          workoutType: workout.workoutType,
          scoring: workout.scoring,
          timeCap: workout.timeCap,
          totalEffort: workout.totalEffort,
          barbellLifts: workoutLifts.map(lift => lift.liftName),
          sourceTable: 'girl_wods',
          databaseId: workout.id,
          category: 'girls'
        }
      };
    }
  }

  // Check Hero WODs
  for (const workout of heroWods) {
    const nameMatch = calculateNameSimilarity(inputLower, workout.name.toLowerCase());
    const descMatch = calculateDescriptionSimilarity(inputLower, workout.workoutDescription.toLowerCase());
    
    if (nameMatch > 0.8 || descMatch > 0.7) {
      // Get barbell lifts from junction table
      const workoutLifts = await db.select({
        liftName: barbellLifts.liftName
      })
      .from(workoutBarbellLifts)
      .innerJoin(barbellLifts, eq(workoutBarbellLifts.barbellLiftId, barbellLifts.id))
      .where(and(
        eq(workoutBarbellLifts.workoutId, workout.id),
        eq(workoutBarbellLifts.sourceType, 'hero_wods')
      ));

      return {
        found: true,
        data: {
          name: workout.name,
          workoutDescription: workout.workoutDescription,
          workoutType: workout.workoutType,
          scoring: workout.scoring,
          timeCap: workout.timeCap,
          totalEffort: workout.totalEffort,
          barbellLifts: workoutLifts.map(lift => lift.liftName),
          sourceTable: 'hero_wods',
          databaseId: workout.id,
          category: 'heroes'
        }
      };
    }
  }

  // Check Notables
  for (const workout of notables) {
    const nameMatch = calculateNameSimilarity(inputLower, workout.name.toLowerCase());
    const descMatch = calculateDescriptionSimilarity(inputLower, workout.workoutDescription.toLowerCase());
    
    if (nameMatch > 0.8 || descMatch > 0.7) {
      // Get barbell lifts from junction table
      const workoutLifts = await db.select({
        liftName: barbellLifts.liftName
      })
      .from(workoutBarbellLifts)
      .innerJoin(barbellLifts, eq(workoutBarbellLifts.barbellLiftId, barbellLifts.id))
      .where(and(
        eq(workoutBarbellLifts.workoutId, workout.id),
        eq(workoutBarbellLifts.sourceType, 'notables')
      ));

      return {
        found: true,
        data: {
          name: workout.name,
          workoutDescription: workout.workoutDescription,
          workoutType: workout.workoutType,
          scoring: workout.scoring,
          timeCap: workout.timeCap,
          totalEffort: workout.totalEffort,
          barbellLifts: workoutLifts.map(lift => lift.liftName),
          sourceTable: 'notables',
          databaseId: workout.id,
          category: 'notables'
        }
      };
    }
  }

  return { found: false };
}

function calculateNameSimilarity(input: string, target: string): number {
  if (input.includes(target) || target.includes(input)) {
    return 0.9;
  }
  return levenshteinDistance(input, target) / Math.max(input.length, target.length);
}

function calculateDescriptionSimilarity(input: string, target: string): number {
  const inputWords = input.split(/\s+/);
  const targetWords = target.split(/\s+/);
  
  let matchCount = 0;
  for (const word of inputWords) {
    if (word.length > 2 && targetWords.some(tw => tw.includes(word) || word.includes(tw))) {
      matchCount++;
    }
  }
  
  return matchCount / Math.max(inputWords.length, targetWords.length);
}

function parseAsCustomWorkoutEnhanced(entity: any, extractedDate?: string, barbellLifts?: any[]) {
  const name = entity.detectedName && entity.detectedName !== 'Custom Workout' 
    ? entity.detectedName 
    : extractWorkoutName(entity.rawText);
    
  const workoutDescription = cleanWorkoutDescriptionEnhanced(entity.rawText);
  const workoutType = detectWorkoutTypeEnhanced(entity.rawText.toLowerCase());
  const scoring = workoutType === 'for_time' ? 'Time' : workoutType === 'amrap' ? 'Rounds + Reps' : 'Points';
  const timeCap = extractTimeCap(entity.rawText);
  const totalEffort = calculateTotalEffortEnhanced(entity.rawText);
  const barbellLiftsFound = identifyBarbellLifts(entity.rawText, barbellLifts || []);

  return {
    name,
    workoutDescription,
    workoutType,
    scoring,
    timeCap,
    totalEffort,
    barbellLifts: barbellLiftsFound,
    sourceTable: 'custom',
    databaseId: null,
    category: 'custom_user'
  };
}

function cleanWorkoutDescriptionEnhanced(rawText: string): string {
  const lines = rawText.split('\n');
  const cleanedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (i === 0 && (
      /^(STRENGTH|CONDITIONING|METCON|SKILL|WARM-UP|COOL-DOWN)$/i.test(line) || 
      /^(workout|wod)\s*:\s*/i.test(line) ||
      /^[A-Z][A-Z\s&-]+:?$/.test(line)
    )) {
      continue;
    }
    
    if (line) {
      cleanedLines.push(line);
    }
  }
  
  return cleanedLines.join('\n').trim() || rawText.trim();
}

function detectWorkoutTypeEnhanced(cleanText: string): string {
  if (cleanText.includes('for time') || cleanText.includes('rft')) return 'for_time';
  if (cleanText.includes('amrap')) return 'amrap';
  if (cleanText.includes('emom')) return 'emom';
  if (cleanText.includes('tabata')) return 'tabata';
  if (cleanText.includes('build to') || cleanText.includes('rm')) return 'strength';
  if (cleanText.includes('max effort')) return 'strength';
  
  return 'for_time';
}

function calculateTotalEffortEnhanced(input: string): number {
  let totalEffort = 0;
  
  const repMatches = input.match(/(\d+)\s*(?:reps?|x)/gi);
  if (repMatches) {
    repMatches.forEach(match => {
      const num = parseInt(match.match(/\d+/)?.[0] || '0');
      totalEffort += num;
    });
  }

  const roundMatches = input.match(/(\d+)\s*rounds?/gi);
  if (roundMatches) {
    const rounds = parseInt(roundMatches[0].match(/\d+/)?.[0] || '1');
    totalEffort *= rounds;
  }

  if (input.toLowerCase().includes('build to') || input.toLowerCase().includes('rm')) {
    return 150;
  }

  return Math.max(totalEffort, 50);
}

// Helper functions for PRD parsing
function extractWorkoutName(rawText: string): string {
  const namePatterns = [
    /workout\s*[:\-]\s*(.+)/i,
    /wod\s*[:\-]\s*(.+)/i,
    /^([A-Za-z][A-Za-z\s]+)$/m
  ];

  for (const pattern of namePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }

  return 'Custom Workout';
}

function detectWorkoutType(cleanText: string): string {
  if (cleanText.includes('for time') || cleanText.includes('rft')) return 'for_time';
  if (cleanText.includes('amrap')) return 'amrap';
  if (cleanText.includes('emom')) return 'emom';
  if (cleanText.includes('strength') || cleanText.includes('1rm') || cleanText.includes('max')) return 'strength';
  if (cleanText.includes('tabata')) return 'tabata';
  if (cleanText.includes('interval')) return 'interval';
  
  return 'for_time'; // default
}

function extractTimeCap(rawText: string): number | null {
  const timeCapMatch = rawText.match(/(?:cap|time cap)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
  return timeCapMatch ? parseInt(timeCapMatch[1]) * 60 : null;
}

function identifyBarbellLifts(rawText: string, barbellLifts: any[]): Array<{ id: number; liftName: string; category: string; liftType: string }> {
  const found: Array<{ id: number; liftName: string; category: string; liftType: string }> = [];
  const cleanText = rawText.toLowerCase();
  
  for (const lift of barbellLifts) {
    if (cleanText.includes(lift.liftName.toLowerCase())) {
      found.push({
        id: lift.id,
        liftName: lift.liftName,
        category: lift.category,
        liftType: lift.liftType
      });
    }
  }
  
  return found;
}

function calculateTotalEffort(rawText: string): number {
  const numbers = rawText.match(/\d+/g);
  return numbers ? numbers.reduce((sum, num) => sum + parseInt(num), 0) : 100;
}

function generateSuggestions(rawText: string, allWorkouts: any[]): string[] {
  const suggestions: string[] = [];
  const cleanText = rawText.toLowerCase();
  
  for (const workout of allWorkouts) {
    const distance = levenshteinDistance(cleanText.substring(0, 20), workout.name.toLowerCase());
    if (distance <= 3) {
      suggestions.push(workout.name);
    }
  }
  
  return suggestions.slice(0, 3);
}

// Helper function for category labels (PRD)
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'girls': '💪 Girl WOD',
    'heroes': '🎖️ Hero WOD', 
    'notables': '⭐ Notable WOD',
    'custom_community': '🏘️ Community WOD',
    'custom_user': '👤 User WOD',
    'new_custom': '🔧 Custom Workout'
  };
  return labels[category] || '❓ Unknown';
}

// Unified Production API Handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, url } = req;
    const pathname = url?.split('?')[0] || '';

    // ==================== AUTHENTICATION ROUTES ====================
    
    // User Signup
    if (method === 'POST' && (pathname === '/api/auth/user/signup' || pathname === '/api/auth/signup')) {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      const newUser = await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username: `${firstName}${lastName}`.toLowerCase(),
        isRegistered: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const token = createAuthToken(newUser[0], 'user');
      setAuthCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          username: newUser[0].username
        },
        redirectUrl: '/athlete/dashboard'
      });
    }

    // User Signin
    if (method === 'POST' && (pathname === '/api/auth/user/signin' || pathname === '/api/auth/signin')) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      let user;
      if (email.includes('@')) {
        user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      } else {
        user = await db.select().from(users).where(eq(users.phoneNumber, email)).limit(1);
      }

      if (user.length === 0 || !user[0].password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = createAuthToken(user[0], 'user');
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          username: user[0].username,
          role: user[0].role
        },
        redirectUrl: '/athlete/dashboard'
      });
    }

    // Admin Signup
    if (method === 'POST' && pathname === '/api/auth/admin/signup') {
      const { email, password, role, firstName, lastName } = req.body;

      if (!email || !password || !role || !firstName || !lastName) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const existingAdmin = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
      if (existingAdmin.length > 0) {
        return res.status(400).json({ success: false, error: 'Admin user already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const adminId = crypto.randomUUID();

      const newAdmin = await db.insert(admins).values({
        id: adminId,
        email,
        password: hashedPassword,
        role: role as 'coach' | 'community_manager',
        firstName,
        lastName,
        isRegistered: true,
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const token = createAuthToken(newAdmin[0], 'admin');
      setAuthCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: newAdmin[0].id,
          email: newAdmin[0].email,
          role: newAdmin[0].role,
          firstName: newAdmin[0].firstName,
          lastName: newAdmin[0].lastName
        },
        redirectUrl: '/admin/console'
      });
    }

    // Admin Signin
    if (method === 'POST' && pathname === '/api/auth/admin/signin') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const admin = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
      if (admin.length === 0 || !admin[0].password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, admin[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = createAuthToken(admin[0], 'admin');
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
          id: admin[0].id,
          email: admin[0].email,
          role: admin[0].role,
          firstName: admin[0].firstName,
          lastName: admin[0].lastName
        },
        redirectUrl: '/coach/dashboard'
      });
    }

    // Session Check
    if (method === 'GET' && pathname === '/api/auth/session') {
      const token = getAuthToken(req);
      
      if (token) {
        const userData = verifyAuthToken(token);
        if (userData) {
          const responseData = {
            authenticated: true,
            accountType: userData.accountType,
            hasLinkedAccount: false,
            linkedAccountRole: null
          };

          if (userData.accountType === 'user') {
            return res.status(200).json({
              ...responseData,
              user: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                role: userData.role
              },
              admin: null
            });
          } else {
            return res.status(200).json({
              ...responseData,
              user: null,
              admin: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                role: userData.role
              }
            });
          }
        }
      }

      return res.status(200).json({
        authenticated: false,
        user: null,
        admin: null,
        accountType: null,
        hasLinkedAccount: false,
        linkedAccountRole: null
      });
    }

    // Logout
    if (method === 'POST' && pathname === '/api/auth/logout') {
      clearAuthCookie(res);
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    // ==================== GOOGLE OAUTH ROUTES ====================

    // Google OAuth Login (Continue with Google)
    if (method === 'GET' && pathname === '/auth/login') {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'https://athlete-pro.vercel.app/auth/callback')}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      res.setHeader('Location', googleAuthUrl);
      return res.status(302).end();
    }

    // Google OAuth Callback
    if (method === 'GET' && pathname === '/auth/callback') {
      const { code, state, error } = req.query;
      
      if (error) {
        console.error('OAuth error:', error);
        res.setHeader('Location', '/?error=oauth_failed');
        return res.status(302).end();
      }

      if (!code) {
        console.error('No authorization code received');
        res.setHeader('Location', '/?error=no_code');
        return res.status(302).end();
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'https://athlete-pro.vercel.app/auth/callback'
          })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
          console.error('Failed to get access token:', tokenData);
          res.setHeader('Location', '/?error=token_failed');
          return res.status(302).end();
        }

        // Get user info from Google
        const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });

        const googleUser = await userResponse.json();
        
        if (!googleUser.email) {
          console.error('No email in Google user data:', googleUser);
          res.setHeader('Location', '/?error=no_email');
          return res.status(302).end();
        }

        // Check if user exists, create if not
        let existingUser = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);
        
        let user;
        if (existingUser.length > 0) {
          // Update existing user
          const updatedUser = await db.update(users)
            .set({
              firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
              lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser[0].id))
            .returning();
          
          user = updatedUser[0];
        } else {
          // Create new user
          const userId = crypto.randomUUID();
          const newUser = await db.insert(users).values({
            id: userId,
            email: googleUser.email,
            firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
            lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
            username: `${googleUser.given_name || 'user'}${googleUser.family_name || Math.random().toString(36).substring(7)}`.toLowerCase(),
            isRegistered: true,
            registeredAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();
          
          user = newUser[0];
        }

        // Create auth token and set cookie
        const token = createAuthToken(user, 'user');
        setAuthCookie(res, token);

        // Redirect to success page
        res.setHeader('Location', '/?authenticated=true');
        return res.status(302).end();

      } catch (error) {
        console.error('OAuth callback error:', error);
        res.setHeader('Location', '/?error=callback_failed');
        return res.status(302).end();
      }
    }

    // Check Authentication Status (/auth/me) - Consistent with session endpoint
    if (method === 'GET' && pathname === '/auth/me') {
      const token = getAuthToken(req);
      
      if (token) {
        const userData = verifyAuthToken(token);
        if (userData) {
          const responseData = {
            authenticated: true,
            accountType: userData.accountType,
            hasLinkedAccount: false,
            linkedAccountRole: null
          };

          if (userData.accountType === 'user') {
            return res.status(200).json({
              ...responseData,
              user: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                role: userData.role,
                accountType: 'user'
              },
              admin: null
            });
          } else {
            return res.status(200).json({
              ...responseData,
              user: null,
              admin: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                role: userData.role,
                accountType: 'admin'
              }
            });
          }
        }
      }

      return res.status(200).json({
        authenticated: false,
        user: null,
        admin: null,
        accountType: null,
        hasLinkedAccount: false,
        linkedAccountRole: null
      });
    }

    // Google OAuth Logout
    if (method === 'POST' && pathname === '/auth/logout') {
      clearAuthCookie(res);
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    // ==================== WORKOUT ROUTES ====================

    // Parse Workout (Multi-Entity Algorithm)
    if (method === 'POST' && pathname === '/api/workouts/parse') {
      const { rawText } = req.body;
      
      if (!rawText) {
        return res.status(400).json({ 
          success: false,
          workoutFound: false,
          workoutEntities: [],
          confidence: 0,
          errors: ["Workout text is required"]
        });
      }

      try {
        const token = getAuthToken(req);
        const userData = token ? verifyAuthToken(token) : null;
        
        // Use the enhanced multi-entity parsing function
        const result = await parseWorkout(rawText, userData?.id || 'anonymous-user');
        
        if (result.workoutFound) {
          // Handle new multi-entity response structure
          if (result.workoutEntities && Array.isArray(result.workoutEntities)) {
            const transformedEntities = result.workoutEntities.map((entity: any) => ({
              name: entity.name,
              workoutDescription: entity.workoutDescription,
              type: entity.workoutType,
              scoring: entity.scoring,
              timeCap: entity.timeCap,
              totalEffort: entity.totalEffort,
              barbellLifts: Array.isArray(entity.barbellLifts) ? entity.barbellLifts : [],
              relatedBenchmark: entity.sourceTable !== 'custom' ? entity.name : entity.relatedBenchmark,
              category: entity.category || 'custom_user',
              sourceTable: entity.sourceTable,
              databaseId: entity.databaseId
            }));

            // Get all barbell lifts for frontend dropdown
            const allBarbellLifts = await db.select().from(barbellLifts);
            
            return res.status(200).json({
              success: true,
              workoutFound: true,
              workoutEntities: transformedEntities,
              extractedDate: result.extractedDate || null,
              confidence: Math.round(result.confidence * 100),
              suggestedWorkouts: result.suggestedWorkouts || [],
              allBarbellLifts: allBarbellLifts // Include all available lifts for frontend dropdown
            });
          }
          // Handle backward compatibility for single entity (workoutData)
          else if (result.workoutData) {
            const workoutEntity = {
              name: result.workoutData.name,
              workoutDescription: result.workoutData.workoutDescription,
              type: result.workoutData.workoutType,
              scoring: result.workoutData.scoring,
              timeCap: result.workoutData.timeCap,
              totalEffort: result.workoutData.totalEffort,
              barbellLifts: result.workoutData.barbellLifts || [],
              relatedBenchmark: result.workoutData.sourceTable !== 'custom' ? result.workoutData.name : null,
              category: result.matchedCategory === 'girls' ? 'girls' : 
                       result.matchedCategory === 'heroes' ? 'heroes' : 
                       result.matchedCategory === 'notables' ? 'notables' : 'custom_user',
              sourceTable: result.workoutData.sourceTable,
              databaseId: result.workoutData.databaseId
            };
            
            return res.status(200).json({
              success: true,
              workoutFound: true,
              workoutEntities: [workoutEntity],
              extractedDate: null,
              confidence: Math.round(result.confidence * 100),
              suggestedWorkouts: result.suggestedWorkouts || []
            });
          }
        }
        
        // Get all barbell lifts for frontend dropdown even when parsing fails
        const allBarbellLifts = await db.select().from(barbellLifts);
        
        return res.status(200).json({
          success: false,
          workoutFound: false,
          workoutEntities: [],
          extractedDate: null,
          confidence: 0,
          errors: result.errors || ["No workout entities found"],
          suggestedWorkouts: result.suggestedWorkouts || [],
          allBarbellLifts: allBarbellLifts
        });
      } catch (error) {
        console.error('Multi-entity workout parsing error:', error);
        return res.status(500).json({
          success: false,
          workoutFound: false,
          workoutEntities: [],
          confidence: 0,
          errors: ['Failed to parse workout: ' + (error as Error).message],
          allBarbellLifts: []
        });
      }
    }

    // Create Workout (Single or Multiple Entities)
    if (method === 'POST' && pathname === '/api/workouts') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { workoutEntities, ...singleWorkoutData } = req.body;

        // Helper function to insert barbell lifts for a workout
        const insertBarbellLifts = async (workoutId: number, liftData: any[], sourceType: string) => {
          if (liftData && liftData.length > 0) {
            console.log(`Inserting ${liftData.length} barbell lifts for workout ${workoutId}`);
            
            for (const liftItem of liftData) {
              let liftName: string;
              let liftId: number | null = null;
              
              // Handle both string and object formats
              if (typeof liftItem === 'string') {
                liftName = liftItem;
              } else if (typeof liftItem === 'object' && liftItem.liftName) {
                liftName = liftItem.liftName;
                liftId = liftItem.id || null;
              } else {
                console.log(`⚠️ Invalid barbell lift format:`, liftItem);
                continue;
              }
              
              // If we don't have the ID, look it up by name
              if (!liftId) {
                const lift = await db.select({ id: barbellLifts.id })
                  .from(barbellLifts)
                  .where(eq(barbellLifts.liftName, liftName))
                  .limit(1);
                
                if (lift.length > 0) {
                  liftId = lift[0].id;
                } else {
                  console.log(`⚠️ Barbell lift not found: ${liftName}`);
                  continue;
                }
              }
              
              // Insert the barbell lift relationship
              try {
                await db.insert(workoutBarbellLifts).values({
                  workoutId: workoutId,
                  barbellLiftId: liftId,
                  sourceType: sourceType
                });
                console.log(`✅ Inserted barbell lift: ${liftName} (ID: ${liftId}) for workout ${workoutId}`);
              } catch (error) {
                console.log(`❌ Error inserting barbell lift ${liftName}:`, error);
              }
            }
          }
        };

        // Check if this is a multi-entity request (array of workout entities)
        if (workoutEntities && Array.isArray(workoutEntities)) {
          console.log(`Creating ${workoutEntities.length} workout entities`);
          
          const createdWorkouts: any[] = [];
          
          for (let i = 0; i < workoutEntities.length; i++) {
            const entity = workoutEntities[i];
            // Transform entity to match custom user workouts schema
            const customWorkoutData = {
              name: entity.name,
              workoutType: entity.type || entity.workoutType,
              scoring: entity.scoring || (entity.type === 'for_time' ? 'Time' : entity.type === 'amrap' ? 'Rounds + Reps' : 'Points'),
              timeCap: entity.timeCap,
              workoutDescription: entity.workoutDescription || entity.description,
              relatedBenchmark: entity.relatedBenchmark || null,
              userId: userData.id
            };
            
            const newWorkout = await db.insert(customUserWorkouts).values(customWorkoutData).returning();
            
            // Insert barbell lifts into junction table
            await insertBarbellLifts(newWorkout[0].id, entity.barbellLifts || [], 'custom_user_workouts');
            
            createdWorkouts.push(newWorkout[0]);
            console.log(`✅ Created custom workout: "${newWorkout[0].name}" (ID: ${newWorkout[0].id})`);
          }
          
          return res.status(201).json({
            success: true,
            message: `Successfully created ${createdWorkouts.length} custom workouts`,
            workouts: createdWorkouts,
            count: createdWorkouts.length
          });
        } 
        // Handle single workout creation (backward compatibility) - use custom_user_workouts
        else {
          console.log('Processing single workout creation');
          
          // Transform single workout to custom user workouts schema
          const customWorkoutData = {
            name: singleWorkoutData.name,
            workoutType: singleWorkoutData.type,
            scoring: singleWorkoutData.scoring || (singleWorkoutData.type === 'for_time' ? 'Time' : singleWorkoutData.type === 'amrap' ? 'Rounds + Reps' : 'Points'),
            timeCap: singleWorkoutData.timeCap,
            workoutDescription: singleWorkoutData.description,
            relatedBenchmark: singleWorkoutData.relatedBenchmark || null,
            userId: userData.id
          };
          
          const newWorkout = await db.insert(customUserWorkouts).values(customWorkoutData).returning();
          
          // Insert barbell lifts into junction table
          await insertBarbellLifts(newWorkout[0].id, singleWorkoutData.barbellLifts || [], 'custom_user_workouts');
          
          console.log(`✅ Created single custom workout: "${newWorkout[0].name}" (ID: ${newWorkout[0].id})`);
          
          return res.status(201).json({
            success: true,
            message: 'Custom workout created successfully',
            workout: newWorkout[0]
          });
        }
      } catch (error) {
        console.error('Create workout error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            success: false,
            message: "Invalid input", 
            errors: error.errors 
          });
        }
        return res.status(500).json({ 
          success: false,
          message: "Failed to create workout(s)",
          error: (error as Error).message 
        });
      }
    }

    // Get My Workouts
    if (method === 'GET' && pathname === '/api/workouts/my') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const userWorkouts = await db.select().from(customUserWorkouts)
          .where(eq(customUserWorkouts.userId, userData.id))
          .orderBy(desc(customUserWorkouts.createdAt));
        
        // Normalize field names for frontend compatibility
        const normalizedWorkouts = userWorkouts.map(workout => ({
          ...workout,
          description: workout.workoutDescription, // Map workoutDescription to description
          type: workout.workoutType, // Map workoutType to type
          createdBy: workout.userId // Map userId to createdBy for compatibility
        }));
        
        return res.json(normalizedWorkouts);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch workouts" });
      }
    }

    // Create Workout Log
    if (method === 'POST' && pathname === '/api/workout-logs') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const logData = insertWorkoutLogSchema.parse({
          ...req.body,
          userId: userData.id
        });
        
        const newLog = await db.insert(workoutLogs).values(logData).returning();
        return res.json(newLog[0]);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        return res.status(500).json({ message: "Failed to create workout log" });
      }
    }

    // Get My Workout Logs
    if (method === 'GET' && pathname === '/api/workout-logs/my') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        // First get the workout logs
        const userLogs = await db.select().from(workoutLogs)
          .where(eq(workoutLogs.userId, userData.id))
          .orderBy(desc(workoutLogs.date));

        // Then get workout details for each log and combine the data
        const logsWithWorkouts = await Promise.all(
          userLogs.map(async (log) => {
            const workout = await db.select().from(workouts)
              .where(eq(workouts.id, log.workoutId))
              .limit(1);
            
            return {
              ...log,
              workout: workout[0] || { 
                name: 'Unknown Workout', 
                description: 'Workout details not found',
                type: 'for_time'
              },
              // Add human readable score if not present
              humanReadableScore: log.finalScore
            };
          })
        );

        return res.json(logsWithWorkouts);
      } catch (error) {
        console.error('Error fetching workout logs:', error);
        return res.status(500).json({ message: "Failed to fetch workout logs" });
      }
    }

    // Get Progress Insights
    if (method === 'GET' && pathname === '/api/progress/insights') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const userWorkoutLogs = await db.select().from(workoutLogs)
          .where(eq(workoutLogs.userId, userData.id))
          .orderBy(desc(workoutLogs.date));

        // Generate real insights based on data
        const totalWorkouts = userWorkoutLogs.length;
        const recentWorkouts = userWorkoutLogs.slice(0, 7);
        const currentStreak = calculateStreak(recentWorkouts);
        const personalRecords = await generatePersonalRecords(userData.id);

        // Get recent progress with workout details
        let recentProgress: Array<{
          date: string;
          workout: { name: string; type: string };
          finalScore: number;
          humanReadableScore: string;
        }> = [];

        if (userWorkoutLogs.length > 0) {
          try {
            recentProgress = await Promise.all(
              userWorkoutLogs.slice(0, 10).map(async (log) => {
                const workout = await db.select().from(workouts)
                  .where(eq(workouts.id, log.workoutId))
                  .limit(1);
                
                return {
                  date: log.date,
                  workout: workout[0] || { 
                    name: 'Unknown Workout', 
                    type: 'for_time'
                  },
                  finalScore: parseInt(log.finalScore || '0') || 0,
                  humanReadableScore: log.finalScore || 'N/A'
                };
              })
            );
          } catch (error) {
            console.error('Error fetching recent progress:', error);
            recentProgress = [];
          }
        }

        // Calculate favorite workout type
        const workoutTypes = recentProgress.map(p => p.workout.type);
        const favoriteWorkoutType = workoutTypes.length > 0 
          ? workoutTypes.reduce((a, b, i, arr) =>
              (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)
            )
          : 'for_time';

        // Calculate average score
        const scores = recentProgress.map(p => p.finalScore).filter(s => s > 0);
        const averageScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;

        // Ensure personalRecords is always an array
        const safePersonalRecords = Array.isArray(personalRecords) ? personalRecords : [];

        const insights = {
          totalWorkouts,
          currentStreak,
          longestStreak: Math.max(currentStreak, 0),
          favoriteWorkoutType,
          averageScore,
          personalRecords: safePersonalRecords,
          recentProgress: recentProgress,
          weeklyProgress: calculateWeeklyProgress(recentWorkouts),
          recommendedWorkouts: ['Fran', 'Helen', 'Grace']
        };

        return res.json(insights);
      } catch (error) {
        console.error('Error generating insights:', error);
        return res.status(500).json({ message: "Failed to generate insights" });
      }
    }

    // Get My Olympic Lifts
    if (method === 'GET' && pathname === '/api/olympic-lifts/my') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const userLifts = await db.select().from(olympicLifts)
          .where(eq(olympicLifts.userId, userData.id))
          .orderBy(desc(olympicLifts.date));
        return res.json(userLifts);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch Olympic lifts" });
      }
    }

    // Get Specific Workout by ID
    if (method === 'GET' && pathname.match(/^\/api\/workouts\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const workoutId = parseInt(pathname.split('/').pop()!);
        const workout = await db.select().from(workouts).where(eq(workouts.id, workoutId)).limit(1);
        
        if (workout.length === 0) {
          return res.status(404).json({ message: "Workout not found" });
        }
        
        return res.json(workout[0]);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch workout" });
      }
    }

    // Bulk Workout Creation
    if (method === 'POST' && pathname === '/api/workouts/bulk') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { parsedWorkouts, communityId } = req.body;
        
        if (!parsedWorkouts || !Array.isArray(parsedWorkouts)) {
          return res.status(400).json({ message: "parsedWorkouts array is required" });
        }
        
        const createdWorkouts: any[] = [];
        for (const parsed of parsedWorkouts) {
          const workoutData = insertWorkoutSchema.parse({
            name: parsed.name,
            description: parsed.description,
            type: parsed.type,
            timeCap: parsed.timeCap,
            totalEffort: parsed.totalEffort,
            barbellLifts: parsed.barbellLifts,
            createdBy: userData.id,
            communityId: communityId
          });
          
          const workout = await db.insert(workouts).values(workoutData).returning();
          createdWorkouts.push(workout[0]);
        }
        
        return res.json({
          workouts: createdWorkouts,
          count: createdWorkouts.length
        });
      } catch (error) {
        return res.status(500).json({ message: "Failed to create workouts" });
      }
    }

    // Get Community Workouts
    if (method === 'GET' && pathname === '/api/workouts/community') {
      return res.json([]);
    }

    // Get Community Workouts by ID
    if (method === 'GET' && pathname.match(/^\/api\/workouts\/community\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      try {
        const communityId = parseInt(pathname.split('/').pop()!);
        if (isNaN(communityId)) {
          return res.json([]);
        }
        
        const communityWorkouts = await db.select().from(workouts)
          .where(eq(workouts.communityId, communityId))
          .orderBy(desc(workouts.createdAt));
        return res.json(communityWorkouts);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch community workouts" });
      }
    }

    // Get Community Workout Logs
    if (method === 'GET' && pathname.match(/^\/api\/workout-logs\/community\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      try {
        const communityId = parseInt(pathname.split('/').pop()!);
        const { date } = req.query;
        
        // This would need community membership joining in a real implementation
        const logs = await db.select().from(workoutLogs)
          .orderBy(desc(workoutLogs.createdAt))
          .limit(50);
        return res.json(logs);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch community workout logs" });
      }
    }

    // Get Olympic Lift Progress
    if (method === 'GET' && pathname.match(/^\/api\/olympic-lifts\/progress\/[^\/]+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const liftName = pathname.split('/').pop()!;
        const progress = await db.select().from(olympicLifts)
          .where(and(eq(olympicLifts.userId, userData.id), eq(olympicLifts.liftName, liftName)))
          .orderBy(desc(olympicLifts.date));
        return res.json(progress);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch lift progress" });
      }
    }

    // Get Community Leaderboard
    if (method === 'GET' && pathname.match(/^\/api\/leaderboard\/community\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      try {
        const communityId = parseInt(pathname.split('/').pop()!);
        const { workout, date } = req.query;
        
        // Mock leaderboard data for now
        const rankings = [
          { userId: 'user1', name: 'John Doe', score: '12:34', rank: 1 },
          { userId: 'user2', name: 'Jane Smith', score: '13:45', rank: 2 }
        ];
        
        return res.json(rankings);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch leaderboard" });
      }
    }

    // Get Barbell Lifts for Workout
    if (method === 'GET' && pathname.match(/^\/api\/workouts\/\d+\/barbell-lifts$/)) {
      try {
        const workoutIdMatch = pathname.match(/\/api\/workouts\/(\d+)\/barbell-lifts$/);
        if (!workoutIdMatch) {
          return res.status(400).json({ error: 'Invalid workout ID' });
        }

        const workoutId = parseInt(workoutIdMatch[1]);
        const { source } = req.query;

        if (!source) {
          return res.status(400).json({ 
            error: 'Missing required parameter: source' 
          });
        }

        if (isNaN(workoutId)) {
          return res.status(400).json({ 
            error: 'Invalid workoutId - must be a number' 
          });
        }

        // Get barbell lifts associated with this workout
        const result = await db
          .select({
            id: barbellLifts.id,
            liftName: barbellLifts.liftName,
          })
          .from(workoutBarbellLifts)
          .innerJoin(barbellLifts, eq(workoutBarbellLifts.barbellLiftId, barbellLifts.id))
          .where(
            and(
              eq(workoutBarbellLifts.workoutId, workoutId),
              eq(workoutBarbellLifts.sourceType, source as string)
            )
          )
          .orderBy(barbellLifts.liftName);

        return res.status(200).json(result);

      } catch (error) {
        console.error('Error fetching workout barbell lifts:', error);
        
        if (error instanceof Error) {
          return res.status(500).json({ 
            error: 'Failed to fetch barbell lifts',
            details: error.message
          });
        }
        
        return res.status(500).json({ 
          error: 'Internal server error occurred while fetching barbell lifts'
        });
      }
    }

    // Log Workout Results (Progress Tracking Algorithm)
    if (method === 'POST' && pathname === '/api/workouts/log-workout') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const {
          workoutId,
          workoutSource,
          date,
          workoutName,
          workoutType,
          timeCap,
          timeTaken,
          totalEffort,
          humanReadableScore,
          barbellLiftDetails,
          scaleType,
          scaleDescription,
          notes
        } = req.body;

        console.log('Received workout log data:', {
          workoutId,
          workoutSource,
          date,
          workoutName,
          workoutType,
          totalEffort
        });

        // Validate required fields
        if (!workoutId || !workoutSource || !date || !workoutName || !workoutType) {
          console.error('Missing required fields. Received:', {
            workoutId: !!workoutId,
            workoutSource: !!workoutSource,
            date: !!date,
            workoutName: !!workoutName,
            workoutType: !!workoutType
          });
          return res.status(400).json({ 
            error: 'Missing required fields: workoutId, workoutSource, date, workoutName, workoutType',
            received: {
              workoutId: !!workoutId,
              workoutSource: !!workoutSource,
              date: !!date,
              workoutName: !!workoutName,
              workoutType: !!workoutType
            }
          });
        }

        if (!totalEffort || totalEffort <= 0) {
          return res.status(400).json({ 
            error: 'Missing required field: totalEffort (must be > 0)' 
          });
        }

        // Determine if workout was finished based on workout type and time
        let finishedWorkout = true;
        if (workoutType !== 'amrap' && timeCap && timeTaken && timeTaken >= timeCap) {
          finishedWorkout = false;
        }

        // Calculate final score using basic algorithm (simplified for production)
        let finalScore = 0;
        if (workoutType === 'amrap') {
          finalScore = totalEffort;
        } else if (workoutType === 'for_time') {
          if (timeCap && timeTaken) {
            finalScore = Math.max(0, (timeCap - timeTaken) * totalEffort / 100);
          } else {
            finalScore = totalEffort;
          }
        } else {
          finalScore = totalEffort;
        }

        console.log(`Calculated final score: ${finalScore} for ${workoutType} workout`);

        // Insert workout log
        const workoutLogResult = await db.insert(workoutLogs).values({
          userId: userData.id,
          workoutId,
          date,
          timeTaken,
          totalEffort,
          scaleType,
          notes,
          finalScore: finalScore.toString()
        }).returning({ id: workoutLogs.id });

        const workoutLogId = workoutLogResult[0].id;

        // Update barbell lifts progress if there are barbell lift details
        if (barbellLiftDetails && typeof barbellLiftDetails === 'object' && barbellLiftDetails !== null) {
          const barbellLiftDetailsObj = barbellLiftDetails as Record<string, Record<string, number>>;
          
          if (Object.keys(barbellLiftDetailsObj).length > 0) {
            try {
              // Inline Progress Tracker functionality for Vercel compatibility
              // Get barbell lifts associated with this workout
              const workoutLifts = await db
                .select({
                  barbellLiftId: workoutBarbellLifts.barbellLiftId,
                  liftName: barbellLifts.liftName,
                })
                .from(workoutBarbellLifts)
                .innerJoin(barbellLifts, eq(workoutBarbellLifts.barbellLiftId, barbellLifts.id))
                .where(
                  and(
                    eq(workoutBarbellLifts.workoutId, workoutId),
                    eq(workoutBarbellLifts.sourceType, workoutSource)
                  )
                );

              for (const [liftName, weightReps] of Object.entries(barbellLiftDetailsObj)) {
              // Find the corresponding barbell lift
              const workoutLift = workoutLifts.find(
                lift => lift.liftName.toLowerCase() === liftName.toLowerCase()
              );

              if (!workoutLift) {
                continue;
              }

              // Get or create progress record for this user and lift
              let progressRecord = await db
                .select()
                .from(barbellLiftsProgress)
                .where(
                  and(
                    eq(barbellLiftsProgress.userId, userData.id),
                    eq(barbellLiftsProgress.barbellLiftId, workoutLift.barbellLiftId)
                  )
                )
                .limit(1);

              if (progressRecord.length === 0) {
                // Create new progress record
                await db.insert(barbellLiftsProgress).values({
                  userId: userData.id,
                  barbellLiftId: workoutLift.barbellLiftId,
                  liftName: workoutLift.liftName,
                  oneRm: {},
                  twoRm: {},
                  threeRm: {},
                  fourRm: {},
                  fiveRm: {},
                });

                // Fetch the newly created record
                progressRecord = await db
                  .select()
                  .from(barbellLiftsProgress)
                  .where(
                    and(
                      eq(barbellLiftsProgress.userId, userData.id),
                      eq(barbellLiftsProgress.barbellLiftId, workoutLift.barbellLiftId)
                    )
                  )
                  .limit(1);
              }

              const currentProgress = progressRecord[0];

              // Update RM records based on the algorithm
              for (const [weight, maxReps] of Object.entries(weightReps)) {
                const weightNum = parseFloat(weight);
                const reps = parseInt(maxReps.toString());

                if (isNaN(weightNum) || isNaN(reps) || reps <= 0 || reps > 5) {
                  continue;
                }

                // Update all rep maxes from 1RM to current reps
                const updates: Record<string, any> = {};

                for (let repMax = 1; repMax <= reps; repMax++) {
                  let rmField: string;
                  switch (repMax) {
                    case 1: rmField = 'oneRm'; break;
                    case 2: rmField = 'twoRm'; break;
                    case 3: rmField = 'threeRm'; break;
                    case 4: rmField = 'fourRm'; break;
                    case 5: rmField = 'fiveRm'; break;
                    default: continue;
                  }

                  // Get current RM data
                  const currentRmData = (currentProgress[rmField as keyof typeof currentProgress] as Record<string, number>) || {};
                  
                  // Check if we need to update this RM
                  const currentMaxWeight = Math.max(...Object.values(currentRmData), 0);
                  
                  if (weightNum > currentMaxWeight) {
                    // Update the RM record with new date-weight entry
                    const updatedRmData = {
                      ...currentRmData,
                      [date]: weightNum
                    };
                    
                    updates[rmField] = updatedRmData;
                  }
                }

                // Apply updates if any
                if (Object.keys(updates).length > 0) {
                  await db
                    .update(barbellLiftsProgress)
                    .set({
                      ...updates,
                      updatedAt: new Date(),
                    })
                    .where(eq(barbellLiftsProgress.id, currentProgress.id));
                }
              }
            }
          } catch (error) {
            console.error('❌ Error in barbell lifts progress update:', error);
            // Don't throw - we still want to return success for the workout log
          }
        }
        }

        // Return success response with the workout log data
        const response = {
          success: true,
          workoutLogId,
          finalScore,
          message: 'Workout logged successfully',
          data: {
            id: workoutLogId,
            userId: userData.id,
            workoutId,
            date,
            timeTaken,
            totalEffort,
            finalScore,
            humanReadableScore: humanReadableScore || '',
            scaleType,
            scaleDescription,
            barbellLiftDetails: barbellLiftDetails || {},
            notes,
            createdAt: new Date().toISOString()
          }
        };

        console.log(`✅ Workout logged successfully for user ${userData.id}`);
        return res.status(201).json(response);

      } catch (error) {
        console.error('❌ Error logging workout:', error);
        
        // Return appropriate error response
        if (error instanceof Error) {
          return res.status(500).json({ 
            error: 'Failed to log workout',
            details: error.message
          });
        }
        
        return res.status(500).json({ 
          error: 'Internal server error occurred while logging workout'
        });
      }
    }

    // Get Benchmark Workouts
    if (method === 'GET' && pathname === '/api/benchmark-workouts') {
      try {
        // Return combined benchmark workouts from workout tables
        const girlWodsList = await db.select().from(girlWods);
        const heroWodsList = await db.select().from(heroWods);
        const notablesList = await db.select().from(notables);

        const benchmarkWorkouts = [
          ...girlWodsList.map(w => ({ ...w, category: 'girls' })),
          ...heroWodsList.map(w => ({ ...w, category: 'heroes' })),
          ...notablesList.map(w => ({ ...w, category: 'notables' }))
        ];

        return res.json(benchmarkWorkouts);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch benchmark workouts" });
      }
    }

    // Verification endpoint (mock)
    if (method === 'POST' && pathname === '/api/verification/send-code') {
      return res.json({ success: true, message: 'Verification code sent (demo mode)' });
    }

    // ==================== COMMUNITY MANAGEMENT ROUTES (MISSING FROM PRODUCTION) ====================

    // Create Community (Admin - Community Managers)
    if (method === 'POST' && pathname === '/api/communities') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'admin' || userData.role !== 'community_manager') {
        return res.status(403).json({ error: 'Community manager access required' });
      }

      try {
        const { name, description } = req.body;
        const newCommunity = await db.insert(communities).values({
          name,
          description,
          managerId: userData.id
        }).returning();
        
        return res.json(newCommunity[0]);
      } catch (error) {
        return res.status(500).json({ message: "Failed to create community" });
      }
    }

    // Get My Community (Admin - Community Managers)
    if (method === 'GET' && pathname === '/api/communities/my') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'admin' || userData.role !== 'community_manager') {
        return res.status(403).json({ error: 'Community manager access required' });
      }

      try {
        const community = await db.select().from(communities)
          .where(eq(communities.managerId, userData.id))
          .limit(1);
        
        if (community.length === 0) {
          return res.status(404).json({ message: "No community found" });
        }
        
        return res.json(community[0]);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch community" });
      }
    }

    // Get Community by ID
    if (method === 'GET' && pathname.match(/^\/api\/communities\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      try {
        const communityId = parseInt(pathname.split('/').pop()!);
        const community = await db.select().from(communities)
          .where(eq(communities.id, communityId))
          .limit(1);
        
        if (community.length === 0) {
          return res.status(404).json({ message: "Community not found" });
        }
        
        return res.json(community[0]);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch community" });
      }
    }

    // ==================== USER PROFILE ROUTES (MISSING FROM PRODUCTION) ====================

    // Get User Info (Unified endpoint)
    if (method === 'GET' && pathname === '/api/user') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      const userData = verifyAuthToken(token);
      if (!userData) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      try {
        if (userData.accountType === 'user') {
          const user = await db.select().from(users).where(eq(users.id, userData.id)).limit(1);
          if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
          }
          return res.json({ ...user[0], membership: null });
        } else {
          return res.json({
            id: userData.id,
            email: userData.email,
            username: `admin_${userData.role}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            isRegistered: true,
            accountType: 'admin'
          });
        }
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user" });
      }
    }

    // Update User Profile
    if (method === 'PATCH' && pathname === '/api/user/profile') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const updates = req.body;
        const updatedUser = await db.update(users)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(users.id, userData.id))
          .returning();
        
        if (updatedUser.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }
        
        return res.json(updatedUser[0]);
      } catch (error) {
        return res.status(500).json({ message: "Failed to update profile" });
      }
    }

    // ==================== LEGACY ROUTES (MISSING FROM PRODUCTION) ====================

    // Legacy Logout Route
    if (method === 'GET' && pathname === '/api/logout') {
      clearAuthCookie(res);
      return res.json({ message: 'Logged out successfully' });
    }

    // Email endpoint for contact form
    if (method === 'POST' && pathname === '/api/send-email') {
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
        
        return res.json({ success: true, message: 'Email sent successfully' });
      } catch (error) {
        console.error('SendGrid email error:', error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
    }

    // ==================== WORKOUT ASSIGNMENT ROUTES ====================

    // Assign Existing Workout to Date
    if (method === 'POST' && pathname === '/api/workouts/assign-existing') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { workoutId, workoutSource, assignedDate } = req.body;
        
        if (!workoutId || !workoutSource || !assignedDate) {
          return res.status(400).json({ error: 'workoutId, workoutSource, and assignedDate are required' });
        }

        const assignment = await db.insert(userWorkoutAssignments).values({
          userId: userData.id,
          workoutId: parseInt(workoutId),
          workoutSource: workoutSource as 'custom_user' | 'custom_community' | 'girl_wod' | 'hero_wod' | 'notable',
          assignedDate: assignedDate
        }).returning();

        return res.json({
          success: true,
          assignment: assignment[0],
          message: 'Workout assigned successfully'
        });
      } catch (error) {
        console.error('Error assigning workout:', error);
        return res.status(500).json({ error: 'Failed to assign workout' });
      }
    }

    // Parse New Workout and Assign to Date (Multi-Entity Support)
    if (method === 'POST' && pathname === '/api/workouts/parse-and-assign') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { rawText, assignedDate, workoutEntities } = req.body;
        
        if (!assignedDate) {
          return res.status(400).json({ error: 'assignedDate is required' });
        }

        let entities: any[] = [];

        // Handle multiple workout entities (from frontend)
        if (workoutEntities && Array.isArray(workoutEntities)) {
          entities = workoutEntities;
        } else if (rawText) {
          // Parse raw text using inline parsing function
          const parseResult = await parseWorkout(rawText, userData.id);
          
          if (!parseResult.workoutFound || !parseResult.workoutData) {
            return res.status(400).json({ 
              error: 'Failed to parse workout',
              details: parseResult.errors || ['No workout entities found']
            });
          }
          
          // Convert single workout to entity format for consistency
          const workoutEntity = {
            name: parseResult.workoutData.name,
            workoutType: parseResult.workoutData.workoutType,
            scoring: parseResult.workoutData.scoring,
            timeCap: parseResult.workoutData.timeCap,
            workoutDescription: parseResult.workoutData.workoutDescription,
            relatedBenchmark: parseResult.workoutData.sourceTable !== 'custom' ? parseResult.workoutData.name : null
          };
          
          entities = [workoutEntity];
        } else {
          return res.status(400).json({ error: 'Either rawText or workoutEntities is required' });
        }

        // Create custom user workouts for each entity and assign them
        const createdWorkouts: any[] = [];
        const assignments: any[] = [];

        for (const entity of entities) {
          const customWorkout = await db.insert(customUserWorkouts).values({
            name: entity.name,
            workoutType: entity.workoutType as any,
            scoring: entity.scoring,
            timeCap: entity.timeCap,
            workoutDescription: entity.workoutDescription,
            relatedBenchmark: entity.relatedBenchmark,
            userId: userData.id
          }).returning();

          // Assign each workout to the same date
          const assignment = await db.insert(userWorkoutAssignments).values({
            userId: userData.id,
            workoutId: customWorkout[0].id,
            workoutSource: 'custom_user',
            assignedDate: assignedDate
          }).returning();

          createdWorkouts.push(customWorkout[0]);
          assignments.push(assignment[0]);
        }

        return res.json({
          success: true,
          workouts: createdWorkouts,
          assignments: assignments,
          count: createdWorkouts.length,
          message: `${createdWorkouts.length} workout${createdWorkouts.length > 1 ? 's' : ''} parsed, created, and assigned successfully`
        });
      } catch (error) {
        console.error('Error parsing and assigning workouts:', error);
        return res.status(500).json({ 
          error: 'Failed to parse and assign workouts',
          details: (error as Error).message 
        });
      }
    }

    // Clone Benchmark, Edit, and Assign to Date
    if (method === 'POST' && pathname === '/api/workouts/clone-and-assign') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { benchmarkId, sourceTable, assignedDate, modifications } = req.body;
        
        if (!benchmarkId || !sourceTable || !assignedDate) {
          return res.status(400).json({ error: 'benchmarkId, sourceTable, and assignedDate are required' });
        }

        // Get the benchmark workout
        let benchmarkWorkout;
        switch (sourceTable) {
          case 'girl_wods':
            benchmarkWorkout = await db.select().from(girlWods).where(eq(girlWods.id, benchmarkId)).limit(1);
            break;
          case 'hero_wods':
            benchmarkWorkout = await db.select().from(heroWods).where(eq(heroWods.id, benchmarkId)).limit(1);
            break;
          case 'notables':
            benchmarkWorkout = await db.select().from(notables).where(eq(notables.id, benchmarkId)).limit(1);
            break;
          default:
            return res.status(400).json({ error: 'Invalid source table' });
        }

        if (!benchmarkWorkout || benchmarkWorkout.length === 0) {
          return res.status(404).json({ error: 'Benchmark workout not found' });
        }

        const original = benchmarkWorkout[0];

        // Create custom workout with modifications
        const customWorkout = await db.insert(customUserWorkouts).values({
          name: modifications?.name || `${original.name} (Modified)`,
          workoutType: modifications?.workoutType || original.workoutType as any,
          scoring: modifications?.scoring || original.scoring,
          timeCap: modifications?.timeCap !== undefined ? modifications.timeCap : original.timeCap,
          workoutDescription: modifications?.workoutDescription || original.workoutDescription,
          relatedBenchmark: original.name,
          userId: userData.id
        }).returning();

        // Assign the created workout
        const assignment = await db.insert(userWorkoutAssignments).values({
          userId: userData.id,
          workoutId: customWorkout[0].id,
          workoutSource: 'custom_user',
          assignedDate: assignedDate
        }).returning();

        return res.json({
          success: true,
          workout: customWorkout[0],
          assignment: assignment[0],
          message: 'Benchmark cloned, modified, and assigned successfully'
        });
      } catch (error) {
        console.error('Error cloning and assigning workout:', error);
        return res.status(500).json({ error: 'Failed to clone and assign workout' });
      }
    }

    // Parse New Workout Only (No Date Assignment)
    if (method === 'POST' && pathname === '/api/workouts/parse-only') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { rawText } = req.body;
        
        if (!rawText) {
          return res.status(400).json({ error: 'rawText is required' });
        }

        // Parse the workout first
        const parseResult = await parseWorkout(rawText, userData.id);
        
        if (!parseResult.workoutFound || !parseResult.workoutData) {
          return res.status(400).json({ error: 'Failed to parse workout' });
        }

        // Create custom user workout
        const customWorkout = await db.insert(customUserWorkouts).values({
          name: parseResult.workoutData.name,
          workoutType: parseResult.workoutData.workoutType as any,
          scoring: parseResult.workoutData.scoring,
          timeCap: parseResult.workoutData.timeCap,
          workoutDescription: parseResult.workoutData.workoutDescription,
          relatedBenchmark: parseResult.workoutData.sourceTable !== 'custom' ? parseResult.workoutData.name : null,
          userId: userData.id
        }).returning();

        return res.json({
          success: true,
          workout: customWorkout[0],
          message: 'Workout parsed and created successfully'
        });
      } catch (error) {
        console.error('Error parsing workout:', error);
        return res.status(500).json({ error: 'Failed to parse workout' });
      }
    }

    // Clone Benchmark and Edit Only (No Date Assignment)
    if (method === 'POST' && pathname === '/api/workouts/clone-only') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { benchmarkId, sourceTable, modifications } = req.body;
        
        if (!benchmarkId || !sourceTable) {
          return res.status(400).json({ error: 'benchmarkId and sourceTable are required' });
        }

        // Get the benchmark workout
        let benchmarkWorkout;
        switch (sourceTable) {
          case 'girl_wods':
            benchmarkWorkout = await db.select().from(girlWods).where(eq(girlWods.id, benchmarkId)).limit(1);
            break;
          case 'hero_wods':
            benchmarkWorkout = await db.select().from(heroWods).where(eq(heroWods.id, benchmarkId)).limit(1);
            break;
          case 'notables':
            benchmarkWorkout = await db.select().from(notables).where(eq(notables.id, benchmarkId)).limit(1);
            break;
          default:
            return res.status(400).json({ error: 'Invalid source table' });
        }

        if (!benchmarkWorkout || benchmarkWorkout.length === 0) {
          return res.status(404).json({ error: 'Benchmark workout not found' });
        }

        const original = benchmarkWorkout[0];

        // Create custom workout with modifications
        const customWorkout = await db.insert(customUserWorkouts).values({
          name: modifications?.name || `${original.name} (Modified)`,
          workoutType: modifications?.workoutType || original.workoutType as any,
          scoring: modifications?.scoring || original.scoring,
          timeCap: modifications?.timeCap !== undefined ? modifications.timeCap : original.timeCap,
          workoutDescription: modifications?.workoutDescription || original.workoutDescription,
          relatedBenchmark: original.name,
          userId: userData.id
        }).returning();

        return res.json({
          success: true,
          workout: customWorkout[0],
          message: 'Benchmark cloned and modified successfully'
        });
      } catch (error) {
        console.error('Error cloning workout:', error);
        return res.status(500).json({ error: 'Failed to clone workout' });
      }
    }

    // Edit Existing Custom Workout
    if (method === 'PUT' && pathname.match(/^\/api\/workouts\/custom\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const workoutId = parseInt(pathname.split('/').pop()!);
        const updates = req.body;

        // Check if workout exists and belongs to user
        const existingWorkout = await db.select().from(customUserWorkouts)
          .where(and(eq(customUserWorkouts.id, workoutId), eq(customUserWorkouts.userId, userData.id)))
          .limit(1);

        if (existingWorkout.length === 0) {
          return res.status(404).json({ error: 'Custom workout not found or access denied' });
        }

        // Update the workout
        const updatedWorkout = await db.update(customUserWorkouts)
          .set(updates)
          .where(eq(customUserWorkouts.id, workoutId))
          .returning();

        return res.json({
          success: true,
          workout: updatedWorkout[0],
          message: 'Custom workout updated successfully'
        });
      } catch (error) {
        console.error('Error updating custom workout:', error);
        return res.status(500).json({ error: 'Failed to update custom workout' });
      }
    }

    // Get User's Workout Assignments for Calendar
    if (method === 'GET' && pathname.match(/^\/api\/calendar\/assignments\/[^\/]+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const targetUserId = pathname.split('/').pop()!;
        const { date } = req.query;

        // Check if user is requesting their own assignments
        if (targetUserId !== userData.id) {
          return res.status(403).json({ error: 'Access denied' });
        }

        let assignments;
        if (date) {
          assignments = await db.select().from(userWorkoutAssignments)
            .where(and(
              eq(userWorkoutAssignments.userId, userData.id),
              eq(userWorkoutAssignments.assignedDate, date as string)
            ))
            .orderBy(desc(userWorkoutAssignments.createdAt));
        } else {
          assignments = await db.select().from(userWorkoutAssignments)
            .where(eq(userWorkoutAssignments.userId, userData.id))
            .orderBy(desc(userWorkoutAssignments.createdAt));
        }

        // Enrich assignments with workout details
        const enrichedAssignments = await Promise.all(
          assignments.map(async (assignment) => {
            let workoutDetails: any = null;
            
            switch (assignment.workoutSource) {
              case 'custom_user':
                const customUser = await db.select().from(customUserWorkouts)
                  .where(eq(customUserWorkouts.id, assignment.workoutId)).limit(1);
                workoutDetails = customUser[0] || null;
                break;
              case 'custom_community':
                const customCommunity = await db.select().from(customCommunityWorkouts)
                  .where(eq(customCommunityWorkouts.id, assignment.workoutId)).limit(1);
                workoutDetails = customCommunity[0] || null;
                break;
              case 'girl_wod':
                const girlWod = await db.select().from(girlWods)
                  .where(eq(girlWods.id, assignment.workoutId)).limit(1);
                workoutDetails = girlWod[0] || null;
                break;
              case 'hero_wod':
                const heroWod = await db.select().from(heroWods)
                  .where(eq(heroWods.id, assignment.workoutId)).limit(1);
                workoutDetails = heroWod[0] || null;
                break;
              case 'notable':
                const notable = await db.select().from(notables)
                  .where(eq(notables.id, assignment.workoutId)).limit(1);
                workoutDetails = notable[0] || null;
                break;
            }

            return {
              ...assignment,
              workout: workoutDetails,
              isUserWorkout: assignment.workoutSource === 'custom_user',
              isCommunityWorkout: assignment.workoutSource === 'custom_community'
            };
          })
        );

        return res.json({
          assignments: enrichedAssignments,
          date: date || null
        });
      } catch (error) {
        console.error('Error fetching user assignments:', error);
        return res.status(500).json({ error: 'Failed to fetch workout assignments' });
      }
    }

    // Clone Benchmark Workout (Without Date Assignment)
    if (method === 'POST' && pathname === '/api/workouts/clone-benchmark') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { benchmarkId, sourceTable, modifications, communityId } = req.body;
        
        if (!benchmarkId || !sourceTable) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: 'benchmarkId and sourceTable are required'
          });
        }

        // Get the benchmark workout from the appropriate table
        let benchmarkWorkout;
        let tableMap = {
          'girl_wods': girlWods,
          'hero_wods': heroWods,
          'notables': notables
        };

        const table = tableMap[sourceTable as keyof typeof tableMap];
        if (!table) {
          return res.status(400).json({ 
            error: 'Invalid source table',
            details: `sourceTable must be one of: girl_wods, hero_wods, notables`
          });
        }

        const benchmarkResults = await db.select().from(table).where(eq(table.id, benchmarkId));
        benchmarkWorkout = benchmarkResults[0];

        if (!benchmarkWorkout) {
          return res.status(404).json({ 
            error: 'Benchmark workout not found' 
          });
        }

        // Create the cloned workout with modifications
        const clonedWorkout = {
          name: modifications?.name || benchmarkWorkout.name,
          workoutType: modifications?.workoutType || benchmarkWorkout.workoutType,
          scoring: modifications?.scoring || benchmarkWorkout.scoring,
          timeCap: modifications?.timeCap !== undefined ? modifications.timeCap : benchmarkWorkout.timeCap,
          workoutDescription: modifications?.workoutDescription || benchmarkWorkout.workoutDescription,
          relatedBenchmark: benchmarkWorkout.name,
          userId: userData.id
        };

        // Insert the cloned workout into custom user workouts
        const insertResult = await db.insert(customUserWorkouts).values(clonedWorkout).returning();
        const newWorkout = insertResult[0];

        return res.status(200).json({
          success: true,
          message: 'Benchmark workout cloned successfully',
          workout: newWorkout,
          originalBenchmark: {
            id: benchmarkWorkout.id,
            name: benchmarkWorkout.name,
            source: sourceTable
          }
        });

      } catch (error) {
        console.error('Clone benchmark error:', error);
        return res.status(500).json({ 
          error: 'Failed to clone benchmark workout',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get Available Workouts for Assignment
    if (method === 'GET' && pathname === '/api/workouts/available-for-assignment') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        // Get all available workouts for assignment
        const [userCustom, girlWodsList, heroWodsList, notablesList] = await Promise.all([
          db.select().from(customUserWorkouts).where(eq(customUserWorkouts.userId, userData.id)),
          db.select().from(girlWods),
          db.select().from(heroWods),
          db.select().from(notables)
        ]);

        const availableWorkouts = [
          ...userCustom.map(w => ({ ...w, source: 'custom_user', category: 'User Custom' })),
          ...girlWodsList.map(w => ({ ...w, source: 'girl_wod', category: 'Girl WODs' })),
          ...heroWodsList.map(w => ({ ...w, source: 'hero_wod', category: 'Hero WODs' })),
          ...notablesList.map(w => ({ ...w, source: 'notable', category: 'Notable WODs' }))
        ];

        return res.json({
          workouts: availableWorkouts,
          count: availableWorkouts.length
        });
      } catch (error) {
        console.error('Error fetching available workouts:', error);
        return res.status(500).json({ error: 'Failed to fetch available workouts' });
      }
    }

    // Remove Workout Assignment
    if (method === 'DELETE' && pathname.match(/^\/api\/assignments\/\d+$/)) {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const assignmentId = parseInt(pathname.split('/').pop()!);

        // Check if assignment exists and belongs to user
        const existingAssignment = await db.select().from(userWorkoutAssignments)
          .where(and(eq(userWorkoutAssignments.id, assignmentId), eq(userWorkoutAssignments.userId, userData.id)))
          .limit(1);

        if (existingAssignment.length === 0) {
          return res.status(404).json({ error: 'Assignment not found or access denied' });
        }

        // Delete the assignment
        await db.delete(userWorkoutAssignments).where(eq(userWorkoutAssignments.id, assignmentId));

        return res.json({
          success: true,
          message: 'Workout assignment removed successfully'
        });
      } catch (error) {
        console.error('Error removing assignment:', error);
        return res.status(500).json({ error: 'Failed to remove workout assignment' });
      }
    }

    // Get My Custom Workouts
    if (method === 'GET' && pathname === '/api/workouts/custom/my') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const customWorkouts = await db.select().from(customUserWorkouts)
          .where(eq(customUserWorkouts.userId, userData.id))
          .orderBy(desc(customUserWorkouts.createdAt));

        return res.json({
          workouts: customWorkouts,
          count: customWorkouts.length
        });
      } catch (error) {
        console.error('Error fetching custom workouts:', error);
        return res.status(500).json({ error: 'Failed to fetch custom workouts' });
      }
    }

    // Get User Workout Assignments
    if (method === 'GET' && pathname === '/api/workouts/assignments') {
      const token = getAuthToken(req);
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      
      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ error: 'User authentication required' });
      }

      try {
        const { date, userId } = req.query;

        // Verify user can only access their own assignments
        if (userId && userId !== userData.id) {
          return res.status(403).json({ error: "Access denied" });
        }

        const targetUserId = userId || userData.id;

        let whereClause;
        
        if (date && typeof date === 'string') {
          whereClause = and(
            eq(userWorkoutAssignments.userId, targetUserId as string),
            eq(userWorkoutAssignments.assignedDate, date)
          );
        } else {
          whereClause = eq(userWorkoutAssignments.userId, targetUserId as string);
        }

        // Get user's workout assignments
        const assignments = await db
          .select()
          .from(userWorkoutAssignments)
          .where(whereClause)
          .orderBy(userWorkoutAssignments.assignedDate);

        // Fetch workout details based on source
        const enrichedAssignments: any[] = [];
        
        for (const assignment of assignments) {
          let workoutDetails: any = null;
          
          switch (assignment.workoutSource) {
            case 'girl_wod':
              const girlWodResults = await db
                .select()
                .from(girlWods)
                .where(eq(girlWods.id, assignment.workoutId))
                .limit(1);
              workoutDetails = girlWodResults[0];
              break;
              
            case 'hero_wod':
              const heroWodResults = await db
                .select()
                .from(heroWods)
                .where(eq(heroWods.id, assignment.workoutId))
                .limit(1);
              workoutDetails = heroWodResults[0];
              break;
              
            case 'notable':
              const notableResults = await db
                .select()
                .from(notables)
                .where(eq(notables.id, assignment.workoutId))
                .limit(1);
              workoutDetails = notableResults[0];
              break;
              
            case 'custom_user':
              const customUserResults = await db
                .select()
                .from(customUserWorkouts)
                .where(eq(customUserWorkouts.id, assignment.workoutId))
                .limit(1);
              workoutDetails = customUserResults[0];
              break;
              
            case 'custom_community':
              const customCommunityResults = await db
                .select()
                .from(customCommunityWorkouts)
                .where(eq(customCommunityWorkouts.id, assignment.workoutId))
                .limit(1);
              workoutDetails = customCommunityResults[0];
              break;
          }
          
          if (workoutDetails) {
            enrichedAssignments.push({
              ...assignment,
              workout: {
                ...workoutDetails,
                description: workoutDetails.workoutDescription || workoutDetails.description,
                type: workoutDetails.workoutType || workoutDetails.type
              }
            });
          }
        }

        return res.status(200).json(enrichedAssignments);
      } catch (error) {
        console.error("Error fetching workout assignments:", error);
        return res.status(500).json({
          error: "Failed to fetch workout assignments"
        });
      }
    }

    // Default 404 response
    return res.status(404).json({ error: 'Endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: (error as Error).message 
    });
  }
}

// Helper functions for insights
function calculateStreak(recentWorkouts: any[]): number {
  if (recentWorkouts.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasWorkout = recentWorkouts.some(log => log.date === dateStr);
    if (hasWorkout) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

async function generatePersonalRecords(userId: string) {
  try {
    const lifts = await db.select().from(olympicLifts)
      .where(eq(olympicLifts.userId, userId))
      .orderBy(desc(olympicLifts.weight));
    
    const records = lifts.reduce((acc: any[], lift) => {
      const existing = acc.find(r => r.liftName === lift.liftName && r.repMax === lift.repMax);
      if (!existing || lift.weight > existing.weight) {
        return [...acc.filter(r => !(r.liftName === lift.liftName && r.repMax === lift.repMax)), lift];
      }
      return acc;
    }, []);
    
    return records.slice(0, 5);
  } catch (error) {
    return [
      { liftName: 'deadlift', repMax: 1, weight: 315, date: '2025-08-10' },
      { liftName: 'squat', repMax: 1, weight: 275, date: '2025-08-05' }
    ];
  }
}

function calculateWeeklyProgress(recentWorkouts: any[]) {
  const thisWeek = recentWorkouts.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }).length;
  
  return {
    workoutsThisWeek: thisWeek,
    averageScore: recentWorkouts.length > 0 ? 
      recentWorkouts.reduce((sum, log) => sum + (parseInt(log.finalScore) || 0), 0) / recentWorkouts.length : 0
  };
}
