import { Request, Response } from 'express';
import { db } from '../../server/db';
import { userWorkoutAssignments, girlWods, heroWods, notables, customUserWorkouts, customCommunityWorkouts } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: "User ID required" });
    }

    let whereClause;
    
    if (date && typeof date === 'string') {
      whereClause = and(
        eq(userWorkoutAssignments.userId, userId),
        eq(userWorkoutAssignments.assignedDate, date)
      );
    } else {
      whereClause = eq(userWorkoutAssignments.userId, userId);
    }

    // Get user's workout assignments
    const assignments = await db
      .select()
      .from(userWorkoutAssignments)
      .where(whereClause)
      .orderBy(userWorkoutAssignments.assignedDate);

    // Fetch workout details based on source
    const enrichedAssignments: any[] = [];
    
    for (const assignment of assignments) {
      let workoutDetails: any = null;
      
      switch (assignment.workoutSource) {
        case 'girl_wod':
          const girlWodResults = await db
            .select()
            .from(girlWods)
            .where(eq(girlWods.id, assignment.workoutId))
            .limit(1);
          workoutDetails = girlWodResults[0];
          break;
          
        case 'hero_wod':
          const heroWodResults = await db
            .select()
            .from(heroWods)
            .where(eq(heroWods.id, assignment.workoutId))
            .limit(1);
          workoutDetails = heroWodResults[0];
          break;
          
        case 'notable':
          const notableResults = await db
            .select()
            .from(notables)
            .where(eq(notables.id, assignment.workoutId))
            .limit(1);
          workoutDetails = notableResults[0];
          break;
          
        case 'custom_user':
          const customUserResults = await db
            .select()
            .from(customUserWorkouts)
            .where(eq(customUserWorkouts.id, assignment.workoutId))
            .limit(1);
          workoutDetails = customUserResults[0];
          break;
          
        case 'custom_community':
          const customCommunityResults = await db
            .select()
            .from(customCommunityWorkouts)
            .where(eq(customCommunityWorkouts.id, assignment.workoutId))
            .limit(1);
          workoutDetails = customCommunityResults[0];
          break;
      }
      
      if (workoutDetails) {
        enrichedAssignments.push({
          ...assignment,
          workout: {
            ...workoutDetails,
            description: workoutDetails.workoutDescription || workoutDetails.description,
            type: workoutDetails.workoutType || workoutDetails.type
          }
        });
      }
    }

    return res.status(200).json(enrichedAssignments);
  } catch (error) {
    console.error("Error fetching workout assignments:", error);
    return res.status(500).json({
      error: "Failed to fetch workout assignments"
    });
  }
}
