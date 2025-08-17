const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Database connection
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = drizzle(connection);

async function migrateData() {
  console.log('🚀 Starting Barbell Lifts Migration...\n');

  try {
    // Check if the new tables exist
    console.log('📋 Checking database structure...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'barbell_lifts'");
    if (tables.length === 0) {
      console.log('❌ Error: barbell_lifts table not found. Please run database migrations first.');
      process.exit(1);
    }

    const [junctionTables] = await connection.execute("SHOW TABLES LIKE 'workout_barbell_lifts'");
    if (junctionTables.length === 0) {
      console.log('❌ Error: workout_barbell_lifts table not found. Please run database migrations first.');
      process.exit(1);
    }

    console.log('✅ Required tables found.\n');

    // Get all available barbell lifts for mapping
    console.log('📚 Loading barbell lifts dictionary...');
    const [barbellLifts] = await connection.execute('SELECT id, lift_name FROM barbell_lifts');
    const liftNameToId = {};
    barbellLifts.forEach(lift => {
      liftNameToId[lift.lift_name.toLowerCase()] = lift.id;
    });
    
    console.log(`✅ Loaded ${barbellLifts.length} barbell lifts.\n`);

    // Helper function to parse JSON and map lift names to IDs
    function mapLiftsToIds(jsonString) {
      if (!jsonString) return [];
      
      try {
        const lifts = JSON.parse(jsonString);
        if (!Array.isArray(lifts)) return [];
        
        return lifts
          .map(liftName => {
            const normalizedName = liftName.toLowerCase();
            const liftId = liftNameToId[normalizedName];
            if (!liftId) {
              console.log(`⚠️  Warning: Unknown lift "${liftName}"`);
              return null;
            }
            return liftId;
          })
          .filter(id => id !== null);
      } catch (error) {
        console.log(`⚠️  Warning: Invalid JSON: ${jsonString}`);
        return [];
      }
    }

    // Migration functions for each table
    async function migrateTable(tableName, workoutIdColumn = 'id') {
      console.log(`\n🔄 Migrating ${tableName}...`);
      
      // Check if the table has the barbell_lifts column
      const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName} LIKE 'barbell_lifts'`);
      if (columns.length === 0) {
        console.log(`⚠️  ${tableName} doesn't have barbell_lifts column, skipping...`);
        return 0;
      }

      // Get all records with barbell lifts
      const [records] = await connection.execute(
        `SELECT ${workoutIdColumn}, barbell_lifts FROM ${tableName} WHERE barbell_lifts IS NOT NULL AND barbell_lifts != '[]'`
      );

      let insertedCount = 0;
      
      for (const record of records) {
        const liftIds = mapLiftsToIds(record.barbell_lifts);
        
        if (liftIds.length > 0) {
          // Insert into junction table
          for (const liftId of liftIds) {
            try {
              await connection.execute(
                'INSERT IGNORE INTO workout_barbell_lifts (workout_id, workout_type, barbell_lift_id) VALUES (?, ?, ?)',
                [record[workoutIdColumn], tableName, liftId]
              );
              insertedCount++;
            } catch (error) {
              console.log(`❌ Error inserting ${tableName}:${record[workoutIdColumn]} -> lift:${liftId}: ${error.message}`);
            }
          }
        }
      }
      
      console.log(`✅ ${tableName}: Processed ${records.length} records, inserted ${insertedCount} relationships`);
      return insertedCount;
    }

    // Migrate each table
    let totalInserted = 0;
    totalInserted += await migrateTable('girl_wods');
    totalInserted += await migrateTable('hero_wods');
    totalInserted += await migrateTable('notables');
    totalInserted += await migrateTable('custom_user_workouts');
    totalInserted += await migrateTable('custom_community_workouts');

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total relationships created: ${totalInserted}`);

    // Verification
    console.log('\n🔍 Verification:');
    const [verification] = await connection.execute('SELECT COUNT(*) as count FROM workout_barbell_lifts');
    console.log(`✅ Total records in workout_barbell_lifts: ${verification[0].count}`);

    // Show distribution by workout type
    const [distribution] = await connection.execute(`
      SELECT workout_type, COUNT(*) as count 
      FROM workout_barbell_lifts 
      GROUP BY workout_type 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Distribution by workout type:');
    distribution.forEach(row => {
      console.log(`   ${row.workout_type}: ${row.count} relationships`);
    });

    console.log('\n✅ Migration completed successfully! 🎉');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
