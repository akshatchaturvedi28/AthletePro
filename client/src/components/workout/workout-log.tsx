import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { WorkoutLogForm } from "./workout-log-form";
import { Timer } from "lucide-react";

interface Workout {
  id: number;
  name: string;
  description?: string;
  type: string;
  timeCap?: number;
  barbellLifts?: string[];
  totalEffort?: number;
}

interface WorkoutLogProps {
  workout: Workout;
  workoutSource: string; // 'girl_wod', 'hero_wod', 'notable', 'custom_user', 'custom_community'
  onLogCreated: (log: any) => void;
}

interface BarbellLift {
  id: number;
  liftName: string;
}

export function WorkoutLog({ workout, workoutSource, onLogCreated }: WorkoutLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch barbell lifts for this workout
  const { data: barbellLifts = [], isLoading: isLoadingLifts } = useQuery({
    queryKey: [`/api/workouts/${workout.id}/barbell-lifts`, workoutSource],
    queryFn: async () => {
      console.log('Fetching barbell lifts with source:', workoutSource);
      const response = await apiRequest("GET", `/api/workouts/${workout.id}/barbell-lifts?source=${workoutSource || 'girl_wod'}`);
      return response.json();
    },
    enabled: isOpen && !!workoutSource, // Only fetch when dialog is open and source is available
  });

  const createLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      const payload = {
        userId: "current-user", // This should come from auth context
        workoutId: workout.id,
        workoutSource: workoutSource || 'custom_user', // Ensure workoutSource is always present
        workoutName: workout.name,
        workoutType: workout.type,
        timeCap: workout.timeCap || null,
        ...logData, // Spread logData after the required fields to avoid overriding
      };
      
      console.log('Sending workout log payload:', payload);
      
      const response = await apiRequest("POST", "/api/workouts/log-workout", payload);
      return response.json();
    },
    onSuccess: (data) => {
      onLogCreated(data);
      setIsOpen(false);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      toast({
        title: "Workout Logged Successfully! 🎉",
        description: `Final Score: ${data.finalScore}. Your barbell lifts progress has been updated.`,
      });
    },
    onError: (error: any) => {
      console.error("Error logging workout:", error);
      toast({
        title: "Logging Failed",
        description: error?.details || "Failed to log workout. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (logData: any) => {
    await createLogMutation.mutateAsync(logData);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Timer className="h-4 w-4 mr-2" />
          Log Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full lg:max-w-7xl max-h-[95vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Log Workout Results</DialogTitle>
        </VisuallyHidden>
        {isOpen && (
          <>
            {isLoadingLifts ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading workout details...</span>
              </div>
            ) : (
              <WorkoutLogForm
                workoutName={workout.name}
                workoutType={workout.type}
                workoutDescription={workout.description}
                timeCap={workout.timeCap}
                workoutId={workout.id}
                workoutSource={workoutSource}
                barbellLifts={barbellLifts}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={createLogMutation.isPending}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
