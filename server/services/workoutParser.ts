/**
 * Multi-Entity Workout Parsing Algorithm Implementation
 * Based on ACrossFit PRD Phase 1 Parsing Algorithm
 * 
 * This parser implements entity splitting and multi-workout parsing using:
 * - CrossFit Workout Types (Global Table)
 * - Girl WODs, Hero WODs, Notables (Global Tables) 
 * - Barbell Lifts (Global Table)
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
  type InsertCustomUserWorkout,
  type InsertCustomCommunityWorkout
} from '../../shared/schema';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface ParseResult {
  workoutFound: boolean;
  workoutEntities: ParsedWorkoutData[];
  extractedDate?: string;
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
  barbellLifts: Array<{ id: number; liftName: string; category: string; liftType: string }>;
  relatedBenchmark?: string;
  category: 'girls' | 'heroes' | 'notables' | 'custom_community' | 'custom_user';
  sourceTable?: string;
  databaseId?: number;
}

export interface WorkoutEntity {
  rawText: string;
  startLine: number;
  endLine: number;
  detectedName?: string;
  sectionType?: string;
}

export class WorkoutParser {
  private static workoutTypesCache: CrossfitWorkoutType[] = [];
  private static girlWodsCache: GirlWod[] = [];
  private static heroWodsCache: HeroWod[] = [];
  private static notablesCache: Notable[] = [];
  private static barbellLiftsCache: BarbellLift[] = [];
  private static cacheInitialized = false;

  /**
   * Main Parser Entry Point - Multi-Entity Support
   */
  static async parseWorkout(
    rawInput: string,
    userId?: string,
    communityId?: number
  ): Promise<ParseResult> {
    try {
      console.log('🚀 Starting Multi-Entity Workout Parsing...');
      
      // Step 1: Input Validation & Preprocessing
      const cleanedInput = this.preprocessInput(rawInput);
      if (!cleanedInput) {
        return {
          workoutFound: false,
          workoutEntities: [],
          confidence: 0,
          errors: ['Invalid or empty input provided']
        };
      }

      // Step 2: Initialize Database Cache
      await this.initializeCache();

      // Step 3: Extract Date from Input
      const extractedDate = this.extractDate(cleanedInput);

      // Step 4: Split WOD into Entities (Enhanced)
      const entities = this.splitWODIntoEntities(cleanedInput);
      console.log(`📊 Found ${entities.length} workout entities`);

      if (entities.length === 0) {
        return {
          workoutFound: false,
          workoutEntities: [],
          extractedDate,
          confidence: 0,
          errors: ['No workout entities could be identified']
        };
      }

      // Step 5: Parse Each Entity
      const parsedEntities: ParsedWorkoutData[] = [];
      const suggestions: string[] = [];
      let overallConfidence = 0;

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        console.log(`🔍 Processing entity ${i + 1}: "${entity.detectedName || 'Unnamed'}"`);
        
        try {
          const parsedEntity = await this.parseWorkoutEntity(entity, extractedDate, communityId);
          parsedEntities.push(parsedEntity);
          overallConfidence += 0.8; // Base confidence per successful entity
        } catch (error) {
          console.error(`❌ Failed to parse entity ${i + 1}:`, error);
          return {
            workoutFound: false,
            workoutEntities: [],
            extractedDate,
            confidence: 0,
            errors: [`Failed to parse workout entity ${i + 1}: "${entity.detectedName || 'Unnamed'}". Please split the workout manually and parse each section separately.`]
          };
        }
      }

      const finalConfidence = Math.min(overallConfidence / entities.length, 1.0);

      return {
        workoutFound: true,
        workoutEntities: parsedEntities,
        extractedDate,
        confidence: finalConfidence,
        suggestedWorkouts: suggestions.slice(0, 5)
      };

    } catch (error) {
      console.error('❌ Parser Error:', error);
      return {
        workoutFound: false,
        workoutEntities: [],
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
      .replace(/\t/g, ' ')     // Convert tabs to spaces
      .replace(/\s+(?=\n)/g, '') // Remove trailing spaces on lines
      .replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines

    return cleaned;
  }

  /**
   * Step 2: Initialize Database Cache
   */
  private static async initializeCache(): Promise<void> {
    if (this.cacheInitialized) return;

    console.log('🔄 Initializing workout database cache...');
    
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
   * Step 3: Extract Date from Input
   */
  private static extractDate(input: string): string | undefined {
    // Enhanced date patterns to match - handles formats like "*06-APRIL-2023|THURSDAY*" or "18-Jun-2025" or "27-June-2025| Friday"
    let dateMatch = null;
    let dayMatch = null;
    
    // Search for date in first 5 lines
    const lines = input.split('\n');
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (!dateMatch) {
        dateMatch = lines[i].match(/(\d{1,2}-\w+-\d{4})/) || lines[i].match(/\*(\d{2}-\w+-\d{4})/);
        if (dateMatch && dateMatch[2]) dateMatch[1] = dateMatch[2];
      }
      if (!dayMatch) {
        dayMatch = lines[i].match(/\|\s*(\w+)/) || lines[i].match(/\*\d{2}-\w+-\d{4}\|(\w+)\*/);
        if (dayMatch && dayMatch[2]) dayMatch[1] = dayMatch[2];
      }
    }

    return dateMatch ? dateMatch[1] : undefined;
  }

  /**
   * Step 4: Split WOD into Entities - Enhanced Version with Better Section Detection
   * Inspired by the provided parseWorkoutDescription code
   */
  private static splitWODIntoEntities(input: string): WorkoutEntity[] {
    const lines = input.split('\n');
    const entities: WorkoutEntity[] = [];
    
    // Remove date/day lines from the beginning using enhanced detection
    let startIndex = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (this.isDateLine(line) || line === '') {
        startIndex = i + 1;
      } else {
        break;
      }
    }

    let currentSection: string[] = [];
    let currentName = '';
    let currentSectionType = '';

    const finishSection = () => {
      if (currentSection.length > 0 && currentName.trim()) {
        const rawText = currentSection.join('\n');
        
        entities.push({
          rawText: rawText,
          startLine: 0, // Will be adjusted based on actual line positions
          endLine: 0,   // Will be adjusted based on actual line positions
          detectedName: currentName,
          sectionType: currentSectionType
        });
        
        console.log(`📝 Created entity: "${currentName}" (${currentSectionType})`);
      }
    };

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cleanLine = line.trim();
      
      // Skip empty lines and lines with date/day info
      if (!cleanLine || this.isDateLine(cleanLine)) continue;
      
      // Enhanced section detection patterns - inspired by provided code
      const isNewSection = cleanLine.match(/^[A-Z][A-Z\s&-]+:?$/) || // All caps headers like "STRENGTH", "FOR TIME"
                          cleanLine.match(/^\*?\s*(STRENGTH|WORKOUT|SKILL|GYMNASTICS|MINI-PUMP|ACCESSORY|METCON|WOD|CONDITIONING)/i) || // Standard section headers
                          cleanLine.match(/^(workout|wod)\s*:\s*(.+)$/i) || // "Workout : Chicago Slice"
                          cleanLine.match(/^(.+)\s*:\s*$/) || // Any name followed by colon
                          this.looksLikeWorkoutName(cleanLine, i, lines); // Standalone workout names
      
      if (isNewSection) {
        // Finish previous section
        finishSection();
        
        // Start new section
        currentSection = [line];
        
        // Extract section name and type based on different patterns
        if (cleanLine.match(/^(workout|wod)\s*:\s*(.+)$/i)) {
          // Handle "Workout : Chicago Slice" format
          const match = cleanLine.match(/^(workout|wod)\s*:\s*(.+)$/i);
          currentName = match ? match[2].trim() : cleanLine;
          currentSectionType = 'named_workout';
        } else if (cleanLine.match(/^[A-Z][A-Z\s&-]+:?$/)) {
          // Handle "STRENGTH" format (all caps)
          currentName = cleanLine.replace(/[:\s]*$/, '').trim();
          currentSectionType = 'section_header';
        } else if (cleanLine.match(/^\*?\s*(STRENGTH|WORKOUT|SKILL|GYMNASTICS|MINI-PUMP|ACCESSORY|METCON|WOD|CONDITIONING)/i)) {
          // Handle section headers with optional asterisks
          const match = cleanLine.match(/^\*?\s*(STRENGTH|WORKOUT|SKILL|GYMNASTICS|MINI-PUMP|ACCESSORY|METCON|WOD|CONDITIONING)\s*:?\s*-?(.*)$/i);
          if (match) {
            currentName = match[2].trim() || match[1];
            currentSectionType = 'section_header';
          }
        } else if (cleanLine.match(/^(.+)\s*:\s*$/)) {
          // Handle "Something:" format
          const match = cleanLine.match(/^(.+)\s*:\s*$/);
          currentName = match ? match[1].trim() : cleanLine;
          currentSectionType = 'generic_header';
        } else if (this.looksLikeWorkoutName(cleanLine, i, lines)) {
          // Handle standalone workout names
          currentName = cleanLine;
          currentSectionType = 'standalone_name';
        }
        
        // Clean up the name (remove asterisks, extra formatting)
        currentName = currentName
          .replace(/^\*+\s*/, '') // Remove leading asterisks
          .replace(/\*+$/, '')   // Remove trailing asterisks
          .replace(/^(STRENGTH|WORKOUT|SKILL|GYMNASTICS|MINI-PUMP|ACCESSORY|METCON|WOD|CONDITIONING)\s*:?\s*-?/i, '')
          .replace(/"/g, '')
          .replace(/^-\s*/, '')
          .trim();
        
        // If no name extracted, use the section type or a default
        if (!currentName) {
          const typeMatch = cleanLine.match(/(STRENGTH|WORKOUT|SKILL|GYMNASTICS|MINI-PUMP|ACCESSORY|METCON|WOD|CONDITIONING)/i);
          currentName = typeMatch ? typeMatch[1] : 'Workout Section';
        }
      } else if (currentSection.length > 0) {
        // Add to current section
        currentSection.push(line);
      } else {
        // Start first section if no section detected yet
        currentSection = [line];
        currentName = this.extractWorkoutNameFromContent(line);
        currentSectionType = 'content_based';
      }
    }
    
    // Finish the last section
    finishSection();

    // If no entities found, treat entire input as one entity
    if (entities.length === 0) {
      const cleanText = lines.slice(startIndex).join('\n').trim();
      if (cleanText) {
        entities.push({
          rawText: cleanText,
          startLine: startIndex,
          endLine: lines.length - 1,
          detectedName: this.extractWorkoutNameFromContent(cleanText),
          sectionType: 'full_content'
        });
      }
    }

    console.log(`🔍 Split into ${entities.length} entities:`, entities.map(e => e.detectedName));
    return entities;
  }

  /**
   * Helper: Check if line contains date information - Enhanced
   */
  private static isDateLine(line: string): boolean {
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
  private static looksLikeWorkoutName(line: string, index: number, lines: string[]): boolean {
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
  private static extractWorkoutNameFromContent(content: string): string {
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
   * Step 5: Parse Individual Workout Entity
   */
  private static async parseWorkoutEntity(
    entity: WorkoutEntity, 
    extractedDate?: string,
    communityId?: number
  ): Promise<ParsedWorkoutData> {
    
    // First, check if this entity matches a known benchmark workout
    const benchmarkResult = await this.identifyBenchmarkWorkout(entity.rawText);
    if (benchmarkResult.found) {
      return benchmarkResult.data!;
    }

    // Parse as custom workout
    return this.parseAsCustomWorkout(entity, extractedDate, communityId);
  }

  /**
   * Identify Benchmark Workout (Girl/Hero/Notable)
   */
  private static async identifyBenchmarkWorkout(input: string): Promise<{
    found: boolean;
    data?: ParsedWorkoutData;
  }> {
    const inputLower = input.toLowerCase();

    // Check Girl WODs first (highest priority)
    for (const girlWod of this.girlWodsCache) {
      const nameMatch = this.calculateNameSimilarity(inputLower, girlWod.name.toLowerCase());
      const descMatch = this.calculateDescriptionSimilarity(inputLower, girlWod.workoutDescription.toLowerCase());
      
      if (nameMatch > 0.8 || descMatch > 0.7) {
        return {
          found: true,
          data: this.convertGirlWodToParsedData(girlWod)
        };
      }
    }

    // Check Hero WODs
    for (const heroWod of this.heroWodsCache) {
      const nameMatch = this.calculateNameSimilarity(inputLower, heroWod.name.toLowerCase());
      const descMatch = this.calculateDescriptionSimilarity(inputLower, heroWod.workoutDescription.toLowerCase());
      
      if (nameMatch > 0.8 || descMatch > 0.7) {
        return {
          found: true,
          data: this.convertHeroWodToParsedData(heroWod)
        };
      }
    }

    // Check Notables
    for (const notable of this.notablesCache) {
      const nameMatch = this.calculateNameSimilarity(inputLower, notable.name.toLowerCase());
      const descMatch = this.calculateDescriptionSimilarity(inputLower, notable.workoutDescription.toLowerCase());
      
      if (nameMatch > 0.8 || descMatch > 0.7) {
        return {
          found: true,
          data: this.convertNotableToParsedData(notable)
        };
      }
    }

    return { found: false };
  }

  /**
   * Parse as Custom Workout
   */
  private static parseAsCustomWorkout(
    entity: WorkoutEntity,
    extractedDate?: string,
    communityId?: number
  ): ParsedWorkoutData {
    
    // Generate workout name
    const name = this.generateWorkoutName(entity, extractedDate);
    
    // Clean description (remove headers, keep workout content)
    const workoutDescription = this.cleanWorkoutDescription(entity.rawText);
    
    // Identify workout type using database
    const workoutType = this.identifyWorkoutType(entity.rawText);
    
    // Determine scoring pattern based on workout type
    const scoring = this.determineScoring(workoutType);
    
    // Extract time cap
    const timeCap = this.extractTimeCap(entity.rawText);
    
    // Calculate total effort
    const totalEffort = this.calculateTotalEffort(entity.rawText);
    
    // Identify barbell lifts using database
    const barbellLifts = this.identifyBarbellLifts(entity.rawText);
    
    // Check for related benchmark
    const relatedBenchmark = this.findRelatedBenchmark(entity.rawText);

    return {
      name,
      workoutType,
      scoring,
      timeCap,
      workoutDescription,
      totalEffort,
      barbellLifts,
      relatedBenchmark,
      category: communityId ? 'custom_community' : 'custom_user'
    };
  }

  /**
   * Generate Workout Name - Enhanced
   */
  private static generateWorkoutName(entity: WorkoutEntity, extractedDate?: string): string {
    if (entity.detectedName && entity.detectedName !== 'Custom Workout') {
      return entity.detectedName;
    }

    // Auto-generate based on section type
    if (entity.sectionType === 'section_header' && entity.detectedName) {
      const dateStr = extractedDate ? ` - ${extractedDate}` : '';
      return `${entity.detectedName} Work${dateStr}`;
    }

    // Use first meaningful line
    const lines = entity.rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0]
        .replace(/^(STRENGTH|CONDITIONING|METCON|SKILL|WARM-UP|COOL-DOWN)[:|\s]*/i, '')
        .replace(/^(workout|wod):\s*/i, '')
        .trim();
        
      if (firstLine && firstLine.length < 50) {
        return firstLine;
      }
    }

    // Fallback to type-based name
    const dateStr = extractedDate ? ` - ${extractedDate}` : '';
    return `Custom Workout${dateStr}`;
  }

  /**
   * Clean Workout Description - Enhanced
   */
  private static cleanWorkoutDescription(rawText: string): string {
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
   * Helper: Calculate name similarity using Levenshtein distance
   */
  private static calculateNameSimilarity(input: string, target: string): number {
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
   * Helper: Identify workout type using database - Enhanced
   */
  private static identifyWorkoutType(input: string): string {
    const inputLower = input.toLowerCase();
    
    for (const workoutType of this.workoutTypesCache) {
      const examples = workoutType.examples.toLowerCase();
      const description = workoutType.description.toLowerCase();
      
      if (inputLower.includes(workoutType.workoutType) ||
          examples.split(',').some((ex: string) => inputLower.includes(ex.trim())) ||
          description.split(' ').some((word: string) => inputLower.includes(word))) {
        return workoutType.workoutType;
      }
    }
    
    // Enhanced fallback based on common patterns
    if (inputLower.includes('for time') || inputLower.includes('rft')) return 'for_time';
    if (inputLower.includes('amrap')) return 'amrap';
    if (inputLower.includes('emom')) return 'emom';
    if (inputLower.includes('tabata')) return 'tabata';
    if (inputLower.includes('build to') || inputLower.includes('rm')) return 'strength';
    if (inputLower.includes('max effort')) return 'max_effort';
    
    return 'for_time';
  }

  /**
   * Helper: Determine scoring pattern
   */
  private static determineScoring(workoutType: string): string {
    const typeData = this.workoutTypesCache.find(wt => wt.workoutType === workoutType);
    return typeData?.scoreFormat || 'Time';
  }

  /**
   * Helper: Extract time cap - Enhanced
   */
  private static extractTimeCap(input: string): number | undefined {
    const timeCapMatch = input.match(/(?:cap|time cap|tc)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
    if (timeCapMatch) {
      return parseInt(timeCapMatch[1]) * 60;
    }
    return undefined;
  }

  /**
   * Helper: Calculate total effort - Enhanced
   */
  private static calculateTotalEffort(input: string): number {
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
   * Helper: Identify barbell lifts using database - Enhanced
   */
  private static identifyBarbellLifts(input: string): Array<{ id: number; liftName: string; category: string; liftType: string }> {
    const inputLower = input.toLowerCase();
    const foundLifts: Array<{ id: number; liftName: string; category: string; liftType: string }> = [];
    
    for (const lift of this.barbellLiftsCache) {
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
   * Helper: Find related benchmark workout
   */
  private static findRelatedBenchmark(input: string): string | undefined {
    const inputLower = input.toLowerCase();
    
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
      barbellLifts: [], // Will be populated from junction table
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
      barbellLifts: [], // Will be populated from junction table
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
      barbellLifts: [], // Will be populated from junction table
      category: 'notables',
      sourceTable: 'notables',
      databaseId: notable.id
    };
  }

  /**
   * Convert ParsedWorkoutData to Database Insert Format
   */
  static createCustomUserWorkout(parsed: ParsedWorkoutData, userId: string): InsertCustomUserWorkout {
    return {
      name: parsed.name,
      category: 'custom_user',
      workoutType: parsed.workoutType as any,
      scoring: parsed.scoring,
      timeCap: parsed.timeCap,
      workoutDescription: parsed.workoutDescription,
      relatedBenchmark: parsed.relatedBenchmark,
      userId
    };
  }

  static createCustomCommunityWorkout(parsed: ParsedWorkoutData, communityId: number, createdBy: string): InsertCustomCommunityWorkout {
    return {
      name: parsed.name,
      category: 'custom_community',
      workoutType: parsed.workoutType as any,
      scoring: parsed.scoring,
      timeCap: parsed.timeCap,
      workoutDescription: parsed.workoutDescription,
      relatedBenchmark: parsed.relatedBenchmark,
      communityId,
      createdBy
    };
  }

  /**
   * Get workout suggestions based on partial input
   */
  static async getWorkoutSuggestions(partialInput: string, limit: number = 10): Promise<string[]> {
    await this.initializeCache();
    
    const suggestions: string[] = [];
    const inputLower = partialInput.toLowerCase().trim();
    
    if (inputLower.length < 2) return suggestions;

    // Search Girl WODs
    for (const girlWod of this.girlWodsCache) {
      if (girlWod.name.toLowerCase().includes(inputLower) && suggestions.length < limit) {
        suggestions.push(girlWod.name);
      }
    }

    // Search Hero WODs
    for (const heroWod of this.heroWodsCache) {
      if (heroWod.name.toLowerCase().includes(inputLower) && suggestions.length < limit) {
        suggestions.push(heroWod.name);
      }
    }

    // Search Notables
    for (const notable of this.notablesCache) {
      if (notable.name.toLowerCase().includes(inputLower) && suggestions.length < limit) {
        suggestions.push(notable.name);
      }
    }

    return suggestions.slice(0, limit);
  }
}
