/**
 * Workout Parser Utility Functions
 * 
 * This file contains only utility functions for workout parsing.
 * The main parsing logic has been consolidated into api/index.ts for production use.
 * 
 * These utilities can be imported and used by the main parsing algorithm.
 */

/**
 * Generate Workout Name - Enhanced with New Default Naming Pattern
 * Used by the main parsing algorithm in api/index.ts
 */
export function generateWorkoutName(
  detectedName: string | undefined, 
  rawText: string, 
  barbellLifts?: Array<{ liftName: string }>,
  workoutType?: string
): string {
  // Only use detectedName if it exists and is meaningful (not default fallbacks)
  if (detectedName && 
      detectedName.trim() !== '' &&
      detectedName.toLowerCase() !== 'custom workout' &&
      detectedName !== 'Workout Section' &&
      !detectedName.match(/^(STRENGTH|CONDITIONING|METCON|SKILL|WARM-UP|COOL-DOWN)$/i)) {
    return detectedName;
  }

  // Use first meaningful line from content
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0]
      .replace(/^(STRENGTH|CONDITIONING|METCON|SKILL|WARM-UP|COOL-DOWN)[:|\s]*/i, '')
      .replace(/^(workout|wod):\s*/i, '')
      .trim();
      
    if (firstLine && 
        firstLine.length < 50 && 
        firstLine.toLowerCase() !== 'custom workout' &&
        !firstLine.match(/^\d/) && // Don't use lines starting with numbers
        !firstLine.match(/(reps|rounds|for time|amrap|emom)/i)) {
      return firstLine;
    }
  }

  // NEW DEFAULT NAMING PATTERN - Issue 1 Implementation
  const detectedWorkoutType = workoutType || detectWorkoutTypeBasic(rawText.toLowerCase());
  
  // Special handling for strength workouts with barbell lifts (check if array exists first)
  if (detectedWorkoutType === 'strength' && barbellLifts && barbellLifts.length > 0) {
    return `Strength-${barbellLifts[0].liftName}-CustomWorkout`;
  }
  
  // For strength workouts without barbell lifts, fallback to Strength-CustomWorkout
  if (detectedWorkoutType === 'strength') {
    return `Strength-CustomWorkout`;
  }
  
  // General pattern: WorkoutType-CustomWorkout (with proper formatting)
  const formattedType = detectedWorkoutType.charAt(0).toUpperCase() + detectedWorkoutType.slice(1);
  
  return `${formattedType}-CustomWorkout`;
}

/**
 * Basic Workout Type Detection (without database dependency)
 * Used as fallback in naming pattern
 */
export function detectWorkoutTypeBasic(cleanText: string): string {
  // Check for strength patterns FIRST (before other patterns)
  if (cleanText.includes('strength:') || 
      cleanText.includes('build to') || 
      cleanText.includes('rm') ||
      cleanText.includes('work up to') ||
      cleanText.includes('find') ||
      /\d+\s*x\s*\d+/.test(cleanText) || // 5x3, 3x5 patterns
      cleanText.includes('sets every')) {
    return 'strength';
  }
  
  if (cleanText.includes('for time') || cleanText.includes('rft')) return 'for_time';
  if (cleanText.includes('amrap')) return 'amrap';
  if (cleanText.includes('emom')) return 'emom';
  if (cleanText.includes('tabata')) return 'tabata';
  if (cleanText.includes('max effort')) return 'strength';
  
  return 'for_time';
}

/**
 * Determine scoring pattern based on workout type
 */
export function determineScoring(workoutType: string): string {
  const scoringMap: Record<string, string> = {
    'for_time': 'Time',
    'amrap': 'Rounds + Reps',
    'emom': 'Completed Rounds',
    'tabata': 'Total Reps',
    'strength': 'Weight',
    'max_effort': 'Max Weight/Reps',
    'interval': 'Time',
    'endurance': 'Distance/Time'
  };
  
  return scoringMap[workoutType] || 'Points';
}

/**
 * Helper: Calculate name similarity using Levenshtein distance
 * Enhanced version for benchmark matching
 */
export function calculateNameSimilarity(input: string, target: string): number {
  if (input.includes(target) || target.includes(input)) {
    return 0.9;
  }

  const matrix = Array(target.length + 1).fill(null).map(() => 
    Array(input.length + 1).fill(null)
  );

  for (let i = 0; i <= target.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= input.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= target.length; i++) {
    for (let j = 1; j <= input.length; j++) {
      const cost = target[i - 1] === input[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLength = Math.max(target.length, input.length);
  return 1 - (matrix[target.length][input.length] / maxLength);
}

/**
 * Helper: Calculate description similarity
 */
export function calculateDescriptionSimilarity(input: string, target: string): number {
  const inputWords = input.split(/\s+/);
  const targetWords = target.split(/\s+/);
  
  let matchCount = 0;
  for (const word of inputWords) {
    if (word.length > 2 && targetWords.some(tw => tw.includes(word) || word.includes(tw))) {
      matchCount++;
    }
  }
  
  return matchCount / Math.max(inputWords.length, targetWords.length);
}

/**
 * Helper: Find related benchmark workout
 */
export function findRelatedBenchmark(
  input: string, 
  girlWods: any[], 
  heroWods: any[], 
  notables: any[]
): string | undefined {
  const inputLower = input.toLowerCase();
  
  const allWorkouts = [
    ...girlWods.map(w => w.name),
    ...heroWods.map(w => w.name),
    ...notables.map(w => w.name)
  ];
  
  for (const workout of allWorkouts) {
    if (inputLower.includes(workout.toLowerCase())) {
      return workout;
    }
  }
  
  return undefined;
}

/**
 * Clean Workout Description - Enhanced
 * Removes section headers while preserving workout content
 */
export function cleanWorkoutDescription(rawText: string): string {
  const lines = rawText.split('\n');
  const cleanedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip section headers and workout labels only on the first line
    if (i === 0 && (
      /^(STRENGTH|CONDITIONING|METCON|SKILL|WARM-UP|COOL-DOWN)$/i.test(line) || 
      /^(workout|wod)\s*:\s*/i.test(line) ||
      /^[A-Z][A-Z\s&-]+:?$/.test(line)
    )) {
      continue;
    }
    
    if (line) {
      cleanedLines.push(line);
    }
  }
  
  return cleanedLines.join('\n').trim() || rawText.trim();
}

/**
 * Helper: Check if line contains date information - Enhanced
 */
export function isDateLine(line: string): boolean {
  const datePatterns = [
    /\d{1,2}[-\/]\w+[-\/]\d{4}/i,  // 27-June-2025, 27/June/2025
    /\w+\s+\d{1,2},?\s+\d{4}/i,     // June 27, 2025
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, // Day names
    /\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/, // 27/06/2025, 27-06-2025
    /\*\d{2}-\w+-\d{4}\|\w+\*/,     // *27-June-2025|Friday*
    /\d{1,2}-\w+-\d{4}\|\s*\w+/i    // 27-June-2025| Friday
  ];

  return datePatterns.some(pattern => pattern.test(line));
}

/**
 * Helper: Check if line looks like a workout name - Enhanced
 */
export function looksLikeWorkoutName(line: string, index: number, lines: string[]): boolean {
  // Skip if it's too long or contains common description words
  if (line.length > 50) return false;
  if (/^\d/.test(line)) return false; // Starts with number (likely rep scheme)
  if (/(reps|rounds|for time|amrap|emom|minutes?|seconds?|build to|cap:)/i.test(line)) return false;

  // Check if it's capitalized and followed by workout content
  const isCapitalized = /^[A-Z]/.test(line);
  const hasWorkoutContentBelow = index + 1 < lines.length && 
    /(reps|rounds|for time|amrap|emom|\d+|build to)/i.test(lines[index + 1]);

  // Check if it's a known workout name pattern
  const isWorkoutNamePattern = /^[A-Z][a-zA-Z\s]+$/.test(line) && line.length < 30;

  return (isCapitalized && hasWorkoutContentBelow) || isWorkoutNamePattern;
}

/**
 * Helper: Extract workout name from content - Enhanced
 */
export function extractWorkoutNameFromContent(content: string): string {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return 'Custom Workout';
  
  const firstLine = lines[0];
  
  // Remove section headers and get actual content
  const cleanedLine = firstLine
    .replace(/^(STRENGTH|CONDITIONING|METCON|SKILL|WARM-UP|COOL-DOWN)[:|\s]*/i, '')
    .replace(/^(workout|wod):\s*/i, '')
    .trim();
  
  if (cleanedLine && cleanedLine.length < 50 && !/^\d/.test(cleanedLine)) {
    return cleanedLine;
  }
  
  return 'Custom Workout';
}

/**
 * Helper: Extract time cap - Enhanced
 */
export function extractTimeCap(input: string): number | undefined {
  const timeCapMatch = input.match(/(?:cap|time cap|tc)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
  if (timeCapMatch) {
    return parseInt(timeCapMatch[1]) * 60;
  }
  return undefined;
}

/**
 * Helper: Calculate total effort - Enhanced
 */
export function calculateTotalEffort(input: string): number {
  let totalEffort = 0;
  
  const repMatches = input.match(/(\d+)\s*(?:reps?|x)/gi);
  if (repMatches) {
    repMatches.forEach(match => {
      const num = parseInt(match.match(/\d+/)?.[0] || '0');
      totalEffort += num;
    });
  }

  const roundMatches = input.match(/(\d+)\s*rounds?/gi);
  if (roundMatches) {
    const rounds = parseInt(roundMatches[0].match(/\d+/)?.[0] || '1');
    totalEffort *= rounds;
  }

  // For strength workouts, use a different calculation
  if (input.toLowerCase().includes('build to') || input.toLowerCase().includes('rm')) {
    return 150; // Standard effort for strength work
  }

  return Math.max(totalEffort, 50);
}

/**
 * Helper: Identify barbell lifts in text
 * This is a simple text-based version - the main algorithm uses database lookup
 */
export function identifyBarbellLiftsFromText(
  input: string, 
  availableLifts: Array<{ id: number; liftName: string; category: string; liftType: string }>
): Array<{ id: number; liftName: string; category: string; liftType: string }> {
  const inputLower = input.toLowerCase();
  const foundLifts: Array<{ id: number; liftName: string; category: string; liftType: string }> = [];
  
  for (const lift of availableLifts) {
    const liftName = lift.liftName.toLowerCase();
    if (inputLower.includes(liftName)) {
      foundLifts.push({
        id: lift.id,
        liftName: lift.liftName,
        category: lift.category,
        liftType: lift.liftType
      });
    }
  }
  
  return foundLifts;
}

/**
 * Legacy compatibility - these functions are used by the main algorithm in api/index.ts
 * DO NOT ADD NEW PARSING LOGIC HERE - add it to api/index.ts instead
 */

// Export additional utility functions if needed by api/index.ts
export const WorkoutParserUtils = {
  generateWorkoutName,
  detectWorkoutTypeBasic,
  determineScoring,
  calculateNameSimilarity,
  calculateDescriptionSimilarity,
  findRelatedBenchmark,
  cleanWorkoutDescription,
  isDateLine,
  looksLikeWorkoutName,
  extractWorkoutNameFromContent,
  extractTimeCap,
  calculateTotalEffort,
  identifyBarbellLiftsFromText
};

// Default export for backward compatibility
export default WorkoutParserUtils;
