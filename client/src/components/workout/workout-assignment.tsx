import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar, 
  Zap, 
  Copy, 
  Plus, 
  Target, 
  Clock, 
  Dumbbell, 
  Check,
  Edit3,
  Trash2,
  Search
} from "lucide-react";
import { format } from "date-fns";

interface WorkoutAssignmentProps {
  selectedDate: Date;
  userId: string;
  onAssignmentCreated: () => void;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

interface BenchmarkWorkout {
  id: number;
  name: string;
  workoutDescription: string;
  workoutType: string;
  scoring: string;
  timeCap?: number;
  category: 'girls' | 'heroes' | 'notables';
}

interface ParsedWorkout {
  name: string;
  workoutDescription: string;
  workoutType: string;
  scoring: string;
  timeCap?: number;
  totalEffort?: number;
  barbellLifts: string[];
}

export function WorkoutAssignment({ 
  selectedDate, 
  userId, 
  onAssignmentCreated, 
  isOpen, 
  onClose,
  initialTab = "parse"
}: WorkoutAssignmentProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Reset tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [rawText, setRawText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkWorkout | null>(null);
  const [modifications, setModifications] = useState<any>({});
  const [parsedWorkout, setParsedWorkout] = useState<ParsedWorkout | null>(null);
  const [editableWorkout, setEditableWorkout] = useState<ParsedWorkout | null>(null);
  const { toast } = useToast();

  const dateString = format(selectedDate, "yyyy-MM-dd");

  // Get available workouts for assignment
  const { data: availableWorkouts } = useQuery({
    queryKey: ["/api/workouts/available-for-assignment"],
    enabled: isOpen,
  });

  // Get benchmark workouts
  const { data: benchmarkWorkouts } = useQuery({
    queryKey: ["/api/benchmark-workouts"],
    enabled: isOpen,
  });

  // Parse workout mutation
  const parseMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/workouts/parse", { rawText: text });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data.workout) {
        setParsedWorkout(data.data.workout);
        toast({
          title: `🎯 Workout Parsed! (${data.data.analysis.confidence}% confidence)`,
          description: `Identified as: ${data.data.analysis.categoryLabel}`,
        });
      }
    },
  });

  // Parse and assign mutation
  const parseAndAssignMutation = useMutation({
    mutationFn: async (data: { rawText: string; assignedDate: string }) => {
      const response = await apiRequest("POST", "/api/workouts/parse-and-assign", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Workout Assigned",
        description: "Workout parsed and assigned to date successfully!",
      });
      onAssignmentCreated();
      onClose();
      resetForm();
    },
  });

  // Clone and assign mutation
  const cloneAndAssignMutation = useMutation({
    mutationFn: async (data: { 
      benchmarkId: number; 
      sourceTable: string; 
      assignedDate: string; 
      modifications?: any;
    }) => {
      const response = await apiRequest("POST", "/api/workouts/clone-and-assign", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Benchmark Cloned & Assigned",
        description: "Benchmark workout cloned and assigned to date!",
      });
      onAssignmentCreated();
      onClose();
      resetForm();
    },
  });

  // Assign existing workout mutation
  const assignExistingMutation = useMutation({
    mutationFn: async (data: { 
      workoutId: number; 
      workoutSource: string; 
      assignedDate: string;
    }) => {
      const response = await apiRequest("POST", "/api/workouts/assign-existing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Workout Assigned",
        description: "Existing workout assigned to date successfully!",
      });
      onAssignmentCreated();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setRawText("");
    setSearchQuery("");
    setSelectedBenchmark(null);
    setModifications({});
    setParsedWorkout(null);
    setEditableWorkout(null);
    setActiveTab("parse");
  };

  const handleParseAndAssign = () => {
    if (!rawText.trim()) {
      toast({
        title: "⚠️ Input Required",
        description: "Please enter workout text to parse",
        variant: "destructive",
      });
      return;
    }

    parseAndAssignMutation.mutate({
      rawText: rawText,
      assignedDate: dateString
    });
  };

  const handleCloneAndAssign = () => {
    if (!selectedBenchmark) {
      toast({
        title: "⚠️ Selection Required",
        description: "Please select a benchmark workout to clone",
        variant: "destructive",
      });
      return;
    }

    const sourceTable = selectedBenchmark.category === 'girls' ? 'girl_wods' : 
                       selectedBenchmark.category === 'heroes' ? 'hero_wods' : 'notables';

    cloneAndAssignMutation.mutate({
      benchmarkId: selectedBenchmark.id,
      sourceTable: sourceTable,
      assignedDate: dateString,
      modifications: Object.keys(modifications).length > 0 ? modifications : undefined
    });
  };

  const handleAssignExisting = (workout: any) => {
    assignExistingMutation.mutate({
      workoutId: workout.id,
      workoutSource: workout.source,
      assignedDate: dateString
    });
  };

  const filteredBenchmarks = Array.isArray(benchmarkWorkouts) ? benchmarkWorkouts.filter((workout: BenchmarkWorkout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.workoutDescription.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredAvailable = (availableWorkouts && (availableWorkouts as any).workouts && Array.isArray((availableWorkouts as any).workouts)) ? (availableWorkouts as any).workouts.filter((workout: any) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Assign Workout to {format(selectedDate, "MMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parse">
              <Zap className="h-4 w-4 mr-2" />
              Parse & Assign
            </TabsTrigger>
            <TabsTrigger value="clone">
              <Copy className="h-4 w-4 mr-2" />
              Clone Benchmark
            </TabsTrigger>
            <TabsTrigger value="existing">
              <Target className="h-4 w-4 mr-2" />
              Assign Existing
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Check className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Parse & Assign Tab */}
          <TabsContent value="parse" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Parse New Workout & Assign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workout-text">Workout Description</Label>
                  <Textarea
                    id="workout-text"
                    placeholder="Paste your workout here... e.g.:

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
                    onClick={() => parseMutation.mutate(rawText)}
                    variant="outline"
                    disabled={!rawText.trim() || parseMutation.isPending}
                  >
                    {parseMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Preview Parse
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleParseAndAssign}
                    disabled={!rawText.trim() || parseAndAssignMutation.isPending}
                  >
                    {parseAndAssignMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Parse & Assign to Date
                      </>
                    )}
                  </Button>
                </div>

                {parsedWorkout && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">✏️ Edit Workout Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Workout Name</Label>
                        <Input
                          value={editableWorkout?.name || parsedWorkout.name}
                          onChange={(e) => setEditableWorkout({...parsedWorkout, ...editableWorkout, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Workout Type</Label>
                        <Select
                          value={editableWorkout?.workoutType || parsedWorkout.workoutType}
                          onValueChange={(value) => setEditableWorkout({...parsedWorkout, ...editableWorkout, workoutType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="for_time">For Time</SelectItem>
                            <SelectItem value="amrap">AMRAP</SelectItem>
                            <SelectItem value="emom">EMOM</SelectItem>
                            <SelectItem value="tabata">Tabata</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="interval">Interval</SelectItem>
                            <SelectItem value="endurance">Endurance</SelectItem>
                            <SelectItem value="chipper">Chipper</SelectItem>
                            <SelectItem value="ladder">Ladder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Scoring</Label>
                        <Input
                          value={editableWorkout?.scoring || parsedWorkout.scoring}
                          onChange={(e) => setEditableWorkout({...parsedWorkout, ...editableWorkout, scoring: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Time Cap (minutes)</Label>
                        <Input
                          type="number"
                          value={editableWorkout?.timeCap ? Math.round(editableWorkout.timeCap / 60) : parsedWorkout.timeCap ? Math.round(parsedWorkout.timeCap / 60) : ""}
                          onChange={(e) => setEditableWorkout({...parsedWorkout, ...editableWorkout, timeCap: e.target.value ? parseInt(e.target.value) * 60 : undefined})}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Workout Description</Label>
                      <Textarea
                        value={editableWorkout?.workoutDescription || parsedWorkout.workoutDescription}
                        onChange={(e) => setEditableWorkout({...parsedWorkout, ...editableWorkout, workoutDescription: e.target.value})}
                        rows={4}
                      />
                    </div>
                    
                    <Button
                      className="w-full mt-4"
                      onClick={() => {
                        const finalWorkout = {...parsedWorkout, ...editableWorkout};
                        parseAndAssignMutation.mutate({
                          rawText: JSON.stringify(finalWorkout),
                          assignedDate: dateString
                        });
                      }}
                      disabled={parseAndAssignMutation.isPending}
                    >
                      {parseAndAssignMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating & Assigning...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create & Assign to Date
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clone Benchmark Tab */}
          <TabsContent value="clone" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Copy className="h-5 w-5 mr-2 text-accent" />
                  Clone & Modify Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Search Benchmarks</Label>
                  <Input
                    placeholder="Search Girl WODs, Hero WODs, Notables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredBenchmarks.map((workout: BenchmarkWorkout) => (
                    <div 
                      key={workout.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedBenchmark?.id === workout.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBenchmark(workout)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{workout.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {workout.category === 'girls' ? '💪 Girl' : 
                             workout.category === 'heroes' ? '🎖️ Hero' : '⭐ Notable'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {workout.workoutType}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {workout.workoutDescription.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>

                {selectedBenchmark && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">✏️ Modify All Fields</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Custom Name</Label>
                        <Input
                          placeholder={`${selectedBenchmark.name} (Modified)`}
                          value={modifications.name || ""}
                          onChange={(e) => setModifications({...modifications, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Workout Type</Label>
                        <Select
                          value={modifications.workoutType || selectedBenchmark.workoutType}
                          onValueChange={(value) => setModifications({...modifications, workoutType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={selectedBenchmark.workoutType} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="for_time">For Time</SelectItem>
                            <SelectItem value="amrap">AMRAP</SelectItem>
                            <SelectItem value="emom">EMOM</SelectItem>
                            <SelectItem value="tabata">Tabata</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="interval">Interval</SelectItem>
                            <SelectItem value="endurance">Endurance</SelectItem>
                            <SelectItem value="chipper">Chipper</SelectItem>
                            <SelectItem value="ladder">Ladder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Scoring</Label>
                        <Input
                          placeholder={selectedBenchmark.scoring}
                          value={modifications.scoring || ""}
                          onChange={(e) => setModifications({...modifications, scoring: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Time Cap (minutes)</Label>
                        <Input
                          type="number"
                          placeholder={selectedBenchmark.timeCap ? `${Math.round(selectedBenchmark.timeCap / 60)}` : "No cap"}
                          value={modifications.timeCap || ""}
                          onChange={(e) => setModifications({...modifications, timeCap: e.target.value ? parseInt(e.target.value) * 60 : null})}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Custom Description</Label>
                      <Textarea
                        placeholder="Modify the workout description..."
                        value={modifications.workoutDescription || selectedBenchmark.workoutDescription}
                        onChange={(e) => setModifications({...modifications, workoutDescription: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCloneAndAssign}
                  disabled={!selectedBenchmark || cloneAndAssignMutation.isPending}
                  className="w-full"
                >
                  {cloneAndAssignMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cloning & Assigning...
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone & Assign to Date
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assign Existing Tab */}
          <TabsContent value="existing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Assign Existing Workout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Search Your Workouts</Label>
                  <Input
                    placeholder="Search your custom workouts and benchmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredAvailable.map((workout: any) => (
                    <div 
                      key={`${workout.source}-${workout.id}`}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{workout.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {workout.category}
                          </Badge>
                          {workout.workoutType && (
                            <Badge variant="secondary" className="text-xs">
                              {workout.workoutType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {workout.workoutDescription?.substring(0, 100) || workout.description?.substring(0, 100)}...
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleAssignExisting(workout)}
                          disabled={assignExistingMutation.isPending}
                        >
                          {assignExistingMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Assigning...
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Assign
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAvailable.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No workouts available for assignment.</p>
                    <p className="text-sm">Create some workouts first!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-accent" />
                  Assignment Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    📅 {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  <p className="text-gray-600">
                    Use the tabs above to assign workouts to this date
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-primary/10 rounded-lg p-4">
                      <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="font-medium">Parse & Assign</p>
                      <p className="text-gray-600">Paste workout text</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4">
                      <Copy className="h-6 w-6 text-accent mx-auto mb-2" />
                      <p className="font-medium">Clone Benchmark</p>
                      <p className="text-gray-600">Modify famous WODs</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-4">
                      <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Assign Existing</p>
                      <p className="text-gray-600">Use saved workouts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
