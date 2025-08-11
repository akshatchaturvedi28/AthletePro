/**
 * Seed script for populating workout databases
 * Based on CrossFit workout specifications
 * 
 * Run with: npx tsx server/seedWorkoutData.ts
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import {
  crossfitWorkoutTypes,
  girlWods,
  heroWods,
  notables,
  barbellLifts,
  type InsertCrossfitWorkoutType,
  type InsertGirlWod,
  type InsertHeroWod,
  type InsertNotable,
  type InsertBarbellLift,
} from '../shared/schema';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// CrossFit Workout Types & Associated Scoring Patterns
const crossfitWorkoutTypesData: InsertCrossfitWorkoutType[] = [
  {
    workoutType: "for_time",
    description: "Complete the prescribed work in the fastest time possible",
    commonScoringPatterns: "Time to completion (MM:SS format)",
    scoreFormat: "Time (minutes:seconds)",
    examples: "Fran, Grace, Helen"
  },
  {
    workoutType: "amrap",
    description: "As Many Rounds/Reps As Possible in a given time domain",
    commonScoringPatterns: "Total rounds + additional reps completed",
    scoreFormat: "Rounds + Reps (e.g., 12+8)",
    examples: "Cindy, Mary, Kelly"
  },
  {
    workoutType: "emom",
    description: "Every Minute On the Minute - perform specific work each minute",
    commonScoringPatterns: "Time completed or rounds completed",
    scoreFormat: "Time completed or Pass/Fail",
    examples: "EMOM 10: 5 Pull-ups + 10 Push-ups + 15 Squats"
  },
  {
    workoutType: "rft",
    description: "Rounds For Time - complete a specific number of rounds as fast as possible",
    commonScoringPatterns: "Time to completion",
    scoreFormat: "Time (minutes:seconds)",
    examples: "5 RFT: 400m run + 30 box jumps + 30 wall balls"
  },
  {
    workoutType: "chipper",
    description: "Complete a long list of exercises in order, 'chipping away' at each",
    commonScoringPatterns: "Time to completion",
    scoreFormat: "Time (minutes:seconds)",
    examples: "The Seven, Filthy Fifty"
  },
  {
    workoutType: "interval",
    description: "Work periods followed by rest periods",
    commonScoringPatterns: "Total work completed or time",
    scoreFormat: "Distance/Reps or Time per interval",
    examples: "4x400m run (90s rest between)"
  },
  {
    workoutType: "strength",
    description: "Focus on lifting heavy weights, typically 1-5 reps",
    commonScoringPatterns: "Weight lifted (1RM, 3RM, 5RM)",
    scoreFormat: "Weight (lbs/kg)",
    examples: "Work up to 1RM Back Squat"
  },
  {
    workoutType: "gymnastics_skill_work",
    description: "Focus on bodyweight movements and skills",
    commonScoringPatterns: "Reps completed or skill achieved",
    scoreFormat: "Reps or Pass/Fail",
    examples: "Handstand practice, muscle-up progression"
  },
  {
    workoutType: "endurance",
    description: "Longer duration aerobic work",
    commonScoringPatterns: "Time or distance",
    scoreFormat: "Time or Distance",
    examples: "5K run, 2000m row"
  },
  {
    workoutType: "tabata",
    description: "4 minutes of 20 seconds work / 10 seconds rest",
    commonScoringPatterns: "Lowest round or total reps",
    scoreFormat: "Lowest round score or total reps",
    examples: "Tabata Squats, Tabata Push-ups"
  }
];

// Girl WODs - Classic CrossFit Benchmark Workouts
const girlWodsData: InsertGirlWod[] = [
  {
    name: "Angie",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 1800, // 30 minutes
    workoutDescription: "100 Pull-ups\n100 Push-ups\n100 Sit-ups\n100 Squats",
    totalEffort: 400,
    barbellLifts: null
  },
  {
    name: "Barbara",
    workoutType: "for_time", 
    scoring: "Time",
    timeCap: 1200, // 20 minutes
    workoutDescription: "5 rounds:\n20 Pull-ups\n30 Push-ups\n40 Sit-ups\n50 Squats\n(3 minutes rest between rounds)",
    totalEffort: 700,
    barbellLifts: null
  },
  {
    name: "Chelsea",
    workoutType: "emom",
    scoring: "Rounds Completed",
    timeCap: 1800, // 30 minutes
    workoutDescription: "EMOM 30:\n5 Pull-ups\n10 Push-ups\n15 Squats",
    totalEffort: 900,
    barbellLifts: null
  },
  {
    name: "Diane",
    workoutType: "for_time",
    scoring: "Time", 
    timeCap: 900, // 15 minutes
    workoutDescription: "21-15-9:\nDeadlifts (225/155 lbs)\nHandstand Push-ups",
    totalEffort: 90,
    barbellLifts: ["Deadlift"]
  },
  {
    name: "Elizabeth",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 900, // 15 minutes  
    workoutDescription: "21-15-9:\nCleans (135/95 lbs)\nRing Dips",
    totalEffort: 90,
    barbellLifts: ["Clean"]
  },
  {
    name: "Fran",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 600, // 10 minutes
    workoutDescription: "21-15-9:\nThrusters (95/65 lbs)\nPull-ups",
    totalEffort: 90,
    barbellLifts: ["Thruster"]
  },
  {
    name: "Grace",
    workoutType: "for_time", 
    scoring: "Time",
    timeCap: 600, // 10 minutes
    workoutDescription: "30 Clean and Jerks (135/95 lbs)",
    totalEffort: 30,
    barbellLifts: ["Clean and Jerk"]
  },
  {
    name: "Helen",
    workoutType: "for_time",
    scoring: "Time", 
    timeCap: 900, // 15 minutes
    workoutDescription: "3 rounds:\n400m Run\n21 KB Swings (53/35 lbs)\n12 Pull-ups",
    totalEffort: 99,
    barbellLifts: null
  },
  {
    name: "Isabel",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 600, // 10 minutes
    workoutDescription: "30 Snatches (135/95 lbs)",
    totalEffort: 30,
    barbellLifts: ["Snatch"]
  },
  {
    name: "Jackie",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 900, // 15 minutes
    workoutDescription: "1000m Row\n50 Thrusters (45/35 lbs)\n30 Pull-ups", 
    totalEffort: 80,
    barbellLifts: ["Thruster"]
  },
  {
    name: "Karen",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 900, // 15 minutes
    workoutDescription: "150 Wall Balls (20/14 lbs to 10/9 ft)",
    totalEffort: 150,
    barbellLifts: null
  },
  {
    name: "Linda",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 1800, // 30 minutes
    workoutDescription: "10-9-8-7-6-5-4-3-2-1:\nDeadlifts (1.5x bodyweight)\nBench Press (bodyweight)\nCleans (0.75x bodyweight)",
    totalEffort: 165,
    barbellLifts: ["Deadlift", "Bench Press", "Clean"]
  },
  {
    name: "Mary",
    workoutType: "amrap",
    scoring: "Rounds + Reps",
    timeCap: 1200, // 20 minutes
    workoutDescription: "AMRAP 20:\n5 Handstand Push-ups\n10 Pistol Squats\n15 Pull-ups",
    totalEffort: 30, // Per round, variable based on performance
    barbellLifts: null
  },
  {
    name: "Nancy",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 1200, // 20 minutes
    workoutDescription: "5 rounds:\n400m Run\n15 Overhead Squats (95/65 lbs)",
    totalEffort: 75,
    barbellLifts: ["Overhead Squat"]
  }
];

// Hero WODs - Memorial CrossFit Workouts
const heroWodsData: InsertHeroWod[] = [
  {
    name: "Murph",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 3600, // 60 minutes
    workoutDescription: "1 mile Run\n100 Pull-ups\n200 Push-ups\n300 Squats\n1 mile Run\n(20 lb vest)",
    totalEffort: 600,
    barbellLifts: null
  },
  {
    name: "Fran",
    workoutType: "for_time", 
    scoring: "Time",
    timeCap: 600, // 10 minutes
    workoutDescription: "21-15-9:\nThrusters (95/65 lbs)\nPull-ups",
    totalEffort: 90,
    barbellLifts: ["Thruster"]
  },
  {
    name: "Chad",
    workoutType: "for_time",
    scoring: "Time", 
    timeCap: 1800, // 30 minutes
    workoutDescription: "1000 Box Steps (20 inch box)\n(45/25 lb plate)",
    totalEffort: 1000,
    barbellLifts: null
  },
  {
    name: "JT",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 1200, // 20 minutes
    workoutDescription: "21-15-9:\nHandstand Push-ups\nRing Dips\nPush-ups",
    totalEffort: 135,
    barbellLifts: null
  },
  {
    name: "Michael",
    workoutType: "for_time",
    scoring: "Time",
    timeCap: 1800, // 30 minutes
    workoutDescription: "3 rounds:\n800m Run\n50 Back Extensions\n50 Sit-ups",
    totalEffort: 300,
    barbellLifts: null
  }
];

// Notables / Skills / Tests - CrossFit Skills & Tests
const notablesData: InsertNotable[] = [
  {
    name: "Filthy Fifty",
    workoutType: "chipper",
    scoring: "Time",
    timeCap: 2400, // 40 minutes
    workoutDescription: "50 Box Jumps (24/20 inch)\n50 Jumping Pull-ups\n50 KB Swings (35/26 lbs)\n50 Walking Lunges\n50 Knees to Elbows\n50 Push Press (45/35 lbs)\n50 Back Extensions\n50 Wall Balls (20/14 lbs)\n50 Burpees\n50 Double Unders",
    totalEffort: 500,
    barbellLifts: ["Push Press"]
  },
  {
    name: "The Seven",
    workoutType: "chipper", 
    scoring: "Time",
    timeCap: 2400, // 40 minutes
    workoutDescription: "7 Handstand Push-ups\n77 Squats\n7 Handstand Push-ups\n77 Squats\n7 Handstand Push-ups\n77 Squats\n7 Handstand Push-ups\n77 Squats\n7 Handstand Push-ups\n77 Squats\n7 Handstand Push-ups\n77 Squats\n7 Handstand Push-ups",
    totalEffort: 511,
    barbellLifts: null
  },
  {
    name: "Fight Gone Bad",
    workoutType: "amrap",
    scoring: "Total Points",
    timeCap: 1020, // 17 minutes (5 rounds + rest)
    workoutDescription: "5 rounds:\n1 min Wall Balls (20/14 lbs)\n1 min Sumo Deadlift High Pull (75/55 lbs)\n1 min Box Jumps (20 inch)\n1 min Push Press (75/55 lbs)\n1 min Row (calories)\n(1 min rest between rounds)",
    totalEffort: 300, // Variable based on performance, but roughly 300 total movements
    barbellLifts: ["Sumo Deadlift High Pull", "Push Press"]
  }
];

// Barbell Lifts - CrossFit Movement Database
const barbellLiftsData: InsertBarbellLift[] = [
  // Squat category
  { liftName: "Back Squat", category: "squat", liftType: "strength" },
  { liftName: "Front Squat", category: "squat", liftType: "strength" },
  { liftName: "Overhead Squat", category: "squat", liftType: "olympic_variation" },
  { liftName: "Box Squat", category: "squat", liftType: "strength_variant" },
  { liftName: "Goblet Squat", category: "squat", liftType: "technique_focused" },
  { liftName: "Bulgarian Split Squat", category: "squat", liftType: "unilateral_strength" },
  { liftName: "Jump Squat", category: "squat", liftType: "legs" },
  { liftName: "Pistol Squat", category: "squat", liftType: "balance" },

  // Clean category
  { liftName: "Power Clean", category: "clean", liftType: "olympic_lift" },
  { liftName: "Full Clean", category: "clean", liftType: "olympic_lift" },
  { liftName: "Hang Clean", category: "clean", liftType: "olympic_variation" },
  { liftName: "Clean Pull", category: "clean", liftType: "olympic_accessory" },
  { liftName: "Clean and Jerk", category: "clean", liftType: "olympic_composite" },
  { liftName: "Clean High Pull", category: "clean", liftType: "olympic_accessory" },
  { liftName: "Muscle Clean", category: "clean", liftType: "technique_focused" },

  // Press category  
  { liftName: "Strict Press", category: "press", liftType: "strength" },
  { liftName: "Push Press", category: "press", liftType: "olympic_variation" },
  { liftName: "Push Jerk", category: "press", liftType: "olympic_variation" },
  { liftName: "Bench Press", category: "press", liftType: "strength" },
  { liftName: "Incline Press", category: "press", liftType: "strength_variant" },
  { liftName: "Dumbbell Press", category: "press", liftType: "shoulder_isolation" },
  { liftName: "Handstand Push-up", category: "press", liftType: "overhead" },

  // Jerk category
  { liftName: "Split Jerk", category: "jerk", liftType: "olympic_lift" },
  { liftName: "Push Jerk", category: "jerk", liftType: "olympic_lift" },
  { liftName: "Squat Jerk", category: "jerk", liftType: "advanced_olympic" },
  { liftName: "Behind the Neck Jerk", category: "jerk", liftType: "olympic_variation" },

  // Snatch category
  { liftName: "Power Snatch", category: "snatch", liftType: "olympic_lift" },
  { liftName: "Full Snatch", category: "snatch", liftType: "olympic_lift" },
  { liftName: "Hang Snatch", category: "snatch", liftType: "olympic_variation" },
  { liftName: "Snatch Pull", category: "snatch", liftType: "olympic_accessory" },
  { liftName: "Snatch High Pull", category: "snatch", liftType: "olympic_accessory" },
  { liftName: "Muscle Snatch", category: "snatch", liftType: "technique_focused" },
  { liftName: "Snatch Balance", category: "snatch", liftType: "stability" },
  { liftName: "Overhead Squat Snatch", category: "snatch", liftType: "mobility" },

  // Deadlift category
  { liftName: "Conventional Deadlift", category: "deadlift", liftType: "strength_pull" },
  { liftName: "Sumo Deadlift", category: "deadlift", liftType: "strength_pull" },
  { liftName: "Romanian Deadlift", category: "deadlift", liftType: "posterior_chain" },
  { liftName: "Stiff Leg Deadlift", category: "deadlift", liftType: "hamstring" },
  { liftName: "Deficit Deadlift", category: "deadlift", liftType: "strength_variant" },
  { liftName: "Rack Pull", category: "deadlift", liftType: "pull" },
  { liftName: "Single Leg Deadlift", category: "deadlift", liftType: "unilateral_strength" },

  // Olympic Lift category (complex movements)
  { liftName: "Clean and Jerk", category: "olympic_lift", liftType: "olympic_composite" },
  { liftName: "Thruster", category: "olympic_lift", liftType: "olympic_composite" },

  // Other category
  { liftName: "Good Morning", category: "other", liftType: "posterior_chain" },
  { liftName: "Hip Thrust", category: "other", liftType: "posterior_chain" },
  { liftName: "Farmer's Walk", category: "other", liftType: "assistance" },
  { liftName: "Turkish Get-up", category: "other", liftType: "core" },
  { liftName: "Bear Crawl", category: "other", liftType: "core" }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting workout database seeding...');

    // Seed CrossFit Workout Types
    console.log('📊 Seeding CrossFit Workout Types...');
    await db.insert(crossfitWorkoutTypes).values(crossfitWorkoutTypesData).onConflictDoNothing();
    console.log(`✅ Inserted ${crossfitWorkoutTypesData.length} workout types`);

    // Seed Girl WODs  
    console.log('👩 Seeding Girl WODs...');
    await db.insert(girlWods).values(girlWodsData).onConflictDoNothing();
    console.log(`✅ Inserted ${girlWodsData.length} Girl WODs`);

    // Seed Hero WODs
    console.log('🦸 Seeding Hero WODs...');
    await db.insert(heroWods).values(heroWodsData).onConflictDoNothing();
    console.log(`✅ Inserted ${heroWodsData.length} Hero WODs`);

    // Seed Notables
    console.log('⭐ Seeding Notable workouts...');
    await db.insert(notables).values(notablesData).onConflictDoNothing();
    console.log(`✅ Inserted ${notablesData.length} Notable workouts`);

    // Seed Barbell Lifts
    console.log('🏋️ Seeding Barbell Lifts...');
    await db.insert(barbellLifts).values(barbellLiftsData).onConflictDoNothing();
    console.log(`✅ Inserted ${barbellLiftsData.length} Barbell Lifts`);

    console.log('🎉 Workout database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`- ${crossfitWorkoutTypesData.length} Workout Types`);
    console.log(`- ${girlWodsData.length} Girl WODs`);
    console.log(`- ${heroWodsData.length} Hero WODs`);
    console.log(`- ${notablesData.length} Notable Workouts`);
    console.log(`- ${barbellLiftsData.length} Barbell Lifts`);
    console.log(`\nTotal: ${crossfitWorkoutTypesData.length + girlWodsData.length + heroWodsData.length + notablesData.length + barbellLiftsData.length} records inserted`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
