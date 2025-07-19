import dotenv from 'dotenv';
import { Pool } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function importSampleData() {
  try {
    console.log('🚀 Starting data import...');

    // Insert sample communities
    const communityResult = await pool.query(`
      INSERT INTO communities (name, location, description, manager_id, social_handles)
      VALUES 
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10)
      RETURNING id, name;
    `, [
      'CrossFit Downtown', 'Downtown District', 'Premier CrossFit gym in the heart of the city', 'sample-manager-1', JSON.stringify({ instagram: '@cfdowntown', facebook: 'CFDowntown' }),
      'Elite Fitness Box', 'Westside', 'High-performance training facility', 'sample-manager-2', JSON.stringify({ instagram: '@elitefitness', website: 'elitefitness.com' })
    ]);

    const communityIds = communityResult.rows.map(row => row.id);
    console.log(`✅ Inserted ${communityIds.length} communities`);

    // Insert sample workouts
    await pool.query(`
      INSERT INTO workouts (name, description, type, time_cap, total_effort, related_benchmark, barbell_lifts, is_public, community_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9),
        ($10, $11, $12, $13, $14, $15, $16, $17, $18),
        ($19, $20, $21, $22, $23, $24, $25, $26, $27),
        ($28, $29, $30, $31, $32, $33, $34, $35, $36),
        ($37, $38, $39, $40, $41, $42, $43, $44, $45),
        ($46, $47, $48, $49, $50, $51, $52, $53, $54);
    `, [
      // Fran
      'Fran', '21-15-9 for time:\nThrusters (95/65 lb)\nPull-ups', 'for_time', 600, 45, 'fran', JSON.stringify(['thruster']), true, communityIds[0],
      // Grace
      'Grace', 'For time:\n30 Clean and jerks (135/95 lb)', 'for_time', 300, 30, 'grace', JSON.stringify(['clean and jerk']), true, communityIds[0],
      // Murph
      'Murph', 'For time:\n1 mile run\n100 pull-ups\n200 push-ups\n300 air squats\n1 mile run\n*Partition the pull-ups, push-ups, and squats as needed. Start and finish with a mile run. If you have a 20 lb vest or body armor, wear it.', 'for_time', 3600, 100, 'murph', null, true, communityIds[0],
      // Cindy
      'Cindy', '20 minutes AMRAP:\n5 Pull-ups\n10 Push-ups\n15 Air squats', 'amrap', 1200, 20, 'cindy', null, true, communityIds[0],
      // Helen
      'Helen', 'For time:\n3 rounds of:\n400m run\n21 Kettlebell swings (53/35 lb)\n12 Pull-ups', 'for_time', 900, 66, 'helen', null, true, communityIds[0],
      // Daily WOD
      'Daily WOD - Strength Focus', 'Strength:\nBack Squat 5-5-3-3-1-1-1\n\nMetcon:\n12 min AMRAP:\n10 Deadlifts (225/155)\n15 Box Jumps (24/20)\n20 Wall Balls (20/14)', 'strength', 720, 60, null, JSON.stringify(['back squat', 'deadlift']), true, communityIds[1]
    ]);

    console.log('✅ Inserted 6 workouts');

    console.log('\n🎉 Data import completed successfully!');
    console.log('\nSample data includes:');
    console.log('- 2 communities with different locations');
    console.log('- 6 workouts including famous CrossFit benchmarks');
    console.log('- Mix of workout types: for_time, amrap, strength');
    console.log('- Proper barbell lift associations');

  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the import
importSampleData()
  .then(() => {
    console.log('\n✨ Import script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import script failed:', error.message);
    process.exit(1);
  });