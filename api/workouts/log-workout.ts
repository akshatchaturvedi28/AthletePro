import { Request, Response } from 'express';
import { db } from '../../server/db';
import { workoutLogs, workoutBarbellLifts, barbellLifts } from '../../shared/schema';
import { ProgressTracker } from '../../server/services/progressTracker';
import { eq, and, desc } from 'drizzle-orm';

export interface WorkoutLogRequest {
  userId: string;
  workoutId: number;
  workoutSource: string;
  date: string;
  workoutName: string;
  workoutType: string;
  timeCap: number | null;
  timeTaken: number | null;
  totalEffort: number;
  humanReadableScore: string;
  barbellLiftDetails: Record<string, Record<string, number>>;
  scaleType: string;
  scaleDescription?: string;
  notes?: string;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId: requestUserId,
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
    }: WorkoutLogRequest = req.body;

    // Resolve userId - if "current-user", get from auth or use a fallback
    let userId = requestUserId;
    if (requestUserId === "current-user") {
      // For now, use the most recent user ID from workout_logs as fallback
      // In a real app, this would come from authentication middleware
      
      // Get the most recent user ID from workout_logs as a reasonable fallback
      const recentLog = await db.select({ userId: workoutLogs.userId })
        .from(workoutLogs)
        .orderBy(desc(workoutLogs.createdAt))
        .limit(1);
      
      if (recentLog.length > 0) {
        userId = recentLog[0].userId;
      } else {
        return res.status(400).json({ 
          error: 'Unable to resolve current user. Please provide a valid userId or authenticate properly.' 
        });
      }
    }

    // Validate required fields
    if (!userId || !workoutId || !workoutSource || !date || !workoutName || !workoutType) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, workoutId, workoutSource, date, workoutName, workoutType' 
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

    // Calculate final score using the Progress Tracking Algorithm
    const finalScore = ProgressTracker.calculateFinalScore(
      workoutType,
      timeTaken,
      totalEffort,
      timeCap,
      finishedWorkout
    );

    
    // Insert workout log
    let workoutLogResult;
    try {
      workoutLogResult = await db.insert(workoutLogs).values({
        userId,
        workoutId,
        date,
        timeTaken,
        totalEffort,
        scaleType,
        scaleDescription,
        humanReadableScore,
        finalScore: finalScore.toString(),
        barbellLiftDetails: barbellLiftDetails || {},
        notes
      }).returning({ id: workoutLogs.id });
      
    } catch (dbError) {
      console.error('❌ Database insertion failed:', dbError);
      throw dbError; // Re-throw to be caught by outer try-catch
    }

    const workoutLogId = workoutLogResult[0].id;
    
    // Update barbell lifts progress if there are barbell lift details
    if (barbellLiftDetails && Object.keys(barbellLiftDetails).length > 0) {
      try {
        await ProgressTracker.updateBarbellLiftsProgress(
          userId,
          workoutId,
          workoutSource,
          barbellLiftDetails,
          date
        );
      } catch (error) {
        console.error('❌ Error in barbell lifts progress update:', error);
        // Don't throw - we still want to return success for the workout log
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
        userId,
        workoutId,
        date,
        timeTaken,
        totalEffort,
        finalScore,
        humanReadableScore,
        scaleType,
        scaleDescription,
        barbellLiftDetails,
        notes,
        createdAt: new Date().toISOString()
      }
    };

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

/**
 * Helper function to get barbell lifts for a workout
 * Used by the frontend to determine which barbell lift inputs to show
 */
export async function getWorkoutBarbellLifts(
  workoutId: number, 
  workoutSource: string
): Promise<{ id: number; liftName: string }[]> {
  try {
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
          eq(workoutBarbellLifts.sourceType, workoutSource)
        )
      );

    return result;
  } catch (error) {
    console.error('Error fetching workout barbell lifts:', error);
    return [];
  }
}
