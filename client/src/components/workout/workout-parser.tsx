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
  timeCap?: number;
  restBetweenIntervals?: number;
  totalEffort?: number;
  relatedBenchmark?: string;
  barbellLifts?: string[];
  date?: string;
}

interface WorkoutParserProps {
  onWorkoutCreated: (workout: any) => void;
  communityId?: number;
}

export function WorkoutParser({ onWorkoutCreated, communityId }: WorkoutParserProps) {
  const [rawText, setRawText] = useState("");
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
    onSuccess: (data) => {
      // The API returns { workouts: [...], count: number }
      // For now, use the first workout or combine them
      if (data.workouts && data.workouts.length > 0) {
        setParsedWorkout(data.workouts[0]);
        setIsEditing(true);
        toast({
          title: "Workout Parsed Successfully",
          description: `Found ${data.count} workout(s). Showing the first one for editing.`,
        });
      } else {
        toast({
          title: "No Workouts Found",
          description: "No valid workouts were found in the provided text.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Parsing Failed",
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
      toast({
        title: "Workout Created",
        description: "Your workout has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create workout. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleParse = () => {
    if (!rawText.trim()) {
      toast({
        title: "No Content",
        description: "Please enter a workout description to parse.",
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

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            AI Workout Parser
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-text">Workout Description</Label>
            <Textarea
              id="workout-text"
              placeholder="Paste your workout here... e.g.:

27-June-2025 | Friday

STRENGTH
Build to 1 RM Clean and Jerk in 15 mins.

Workout: Chicago Slice
For Time:
120 Double Unders
30 Kettlebell Swings
50 Back Squats (40/30)
30 Kettlebell Swings
120 Double Unders
Cap: 13 mins"
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
                  Parsing...
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
              onClick={() => {
                setRawText("");
                setParsedWorkout(null);
                setIsEditing(false);
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  
                  {parsedWorkout.relatedBenchmark && (
                    <div className="flex items-center">
                      <Badge variant="outline">{parsedWorkout.relatedBenchmark}</Badge>
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
