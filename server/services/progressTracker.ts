import { WorkoutLog, InsertOlympicLift } from "@shared/schema";
import { storage } from "../storage";

export class ProgressTracker {
  /**
   * Calculate final score based on workout type and performance
   */
  static calculateFinalScore(
    workoutType: string,
    timeTaken: number,
    totalEffort: number,
    timeCap: number,
    completedWork: number
  ): number {
    switch (workoutType) {
      case 'for_time':
      case 'chipper':
        // For time workouts: lower time is better
        if (timeTaken <= timeCap) {
          return timeTaken / totalEffort; // finished workout
        } else {
          return timeCap / completedWork; // didn't finish
        }
      
      case 'amrap':
      case 'endurance':
      case 'tabata':
      case 'unbroken':
      case 'ladder':
        // Volume-based workouts: higher volume is better
        return totalEffort;
      
      case 'strength':
        // Strength workouts: higher weight is better
        return totalEffort; // totalEffort should be max weight
      
      case 'emom':
      case 'interval':
        // Interval workouts: combination of rounds completed and time
        const roundsCompleted = Math.floor(timeTaken / 60); // assuming 1-minute intervals
        const fastestRoundTime = timeTaken / roundsCompleted;
        return totalEffort * (roundsCompleted + 1 / fastestRoundTime);
      
      default:
        return totalEffort;
    }
  }

  /**
   * Update Olympic lift progress based on workout log
   */
  static async updateOlympicLiftProgress(
    workoutLog: WorkoutLog,
    barbellLiftDetails: Record<string, Record<string, number>>
  ): Promise<void> {
    if (!barbellLiftDetails || !workoutLog.userId) return;

    const userId = workoutLog.userId;
    const date = workoutLog.date;

    for (const [liftName, weightReps] of Object.entries(barbellLiftDetails)) {
      for (const [weight, maxReps] of Object.entries(weightReps)) {
        const weightNum = parseFloat(weight);
        const reps = parseInt(maxReps.toString());

        // Update all rep maxes from 1RM to current reps
        for (let repMax = 1; repMax <= reps; repMax++) {
          await storage.updateOlympicLift(
            userId,
            liftName,
            repMax,
            weightNum,
            date
          );
        }
      }
    }
  }

  /**
   * Generate progress insights for a user
   */
  static async generateProgressInsights(userId: string): Promise<any> {
    const workoutLogs = await storage.getUserWorkoutLogs(userId);
    const olympicLifts = await storage.getUserOlympicLifts(userId);

    const insights = {
      totalWorkouts: workoutLogs.length,
      currentStreak: 0,
      longestStreak: 0,
      favoriteWorkoutType: '',
      averageScore: 0,
      personalRecords: [] as any[],
      recentProgress: [] as any[]
    };

    if (workoutLogs.length === 0) return insights;

    // Calculate streaks
    const sortedLogs = workoutLogs.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(sortedLogs[0].date);

    for (let i = 1; i < sortedLogs.length; i++) {
      const currentDate = new Date(sortedLogs[i].date);
      const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      
      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (from most recent workout)
    const today = new Date();
    const lastWorkoutDate = new Date(sortedLogs[sortedLogs.length - 1].date);
    const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastWorkout <= 1) {
      // Count backwards from last workout
      for (let i = sortedLogs.length - 1; i >= 0; i--) {
        const currentDate = new Date(sortedLogs[i].date);
        const nextDate = i < sortedLogs.length - 1 ? new Date(sortedLogs[i + 1].date) : today;
        const dayDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff <= 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    insights.currentStreak = currentStreak;
    insights.longestStreak = longestStreak;

    // Find favorite workout type
    const workoutTypeCounts: Record<string, number> = {};
    workoutLogs.forEach(log => {
      const type = log.workout.type;
      workoutTypeCounts[type] = (workoutTypeCounts[type] || 0) + 1;
    });

    insights.favoriteWorkoutType = Object.entries(workoutTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate average score
    const validScores = workoutLogs
      .filter(log => log.finalScore !== null)
      .map(log => parseFloat(log.finalScore?.toString() || '0'));
    
    insights.averageScore = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;

    // Get personal records from Olympic lifts
    const liftPRs: Record<string, any> = {};
    olympicLifts.forEach(lift => {
      const key = `${lift.liftName}-${lift.repMax}RM`;
      if (!liftPRs[key] || parseFloat(lift.weight.toString()) > parseFloat(liftPRs[key].weight.toString())) {
        liftPRs[key] = lift;
      }
    });

    insights.personalRecords = Object.values(liftPRs);

    // Recent progress (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    insights.recentProgress = workoutLogs
      .filter(log => new Date(log.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return insights;
  }

  /**
   * Compare user performance against community
   */
  static async getCommunityRankings(
    communityId: number,
    workoutName: string,
    date?: string
  ): Promise<any[]> {
    const logs = await storage.getCommunityWorkoutLogs(communityId, date);
    
    // Filter by workout name if specified
    const filteredLogs = workoutName 
      ? logs.filter(log => log.workout.name.toLowerCase().includes(workoutName.toLowerCase()))
      : logs;

    // Sort by final score (lower is better for time-based, higher for volume-based)
    const sortedLogs = filteredLogs.sort((a, b) => {
      const aScore = parseFloat(a.finalScore?.toString() || '0');
      const bScore = parseFloat(b.finalScore?.toString() || '0');
      
      if (a.workout.type === 'for_time' || a.workout.type === 'chipper') {
        return aScore - bScore; // lower time is better
      } else {
        return bScore - aScore; // higher volume is better
      }
    });

    return sortedLogs.map((log, index) => ({
      rank: index + 1,
      user: log.user,
      score: log.finalScore,
      humanReadableScore: log.humanReadableScore,
      scaleType: log.scaleType,
      workout: log.workout,
      date: log.date
    }));
  }
}
