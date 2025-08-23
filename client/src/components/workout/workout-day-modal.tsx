import React from 'react';
import { format, isToday, isPast } from 'date-fns';
import { X, Clock, Target, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutLog } from '@/components/workout/workout-log';

export interface WorkoutDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  workouts: {
    assigned: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      timeCap?: number;
      assignedDate: string;
      workout: any;
      workoutSource?: string;
    }>;
    completed: Array<{
      id: string;
      name: string;
      type: string;
      description?: string;
      finalScore?: string;
      humanReadableScore?: string;
      notes?: string;
      scaleType?: string;
      date: string;
      workout: any;
    }>;
  };
  onWorkoutLogged?: () => void;
}

export function WorkoutDayModal({
  isOpen,
  onClose,
  date,
  workouts,
  onWorkoutLogged
}: WorkoutDayModalProps) {
  if (!isOpen) return null;

  const isPastDate = isPast(date) && !isToday(date);
  const isTodayDate = isToday(date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {isTodayDate && (
                <Badge variant="default" className="bg-blue-500">
                  Today
                </Badge>
              )}
              {isPastDate && (
                <Badge variant="outline" className="text-gray-500">
                  Past Date
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                {workouts.completed.length + workouts.assigned.length} workout(s)
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Completed Workouts Section */}
          {workouts.completed.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Completed Workouts ({workouts.completed.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workouts.completed.map((workout, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">
                          {workout.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {workout.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {workout.scaleType && (
                            <Badge
                              variant={workout.scaleType === 'rx' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {workout.scaleType.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {workout.humanReadableScore || workout.finalScore}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(workout.date), 'h:mm a')}
                        </div>
                      </div>
                    </div>

                    {workout.description && (
                      <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded">
                        {workout.description}
                      </div>
                    )}

                    {workout.notes && (
                      <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="font-medium text-blue-800 mb-1">Notes:</div>
                        {workout.notes}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Assigned Workouts Section */}
          {workouts.assigned.length > 0 && (
            <Card className={`border-blue-200 ${isPastDate ? 'bg-red-50/50' : 'bg-blue-50/50'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center ${isPastDate ? 'text-red-800' : 'text-blue-800'}`}>
                  {isPastDate ? (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <Target className="h-5 w-5 mr-2" />
                  )}
                  {isPastDate ? 'Missed Workouts' : 'Assigned Workouts'} ({workouts.assigned.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workouts.assigned.map((assignment, idx) => {
                  const isCompleted = workouts.completed.some(
                    (completed) => completed.workout.id === assignment.workout.id
                  );
                  
                  if (isCompleted) return null; // Don't show if already completed

                  return (
                    <div
                      key={idx}
                      className={`bg-white border rounded-lg p-4 ${
                        isPastDate ? 'border-red-200' : 'border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 mb-2">
                            {assignment.name}
                          </h4>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {assignment.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {assignment.timeCap && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.round(assignment.timeCap / 60)} min cap
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!isPastDate && (
                          <div className="ml-4">
                            <WorkoutLog
                              workout={assignment.workout}
                              workoutSource={assignment.workoutSource || 'custom_user'}
                              onLogCreated={onWorkoutLogged || (() => {})}
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded leading-relaxed">
                        {assignment.description}
                      </div>

                      {isPastDate && (
                        <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          This workout was assigned but not completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {workouts.completed.length === 0 && workouts.assigned.length === 0 && (
            <Card className="border-gray-200">
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No workouts for this date
                </h3>
                <p className="text-gray-500 mb-6">
                  {isPastDate 
                    ? "No workouts were assigned or completed on this date."
                    : "No workouts are currently assigned for this date."
                  }
                </p>
                {!isPastDate && (
                  <Button variant="outline" onClick={onClose}>
                    Assign Workout
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
