import { drizzle } from 'drizzle-orm/postgres-js';
import { 
  girlWods, 
  heroWods, 
  notables, 
  customCommunityWorkouts, 
  customUserWorkouts,
  barbellLifts,
  workoutBarbellLifts
} from '../shared/schema.js';
import { sql, eq } from 'drizzle-orm';
import { db } from './db.js';

interface WorkoutWithLifts {
  id: number;
  barbellLifts: string[] | null;
}

interface MigrationLog {
  sourceType: string;
  workoutId: number;
  workoutName?: string;
  originalLifts: string[];
  matchedLifts: Array<{ liftName: string; id: number }>;
  unmatchedLifts: string[];
}

// Helper function to match lift names
const matchLiftNames = (liftNames: string[], liftNameMap: Map<string, { id: number; liftName: string }>): { matched: Array<{ liftName: string; id: number }>, unmatched: string[] } => {
  const matched: Array<{ liftName: string; id: number }> = [];
  const unmatched: string[] = [];
  
  liftNames.forEach(liftName => {
    const cleanLiftName = liftName.trim();
    const lowerLiftName = cleanLiftName.toLowerCase();
    
    if (liftNameMap.has(lowerLiftName)) {
      const matchedLift = liftNameMap.get(lowerLiftName)!;
      matched.push(matchedLift);
    } else {
      unmatched.push(cleanLiftName);
    }
  });
  
  return { matched, unmatched };
};

// Helper function to insert junction table records
const insertJunctionRecords = async (workoutId: number, sourceType: string, matchedLifts: Array<{ liftName: string; id: number }>) => {
  for (const lift of matchedLifts) {
    try {
      await db.insert(workoutBarbellLifts).values({
        workoutId,
        barbellLiftId: lift.id,
        sourceType
      }).onConflictDoNothing();
    } catch (error) {
      console.error(`Error inserting junction record for workout ${workoutId}, lift ${lift.id}:`, error);
    }
  }
};

async function migrateWorkoutBarbellLifts() {
  console.log('Starting barbell lifts migration...');
  
  const migrationLogs: MigrationLog[] = [];
  let totalProcessed = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;

  try {
    // First, get all existing barbell lifts for matching
    const allBarbellLifts = await db.select().from(barbellLifts);
    console.log(`Found ${allBarbellLifts.length} barbell lifts in reference table`);
    
    // Create a map for case-insensitive matching
    const liftNameMap = new Map<string, { id: number; liftName: string }>();
    allBarbellLifts.forEach(lift => {
      liftNameMap.set(lift.liftName.toLowerCase(), { id: lift.id, liftName: lift.liftName });
    });

    // Migrate Girl WODs
    console.log('\nMigrating Girl WODs...');
    const girlWodsData = await db.select({
      id: girlWods.id,
      name: girlWods.name,
      barbellLifts: sql<string[] | null>`girl_wods.barbell_lifts`
    }).from(girlWods).where(sql`girl_wods.barbell_lifts IS NOT NULL`);

    for (const workout of girlWodsData) {
      if (workout.barbellLifts && Array.isArray(workout.barbellLifts)) {
        const { matched, unmatched } = matchLiftNames(workout.barbellLifts, liftNameMap);
        
        migrationLogs.push({
          sourceType: 'girl_wods',
          workoutId: workout.id,
          workoutName: workout.name,
          originalLifts: workout.barbellLifts,
          matchedLifts: matched,
          unmatchedLifts: unmatched
        });

        await insertJunctionRecords(workout.id, 'girl_wods', matched);
        
        totalProcessed++;
        totalMatched += matched.length;
        totalUnmatched += unmatched.length;
      }
    }

    // Migrate Hero WODs
    console.log('Migrating Hero WODs...');
    const heroWodsData = await db.select({
      id: heroWods.id,
      name: heroWods.name,
      barbellLifts: sql<string[] | null>`hero_wods.barbell_lifts`
    }).from(heroWods).where(sql`hero_wods.barbell_lifts IS NOT NULL`);

    for (const workout of heroWodsData) {
      if (workout.barbellLifts && Array.isArray(workout.barbellLifts)) {
        const { matched, unmatched } = matchLiftNames(workout.barbellLifts, liftNameMap);
        
        migrationLogs.push({
          sourceType: 'hero_wods',
          workoutId: workout.id,
          workoutName: workout.name,
          originalLifts: workout.barbellLifts,
          matchedLifts: matched,
          unmatchedLifts: unmatched
        });

        await insertJunctionRecords(workout.id, 'hero_wods', matched);
        
        totalProcessed++;
        totalMatched += matched.length;
        totalUnmatched += unmatched.length;
      }
    }

    // Migrate Notables
    console.log('Migrating Notables...');
    const notablesData = await db.select({
      id: notables.id,
      name: notables.name,
      barbellLifts: sql<string[] | null>`notables.barbell_lifts`
    }).from(notables).where(sql`notables.barbell_lifts IS NOT NULL`);

    for (const workout of notablesData) {
      if (workout.barbellLifts && Array.isArray(workout.barbellLifts)) {
        const { matched, unmatched } = matchLiftNames(workout.barbellLifts, liftNameMap);
        
        migrationLogs.push({
          sourceType: 'notables',
          workoutId: workout.id,
          workoutName: workout.name,
          originalLifts: workout.barbellLifts,
          matchedLifts: matched,
          unmatchedLifts: unmatched
        });

        await insertJunctionRecords(workout.id, 'notables', matched);
        
        totalProcessed++;
        totalMatched += matched.length;
        totalUnmatched += unmatched.length;
      }
    }

    // Migrate Custom Community Workouts
    console.log('Migrating Custom Community Workouts...');
    const customCommunityData = await db.select({
      id: customCommunityWorkouts.id,
      name: customCommunityWorkouts.name,
      barbellLifts: sql<string[] | null>`custom_community_workouts.barbell_lifts`
    }).from(customCommunityWorkouts).where(sql`custom_community_workouts.barbell_lifts IS NOT NULL`);

    for (const workout of customCommunityData) {
      if (workout.barbellLifts && Array.isArray(workout.barbellLifts)) {
        const { matched, unmatched } = matchLiftNames(workout.barbellLifts, liftNameMap);
        
        migrationLogs.push({
          sourceType: 'custom_community_workouts',
          workoutId: workout.id,
          workoutName: workout.name,
          originalLifts: workout.barbellLifts,
          matchedLifts: matched,
          unmatchedLifts: unmatched
        });

        await insertJunctionRecords(workout.id, 'custom_community_workouts', matched);
        
        totalProcessed++;
        totalMatched += matched.length;
        totalUnmatched += unmatched.length;
      }
    }

    // Migrate Custom User Workouts
    console.log('Migrating Custom User Workouts...');
    const customUserData = await db.select({
      id: customUserWorkouts.id,
      name: customUserWorkouts.name,
      barbellLifts: sql<string[] | null>`custom_user_workouts.barbell_lifts`
    }).from(customUserWorkouts).where(sql`custom_user_workouts.barbell_lifts IS NOT NULL`);

    for (const workout of customUserData) {
      if (workout.barbellLifts && Array.isArray(workout.barbellLifts)) {
        const { matched, unmatched } = matchLiftNames(workout.barbellLifts, liftNameMap);
        
        migrationLogs.push({
          sourceType: 'custom_user_workouts',
          workoutId: workout.id,
          workoutName: workout.name,
          originalLifts: workout.barbellLifts,
          matchedLifts: matched,
          unmatchedLifts: unmatched
        });

        await insertJunctionRecords(workout.id, 'custom_user_workouts', matched);
        
        totalProcessed++;
        totalMatched += matched.length;
        totalUnmatched += unmatched.length;
      }
    }

    // Generate migration report
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Total workouts processed: ${totalProcessed}`);
    console.log(`Total lifts matched: ${totalMatched}`);
    console.log(`Total lifts unmatched: ${totalUnmatched}`);

    // Show unmatched lifts for review
    const unmatchedLiftsSet = new Set<string>();
    migrationLogs.forEach(log => {
      log.unmatchedLifts.forEach(lift => unmatchedLiftsSet.add(lift));
    });

    if (unmatchedLiftsSet.size > 0) {
      console.log('\n=== UNMATCHED LIFTS (need manual review) ===');
      Array.from(unmatchedLiftsSet).sort().forEach(lift => {
        console.log(`- "${lift}"`);
      });
    }

    // Show detailed logs if there are issues
    const logsWithUnmatched = migrationLogs.filter(log => log.unmatchedLifts.length > 0);
    if (logsWithUnmatched.length > 0) {
      console.log('\n=== DETAILED UNMATCHED LOGS ===');
      logsWithUnmatched.forEach(log => {
        console.log(`\n${log.sourceType} - ${log.workoutName} (ID: ${log.workoutId})`);
        console.log(`  Original lifts: ${log.originalLifts.join(', ')}`);
        console.log(`  Matched: ${log.matchedLifts.map(l => l.liftName).join(', ')}`);
        console.log(`  Unmatched: ${log.unmatchedLifts.join(', ')}`);
      });
    }

    // Verify junction table data
    console.log('\n=== VERIFICATION ===');
    const junctionCount = await db.select({ count: sql<number>`count(*)` }).from(workoutBarbellLifts);
    console.log(`Total records in junction table: ${junctionCount[0].count}`);

    // Count by source type
    const countBySource = await db.select({
      sourceType: workoutBarbellLifts.sourceType,
      count: sql<number>`count(*)`
    }).from(workoutBarbellLifts).groupBy(workoutBarbellLifts.sourceType);
    
    console.log('Records by source type:');
    countBySource.forEach(row => {
      console.log(`  ${row.sourceType}: ${row.count}`);
    });

    console.log('\nMigration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateWorkoutBarbellLifts()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateWorkoutBarbellLifts };
