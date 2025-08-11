/**
 * Test Workout Examples for PRD Phase 1 Parsing Algorithm
 * 
 * This file contains comprehensive test cases to validate the PRD parsing implementation
 * across all workout categories and parsing scenarios.
 */

export const TEST_WORKOUT_EXAMPLES = {
  // Known Girl WODs (should get 90% confidence)
  girlWods: [
    {
      name: "Perfect Fran",
      input: `
27-June-2025 | Friday

Fran
21-15-9 reps for time of:
Thrusters (95/65 lb)
Pull-ups

Time cap: 8 minutes
      `,
      expected: {
        confidence: 0.9,
        category: 'girls',
        workoutName: 'Fran'
      }
    },
    {
      name: "Helen Variation", 
      input: `
Helen
3 rounds for time of:
400m Run
21 Kettlebell Swings (53/35 lb)
12 Pull-ups
      `,
      expected: {
        confidence: 0.9,
        category: 'girls',
        workoutName: 'Helen'
      }
    },
    {
      name: "Grace Test",
      input: `
Grace
30 Clean and Jerks for time
135/95 lb
      `,
      expected: {
        confidence: 0.9,
        category: 'girls',
        workoutName: 'Grace'
      }
    }
  ],

  // Known Hero WODs (should get 90% confidence)
  heroWods: [
    {
      name: "Murph Memorial Day",
      input: `
Memorial Day Murph
For time:
1 mile Run
100 Pull-ups
200 Push-ups
300 Air Squats
1 mile Run

*Partition the pull-ups, push-ups, and air squats as needed.
*Start and finish with a mile run.
*If you have a 20 lb vest or body armor, wear it.
      `,
      expected: {
        confidence: 0.9,
        category: 'heroes',
        workoutName: 'Murph'
      }
    },
    {
      name: "Josh Hero WOD",
      input: `
Josh
For time:
95-lb. overhead squats, 21 reps
42 pull-ups
95-lb. overhead squats, 15 reps
30 pull-ups
95-lb. overhead squats, 9 reps
18 pull-ups
      `,
      expected: {
        confidence: 0.9,
        category: 'heroes',
        workoutName: 'Josh'
      }
    }
  ],

  // Known Notable WODs (should get 90% confidence)
  notableWods: [
    {
      name: "Filthy Fifty",
      input: `
Filthy Fifty
For time:
50 Box jumps (24/20 in)
50 Jumping pull-ups
50 Kettlebell swings (35/26 lb)
50 Walking lunges
50 Knees-to-elbows
50 Push presses (45/35 lb)
50 Back extensions
50 Wall ball shots (20/14 lb)
50 Burpees
50 Double unders
      `,
      expected: {
        confidence: 0.9,
        category: 'notables',
        workoutName: 'Filthy Fifty'
      }
    },
    {
      name: "Fight Gone Bad",
      input: `
Fight Gone Bad
3 rounds of:
Wall-ball shots (20/14 lb)
Sumo deadlift high-pulls (75/55 lb)
Box jumps (20/18 in)
Push presses (75/55 lb)
Row (calories)

In this workout you move from each of the five stations after a minute. The clock does not reset or stop between exercises. This is a five-minute round from which a one-minute break is allowed before repeating. On call of "rotate", the athletes must move to next station immediately for best score. One point is given for each rep, except on the rower where each calorie is one point.
      `,
      expected: {
        confidence: 0.9,
        category: 'notables',
        workoutName: 'Fight Gone Bad'
      }
    }
  ],

  // Custom Workouts (should get ~80% confidence)
  customWorkouts: [
    {
      name: "AMRAP Custom",
      input: `
28-June-2025 | Saturday

Workout: Summer Sweat
AMRAP 20 minutes:
10 Burpees
15 Kettlebell Swings (53/35)
20 Air Squats
25 Double Unders
      `,
      expected: {
        confidence: 0.8,
        category: 'new_custom',
        workoutType: 'amrap'
      }
    },
    {
      name: "For Time Custom",
      input: `
Chicago Slice
For Time:
120 Double Unders
30 Kettlebell Swings (53/35)
50 Back Squats (135/95)
30 Kettlebell Swings (53/35)
120 Double Unders
Cap: 13 mins
      `,
      expected: {
        confidence: 0.8,
        category: 'new_custom',
        workoutType: 'for_time'
      }
    },
    {
      name: "EMOM Custom",
      input: `
Strength Builder
EMOM 16 minutes:
Min 1-4: 5 Front Squats (70% 1RM)
Min 5-8: 8 Pull-ups + 12 Push-ups
Min 9-12: 10 Kettlebell Swings (70/53)
Min 13-16: 15 Air Squats
      `,
      expected: {
        confidence: 0.8,
        category: 'new_custom',
        workoutType: 'emom'
      }
    },
    {
      name: "Strength Focus",
      input: `
27-June-2025 | Friday

STRENGTH
Build to 1 RM Clean and Jerk in 15 mins.
Work up to a heavy single, then drop to 85% for 3 singles.

Accessory:
3 rounds:
10 Front Squats (moderate)
15 Ring Dips
20 Hollow Rocks
      `,
      expected: {
        confidence: 0.8,
        category: 'new_custom',
        workoutType: 'strength'
      }
    }
  ],

  // Typo/Partial Match Tests (should provide suggestions)
  typoTests: [
    {
      name: "Fran Typo",
      input: `
Fren
21-15-9 reps for time of:
Thrusters (95/65 lb)
Pull-ups
      `,
      expected: {
        confidence: 0.0,
        suggestions: ['Fran']
      }
    },
    {
      name: "Helen Partial",
      input: `
Heln
3 rounds for time of:
400m Run
21 Kettlebell Swings
12 Pull-ups
      `,
      expected: {
        confidence: 0.0,
        suggestions: ['Helen']
      }
    },
    {
      name: "Murph Variation",
      input: `
Murphy
For time:
1 mile Run
100 Pull-ups
200 Push-ups
300 Air Squats
1 mile Run
      `,
      expected: {
        confidence: 0.0,
        suggestions: ['Murph']
      }
    }
  ],

  // Complex Workouts with Multiple Components
  complexWorkouts: [
    {
      name: "Multi-Modal Workout",
      input: `
29-June-2025 | Sunday

Warm-up:
10 min easy bike
Dynamic stretching

Strength:
Back Squat
5-5-3-3-1-1 (build to heavy single)

Workout: "Beast Mode"
For Time:
50 Burpees
40 Overhead Squats (135/95)
30 Muscle-ups
20 Deadlifts (225/155)
10 Handstand Push-ups

Time cap: 20 minutes

Cool down:
800m walk
Static stretching
      `,
      expected: {
        confidence: 0.8,
        category: 'new_custom',
        workoutType: 'for_time',
        barbellLifts: ['Back Squat', 'Overhead Squat', 'Deadlift']
      }
    }
  ]
};

// Test runner function for validation
export async function runPRDParsingTests() {
  const { PRDWorkoutParser } = await import('./services/prdWorkoutParser');
  
  console.log('\n🧪 Running PRD Phase 1 Parsing Tests...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test Girl WODs
  console.log('💪 Testing Girl WODs...');
  for (const test of TEST_WORKOUT_EXAMPLES.girlWods) {
    totalTests++;
    try {
      const result = await PRDWorkoutParser.parseWorkout(test.input, 'test-user');
      
      const passed = result.confidence >= test.expected.confidence && 
                     result.matchedCategory === test.expected.category;
      
      if (passed) {
        passedTests++;
        console.log(`  ✅ ${test.name}: ${Math.round(result.confidence * 100)}% confidence, ${result.matchedCategory}`);
      } else {
        console.log(`  ❌ ${test.name}: Expected ${test.expected.confidence}, got ${result.confidence}`);
      }
    } catch (error) {
      console.log(`  💥 ${test.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Test Hero WODs
  console.log('\n🎖️ Testing Hero WODs...');
  for (const test of TEST_WORKOUT_EXAMPLES.heroWods) {
    totalTests++;
    try {
      const result = await PRDWorkoutParser.parseWorkout(test.input, 'test-user');
      
      const passed = result.confidence >= test.expected.confidence && 
                     result.matchedCategory === test.expected.category;
      
      if (passed) {
        passedTests++;
        console.log(`  ✅ ${test.name}: ${Math.round(result.confidence * 100)}% confidence, ${result.matchedCategory}`);
      } else {
        console.log(`  ❌ ${test.name}: Expected ${test.expected.confidence}, got ${result.confidence}`);
      }
    } catch (error) {
      console.log(`  💥 ${test.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Test Notable WODs
  console.log('\n⭐ Testing Notable WODs...');
  for (const test of TEST_WORKOUT_EXAMPLES.notableWods) {
    totalTests++;
    try {
      const result = await PRDWorkoutParser.parseWorkout(test.input, 'test-user');
      
      const passed = result.confidence >= test.expected.confidence && 
                     result.matchedCategory === test.expected.category;
      
      if (passed) {
        passedTests++;
        console.log(`  ✅ ${test.name}: ${Math.round(result.confidence * 100)}% confidence, ${result.matchedCategory}`);
      } else {
        console.log(`  ❌ ${test.name}: Expected ${test.expected.confidence}, got ${result.confidence}`);
      }
    } catch (error) {
      console.log(`  💥 ${test.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Test Custom Workouts
  console.log('\n🔧 Testing Custom Workouts...');
  for (const test of TEST_WORKOUT_EXAMPLES.customWorkouts) {
    totalTests++;
    try {
      const result = await PRDWorkoutParser.parseWorkout(test.input, 'test-user');
      
      const passed = result.confidence >= (test.expected.confidence - 0.1); // Allow some tolerance
      
      if (passed) {
        passedTests++;
        console.log(`  ✅ ${test.name}: ${Math.round(result.confidence * 100)}% confidence, ${result.matchedCategory}, ${result.workoutData?.workoutType}`);
      } else {
        console.log(`  ❌ ${test.name}: Expected ~${test.expected.confidence}, got ${result.confidence}`);
      }
    } catch (error) {
      console.log(`  💥 ${test.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Test Typo Suggestions
  console.log('\n🔍 Testing Typo Suggestions...');
  for (const test of TEST_WORKOUT_EXAMPLES.typoTests) {
    totalTests++;
    try {
      const result = await PRDWorkoutParser.parseWorkout(test.input, 'test-user');
      
      const passed = result.suggestedWorkouts && result.suggestedWorkouts.length > 0;
      
      if (passed) {
        passedTests++;
        console.log(`  ✅ ${test.name}: Suggestions: ${result.suggestedWorkouts?.join(', ') || 'None'}`);
      } else {
        console.log(`  ❌ ${test.name}: No suggestions provided`);
      }
    } catch (error) {
      console.log(`  💥 ${test.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Summary
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests * 100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! PRD Phase 1 implementation is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check implementation for issues.');
  }
  
  return { totalTests, passedTests, successRate: passedTests / totalTests };
}

// Export for external use
export default TEST_WORKOUT_EXAMPLES;
