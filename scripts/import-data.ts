import { db } from "../server/db.js";
import { workouts, communities } from "../shared/schema.js";

async function importSampleData() {
  try {
    console.log('Starting data import...');

    // Insert sample communities
    const communityData = [
      {
        name: 'CrossFit Downtown',
        location: 'Downtown District',
        description: 'Premier CrossFit gym in the heart of the city',
        managerId: 'sample-manager-id',
        socialHandles: { instagram: '@cfdowntown', facebook: 'CFDowntown' }
      },
      {
        name: 'Elite Fitness Box',
        location: 'Westside',
        description: 'High-performance training facility',
        managerId: 'sample-manager-id-2',
        socialHandles: { instagram: '@elitefitness', website: 'elitefitness.com' }
      }
    ];

    const insertedCommunities = await db.insert(communities).values(communityData).returning();
    console.log(`✓ Inserted ${insertedCommunities.length} communities`);

    // Insert sample workouts
    const workoutData = [
      {
        name: 'Fran',
        description: '21-15-9 for time:\nThrusters (95/65 lb)\nPull-ups',
        type: 'for_time' as const,
        timeCap: 600,
        totalEffort: 45,
        relatedBenchmark: 'fran',
        barbellLifts: ['thruster'],
        isPublic: true,
        communityId: insertedCommunities[0].id
      },
      {
        name: 'Grace',
        description: 'For time:\n30 Clean and jerks (135/95 lb)',
        type: 'for_time' as const,
        timeCap: 300,
        totalEffort: 30,
        relatedBenchmark: 'grace',
        barbellLifts: ['clean and jerk'],
        isPublic: true,
        communityId: insertedCommunities[0].id
      },
      {
        name: 'Murph',
        description: 'For time:\n1 mile run\n100 pull-ups\n200 push-ups\n300 air squats\n1 mile run\n*Partition the pull-ups, push-ups, and squats as needed. Start and finish with a mile run. If you have a 20 lb vest or body armor, wear it.',
        type: 'for_time' as const,
        timeCap: 3600,
        totalEffort: 100,
        relatedBenchmark: 'murph',
        isPublic: true,
        communityId: insertedCommunities[0].id
      },
      {
        name: 'Cindy',
        description: '20 minutes AMRAP:\n5 Pull-ups\n10 Push-ups\n15 Air squats',
        type: 'amrap' as const,
        timeCap: 1200,
        totalEffort: 20,
        relatedBenchmark: 'cindy',
        isPublic: true,
        communityId: insertedCommunities[0].id
      },
      {
        name: 'Helen',
        description: 'For time:\n3 rounds of:\n400m run\n21 Kettlebell swings (53/35 lb)\n12 Pull-ups',
        type: 'for_time' as const,
        timeCap: 900,
        totalEffort: 66,
        relatedBenchmark: 'helen',
        isPublic: true,
        communityId: insertedCommunities[0].id
      },
      {
        name: 'Fight Gone Bad',
        description: 'Three rounds of:\nWall-ball, 20 pound ball, 10 ft target (Reps)\nSubed row, 75 / 55 pounds (Reps)\nBox jump, 20″ box (Reps)\nPush-press, 75 pounds (Reps)\nRowing, 15 calories (Calories)\nIn this workout you move from each of five stations after a minute.The clock does not reset or stop between exercises. This is a five-minute round from which a one-minute break is allowed before repeating. On call of "rotate", the athletes must move to next station immediately for best score. One point is given for each rep, except on the rower where each calorie is one point.',
        type: 'amrap' as const,
        timeCap: 1020,
        totalEffort: 75,
        relatedBenchmark: 'fight gone bad',
        isPublic: true,
        communityId: insertedCommunities[1].id
      },
      {
        name: 'Daily WOD - Strength Focus',
        description: 'Strength:\nBack Squat 5-5-3-3-1-1-1\n\nMetcon:\n12 min AMRAP:\n10 Deadlifts (225/155)\n15 Box Jumps (24/20)\n20 Wall Balls (20/14)',
        type: 'strength' as const,
        timeCap: 720,
        totalEffort: 60,
        barbellLifts: ['back squat', 'deadlift'],
        isPublic: true,
        communityId: insertedCommunities[1].id
      }
    ];

    const insertedWorkouts = await db.insert(workouts).values(workoutData).returning();
    console.log(`✓ Inserted ${insertedWorkouts.length} workouts`);

    console.log('✅ Data import completed successfully!');
    console.log('\nSample data includes:');
    console.log('- 2 communities with different locations');
    console.log('- 7 workouts including famous CrossFit benchmarks');
    console.log('- Mix of workout types: for_time, amrap, strength');
    console.log('- Proper barbell lift associations');

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
}

// Run the import
importSampleData()
  .then(() => {
    console.log('Import script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import script failed:', error);
    process.exit(1);
  });