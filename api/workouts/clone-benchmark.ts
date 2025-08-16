import { Request, Response } from 'express';
import { db } from '../../server/db';
import { workouts, girlWods, heroWods, notables } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      description: modifications?.workoutDescription || benchmarkWorkout.workoutDescription,
      type: modifications?.workoutType || benchmarkWorkout.workoutType,
      scoring: modifications?.scoring || benchmarkWorkout.scoring,
      timeCap: modifications?.timeCap !== undefined ? modifications.timeCap : benchmarkWorkout.timeCap,
      totalEffort: benchmarkWorkout.totalEffort || null,
      communityId: communityId || null,
      createdBy: 'system', // Will be updated with actual user when auth is implemented
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the cloned workout
    const insertResult = await db.insert(workouts).values(clonedWorkout).returning();
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
