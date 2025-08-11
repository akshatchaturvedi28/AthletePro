/**
 * PRD Phase 1 Parsing Algorithm Implementation
 * Based on ACrossFit - PRD_1752573397963.pdf
 * 
 * This parser implements the complete Phase 1 algorithm using the database tables:
 * - CrossFit Workout Types (Page 30)
 * - Girl WODs (Pages 31-36) 
 * - Hero WODs (Pages 37-46)
 * - Notables (Pages 47-48)
 * - Barbell Lifts (Pages 49-52)
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, or, ilike, and } from 'drizzle-orm';
import {
  crossfitWorkoutTypes,
  girlWods,
  heroWods,
  notables,
  barbellLifts,
  customCommunityWorkouts,
  customUserWorkouts,
  type CrossfitWorkoutType,
  type GirlWod,
  type HeroWod,
  type Notable,
  type BarbellLift,
  type CustomCommunityWorkout,
  type CustomUserWorkout,
  type InsertWorkout
} from '../../shared/schema';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface PRDParseResult {
  workoutFound: boolean;
  workoutData: ParsedWorkoutData | null;
  matchedCategory: 'girls' | 'heroes' | 'notables' | 'custom_community' | 'custom_user' | 'new_custom';
  confidence: number;
  suggestedWorkouts?: string[];
  errors?: string[];
}

export interface ParsedWorkoutData {
  name: string;
  workoutType: string;
  scoring: string;
  timeCap?: number;
  workoutDescription: string;
  totalEffort: number;
  barbellLifts: string[];
  relatedBenchmark?: string;
  category: string;
  sourceTable?: string;
  databaseId?: number;
}

export class PRDWorkoutParser {
  private static workoutTypesCache: CrossfitWorkoutType[] = [];
  private static girlWodsCache: GirlWod[] = [];
  private static heroWodsCache: HeroWod[] = [];
  private static notablesCache: Notable[] = [];
  private static barbellLiftsCache: BarbellLift[] = [];
  private static cacheInitialized = false;

  /**
   * Phase 1 Main Parser Entry Point
   * Implements the complete PRD parsing algorithm
   */
  static async parseWorkout(
    rawInput: string,
    userId?: string,
    communityId?: number
  ): Promise<PRDParseResult> {
    try {
      console.log('🚀 Starting PRD Phase 1 Parsing Algorithm...');
      
      // Step 1: Input Validation & Preprocessing
      const cleanedInput = this.preprocessInput(rawInput);
      if (!cleanedInput) {
        return {
          workoutFound: false,
          workoutData: null,
          matchedCategory: 'new_custom',
          confidence: 0,
          errors: ['Invalid or empty input provided']
        };
      }

      // Step 2: Initialize Database Cache
      await this.initializeCache();

      // Step 3: Workout Identification (Database Lookup)
      const identificationResult = await this.identifyWorkout(cleanedInput);
      
      if (identificationResult.found) {
        console.log(`✅ Workout identified: ${identificationResult.data?.name} (${identificationResult.category})`);
        return {
          workoutFound: true,
          workoutData: identificationResult.data!,
          matchedCategory: identificationResult.category,
          confidence: identificationResult.confidence,
          suggestedWorkouts: identificationResult.suggestions
        };
      }

      // Step 4: Parse as New Custom Workout
      console.log('📝 Parsing as new custom workout...');
      const customWorkoutData = await this.parseCustomWorkout(cleanedInput);
      
      return {
        workoutFound: true,
        workoutData: customWorkoutData,
        matchedCategory: communityId ? 'custom_community' : 'custom_user',
        confidence: 0.8,
        suggestedWorkouts: identificationResult.suggestions
      };

    } catch (error) {
      console.error('❌ PRD Parser Error:', error);
      return {
        workoutFound: false,
        workoutData: null,
        matchedCategory: 'new_custom',
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Unknown parsing error']
      };
    }
  }

  /**
   * Step 1: Input Validation & Preprocessing
   */
  private static preprocessInput(rawInput: string): string {
    if (!rawInput || typeof rawInput !== 'string') {
      return '';
    }

    // Clean and normalize input
    let cleaned = rawInput.trim()
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .replace(/[""]/g, '"')   // Normalize quotes
      .replace(/['']/g, "'");  // Normalize apostrophes

    // Remove common prefixes
    const prefixesToRemove = [
      'workout:', 'wod:', 'today:', 'daily wod:', 'workout of the day:',
      'metcon:', 'conditioning:', 'strength:', 'skill:'
    ];
    
    for (const prefix of prefixesToRemove) {
      const regex = new RegExp(`^${prefix}\\s*`, 'i');
      cleaned = cleaned.replace(regex, '');
    }

    return cleaned.trim();
  }

  /**
   * Step 2: Initialize Database Cache
   */
  private static async initializeCache(): Promise<void> {
    if (this.cacheInitialized) return;

    console.log('🔄 Initializing PRD database cache...');
    
    try {
      [
        this.workoutTypesCache,
        this.girlWodsCache,
        this.heroWodsCache,
        this.notablesCache,
        this.barbellLiftsCache
      ] = await Promise.all([
        db.select().from(crossfitWorkoutTypes),
        db.select().from(girlWods),
        db.select().from(heroWods),
        db.select().from(notables),
        db.select().from(barbellLifts)
      ]);

      this.cacheInitialized = true;
      console.log(`📊 Cache initialized: ${this.workoutTypesCache.length} types, ${this.girlWodsCache.length} girls, ${this.heroWodsCache.length} heroes, ${this.notablesCache.length} notables, ${this.barbellLiftsCache.length} lifts`);
      
    } catch (error) {
      console.error('❌ Cache initialization failed:', error);
      throw new Error('Failed to initialize workout database cache');
    }
  }

  /**
   * Step 3: Workout Identification
   */
  private static async identifyWorkout(input: string): Promise<{
    found: boolean;
    data?: ParsedWorkoutData;
    category: 'girls' | 'heroes' | 'notables' | 'custom_community' | 'custom_user' | 'new_custom';
    confidence: number;
    suggestions?: string[];
  }> {
    const inputLower = input.toLowerCase();
    const suggestions: string[] = [];

    // Check Girl WODs first (highest priority)
    for (const girlWod of this.girlWodsCache) {
      const nameMatch = this.calculateNameSimilarity(inputLower, girlWod.name.toLowerCase());
      const descMatch = this.calculateDescriptionSimilarity(inputLower, girlWod.workoutDescription.toLowerCase());
      
      if (nameMatch > 0.8 || descMatch > 0.7) {
        return {
          found: true,
          data: this.convertGirlWodToParsedData(girlWod),
          category: 'girls',
          confidence: Math.max(nameMatch, descMatch)
        };
      }
      
      if (nameMatch > 0.3 || descMatch > 0.3) {
        suggestions.push(girlWod.name);
      }
    }

    // Check Hero WODs
    for (const heroWod of this.heroWodsCache) {
      const nameMatch = this.calculateNameSimilarity(inputLower, heroWod.name.toLowerCase());
      const descMatch = this.calculateDescriptionSimilarity(inputLower, heroWod.workoutDescription.toLowerCase());
      
      if (nameMatch > 0.8 || descMatch > 0.7) {
        return {
          found: true,
          data: this.convertHeroWodToParsedData(heroWod),
          category: 'heroes',
          confidence: Math.max(nameMatch, descMatch)
        };
      }
      
      if (nameMatch > 0.3 || descMatch > 0.3) {
        suggestions.push(heroWod.name);
      }
    }

    // Check Notables
    for (const notable of this.notablesCache) {
      const nameMatch = this.calculateNameSimilarity(inputLower, notable.name.toLowerCase());
      const descMatch = this.calculateDescriptionSimilarity(inputLower, notable.workoutDescription.toLowerCase());
      
      if (nameMatch > 0.8 || descMatch > 0.7) {
        return {
          found: true,
          data: this.convertNotableToParsedData(notable),
          category: 'notables',
          confidence: Math.max(nameMatch, descMatch)
        };
      }
      
      if (nameMatch > 0.3 || descMatch > 0.3) {
        suggestions.push(notable.name);
      }
    }

    return {
      found: false,
      category: 'new_custom',
      confidence: 0,
      suggestions: suggestions.slice(0, 5) // Limit suggestions
    };
  }

  /**
   * Step 4: Parse as Custom Workout
   */
  private static async parseCustomWorkout(input: string): Promise<ParsedWorkoutData> {
    // Extract workout name (first line or first meaningful phrase)
    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const name = this.extractWorkoutName(lines);
    
    // Identify workout type using PRD database
    const workoutType = this.identifyWorkoutType(input);
    
    // Determine scoring pattern based on workout type
    const scoring = this.determineScoring(workoutType, input);
    
    // Extract time cap
    const timeCap = this.extractTimeCap(input);
    
    // Calculate total effort
    const totalEffort = this.calculateTotalEffort(input);
    
    // Identify barbell lifts using database
    const barbellLifts = this.identifyBarbellLifts(input);
    
    // Check for related benchmark
    const relatedBenchmark = this.findRelatedBenchmark(input);

    return {
      name,
      workoutType,
      scoring,
      timeCap,
      workoutDescription: input,
      totalEffort,
      barbellLifts,
      relatedBenchmark,
      category: 'custom_user'
    };
  }

  /**
   * Helper: Calculate name similarity using Levenshtein distance
   */
  private static calculateNameSimilarity(input: string, target: string): number {
    // Check for exact matches first
    if (input.includes(target) || target.includes(input)) {
      return 0.9;
    }

    // Levenshtein distance calculation
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
  private static calculateDescriptionSimilarity(input: string, target: string): number {
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
   * Helper: Extract workout name from input
   */
  private static extractWorkoutName(lines: string[]): string {
    if (lines.length === 0) return 'Custom Workout';
    
    // Look for title patterns
    const firstLine = lines[0];
    
    // Check if first line looks like a title (short, capitalized, etc.)
    if (firstLine.length < 50 && /^[A-Z]/.test(firstLine)) {
      return firstLine;
    }
    
    // Extract from patterns like "Workout: Name" or "WOD: Name"
    const titleMatch = firstLine.match(/(?:workout|wod|metcon):\s*(.+)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Use first few words if no clear title
    return firstLine.split(' ').slice(0, 4).join(' ') + '...';
  }

  /**
   * Helper: Identify workout type using database
   */
  private static identifyWorkoutType(input: string): string {
    const inputLower = input.toLowerCase();
    
    for (const workoutType of this.workoutTypesCache) {
      const examples = workoutType.examples.toLowerCase();
      const description = workoutType.description.toLowerCase();
      
      // Check if input matches examples or contains type keywords
      if (inputLower.includes(workoutType.workoutType) ||
          examples.split(',').some((ex: string) => inputLower.includes(ex.trim())) ||
          description.split(' ').some((word: string) => inputLower.includes(word))) {
        return workoutType.workoutType;
      }
    }
    
    // Default fallback based on common patterns
    if (inputLower.includes('for time') || inputLower.includes('rft')) return 'for_time';
    if (inputLower.includes('amrap')) return 'amrap';
    if (inputLower.includes('emom')) return 'emom';
    if (inputLower.includes('tabata')) return 'tabata';
    
    return 'for_time'; // Default
  }

  /**
   * Helper: Determine scoring pattern
   */
  private static determineScoring(workoutType: string, input: string): string {
    const typeData = this.workoutTypesCache.find(wt => wt.workoutType === workoutType);
    return typeData?.scoreFormat || 'Time';
  }

  /**
   * Helper: Extract time cap
   */
  private static extractTimeCap(input: string): number | undefined {
    const timeCapMatch = input.match(/(?:cap|time cap|tc)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
    if (timeCapMatch) {
      return parseInt(timeCapMatch[1]) * 60; // Convert to seconds
    }
    return undefined;
  }

  /**
   * Helper: Calculate total effort
   */
  private static calculateTotalEffort(input: string): number {
    let totalEffort = 0;
    
    // Extract rep numbers
    const repMatches = input.match(/(\d+)\s*(?:reps?|x)/gi);
    if (repMatches) {
      repMatches.forEach(match => {
        const num = parseInt(match.match(/\d+/)?.[0] || '0');
        totalEffort += num;
      });
    }

    // Extract rounds
    const roundMatches = input.match(/(\d+)\s*rounds?/gi);
    if (roundMatches) {
      const rounds = parseInt(roundMatches[0].match(/\d+/)?.[0] || '1');
      totalEffort *= rounds;
    }

    return Math.max(totalEffort, 50); // Minimum effort
  }

  /**
   * Helper: Identify barbell lifts using database
   */
  private static identifyBarbellLifts(input: string): string[] {
    const inputLower = input.toLowerCase();
    const foundLifts: string[] = [];
    
    for (const lift of this.barbellLiftsCache) {
      const liftName = lift.liftName.toLowerCase();
      if (inputLower.includes(liftName)) {
        foundLifts.push(lift.liftName);
      }
    }
    
    return foundLifts;
  }

  /**
   * Helper: Find related benchmark workout
   */
  private static findRelatedBenchmark(input: string): string | undefined {
    const inputLower = input.toLowerCase();
    
    // Check against all cached workouts
    const allWorkouts = [
      ...this.girlWodsCache.map(w => w.name),
      ...this.heroWodsCache.map(w => w.name),
      ...this.notablesCache.map(w => w.name)
    ];
    
    for (const workout of allWorkouts) {
      if (inputLower.includes(workout.toLowerCase())) {
        return workout;
      }
    }
    
    return undefined;
  }

  /**
   * Convert database objects to ParsedWorkoutData
   */
  private static convertGirlWodToParsedData(girlWod: GirlWod): ParsedWorkoutData {
    return {
      name: girlWod.name,
      workoutType: girlWod.workoutType,
      scoring: girlWod.scoring,
      timeCap: girlWod.timeCap || undefined,
      workoutDescription: girlWod.workoutDescription,
      totalEffort: girlWod.totalEffort,
      barbellLifts: (girlWod.barbellLifts as string[]) || [],
      category: 'girls',
      sourceTable: 'girl_wods',
      databaseId: girlWod.id
    };
  }

  private static convertHeroWodToParsedData(heroWod: HeroWod): ParsedWorkoutData {
    return {
      name: heroWod.name,
      workoutType: heroWod.workoutType,
      scoring: heroWod.scoring,
      timeCap: heroWod.timeCap || undefined,
      workoutDescription: heroWod.workoutDescription,
      totalEffort: heroWod.totalEffort,
      barbellLifts: (heroWod.barbellLifts as string[]) || [],
      category: 'heroes',
      sourceTable: 'hero_wods',
      databaseId: heroWod.id
    };
  }

  private static convertNotableToParsedData(notable: Notable): ParsedWorkoutData {
    return {
      name: notable.name,
      workoutType: notable.workoutType,
      scoring: notable.scoring,
      timeCap: notable.timeCap || undefined,
      workoutDescription: notable.workoutDescription,
      totalEffort: notable.totalEffort || 100,
      barbellLifts: (notable.barbellLifts as string[]) || [],
      category: 'notables',
      sourceTable: 'notables',
      databaseId: notable.id
    };
  }

  /**
   * Convert ParsedWorkoutData to InsertWorkout for database storage
   */
  static createWorkoutFromPRDParsed(
    parsed: ParsedWorkoutData,
    createdBy?: string,
    communityId?: number
  ): InsertWorkout {
    return {
      name: parsed.name,
      description: parsed.workoutDescription,
      type: parsed.workoutType as any,
      timeCap: parsed.timeCap,
      totalEffort: parsed.totalEffort,
      relatedBenchmark: parsed.relatedBenchmark,
      barbellLifts: parsed.barbellLifts,
      createdBy,
      communityId,
      isPublic: false
    };
  }

  /**
   * Get workout suggestions based on partial input
   */
  static async getWorkoutSuggestions(partialInput: string, limit: number = 10): Promise<string[]> {
    await this.initializeCache();
    
    const inputLower = partialInput.toLowerCase();
    const suggestions: { name: string; score: number }[] = [];
    
    // Collect suggestions from all tables
    const allWorkouts = [
      ...this.girlWodsCache.map(w => ({ name: w.name, type: 'Girl WOD' })),
      ...this.heroWodsCache.map(w => ({ name: w.name, type: 'Hero WOD' })),
      ...this.notablesCache.map(w => ({ name: w.name, type: 'Notable' }))
    ];
    
    for (const workout of allWorkouts) {
      const score = this.calculateNameSimilarity(inputLower, workout.name.toLowerCase());
      if (score > 0.1) {
        suggestions.push({ name: `${workout.name} (${workout.type})`, score });
      }
    }
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.name);
  }
}
