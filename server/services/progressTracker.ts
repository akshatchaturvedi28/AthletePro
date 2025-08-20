import { WorkoutLog, BarbellLiftsProgress, InsertBarbellLiftsProgress } from "@shared/schema";
import { db } from "../db";
import { barbellLiftsProgress, workoutBarbellLifts, barbellLifts } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Progress Tracker Service - Implements the exact Progress Tracking Algorithm from PDF
 */
export class ProgressTracker {
  /**
   * Calculate final score based on workout type and performance
   * Implements exact formulas from the PDF Progress Tracking Algorithm
   */
  static calculateFinalScore(
    workoutType: string,
    timeTaken: number | null,
    totalEffort: number | null,
    timeCap: number | null,
    finishedWorkout: boolean = true
  ): number {
    switch (workoutType) {
      case 'for_time':
      case 'rft': // Rounds for Time
      case 'chipper':
        if (!totalEffort) return 0;
        if (finishedWorkout && timeTaken) {
          // Finished workout before Time Cap: Score = Total time taken / Total effort
          return timeTaken / totalEffort;
        } else if (timeCap && totalEffort) {
          // Didn't finish before Time Cap: Score = Time Cap / Total effort
          return timeCap / totalEffort;
        }
        return 0;
      
      case 'amrap':
      case 'endurance':
      case 'tabata':
      case 'unbroken':
      case 'ladder':
        // Score = Total effort by User
        return totalEffort || 0;
      
      case 'strength':
        // Score = Maximum weight (in kgs) - but we're using lbs
        return totalEffort || 0;
      
      case 'emom':
      case 'interval':
        // Round effort = Total effort in one round or Total effort in one interval
        // Score = Round effort * (Number of rounds completed + 1 / Fastest Time Round (in secs))
        if (!totalEffort || !timeTaken) return 0;
        
        // For simplicity, assume totalEffort is the round effort
        // and timeTaken represents the fastest round time
        const roundEffort = totalEffort;
        const fastestRoundTime = timeTaken;
        const roundsCompleted = Math.floor(timeCap ? timeCap / fastestRoundTime : 1);
        
        return roundEffort * (roundsCompleted + 1 / fastestRoundTime);
      
      default:
        return totalEffort || 0;
    }
  }

  /**
   * Update Barbell Lifts Progress based on workout log
   * Implements the core algorithm from PDF:
   * "If user has done N unbroken reps with W kgs, the user has also done (N-1, N-2, N-3 ... 3, 2, 1) RM with W kgs"
   */
  static async updateBarbellLiftsProgress(
    userId: string,
    workoutId: number,
    workoutSource: string,
    barbellLiftDetails: Record<string, Record<string, number>>,
    date: string
  ): Promise<void> {
    if (!barbellLiftDetails || Object.keys(barbellLiftDetails).length === 0) {
      return;
    }

    try {
      // Get barbell lifts associated with this workout
      const workoutLifts = await db
        .select({
          barbellLiftId: workoutBarbellLifts.barbellLiftId,
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


      for (const [liftName, weightReps] of Object.entries(barbellLiftDetails)) {
        // Find the corresponding barbell lift
        const workoutLift = workoutLifts.find(
          lift => lift.liftName.toLowerCase() === liftName.toLowerCase()
        );

        if (!workoutLift) {
          console.warn(`Barbell lift "${liftName}" not found in workout associations`);
          continue;
        }

        // Get or create progress record for this user and lift
        let progressRecord = await db
          .select()
          .from(barbellLiftsProgress)
          .where(
            and(
              eq(barbellLiftsProgress.userId, userId),
              eq(barbellLiftsProgress.barbellLiftId, workoutLift.barbellLiftId)
            )
          )
          .limit(1);

        if (progressRecord.length === 0) {
          // Create new progress record
          await db.insert(barbellLiftsProgress).values({
            userId,
            barbellLiftId: workoutLift.barbellLiftId,
            liftName: workoutLift.liftName,
            oneRm: {},
            twoRm: {},
            threeRm: {},
            fourRm: {},
            fiveRm: {},
          });

          // Fetch the newly created record
          progressRecord = await db
            .select()
            .from(barbellLiftsProgress)
            .where(
              and(
                eq(barbellLiftsProgress.userId, userId),
                eq(barbellLiftsProgress.barbellLiftId, workoutLift.barbellLiftId)
              )
            )
            .limit(1);
        }

        const currentProgress = progressRecord[0];

        // Update RM records based on the algorithm
        for (const [weight, maxReps] of Object.entries(weightReps)) {
          const weightNum = parseFloat(weight);
          const reps = parseInt(maxReps.toString());

          if (isNaN(weightNum) || isNaN(reps) || reps <= 0 || reps > 5) {
            console.warn(`Invalid weight-reps data: ${weight} x ${reps} for ${liftName}`);
            continue;
          }

          // Update all rep maxes from 1RM to current reps
          // If user did N reps, they also did (N-1, N-2, ..., 1) RM
          const updates: Record<string, any> = {};

          for (let repMax = 1; repMax <= reps; repMax++) {
            const rmField = this.getRmField(repMax);
            if (!rmField) continue;

            // Get current RM data
            const currentRmData = (currentProgress[rmField] as Record<string, number>) || {};
            
            // Check if we need to update this RM
            const currentMaxWeight = Math.max(...Object.values(currentRmData), 0);
            
            if (weightNum > currentMaxWeight) {
              // Update the RM record with new date-weight entry
              const updatedRmData = {
                ...currentRmData,
                [date]: weightNum
              };
              
              updates[rmField] = updatedRmData;
            }
          }

          // Apply updates if any
          if (Object.keys(updates).length > 0) {
            await db
              .update(barbellLiftsProgress)
              .set({
                ...updates,
                updatedAt: new Date(),
              })
              .where(eq(barbellLiftsProgress.id, currentProgress.id));
          }
        }
      }

    } catch (error) {
      console.error("❌ Error updating barbell lifts progress:", error);
      throw error;
    }
  }

  /**
   * Helper method to get the correct RM field name
   */
  private static getRmField(repMax: number): keyof BarbellLiftsProgress | null {
    switch (repMax) {
      case 1: return 'oneRm';
      case 2: return 'twoRm';
      case 3: return 'threeRm';
      case 4: return 'fourRm';
      case 5: return 'fiveRm';
      default: return null;
    }
  }

  /**
   * Get user's barbell lifts progress
   */
  static async getUserBarbellLiftsProgress(userId: string): Promise<BarbellLiftsProgress[]> {
    return await db
      .select()
      .from(barbellLiftsProgress)
      .where(eq(barbellLiftsProgress.userId, userId));
  }

  /**
   * Get progress for a specific lift
   */
  static async getLiftProgress(
    userId: string, 
    barbellLiftId: number
  ): Promise<BarbellLiftsProgress | null> {
    const result = await db
      .select()
      .from(barbellLiftsProgress)
      .where(
        and(
          eq(barbellLiftsProgress.userId, userId),
          eq(barbellLiftsProgress.barbellLiftId, barbellLiftId)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Generate progress insights for a user
   * Updated to work with new barbell lifts progress structure
   */
  static async generateProgressInsights(userId: string): Promise<any> {
    const barbellProgress = await this.getUserBarbellLiftsProgress(userId);

    const insights = {
      totalLifts: barbellProgress.length,
      personalRecords: [] as any[],
      recentProgress: [] as any[],
      strengthGains: [] as any[]
    };

    // Extract personal records from barbell lifts progress
    barbellProgress.forEach(progress => {
      // Get best 1RM
      const oneRmData = (progress.oneRm as Record<string, number>) || {};
      const maxWeight = Math.max(...Object.values(oneRmData), 0);
      const maxWeightDate = Object.entries(oneRmData)
        .find(([date, weight]) => weight === maxWeight)?.[0];

      if (maxWeight > 0) {
        insights.personalRecords.push({
          liftName: progress.liftName,
          weight: maxWeight,
          date: maxWeightDate,
          repMax: 1
        });
      }

      // Check for recent progress (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      Object.entries(oneRmData).forEach(([date, weight]) => {
        if (new Date(date) >= thirtyDaysAgo) {
          insights.recentProgress.push({
            liftName: progress.liftName,
            weight,
            date,
            repMax: 1
          });
        }
      });
    });

    // Sort by date for recent progress
    insights.recentProgress.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return insights;
  }

  /**
   * Compare user performance against community for barbell lifts
   */
  static async getCommunityLiftRankings(
    communityId: number,
    liftName: string
  ): Promise<any[]> {
    // This would require joining with community memberships
    // Implementation depends on your community structure
    // For now, return empty array
    return [];
  }
}
