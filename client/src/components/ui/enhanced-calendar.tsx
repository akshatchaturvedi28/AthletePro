import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  isPast, 
  isFuture 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type CalendarView = 'month' | 'week' | 'day';

export interface WorkoutData {
  id: string;
  name: string;
  type: string;
  description: string;
  assignedDate?: string;
  completedDate?: string;
}

export interface WorkoutStatus {
  assigned: WorkoutData[];
  completed: WorkoutData[];
  status: 'completed' | 'assigned-future' | 'assigned-missed' | 'available';
}

export interface EnhancedCalendarProps {
  view: CalendarView;
  currentDate: Date;
  selectedDate: Date;
  workoutsByDate: Record<string, WorkoutStatus>;
  onDateSelect: (date: Date) => void;
  onNavigate: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  locationFilter?: string;
  searchQuery?: string;
}

export function EnhancedCalendar({
  view,
  currentDate,
  selectedDate,
  workoutsByDate,
  onDateSelect,
  onNavigate,
  onViewChange,
  locationFilter,
  searchQuery
}: EnhancedCalendarProps) {
  
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onNavigate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onNavigate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'assigned-future':
        return 'bg-blue-500';
      case 'assigned-missed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'assigned-future':
        return 'secondary' as const;
      case 'assigned-missed':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={navigatePrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={navigateNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900">
          {view === 'month' && format(currentDate, 'MMMM yyyy')}
          {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
          {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('month')}
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewChange('day')}
        >
          Day
        </Button>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {dayHeaders.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayWorkouts = workoutsByDate[dateKey];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={dateKey}
                className={`
                  min-h-[100px] p-2 border-r border-b cursor-pointer transition-all duration-200
                  ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                  ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                  ${isTodayDate ? 'ring-2 ring-blue-200' : ''}
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex flex-col h-full">
                  <div className={`
                    text-sm font-medium mb-2
                    ${isTodayDate ? 'text-blue-600' : ''}
                    ${isSelected ? 'text-blue-600' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {dayWorkouts && (
                    <div className="flex-1 space-y-1">
                      {/* Completed workouts */}
                      {dayWorkouts.completed.map((workout, idx) => (
                        <div key={`completed-${idx}`} className="text-xs">
                          <Badge variant="default" className="bg-green-500 text-white text-[10px] px-1 py-0">
                            ✓ {workout.name.length > 12 ? workout.name.substring(0, 12) + '...' : workout.name}
                          </Badge>
                        </div>
                      ))}
                      
                      {/* Assigned workouts */}
                      {dayWorkouts.assigned.map((workout, idx) => {
                        const isPastAssignment = isPast(day) && !dayWorkouts.completed.some(c => c.id === workout.id);
                        return (
                          <div key={`assigned-${idx}`} className="text-xs">
                            <Badge 
                              variant={isPastAssignment ? "destructive" : "secondary"} 
                              className={`text-[10px] px-1 py-0 ${
                                isPastAssignment ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                              }`}
                            >
                              {workout.name.length > 12 ? workout.name.substring(0, 12) + '...' : workout.name}
                            </Badge>
                          </div>
                        );
                      })}
                      
                      {/* Status indicator dot */}
                      {dayWorkouts.status !== 'available' && (
                        <div className="flex justify-end">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(dayWorkouts.status)}`} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ 
      start: weekStart, 
      end: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000) 
    });

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="grid grid-cols-7">
          {weekDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayWorkouts = workoutsByDate[dateKey];
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={dateKey}
                className={`
                  min-h-[200px] p-3 border-r last:border-r-0 cursor-pointer transition-all duration-200
                  ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                  ${isTodayDate ? 'ring-2 ring-blue-200' : ''}
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`
                    text-lg font-semibold
                    ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}
                  `}>
                    {format(day, 'd')}
                  </div>
                </div>

                {dayWorkouts && (
                  <div className="space-y-2">
                    {/* Completed workouts */}
                    {dayWorkouts.completed.map((workout, idx) => (
                      <div key={`completed-${idx}`} className="text-xs">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">
                          <div className="font-medium">✓ {workout.name}</div>
                          <div className="text-green-600">{workout.type.replace('_', ' ')}</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Assigned workouts */}
                    {dayWorkouts.assigned.map((workout, idx) => {
                      const isPastAssignment = isPast(day) && !dayWorkouts.completed.some(c => c.id === workout.id);
                      return (
                        <div key={`assigned-${idx}`} className="text-xs">
                          <div className={`px-2 py-1 rounded border ${
                            isPastAssignment 
                              ? 'bg-red-100 text-red-800 border-red-200' 
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            <div className="font-medium">{workout.name}</div>
                            <div className={isPastAssignment ? 'text-red-600' : 'text-blue-600'}>
                              {workout.type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const dayWorkouts = workoutsByDate[dateKey];
    const isTodayDate = isToday(currentDate);
    const isPastDate = isPast(currentDate) && !isTodayDate;

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6">
          {/* Day Header */}
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
              {format(currentDate, 'EEEE')}
            </div>
            <div className={`text-4xl font-bold mb-2 ${isTodayDate ? 'text-blue-600' : 'text-gray-900'}`}>
              {format(currentDate, 'd')}
            </div>
            <div className="text-lg text-gray-600">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            {isTodayDate && (
              <Badge className="mt-2 bg-blue-500">Today</Badge>
            )}
            {isPastDate && (
              <Badge variant="outline" className="mt-2 text-gray-500">Past Date</Badge>
            )}
          </div>

          {/* Workouts for the day */}
          {dayWorkouts ? (
            <div className="space-y-6">
              {/* Completed Workouts */}
              {dayWorkouts.completed.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-700 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Completed Workouts ({dayWorkouts.completed.length})
                  </h3>
                  {dayWorkouts.completed.map((workout, idx) => (
                    <div key={`completed-${idx}`} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-green-800">{workout.name}</h4>
                          <Badge variant="default" className="mt-1 bg-green-600">
                            {workout.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-green-600 font-medium">✓ Completed</div>
                      </div>
                      {workout.description && (
                        <div className="text-sm text-green-700 bg-green-100 p-3 rounded border">
                          {workout.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Assigned Workouts */}
              {dayWorkouts.assigned.length > 0 && (
                <div className="space-y-4">
                  <h3 className={`text-xl font-semibold flex items-center ${
                    isPastDate ? 'text-red-700' : 'text-blue-700'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      isPastDate ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    {isPastDate ? 'Missed Workouts' : 'Assigned Workouts'} ({dayWorkouts.assigned.length})
                  </h3>
                  {dayWorkouts.assigned.map((workout, idx) => {
                    const isCompleted = dayWorkouts.completed.some(c => c.id === workout.id);
                    if (isCompleted) return null; // Don't show if already completed

                    return (
                      <div key={`assigned-${idx}`} className={`border rounded-lg p-4 ${
                        isPastDate 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className={`text-lg font-semibold ${
                              isPastDate ? 'text-red-800' : 'text-blue-800'
                            }`}>
                              {workout.name}
                            </h4>
                            <Badge variant={isPastDate ? "destructive" : "secondary"} className="mt-1">
                              {workout.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className={`font-medium ${
                            isPastDate ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {isPastDate ? '❌ Missed' : '📅 Assigned'}
                          </div>
                        </div>
                        {workout.description && (
                          <div className={`text-sm p-3 rounded border ${
                            isPastDate 
                              ? 'text-red-700 bg-red-100 border-red-200' 
                              : 'text-blue-700 bg-blue-100 border-blue-200'
                          }`}>
                            {workout.description}
                          </div>
                        )}
                        {isPastDate && (
                          <div className="mt-3 text-sm text-red-600 bg-red-100 p-2 rounded border border-red-200">
                            This workout was assigned but not completed on time.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">📅</div>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No workouts for this day
              </h3>
              <p className="text-gray-500">
                {isPastDate 
                  ? "No workouts were assigned or completed on this date."
                  : isTodayDate
                  ? "No workouts scheduled for today. Time to plan your training!"
                  : "No workouts currently assigned for this date."
                }
              </p>
              {!isPastDate && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => onDateSelect(currentDate)}
                >
                  {isTodayDate ? 'Plan Today\'s Workout' : 'Schedule Workout'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderCalendarHeader()}
      
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
}
