import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Clock, Target, Dumbbell, Edit3, Check, Calendar, Trash2, Plus } from "lucide-react";

interface ParsedWorkoutEntity {
  name: string;
  workoutDescription: string;
  type: string;
  scoring?: string;
  timeCap?: number;
  totalEffort?: number;
  barbellLifts?: string[];
  relatedBenchmark?: string;
  category: 'girls' | 'heroes' | 'notables' | 'custom_community' | 'custom_user';
  sourceTable?: string;
  databaseId?: number;
}

interface MultiEntityParseResult {
  success: boolean;
  workoutFound: boolean;
  workoutEntities: ParsedWorkoutEntity[];
  extractedDate?: string;
  confidence: number;
  suggestedWorkouts?: string[];
  errors?: string[];
}

interface WorkoutParserProps {
  onWorkoutsCreated?: (workouts: any[]) => void;
  communityId?: number;
}

export function WorkoutParser({ onWorkoutsCreated, communityId }: WorkoutParserProps) {
  const [rawText, setRawText] = useState("");
  const [parsedEntities, setParsedEntities] = useState<ParsedWorkoutEntity[]>([]);
  const [extractedDate, setExtractedDate] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [parseResult, setParseResult] = useState<MultiEntityParseResult | null>(null);
  const [editingEntityIndex, setEditingEntityIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const workoutTypes = [
    { value: "for_time", label: "For Time" },
    { value: "amrap", label: "AMRAP" },
    { value: "emom", label: "EMOM" },
    { value: "tabata", label: "Tabata" },
    { value: "strength", label: "Strength" },
    { value: "interval", label: "Interval" },
    { value: "endurance", label: "Endurance" },
    { value: "chipper", label: "Chipper" },
    { value: "ladder", label: "Ladder" },
    { value: "unbroken", label: "Unbroken" }
  ];

  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/workouts/parse", { rawText: text });
      return response.json();
    },
    onSuccess: (data: MultiEntityParseResult) => {
      setParseResult(data);

      if (data.success && data.workoutFound && data.workoutEntities.length > 0) {
        setParsedEntities(data.workoutEntities);
        setExtractedDate(data.extractedDate);
        setIsEditing(true);
        
        const confidence = data.confidence;
        const entityCount = data.workoutEntities.length;
        
        toast({
          title: `🎯 ${entityCount} Workout${entityCount > 1 ? 's' : ''} Parsed! (${confidence}% confidence)`,
          description: entityCount > 1 
            ? `Found ${entityCount} workout entities${data.extractedDate ? ` for ${data.extractedDate}` : ''}`
            : `Single workout detected${data.extractedDate ? ` for ${data.extractedDate}` : ''}`,
        });
      } else if (data.suggestedWorkouts && data.suggestedWorkouts.length > 0) {
        toast({
          title: "🔍 No exact match found",
          description: `Did you mean: ${data.suggestedWorkouts.join(', ')}?`,
          variant: "default",
        });
      } else {
        toast({
          title: "❓ Unable to parse workout",
          description: data.errors?.join(', ') || "No workout entities could be identified",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "💥 Parsing Failed",
        description: "Failed to parse workout. Please check the format and try again.",
        variant: "destructive",
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (entitiesData: ParsedWorkoutEntity[]) => {
      try {
        // Send all workout entities in a single request
        const workoutEntitiesPayload = {
          workoutEntities: entitiesData.map(entity => ({
            name: entity.name,
            workoutDescription: entity.workoutDescription,
            type: entity.type,
            scoring: entity.scoring,
            timeCap: entity.timeCap,
            totalEffort: entity.totalEffort,
            barbellLifts: entity.barbellLifts,
            relatedBenchmark: entity.relatedBenchmark
          }))
        };
        
        const response = await apiRequest("POST", "/api/workouts", workoutEntitiesPayload);
        console.log('HTTP Status:', response.status);
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (!result.success) {
          console.error('API Error:', result.message);
          throw new Error(result.message || 'Failed to create workouts');
        }
        
        return result.workouts || [];
      } catch (error) {
        console.error('Mutation error:', error);
        throw error;
      }
    },
    onSuccess: (createdWorkouts) => {
      // Safety check: only call onWorkoutsCreated if it's a function
      if (typeof onWorkoutsCreated === 'function') {
        onWorkoutsCreated(createdWorkouts);
      }
      
      setRawText("");
      setParsedEntities([]);
      setExtractedDate(undefined);
      setIsEditing(false);
      setParseResult(null);
      setEditingEntityIndex(null);
      console.log('Created workouts:', createdWorkouts);
      
      toast({
        title: "✅ Workouts Created",
        description: `${createdWorkouts.length} workout${createdWorkouts.length > 1 ? 's' : ''} created successfully.`,
      });
    },
    onError: (error) => {
      console.log('Creation failed: ', error);
      toast({
        title: "💥 Creation Failed",
        description: "Failed to create workouts. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleParse = () => {
    if (!rawText.trim()) {
      toast({
        title: "⚠️ Input Required",
        description: "Please enter workout text to parse",
        variant: "destructive",
      });
      return;
    }
    parseMutation.mutate(rawText);
  };

  const handleCreateAll = () => {
    if (parsedEntities.length === 0) return;
    
    if (!isAuthenticated || !user) {
      toast({
        title: "🔐 Authentication Required",
        description: "Please sign in to create workouts",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(parsedEntities);
  };

  const updateEntity = (index: number, field: string, value: any) => {
    const updated = [...parsedEntities];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setParsedEntities(updated);
  };

  const removeEntity = (index: number) => {
    const updated = parsedEntities.filter((_, i) => i !== index);
    setParsedEntities(updated);
    
    if (editingEntityIndex === index) {
      setEditingEntityIndex(null);
    } else if (editingEntityIndex !== null && editingEntityIndex > index) {
      setEditingEntityIndex(editingEntityIndex - 1);
    }
  };

  const clearAll = () => {
    setRawText("");
    setParsedEntities([]);
    setExtractedDate(undefined);
    setIsEditing(false);
    setParseResult(null);
    setEditingEntityIndex(null);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'girls': '💪 Girl WOD',
      'heroes': '🎖️ Hero WOD',
      'notables': '⭐ Notable WOD',
      'custom_community': '🏘️ Community WOD',
      'custom_user': '👤 User WOD'
    };
    return labels[category] || '🔧 Custom Workout';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Multi-Entity Workout Parser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-text">Workout Description</Label>
            <Textarea
              id="workout-text"
              placeholder="Paste your workout here... e.g.:

27-June-2025 | Friday

STRENGTH:
Back Squat
5 x 3 @ 85%

CONDITIONING:
Fran
21-15-9 reps for time of:
- Thrusters (95/65 lb)
- Pull-ups
Time cap: 8 minutes

COOL DOWN:
500m Row
2 rounds of:
10 Stretch holds"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="text-sm text-muted-foreground mt-2">
              💡 The parser can automatically detect multiple workout sections, dates, and benchmark workouts
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleParse}
              disabled={parseMutation.isPending || !rawText.trim()}
            >
              {parseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Parsing Multiple Entities...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Parse Workout(s)
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parse Results Summary */}
      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-accent" />
              📊 Parse Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant={parseResult.confidence > 80 ? "default" : "secondary"}>
                    {parseResult.confidence}% Confidence
                  </Badge>
                  
                  <Badge variant="outline">
                    {parseResult.workoutEntities.length} Entities Found
                  </Badge>

                  {extractedDate && (
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {extractedDate}
                    </Badge>
                  )}
                </div>
              </div>

              {parseResult.suggestedWorkouts && parseResult.suggestedWorkouts.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Workout Suggestions</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parseResult.suggestedWorkouts.map((suggestion: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setRawText(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {parseResult.errors && parseResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Label className="text-sm font-medium text-red-800">Parsing Issues</Label>
                  <ul className="mt-1 text-sm text-red-700 list-inside list-disc">
                    {parseResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Entities Section */}
      {parsedEntities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Parsed Workout Entities ({parsedEntities.length})
            </h3>
            <Button
              onClick={handleCreateAll}
              disabled={createMutation.isPending || parsedEntities.length === 0}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create All {parsedEntities.length} Workout{parsedEntities.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {parsedEntities.map((entity, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="text-sm bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span>{entity.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {getCategoryLabel(entity.category)}
                    </Badge>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingEntityIndex(editingEntityIndex === index ? null : index)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      {editingEntityIndex === index ? "Preview" : "Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeEntity(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingEntityIndex === index ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Workout Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={entity.name}
                        onChange={(e) => updateEntity(index, "name", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`type-${index}`}>Workout Type</Label>
                      <Select
                        value={entity.type}
                        onValueChange={(value) => updateEntity(index, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {workoutTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`timeCap-${index}`}>Time Cap (minutes)</Label>
                      <Input
                        id={`timeCap-${index}`}
                        type="number"
                        value={entity.timeCap ? entity.timeCap / 60 : ""}
                        onChange={(e) => updateEntity(index, "timeCap", e.target.value ? parseInt(e.target.value) * 60 : null)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`totalEffort-${index}`}>Total Effort</Label>
                      <Input
                        id={`totalEffort-${index}`}
                        type="number"
                        value={entity.totalEffort || ""}
                        onChange={(e) => updateEntity(index, "totalEffort", e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={entity.workoutDescription}
                        onChange={(e) => updateEntity(index, "workoutDescription", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entity.type.replace("_", " ").toUpperCase()}</Badge>
                        {entity.scoring && (
                          <Badge variant="secondary">{entity.scoring}</Badge>
                        )}
                        {entity.timeCap && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.round(entity.timeCap / 60)}min
                          </Badge>
                        )}
                        {entity.relatedBenchmark && (
                          <Badge variant="outline">
                            Related: {entity.relatedBenchmark}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">{entity.workoutDescription}</pre>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {entity.totalEffort && (
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-2 text-accent" />
                          <span className="text-sm">Total Effort: {entity.totalEffort}</span>
                        </div>
                      )}
                      
                      {entity.barbellLifts && entity.barbellLifts.length > 0 && (
                        <div className="flex items-center">
                          <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm">{entity.barbellLifts.length} lift(s)</span>
                        </div>
                      )}
                    </div>
                    
                    {entity.barbellLifts && entity.barbellLifts.length > 0 && (
                      <div>
                        <Label>Barbell Lifts</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {entity.barbellLifts.map((lift: string, liftIndex: number) => (
                            <Badge key={liftIndex} variant="secondary">
                              <Dumbbell className="h-3 w-3 mr-1" />
                              {lift}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
