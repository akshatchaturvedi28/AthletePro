import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save } from 'lucide-react';

interface BarbellLift {
  id: number;
  liftName: string;
}

interface WorkoutLogFormProps {
  workoutName: string;
  workoutType: string;
  workoutDescription?: string;
  timeCap?: number; // in seconds
  workoutId: number;
  workoutSource: string;
  barbellLifts: BarbellLift[];
  onSubmit: (logData: WorkoutLogData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface WorkoutLogData {
  date: string;
  workoutName: string;
  workoutType: string;
  timeCap: number | null;
  timeTaken: number | null;
  totalEffort: number;
  humanReadableScore: string;
  barbellLiftDetails: Record<string, Record<string, number>>;
  scaleType: string;
  scaleDescription?: string;
  notes?: string;
}

interface WeightRepsEntry {
  weight: string;
  maxReps: string;
}

export function WorkoutLogForm({
  workoutName,
  workoutType,
  workoutDescription,
  timeCap,
  workoutId,
  workoutSource,
  barbellLifts,
  onSubmit,
  onCancel,
  isSubmitting = false
}: WorkoutLogFormProps) {
  const [formData, setFormData] = useState<WorkoutLogData>({
    date: new Date().toISOString().split('T')[0],
    workoutName,
    workoutType,
    timeCap: timeCap || null,
    timeTaken: workoutType === 'amrap' ? (timeCap || null) : null,
    totalEffort: 0,
    humanReadableScore: '',
    barbellLiftDetails: {},
    scaleType: 'rx',
    scaleDescription: '',
    notes: ''
  });

  const [barbellLiftInputs, setBarbellLiftInputs] = useState<Record<string, WeightRepsEntry[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize barbell lift inputs
  useEffect(() => {
    const initialInputs: Record<string, WeightRepsEntry[]> = {};
    barbellLifts.forEach(lift => {
      initialInputs[lift.liftName] = [{ weight: '', maxReps: '' }];
    });
    setBarbellLiftInputs(initialInputs);
  }, [barbellLifts]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return parseInt(timeStr) || 0;
  };

  const addWeightRepsEntry = (liftName: string) => {
    setBarbellLiftInputs(prev => ({
      ...prev,
      [liftName]: [...prev[liftName], { weight: '', maxReps: '' }]
    }));
  };

  const removeWeightRepsEntry = (liftName: string, index: number) => {
    setBarbellLiftInputs(prev => ({
      ...prev,
      [liftName]: prev[liftName].filter((_, i) => i !== index)
    }));
  };

  const updateWeightRepsEntry = (
    liftName: string, 
    index: number, 
    field: 'weight' | 'maxReps', 
    value: string
  ) => {
    setBarbellLiftInputs(prev => ({
      ...prev,
      [liftName]: prev[liftName].map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Score is now optional - no validation needed

    if (formData.totalEffort <= 0) {
      newErrors.totalEffort = 'Total effort must be greater than 0';
    }

    // Time taken is now optional for all workout types

    // Validate barbell lift details
    Object.entries(barbellLiftInputs).forEach(([liftName, entries]) => {
      entries.forEach((entry, index) => {
        if (entry.weight && !entry.maxReps) {
          newErrors[`${liftName}_${index}_reps`] = 'Max reps required when weight is specified';
        }
        if (entry.maxReps && !entry.weight) {
          newErrors[`${liftName}_${index}_weight`] = 'Weight required when reps are specified';
        }
        if (entry.weight && isNaN(parseFloat(entry.weight))) {
          newErrors[`${liftName}_${index}_weight`] = 'Weight must be a valid number';
        }
        if (entry.maxReps && (isNaN(parseInt(entry.maxReps)) || parseInt(entry.maxReps) <= 0)) {
          newErrors[`${liftName}_${index}_reps`] = 'Max reps must be a positive number';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Process barbell lift details
    const barbellLiftDetails: Record<string, Record<string, number>> = {};
    
    Object.entries(barbellLiftInputs).forEach(([liftName, entries]) => {
      const validEntries = entries.filter(entry => entry.weight && entry.maxReps);
      if (validEntries.length > 0) {
        barbellLiftDetails[liftName] = {};
        validEntries.forEach(entry => {
          barbellLiftDetails[liftName][entry.weight] = parseInt(entry.maxReps);
        });
      }
    });

    const logData: WorkoutLogData = {
      ...formData,
      barbellLiftDetails
    };

    await onSubmit(logData);
  };

  return (
    <div className="w-full max-w-none mx-auto p-4 md:p-6 lg:p-8">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 border-b border-gray-100 p-6 md:p-8">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-3 rounded-xl mr-4 shadow-lg">
              <Save className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Log Workout Results
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Workout Description */}
            {workoutDescription && (
              <div className="mb-4">
                <Label className="text-sm font-medium text-gray-700">Workout Description</Label>
                <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{workoutDescription}</p>
                </div>
              </div>
            )}

            {/* Pre-populated, non-editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="workoutName">Workout Name</Label>
                <Input
                  id="workoutName"
                  value={formData.workoutName}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="workoutType">Workout Type</Label>
                <Input
                  id="workoutType"
                  value={formData.workoutType.toUpperCase()}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="timeCap">Time Cap</Label>
                <Input
                  id="timeCap"
                  value={timeCap ? formatTime(timeCap) : 'No time cap'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            <Separator />

            {/* User input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workoutType !== 'amrap' && (
                <div>
                  <Label htmlFor="timeTaken">Total Time Taken (Optional)</Label>
                  <Input
                    id="timeTaken"
                    placeholder="e.g., 12:30 (optional)"
                    value={formData.timeTaken ? formatTime(formData.timeTaken) : ''}
                    onChange={(e) => {
                      const seconds = parseTimeToSeconds(e.target.value);
                      setFormData(prev => ({ ...prev, timeTaken: seconds }));
                    }}
                    className={errors.timeTaken ? 'border-red-500' : ''}
                  />
                  {errors.timeTaken && (
                    <p className="text-sm text-red-500 mt-1">{errors.timeTaken}</p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="totalEffort">Total Effort Exerted *</Label>
                <Input
                  id="totalEffort"
                  type="number"
                  placeholder="e.g., 150 (required)"
                  value={formData.totalEffort}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    totalEffort: parseInt(e.target.value) || 0 
                  }))}
                  className={errors.totalEffort ? 'border-red-500' : ''}
                />
                {errors.totalEffort && (
                  <p className="text-sm text-red-500 mt-1">{errors.totalEffort}</p>
                )}
              </div>

              <div>
                <Label htmlFor="scaleType">Scale Type</Label>
                <Select 
                  value={formData.scaleType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, scaleType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rx">RX (As Prescribed)</SelectItem>
                    <SelectItem value="scaled">Scaled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.scaleType === 'scaled' && (
                <div>
                  <Label htmlFor="scaleDescription">Scale Description</Label>
                  <Input
                    id="scaleDescription"
                    placeholder="Describe how you scaled the workout"
                    value={formData.scaleDescription}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      scaleDescription: e.target.value 
                    }))}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="humanReadableScore">
                Score (Human Readable) - Optional
              </Label>
              <Textarea
                id="humanReadableScore"
                placeholder="e.g., 5 rounds + 12 reps + 400m + 20 Cals (optional)"
                value={formData.humanReadableScore}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  humanReadableScore: e.target.value 
                }))}
                className={errors.humanReadableScore ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.humanReadableScore && (
                <p className="text-sm text-red-500 mt-1">{errors.humanReadableScore}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Describe your performance in a human-readable format (optional)
              </p>
            </div>

            {/* Barbell Lift Details */}
            <div>
              <Label className="text-lg font-semibold">Barbell Lift Details</Label>
              {barbellLifts.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-600">
                    No barbell lifts found for this workout. 
                    {workoutSource && ` (Source: ${workoutSource}, Workout ID: ${workoutId})`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    If this workout should have barbell lifts, they may need to be added to the database.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Record the maximum unbroken reps you achieved for each weight
                  </p>
                
                  <div className="space-y-6">
                    {barbellLifts.map((lift) => (
                      <Card key={lift.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{lift.liftName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {barbellLiftInputs[lift.liftName]?.map((entry, index) => (
                              <div key={index} className="flex gap-3 items-end">
                                <div className="flex-1">
                                  <Label htmlFor={`weight_${lift.liftName}_${index}`}>
                                    Weight (lbs)
                                  </Label>
                                  <Input
                                    id={`weight_${lift.liftName}_${index}`}
                                    type="number"
                                    placeholder="e.g., 135"
                                    value={entry.weight}
                                    onChange={(e) => updateWeightRepsEntry(
                                      lift.liftName, index, 'weight', e.target.value
                                    )}
                                    className={errors[`${lift.liftName}_${index}_weight`] ? 'border-red-500' : ''}
                                  />
                                  {errors[`${lift.liftName}_${index}_weight`] && (
                                    <p className="text-sm text-red-500 mt-1">
                                      {errors[`${lift.liftName}_${index}_weight`]}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <Label htmlFor={`reps_${lift.liftName}_${index}`}>
                                    Max Unbroken Reps
                                  </Label>
                                  <Input
                                    id={`reps_${lift.liftName}_${index}`}
                                    type="number"
                                    placeholder="e.g., 10"
                                    value={entry.maxReps}
                                    onChange={(e) => updateWeightRepsEntry(
                                      lift.liftName, index, 'maxReps', e.target.value
                                    )}
                                    className={errors[`${lift.liftName}_${index}_reps`] ? 'border-red-500' : ''}
                                  />
                                  {errors[`${lift.liftName}_${index}_reps`] && (
                                    <p className="text-sm text-red-500 mt-1">
                                      {errors[`${lift.liftName}_${index}_reps`]}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addWeightRepsEntry(lift.liftName)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  
                                  {barbellLiftInputs[lift.liftName].length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeWeightRepsEntry(lift.liftName, index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about your workout..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                rows={3}
              />
            </div>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please fix the validation errors above before submitting.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Workout Log'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
