// Test PRD Parsing Algorithm Implementation
// This tests the full parsing workflow for Phase 1 of the ACrossFit PRD

import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { girlWods, heroWods, notables, barbellLifts } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Load environment variables
dotenv.config();

// Initialize database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Test workout examples from different categories
const testWorkouts = {
  girlWods: [
    "Fran\n21-15-9 reps for time of:\nThrusters (95/65 lb)\nPull-ups",
    "Helen\n3 rounds for time:\n400m Run\n21 Kettlebell Swings (53/35 lb)\n12 Pull-ups",
    "Grace\nFor time:\n30 Clean and Jerks (135/95 lb)"
  ],
  heroWods: [
    "Murph\nFor time:\n1 mile Run\n100 Pull-ups\n200 Push-ups\n300 Air Squats\n1 mile Run",
    "DT\n5 rounds for time:\n12 Deadlifts (155/105 lb)\n9 Hang Power Cleans (155/105 lb)\n6 Push Jerks (155/105 lb)"
  ],
  notables: [
    "Fight Gone Bad\n3 rounds of:\nWall-ball, 20 pound ball, 10' target (Reps)\nSumo deadlift high-pull, 75 pounds (Reps)\nBox Jump, 20\" box (Reps)\nPush-press, 75 pounds (Reps)\nRow (Calories)",
    "The Seven\n7 rounds for time:\n7 Handstand Push-ups\n7 Thrusters (135/95 lb)\n7 Knees-to-Elbows\n7 Deadlifts (245/165 lb)\n7 Burpees\n7 Kettlebell Swings (70/53 lb)\n7 Pull-ups"
  ],
  customWorkouts: [
    "AMRAP 20 minutes:\n10 Burpees\n15 Kettlebell Swings (53/35)\n20 Air Squats",
    "5 rounds for time:\n10 Box Jumps (24/20)\n15 Push-ups\n20 Sit-ups\nTime cap: 15 minutes",
    "EMOM 12 minutes:\nMinute 1: 10 Thrusters (95/65)\nMinute 2: 15 Pull-ups\nMinute 3: 20 Air Squats"
  ]
};

// PRD Parsing Algorithm (Test Version)
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

async function testParseWorkout(rawText: string, userId: string = 'test-user') {
  try {
    console.log(`\n🧪 Testing: "${rawText.substring(0, 50)}..."`);
    console.log('━'.repeat(80));

    // Load workout database tables
    const girlWodsList = await db.select().from(girlWods);
    const heroWodsList = await db.select().from(heroWods);
    const notablesList = await db.select().from(notables);
    const barbellLiftsList = await db.select().from(barbellLifts);

    const cleanText = rawText.toLowerCase().trim();
    
    // Step 1: Check for known Girl WODs
    for (const workout of girlWodsList) {
      const workoutName = workout.name.toLowerCase();
      const distance = levenshteinDistance(cleanText.substring(0, 50), workoutName);
      
      if (cleanText.includes(workoutName) || distance <= 2) {
        console.log(`✅ MATCHED: Girl WOD "${workout.name}"`);
        console.log(`📊 Confidence: 90% | Distance: ${distance}`);
        console.log(`🎯 Type: ${workout.workoutType} | Scoring: ${workout.scoring}`);
        console.log(`⏱️ Time Cap: ${workout.timeCap ? workout.timeCap + 's' : 'None'}`);
        console.log(`💪 Barbell Lifts: ${JSON.stringify(workout.barbellLifts) || '[]'}`);
        
        return {
          workoutFound: true,
          confidence: 0.9,
          matchedCategory: 'girls',
          workoutData: {
            name: workout.name,
            workoutDescription: workout.workoutDescription,
            workoutType: workout.workoutType,
            scoring: workout.scoring,
            timeCap: workout.timeCap,
            totalEffort: workout.totalEffort,
            barbellLifts: workout.barbellLifts as string[] || [],
            sourceTable: 'girl_wods',
            databaseId: workout.id
          },
          suggestedWorkouts: []
        };
      }
    }

    // Step 2: Check for known Hero WODs
    for (const workout of heroWodsList) {
      const workoutName = workout.name.toLowerCase();
      const distance = levenshteinDistance(cleanText.substring(0, 50), workoutName);
      
      if (cleanText.includes(workoutName) || distance <= 2) {
        console.log(`✅ MATCHED: Hero WOD "${workout.name}"`);
        console.log(`📊 Confidence: 90% | Distance: ${distance}`);
        console.log(`🎯 Type: ${workout.workoutType} | Scoring: ${workout.scoring}`);
        console.log(`⏱️ Time Cap: ${workout.timeCap ? workout.timeCap + 's' : 'None'}`);
        console.log(`💪 Barbell Lifts: ${JSON.stringify(workout.barbellLifts) || '[]'}`);
        
        return {
          workoutFound: true,
          confidence: 0.9,
          matchedCategory: 'heroes',
          workoutData: {
            name: workout.name,
            workoutDescription: workout.workoutDescription,
            workoutType: workout.workoutType,
            scoring: workout.scoring,
            timeCap: workout.timeCap,
            totalEffort: workout.totalEffort,
            barbellLifts: workout.barbellLifts as string[] || [],
            sourceTable: 'hero_wods',
            databaseId: workout.id
          },
          suggestedWorkouts: []
        };
      }
    }

    // Step 3: Check for known Notable WODs
    for (const workout of notablesList) {
      const workoutName = workout.name.toLowerCase();
      const distance = levenshteinDistance(cleanText.substring(0, 50), workoutName);
      
      if (cleanText.includes(workoutName) || distance <= 2) {
        console.log(`✅ MATCHED: Notable WOD "${workout.name}"`);
        console.log(`📊 Confidence: 90% | Distance: ${distance}`);
        console.log(`🎯 Type: ${workout.workoutType} | Scoring: ${workout.scoring}`);
        console.log(`⏱️ Time Cap: ${workout.timeCap ? workout.timeCap + 's' : 'None'}`);
        console.log(`💪 Barbell Lifts: ${JSON.stringify(workout.barbellLifts) || '[]'}`);
        
        return {
          workoutFound: true,
          confidence: 0.9,
          matchedCategory: 'notables',
          workoutData: {
            name: workout.name,
            workoutDescription: workout.workoutDescription,
            workoutType: workout.workoutType,
            scoring: workout.scoring,
            timeCap: workout.timeCap,
            totalEffort: workout.totalEffort,
            barbellLifts: workout.barbellLifts as string[] || [],
            sourceTable: 'notables',
            databaseId: workout.id
          },
          suggestedWorkouts: []
        };
      }
    }

    // Step 4: Parse as custom workout
    const workoutName = extractWorkoutName(rawText);
    const workoutType = detectWorkoutType(cleanText);
    const timeCap = extractTimeCap(rawText);
    const barbellLiftsFound = identifyBarbellLifts(rawText, barbellLiftsList);
    
    console.log(`🔧 CUSTOM WORKOUT PARSED:`);
    console.log(`📝 Name: ${workoutName}`);
    console.log(`🎯 Type: ${workoutType}`);
    console.log(`⏱️ Time Cap: ${timeCap ? timeCap + 's' : 'None'}`);
    console.log(`💪 Barbell Lifts: ${JSON.stringify(barbellLiftsFound)}`);
    console.log(`📊 Confidence: 80%`);
    
    return {
      workoutFound: true,
      confidence: 0.8,
      matchedCategory: 'new_custom',
      workoutData: {
        name: workoutName,
        workoutDescription: rawText,
        workoutType: workoutType,
        scoring: workoutType === 'for_time' ? 'Time' : workoutType === 'amrap' ? 'Rounds + Reps' : 'Points',
        timeCap: timeCap,
        totalEffort: calculateTotalEffort(rawText),
        barbellLifts: barbellLiftsFound,
        sourceTable: 'custom',
        databaseId: null
      },
      suggestedWorkouts: generateSuggestions(rawText, [...girlWodsList, ...heroWodsList, ...notablesList])
    };

  } catch (error) {
    console.error('❌ Parsing error:', error);
    return {
      workoutFound: false,
      confidence: 0,
      matchedCategory: 'unknown',
      errors: [(error as Error).message],
      suggestedWorkouts: []
    };
  }
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

function identifyBarbellLifts(rawText: string, barbellLifts: any[]): string[] {
  const found: string[] = [];
  const cleanText = rawText.toLowerCase();
  
  for (const lift of barbellLifts) {
    if (cleanText.includes(lift.liftName.toLowerCase())) {
      found.push(lift.liftName);
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

// Main test function
async function runPRDParsingTests() {
  console.log('🚀 PRD PARSING ALGORITHM TESTS');
  console.log('=' .repeat(80));
  console.log('Phase 1: Known Benchmark Workouts + Custom Parsing');
  console.log('Database Tables: Girl WODs, Hero WODs, Notables, Barbell Lifts');
  console.log('=' .repeat(80));

  let totalTests = 0;
  let passedTests = 0;

  // Test Girl WODs
  console.log('\n📋 TESTING GIRL WODS');
  console.log('=' .repeat(40));
  for (const workout of testWorkouts.girlWods) {
    totalTests++;
    const result = await testParseWorkout(workout);
    if (result.workoutFound && result.matchedCategory === 'girls') {
      passedTests++;
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  }

  // Test Hero WODs
  console.log('\n🎖️ TESTING HERO WODS');
  console.log('=' .repeat(40));
  for (const workout of testWorkouts.heroWods) {
    totalTests++;
    const result = await testParseWorkout(workout);
    if (result.workoutFound && result.matchedCategory === 'heroes') {
      passedTests++;
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  }

  // Test Notable WODs
  console.log('\n⭐ TESTING NOTABLE WODS');
  console.log('=' .repeat(40));
  for (const workout of testWorkouts.notables) {
    totalTests++;
    const result = await testParseWorkout(workout);
    if (result.workoutFound && result.matchedCategory === 'notables') {
      passedTests++;
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  }

  // Test Custom Workouts
  console.log('\n🔧 TESTING CUSTOM WORKOUTS');
  console.log('=' .repeat(40));
  for (const workout of testWorkouts.customWorkouts) {
    totalTests++;
    const result = await testParseWorkout(workout);
    if (result.workoutFound && result.matchedCategory === 'new_custom') {
      passedTests++;
      console.log('✅ PASS\n');
    } else {
      console.log('❌ FAIL\n');
    }
  }

  // Final Results
  console.log('\n🎯 FINAL RESULTS');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('=' .repeat(50));

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! PRD Parsing Algorithm is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Review implementation.');
  }
}

// Export functions
export { testParseWorkout, runPRDParsingTests };

// Run tests immediately
runPRDParsingTests().catch(console.error);
