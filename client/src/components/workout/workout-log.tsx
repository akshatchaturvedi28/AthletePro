import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Clock, 
  Target, 
  Dumbbell, 
  Calendar as CalendarIcon,
  Save,
  Plus,
  Minus,
  Timer
} from "lucide-react";

interface Workout {
  id: number;
  name: string;
  description: string;
  type: string;
  timeCap?: number;
  barbellLifts?: string[];
  totalEffort?: number;
}

interface WorkoutLogProps {
  workout: Workout;
  onLogCreated: (log: any) => void;
}

export function WorkoutLog({ workout, onLogCreated }: WorkoutLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [timeTaken, setTimeTaken] = useState("");
  const [totalEffort, setTotalEffort] = useState("");
  const [scaleType, setScaleType] = useState<"rx" | "scaled">("rx");
  const [scaleDescription, setScaleDescription] = useState("");
  const [humanReadableScore, setHumanReadableScore] = useState("");
  const [notes, setNotes] = useState("");
  const [barbellLiftDetails, setBarbellLiftDetails] = useState<Record<string, Record<string, number>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      const response = await apiRequest("POST", "/api/workout-logs", logData);
      return response.json();
    },
    onSuccess: (data) => {
      onLogCreated(data);
      setIsOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs/my"] });
      toast({
        title: "Workout Logged",
        description: "Your workout performance has been logged successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logging Failed",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setDate(new Date());
    setTimeTaken("");
    setTotalEffort("");
    setScaleType("rx");
    setScaleDescription("");
    setHumanReadableScore("");
    setNotes("");
    setBarbellLiftDetails({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const logData = {
      workoutId: workout.id,
      date: format(date, "yyyy-MM-dd"),
      timeTaken: timeTaken ? parseInt(timeTaken) * 60 : null, // convert minutes to seconds
      totalEffort: totalEffort ? parseInt(totalEffort) : null,
      scaleType,
      scaleDescription: scaleType === "scaled" ? scaleDescription : null,
      humanReadableScore,
      notes,
      barbellLiftDetails: Object.keys(barbellLiftDetails).length > 0 ? barbellLiftDetails : null
    };

    createLogMutation.mutate(logData);
  };

  const addLiftWeight = (liftName: string, weight: string, reps: string) => {
    if (!weight || !reps) return;
    
    setBarbellLiftDetails(prev => ({
      ...prev,
      [liftName]: {
        ...prev[liftName],
        [weight]: parseInt(reps)
      }
    }));
  };

  const removeLiftWeight = (liftName: string, weight: string) => {
    setBarbellLiftDetails(prev => {
      const newDetails = { ...prev };
      if (newDetails[liftName]) {
        delete newDetails[liftName][weight];
        if (Object.keys(newDetails[liftName]).length === 0) {
          delete newDetails[liftName];
        }
      }
      return newDetails;
    });
  };

  const formatTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Timer className="h-4 w-4 mr-2" />
          Log Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Log Results for {workout.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{workout.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{workout.type.replace("_", " ").toUpperCase()}</Badge>
                  {workout.timeCap && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(workout.timeCap / 60)}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-sm whitespace-pre-wrap">{workout.description}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Date and Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Scale Type</Label>
              <Select value={scaleType} onValueChange={(value: "rx" | "scaled") => setScaleType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rx">RX (As Prescribed)</SelectItem>
                  <SelectItem value="scaled">Scaled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {workout.type === "for_time" || workout.type === "chipper" ? (
              <div>
                <Label>Time Taken (minutes)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={timeTaken}
                  onChange={(e) => setTimeTaken(e.target.value)}
                  placeholder="e.g., 5.5"
                />
              </div>
            ) : (
              <div>
                <Label>Total Effort/Volume</Label>
                <Input
                  type="number"
                  value={totalEffort}
                  onChange={(e) => setTotalEffort(e.target.value)}
                  placeholder="e.g., 150 (for AMRAP rounds+reps)"
                />
              </div>
            )}

            <div>
              <Label>Human Readable Score</Label>
              <Input
                value={humanReadableScore}
                onChange={(e) => setHumanReadableScore(e.target.value)}
                placeholder="e.g., 5 rounds + 12 reps"
              />
            </div>
          </div>

          {scaleType === "scaled" && (
            <div>
              <Label>Scale Description</Label>
              <Textarea
                value={scaleDescription}
                onChange={(e) => setScaleDescription(e.target.value)}
                placeholder="Describe how you scaled the workout..."
                rows={3}
              />
            </div>
          )}

          {/* Barbell Lifts */}
          {workout.barbellLifts && workout.barbellLifts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  Barbell Lifts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workout.barbellLifts.map((lift) => (
                  <div key={lift} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 capitalize">{lift}</h4>
                    <div className="space-y-2">
                      {Object.entries(barbellLiftDetails[lift] || {}).map(([weight, reps]) => (
                        <div key={weight} className="flex items-center gap-2">
                          <span className="text-sm">{weight}lbs × {reps} reps</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLiftWeight(lift, weight)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Weight (lbs)"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const weight = (e.target as HTMLInputElement).value;
                              const repsInput = (e.target as HTMLInputElement).parentElement?.querySelector('input[placeholder="Max reps"]') as HTMLInputElement;
                              if (repsInput) {
                                addLiftWeight(lift, weight, repsInput.value);
                                (e.target as HTMLInputElement).value = '';
                                repsInput.value = '';
                              }
                            }
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Max reps"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const reps = (e.target as HTMLInputElement).value;
                              const weightInput = (e.target as HTMLInputElement).parentElement?.querySelector('input[placeholder="Weight (lbs)"]') as HTMLInputElement;
                              if (weightInput) {
                                addLiftWeight(lift, weightInput.value, reps);
                                (e.target as HTMLInputElement).value = '';
                                weightInput.value = '';
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            const inputs = (e.target as HTMLElement).parentElement?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
                            if (inputs?.length === 2) {
                              addLiftWeight(lift, inputs[0].value, inputs[1].value);
                              inputs[0].value = '';
                              inputs[1].value = '';
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your performance..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLogMutation.isPending}>
              {createLogMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Log Workout
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
