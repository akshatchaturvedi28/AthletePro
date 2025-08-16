import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Copy, 
  Search,
  Dumbbell,
  Clock,
  Target,
  Check
} from "lucide-react";

interface WorkoutCloneProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: (workout: any) => void;
  communityId?: string;
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

export function WorkoutClone({ 
  isOpen, 
  onClose, 
  onWorkoutCreated,
  communityId
}: WorkoutCloneProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkWorkout | null>(null);
  const [modifications, setModifications] = useState<any>({});
  const { toast } = useToast();

  // Get benchmark workouts
  const { data: benchmarkWorkouts, isLoading } = useQuery({
    queryKey: ["/api/benchmark-workouts"],
    enabled: isOpen,
  });

  // Clone workout mutation
  const cloneMutation = useMutation({
    mutationFn: async (data: { 
      benchmarkId: number; 
      sourceTable: string; 
      modifications?: any;
      communityId?: string;
    }) => {
      const response = await apiRequest("POST", "/api/workouts/clone-benchmark", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Benchmark Cloned",
        description: "Benchmark workout cloned successfully!",
      });
      onWorkoutCreated(data.workout);
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Clone Failed",
        description: error.message || "Failed to clone benchmark workout",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSearchQuery("");
    setSelectedBenchmark(null);
    setModifications({});
  };

  const handleClone = () => {
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

    cloneMutation.mutate({
      benchmarkId: selectedBenchmark.id,
      sourceTable: sourceTable,
      modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
      communityId: communityId
    });
  };

  const filteredBenchmarks = Array.isArray(benchmarkWorkouts) ? benchmarkWorkouts.filter((workout: BenchmarkWorkout) =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.workoutDescription.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Copy className="h-5 w-5 mr-2" />
            Clone Benchmark Workout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                Search Benchmark Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Girl WODs, Hero WODs, Notables</Label>
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
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
                        <h4 className="font-semibold text-lg">{workout.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {workout.category === 'girls' ? '💪 Girl' : 
                             workout.category === 'heroes' ? '🎖️ Hero' : '⭐ Notable'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {workout.workoutType.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {workout.timeCap && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {Math.round(workout.timeCap / 60)}min
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {workout.workoutDescription}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>Scoring:</strong> {workout.scoring}
                      </div>
                    </div>
                  ))}
                  {filteredBenchmarks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No benchmark workouts found.</p>
                      <p className="text-sm">Try a different search term.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modification Section */}
          {selectedBenchmark && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-accent" />
                  Modify Selected Workout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-lg mb-2">Selected: {selectedBenchmark.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedBenchmark.workoutDescription}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedBenchmark.workoutType.replace('_', ' ').toUpperCase()}</Badge>
                    <Badge variant="outline">{selectedBenchmark.scoring}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Custom Name (Optional)</Label>
                    <Input
                      placeholder={`${selectedBenchmark.name} (Modified)`}
                      value={modifications.name || ""}
                      onChange={(e) => setModifications({...modifications, name: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep original name</p>
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
                    <Label>Scoring (Optional)</Label>
                    <Input
                      placeholder={selectedBenchmark.scoring}
                      value={modifications.scoring || ""}
                      onChange={(e) => setModifications({...modifications, scoring: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep original scoring</p>
                  </div>
                  <div>
                    <Label>Time Cap (minutes, Optional)</Label>
                    <Input
                      type="number"
                      placeholder={selectedBenchmark.timeCap ? `${Math.round(selectedBenchmark.timeCap / 60)}` : "No cap"}
                      value={modifications.timeCap ? Math.round(modifications.timeCap / 60) : ""}
                      onChange={(e) => setModifications({...modifications, timeCap: e.target.value ? parseInt(e.target.value) * 60 : null})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to keep original time cap</p>
                  </div>
                </div>
                
                <div>
                  <Label>Custom Description (Optional)</Label>
                  <Textarea
                    placeholder="Modify the workout description or leave empty to keep original..."
                    value={modifications.workoutDescription || ""}
                    onChange={(e) => setModifications({...modifications, workoutDescription: e.target.value})}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep original description</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Check className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Preview Changes</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p><strong>Name:</strong> {modifications.name || selectedBenchmark.name}</p>
                    <p><strong>Type:</strong> {(modifications.workoutType || selectedBenchmark.workoutType).replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Scoring:</strong> {modifications.scoring || selectedBenchmark.scoring}</p>
                    <p><strong>Time Cap:</strong> {
                      modifications.timeCap !== undefined 
                        ? (modifications.timeCap ? `${Math.round(modifications.timeCap / 60)} minutes` : "No cap")
                        : (selectedBenchmark.timeCap ? `${Math.round(selectedBenchmark.timeCap / 60)} minutes` : "No cap")
                    }</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={cloneMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClone}
              disabled={!selectedBenchmark || cloneMutation.isPending}
            >
              {cloneMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Workout
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
