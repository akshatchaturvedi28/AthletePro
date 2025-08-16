import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Target, Dumbbell, Edit3, Check } from "lucide-react";

interface ParsedWorkout {
  name: string;
  description: string;
  type: string;
  scoring?: string;
  timeCap?: number;
  restBetweenIntervals?: number;
  totalEffort?: number;
  barbellLifts?: string[];
  date?: string;
}

interface PRDParseResult {
  success: boolean;
  data: {
    workout?: ParsedWorkout;
    analysis: {
      confidence: number;
      category: string;
      categoryLabel: string;
      sourceTable?: string;
      databaseId?: number;
      errors?: string[];
    };
    suggestions: string[];
  };
}

interface WorkoutParserProps {
  onWorkoutCreated: (workout: any) => void;
  communityId?: number;
}

export function WorkoutParser({ onWorkoutCreated, communityId }: WorkoutParserProps) {
  const [rawText, setRawText] = useState("");
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [parseResult, setParseResult] = useState<PRDParseResult | null>(null);
  const { toast } = useToast();

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
    onSuccess: (data: PRDParseResult) => {
      setParseResult(data);

      if (data.success && data.data.workout) {
        setParsedWorkout(data.data.workout);
        setIsEditing(true);
        
        const confidence = data.data.analysis.confidence;
        const categoryLabel = data.data.analysis.categoryLabel;
        
        toast({
          title: `🎯 Workout Parsed! (${confidence}% confidence)`,
          description: `Identified as: ${categoryLabel}`,
        });
      } else if (data.data.suggestions && data.data.suggestions.length > 0) {
        toast({
          title: "🔍 No exact match found",
          description: `Did you mean: ${data.data.suggestions.join(', ')}?`,
          variant: "default",
        });
      } else {
        toast({
          title: "❓ Custom Workout Detected",
          description: "Parsed as custom workout - ready to save!",
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
    mutationFn: async (workoutData: any) => {
      const response = await apiRequest("POST", "/api/workouts", workoutData);
      return response.json();
    },
    onSuccess: (data) => {
      onWorkoutCreated(data);
      setRawText("");
      setParsedWorkout(null);
      setIsEditing(false);
      setParseResult(null);
      toast({
        title: "✅ Workout Created",
        description: "Your workout has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "💥 Creation Failed",
        description: "Failed to create workout. Please try again.",
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

  const handleCreate = () => {
    if (!parsedWorkout) return;

    const workoutData = {
      ...parsedWorkout,
      communityId: communityId || null,
      isPublic: false
    };

    createMutation.mutate(workoutData);
  };

  const updateParsedWorkout = (field: string, value: any) => {
    if (!parsedWorkout) return;
    setParsedWorkout({
      ...parsedWorkout,
      [field]: value
    });
  };

  const clearAll = () => {
    setRawText("");
    setParsedWorkout(null);
    setIsEditing(false);
    setParseResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Smart Workout Parser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-text">Workout Description</Label>
            <Textarea
              id="workout-text"
              placeholder="Paste your workout here... e.g.:

27-June-2025 | Friday

Fran
21-15-9 reps for time of:
Thrusters (95/65 lb)
Pull-ups

Time cap: 8 minutes

-- or --

AMRAP 20 minutes:
10 Burpees
15 Kettlebell Swings (53/35)
20 Air Squats"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleParse}
              disabled={parseMutation.isPending || !rawText.trim()}
            >
              {parseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Parse Workout
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

      {/* PRD Analysis Results */}
      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-accent" />
              📊 Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant={parseResult.data.analysis.confidence > 80 ? "default" : "secondary"}>
                    {parseResult.data.analysis.confidence}% Confidence
                  </Badge>
                  
                  <Badge variant="outline">
                    {parseResult.data.analysis.categoryLabel}
                  </Badge>

                  {parseResult.data.analysis.sourceTable && (
                    <Badge variant="secondary" className="text-xs">
                      Source: {parseResult.data.analysis.sourceTable}
                    </Badge>
                  )}
                </div>
              </div>

              {parseResult.data.suggestions && parseResult.data.suggestions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Smart Suggestions</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parseResult.data.suggestions.map((suggestion, index) => (
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

              {parseResult.data.analysis.errors && parseResult.data.analysis.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Label className="text-sm font-medium text-red-800">Parsing Issues</Label>
                  <ul className="mt-1 text-sm text-red-700 list-inside list-disc">
                    {parseResult.data.analysis.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Workout Section */}
      {parsedWorkout && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2 text-accent" />
                Parsed Workout
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Preview" : "Edit"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Workout Name</Label>
                  <Input
                    id="name"
                    value={parsedWorkout.name}
                    onChange={(e) => updateParsedWorkout("name", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Workout Type</Label>
                  <Select
                    value={parsedWorkout.type}
                    onValueChange={(value) => updateParsedWorkout("type", value)}
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
                  <Label htmlFor="timeCap">Time Cap (minutes)</Label>
                  <Input
                    id="timeCap"
                    type="number"
                    value={parsedWorkout.timeCap ? parsedWorkout.timeCap / 60 : ""}
                    onChange={(e) => updateParsedWorkout("timeCap", e.target.value ? parseInt(e.target.value) * 60 : null)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="totalEffort">Total Effort</Label>
                  <Input
                    id="totalEffort"
                    type="number"
                    value={parsedWorkout.totalEffort || ""}
                    onChange={(e) => updateParsedWorkout("totalEffort", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={parsedWorkout.description}
                    onChange={(e) => updateParsedWorkout("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{parsedWorkout.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{parsedWorkout.type.replace("_", " ").toUpperCase()}</Badge>
                    {parsedWorkout.scoring && (
                      <Badge variant="secondary">{parsedWorkout.scoring}</Badge>
                    )}
                    {parsedWorkout.timeCap && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.round(parsedWorkout.timeCap / 60)}min
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm">{parsedWorkout.description}</pre>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {parsedWorkout.totalEffort && (
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-accent" />
                      <span className="text-sm">Total Effort: {parsedWorkout.totalEffort}</span>
                    </div>
                  )}
                  
                  
                  {parsedWorkout.barbellLifts && parsedWorkout.barbellLifts.length > 0 && (
                    <div className="flex items-center">
                      <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">{parsedWorkout.barbellLifts.length} lift(s)</span>
                    </div>
                  )}
                </div>
                
                {parsedWorkout.barbellLifts && parsedWorkout.barbellLifts.length > 0 && (
                  <div>
                    <Label>Barbell Lifts</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {parsedWorkout.barbellLifts.map((lift, index) => (
                        <Badge key={index} variant="secondary">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {lift}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Workout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
