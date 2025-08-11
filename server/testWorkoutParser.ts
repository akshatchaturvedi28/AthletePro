/**
 * Test script for PRD Phase 1 Parsing Algorithm
 * Demonstrates the parser working with various workout inputs
 * 
 * Run with: DATABASE_URL='...' npx tsx server/testPRDParser.ts
 */

import { PRDWorkoutParser } from './services/workoutParser';

async function testPRDParser() {
  console.log('🧪 Testing PRD Phase 1 Parsing Algorithm');
  console.log('=' .repeat(60));

  // Test cases from PRD
  const testCases = [
    {
      name: 'Girl WOD - Fran (Exact Match)',
      input: 'Fran'
    },
    {
      name: 'Girl WOD - Fran (Full Description)',
      input: 'Fran\n21-15-9:\nThrusters (95/65 lbs)\nPull-ups'
    },
    {
      name: 'Hero WOD - Murph (Exact Match)', 
      input: 'Murph'
    },
    {
      name: 'Hero WOD - Murph (Partial Description)',
      input: 'Murph workout with vest 1 mile run pull-ups push-ups squats'
    },
    {
      name: 'Notable WOD - Filthy Fifty',
      input: 'Filthy Fifty'
    },
    {
      name: 'Custom AMRAP Workout',
      input: 'AMRAP 15:\n10 Burpees\n15 KB Swings (53 lbs)\n20 Box Jumps (24 inch)'
    },
    {
      name: 'Custom For Time Workout',
      input: 'For Time:\n100 Wall Balls (20 lbs)\n50 Pull-ups\n25 Thrusters (95 lbs)\nTime Cap: 12 minutes'
    },
    {
      name: 'Custom EMOM Workout',
      input: 'EMOM 16:\nMin 1: 12 Deadlifts (185 lbs)\nMin 2: 10 Push-ups\nMin 3: 8 Front Squats (135 lbs)\nMin 4: Rest'
    },
    {
      name: 'Typo/Similar Name Test',
      input: 'Fren' // Should suggest Fran
    },
    {
      name: 'Complex Custom Workout',
      input: 'The Chipper\n5 rounds:\n400m Run\n30 KB Swings\n20 Burpees\n10 Clean & Jerks (135 lbs)\nTime Cap: 25 minutes'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. ${testCase.name}`);
    console.log('-'.repeat(40));
    console.log(`Input: "${testCase.input}"`);
    
    try {
      const result = await PRDWorkoutParser.parseWorkout(testCase.input);
      
      console.log(`✅ Workout Found: ${result.workoutFound}`);
      console.log(`📁 Category: ${result.matchedCategory}`);
      console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      
      if (result.workoutData) {
        console.log(`📝 Name: ${result.workoutData.name}`);
        console.log(`🏃 Type: ${result.workoutData.workoutType}`);
        console.log(`📊 Scoring: ${result.workoutData.scoring}`);
        if (result.workoutData.timeCap) {
          console.log(`⏰ Time Cap: ${result.workoutData.timeCap / 60} minutes`);
        }
        console.log(`💪 Total Effort: ${result.workoutData.totalEffort}`);
        if (result.workoutData.barbellLifts.length > 0) {
          console.log(`🏋️ Barbell Lifts: ${result.workoutData.barbellLifts.join(', ')}`);
        }
        if (result.workoutData.sourceTable) {
          console.log(`📋 Source: ${result.workoutData.sourceTable} (ID: ${result.workoutData.databaseId})`);
        }
      }
      
      if (result.suggestedWorkouts && result.suggestedWorkouts.length > 0) {
        console.log(`💡 Suggestions: ${result.suggestedWorkouts.join(', ')}`);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log(`❌ Errors: ${result.errors.join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error}`);
    }
  }

  // Test workout suggestions
  console.log('\n🔍 Testing Workout Suggestions');
  console.log('=' .repeat(60));
  
  const suggestionTests = ['Fr', 'Mur', 'Filth', 'Dead', 'Pull'];
  
  for (const partial of suggestionTests) {
    try {
      const suggestions = await PRDWorkoutParser.getWorkoutSuggestions(partial, 5);
      console.log(`"${partial}" → [${suggestions.join(', ')}]`);
    } catch (error) {
      console.log(`❌ Suggestion test failed for "${partial}": ${error}`);
    }
  }

  console.log('\n🎉 PRD Parser Testing Complete!');
}

// Run the tests
testPRDParser().catch(console.error);
