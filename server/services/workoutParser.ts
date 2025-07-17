import { InsertWorkout } from "@shared/schema";

export interface ParsedWorkout {
  name: string;
  description: string;
  type: string;
  timeCap?: number;
  restBetweenIntervals?: number;
  totalEffort?: number;
  relatedBenchmark?: string;
  barbellLifts?: string[];
  date?: string;
}

export class WorkoutParser {
  private static readonly WORKOUT_TYPES = {
    'for time': 'for_time',
    'rft': 'for_time',
    'rounds for time': 'for_time',
    'amrap': 'amrap',
    'as many rounds as possible': 'amrap',
    'emom': 'emom',
    'every minute on the minute': 'emom',
    'tabata': 'tabata',
    'strength': 'strength',
    'interval': 'interval',
    'endurance': 'endurance',
    'chipper': 'chipper',
    'ladder': 'ladder',
    'unbroken': 'unbroken'
  };

  private static readonly BARBELL_LIFTS = [
    'deadlift', 'deadlifts', 'squat', 'squats', 'bench press', 'bench',
    'clean', 'cleans', 'jerk', 'jerks', 'clean and jerk', 'clean & jerk',
    'snatch', 'snatches', 'overhead press', 'press', 'thruster', 'thrusters',
    'front squat', 'front squats', 'back squat', 'back squats',
    'overhead squat', 'overhead squats', 'sumo deadlift', 'romanian deadlift'
  ];

  private static readonly BENCHMARK_WORKOUTS = [
    'fran', 'helen', 'grace', 'isabel', 'karen', 'nancy', 'diane', 'elizabeth',
    'angie', 'barbara', 'chelsea', 'jackie', 'linda', 'mary', 'amanda', 'annie',
    'candy', 'eva', 'fight gone bad', 'murph', 'josh', 'daniel', 'tommy v',
    'michael', 'jt', 'danny', 'jason', 'adam', 'brad', 'chad', 'christopher'
  ];

  static parseWorkout(rawText: string): ParsedWorkout[] {
    const lines = rawText.trim().split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      throw new Error('No workout content provided');
    }

    // Split WOD into multiple workout entities
    const workoutEntities = this.splitIntoWorkoutEntities(lines);
    
    return workoutEntities.map(entity => this.parseWorkoutEntity(entity));
  }

  private static splitIntoWorkoutEntities(lines: string[]): string[][] {
    const workoutEntities: string[][] = [];
    let currentEntity: string[] = [];
    
    const workoutSeparators = [
      'workout a:', 'workout b:', 'workout c:', 'workout d:',
      'wod a:', 'wod b:', 'wod c:', 'wod d:',
      'part a:', 'part b:', 'part c:', 'part d:',
      'round 1:', 'round 2:', 'round 3:', 'round 4:',
      'strength:', 'metcon:', 'conditioning:', 'warm-up:', 'cool-down:',
      'amrap:', 'for time:', 'emom:', 'tabata:',
      'then:', 'followed by:', 'next:', 'also:',
      '---', '***', '+++', '===',
      'workout:', 'wod:', 'part:', 'section:'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Check if this line indicates a new workout entity
      const isNewEntity = workoutSeparators.some(separator => 
        lowerLine.includes(separator) || 
        lowerLine.startsWith(separator) ||
        // Check for numbered patterns like "1.", "2.", etc.
        /^\d+\.\s/.test(line) ||
        // Check for uppercase headers
        (line === line.toUpperCase() && line.length > 5) ||
        // Check for time-based splits
        /^\d+:\d+/.test(line)
      );
      
      if (isNewEntity && currentEntity.length > 0) {
        // Start a new entity
        workoutEntities.push([...currentEntity]);
        currentEntity = [line];
      } else {
        currentEntity.push(line);
      }
    }
    
    // Add the last entity
    if (currentEntity.length > 0) {
      workoutEntities.push(currentEntity);
    }
    
    // If no clear separators found, treat as single workout
    if (workoutEntities.length === 1 && workoutEntities[0].length === lines.length) {
      return [lines];
    }
    
    return workoutEntities;
  }

  private static parseWorkoutEntity(lines: string[]): ParsedWorkout {
    const result: ParsedWorkout = {
      name: '',
      description: '',
      type: 'for_time'
    };

    // Extract date if present (usually in first few lines)
    const fullText = lines.join('\n');
    const dateMatch = fullText.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
    if (dateMatch) {
      result.date = dateMatch[1];
    }

    // Extract workout name (usually first line or after date)
    let nameLineIndex = 0;
    if (result.date && lines[0].includes(result.date)) {
      nameLineIndex = 1;
    }
    
    result.name = lines[nameLineIndex] || 'Custom Workout';

    // Check if it's a known benchmark workout
    const lowerName = result.name.toLowerCase();
    const benchmark = this.BENCHMARK_WORKOUTS.find(b => 
      lowerName.includes(b) || b.includes(lowerName)
    );
    if (benchmark) {
      result.relatedBenchmark = benchmark;
    }

    // Join remaining lines as description
    result.description = lines.slice(nameLineIndex + 1).join('\n');

    // Determine workout type
    const lowerDescription = result.description.toLowerCase();
    for (const [keyword, type] of Object.entries(this.WORKOUT_TYPES)) {
      if (lowerDescription.includes(keyword)) {
        result.type = type;
        break;
      }
    }

    // Extract time cap
    const timeCapMatch = result.description.match(/(?:cap|time cap)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
    if (timeCapMatch) {
      result.timeCap = parseInt(timeCapMatch[1]) * 60; // convert to seconds
    }

    // Extract rest between intervals
    const restMatch = result.description.match(/(?:rest|break)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
    if (restMatch) {
      result.restBetweenIntervals = parseInt(restMatch[1]) * 60; // convert to seconds
    }

    // Identify barbell lifts
    const foundLifts: string[] = [];
    const descriptionLower = result.description.toLowerCase();
    
    for (const lift of this.BARBELL_LIFTS) {
      if (descriptionLower.includes(lift)) {
        foundLifts.push(lift);
      }
    }
    
    if (foundLifts.length > 0) {
      result.barbellLifts = foundLifts;
    }

    // Calculate total effort (basic estimation)
    result.totalEffort = this.calculateTotalEffort(result.description);

    return result;
  }

  private static calculateTotalEffort(description: string): number {
    let totalEffort = 0;
    
    // Extract rep numbers
    const repMatches = description.match(/(\d+)\s*(?:reps?|x)/gi);
    if (repMatches) {
      repMatches.forEach(match => {
        const num = parseInt(match.match(/\d+/)?.[0] || '0');
        totalEffort += num;
      });
    }

    // Extract distances (convert to meters)
    const distanceMatches = description.match(/(\d+)\s*(?:m|meter|meters|km|k)/gi);
    if (distanceMatches) {
      distanceMatches.forEach(match => {
        const num = parseInt(match.match(/\d+/)?.[0] || '0');
        if (match.toLowerCase().includes('k')) {
          totalEffort += num * 1000; // km to meters
        } else {
          totalEffort += num; // already in meters
        }
      });
    }

    // Extract calories
    const calorieMatches = description.match(/(\d+)\s*(?:cal|calories?)/gi);
    if (calorieMatches) {
      calorieMatches.forEach(match => {
        const num = parseInt(match.match(/\d+/)?.[0] || '0');
        totalEffort += num;
      });
    }

    return totalEffort || 100; // default minimum effort
  }

  static createWorkoutFromParsed(
    parsed: ParsedWorkout,
    createdBy?: string,
    communityId?: number
  ): InsertWorkout {
    return {
      name: parsed.name,
      description: parsed.description,
      type: parsed.type as any,
      timeCap: parsed.timeCap,
      restBetweenIntervals: parsed.restBetweenIntervals,
      totalEffort: parsed.totalEffort,
      relatedBenchmark: parsed.relatedBenchmark,
      barbellLifts: parsed.barbellLifts,
      createdBy,
      communityId,
      isPublic: false
    };
  }
}
