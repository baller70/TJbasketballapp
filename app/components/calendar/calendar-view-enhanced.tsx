'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Play, 
  CheckCircle, 
  X, 
  Edit,
  ChevronLeft,
  ChevronRight,
  Target,
  Trophy,
  AlertCircle,
  GripVertical,
  Dumbbell,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ScheduleEntry, Drill, Workout } from '@/lib/types';

interface CalendarViewEnhancedProps {
  showDragSidebar?: boolean;
}

export default function CalendarViewEnhanced({ showDragSidebar = true }: CalendarViewEnhancedProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'drills' | 'workouts'>('all');
  const [newEntry, setNewEntry] = useState({
    drillId: '',
    workoutId: '',
    date: '',
    startTime: '',
    notes: '',
  });

  useEffect(() => {
    fetchScheduleEntries();
    fetchDrills();
    fetchWorkouts();
  }, [currentDate]);

  const fetchScheduleEntries = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await fetch(
        `/api/schedule?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setScheduleEntries(data);
      }
    } catch (error) {
      console.error('Error fetching schedule entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrills = async () => {
    try {
      const response = await fetch('/api/drills');
      if (response.ok) {
        const data = await response.json();
        setDrills(data);
      }
    } catch (error) {
      console.error('Error fetching drills:', error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Check if dropped on a calendar date
    if (destination.droppableId.startsWith('calendar-')) {
      const dateStr = destination.droppableId.replace('calendar-', '');
      const targetDate = new Date(dateStr);
      
      // Determine if it's a drill or workout
      const isDrill = draggableId.startsWith('drill-');
      const isWorkout = draggableId.startsWith('workout-');
      
      if (isDrill) {
        const drillId = draggableId.replace('drill-', '');
        await addScheduleEntry(drillId, null, targetDate);
      } else if (isWorkout) {
        const workoutId = draggableId.replace('workout-', '');
        await addScheduleEntry(null, workoutId, targetDate);
      }
    }
  };

  const addScheduleEntry = async (drillId?: string | null, workoutId?: string | null, date?: Date) => {
    try {
      const scheduleDate = date || new Date(newEntry.date);
      const startTime = date ? '09:00' : newEntry.startTime;
      
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drillId: drillId || newEntry.drillId || null,
          workoutId: workoutId || newEntry.workoutId || null,
          date: scheduleDate.toISOString(),
          startTime: `${scheduleDate.toISOString().split('T')[0]}T${startTime}:00`,
          notes: newEntry.notes,
        }),
      });

      if (response.ok) {
        setShowAddDialog(false);
        setNewEntry({ drillId: '', workoutId: '', date: '', startTime: '', notes: '' });
        fetchScheduleEntries();
      }
    } catch (error) {
      console.error('Error adding schedule entry:', error);
    }
  };

  const updateScheduleEntry = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchScheduleEntries();
      }
    } catch (error) {
      console.error('Error updating schedule entry:', error);
    }
  };

  const deleteScheduleEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchScheduleEntries();
      }
    } catch (error) {
      console.error('Error deleting schedule entry:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));
    }
    
    return days;
  };

  const getEntriesForDate = (date: Date) => {
    return scheduleEntries.filter(entry => 
      new Date(entry.date).toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      MISSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      SCHEDULED: <Clock className="h-3 w-3" />,
      IN_PROGRESS: <Play className="h-3 w-3" />,
      COMPLETED: <CheckCircle className="h-3 w-3" />,
      CANCELLED: <X className="h-3 w-3" />,
      MISSED: <AlertCircle className="h-3 w-3" />,
    };
    return icons[status as keyof typeof icons] || <Clock className="h-3 w-3" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      shooting: 'bg-orange-100 text-orange-800',
      dribbling: 'bg-blue-100 text-blue-800',
      passing: 'bg-green-100 text-green-800',
      defense: 'bg-red-100 text-red-800',
      footwork: 'bg-purple-100 text-purple-800',
      conditioning: 'bg-yellow-100 text-yellow-800',
      fundamentals: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const filteredItems = () => {
    let items: any[] = [];
    
    if (sidebarFilter === 'all' || sidebarFilter === 'drills') {
      items = [...items, ...drills.map(drill => ({ ...drill, type: 'drill' }))];
    }
    
    if (sidebarFilter === 'all' || sidebarFilter === 'workouts') {
      items = [...items, ...workouts.map(workout => ({ ...workout, type: 'workout' }))];
    }
    
    return items;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-screen">
        {/* Sidebar with draggable items */}
        {showDragSidebar && (
          <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Drills & Workouts</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag items to calendar dates to schedule them
                </p>
                
                <Tabs value={sidebarFilter} onValueChange={(value) => setSidebarFilter(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="drills">Drills</TabsTrigger>
                    <TabsTrigger value="workouts">Workouts</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Droppable droppableId="sidebar">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                  >
                    {filteredItems().map((item, index) => (
                      <Draggable 
                        key={`${item.type}-${item.id}`} 
                        draggableId={`${item.type}-${item.id}`} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 ${
                              snapshot.isDragging ? 'shadow-lg bg-white' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.type === 'drill' ? (
                                    <BookOpen className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Dumbbell className="h-4 w-4 text-blue-600" />
                                  )}
                                  <span className="font-medium text-sm">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.type === 'drill' ? (
                                    <Badge className={getCategoryColor(item.category)} variant="secondary">
                                      {item.category}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      {item.workoutDrills?.length || 0} drills
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {item.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        )}

        {/* Main calendar area */}
        <div className="flex-1 p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Practice Calendar</h2>
              <p className="text-gray-600">
                {showDragSidebar ? 'Drag drills and workouts to dates to schedule them' : 'Schedule and track your basketball practice sessions'}
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Practice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule New Practice</DialogTitle>
                  <DialogDescription>
                    Add a new drill or workout to your practice schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Tabs defaultValue="drill">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="drill">Drill</TabsTrigger>
                      <TabsTrigger value="workout">Workout</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="drill" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="drill">Select Drill</Label>
                        <Select value={newEntry.drillId} onValueChange={(value) => setNewEntry({ ...newEntry, drillId: value, workoutId: '' })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a drill" />
                          </SelectTrigger>
                          <SelectContent>
                            {drills.map(drill => (
                              <SelectItem key={drill.id} value={drill.id}>
                                {drill.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="workout" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="workout">Select Workout</Label>
                        <Select value={newEntry.workoutId} onValueChange={(value) => setNewEntry({ ...newEntry, workoutId: value, drillId: '' })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a workout" />
                          </SelectTrigger>
                          <SelectContent>
                            {workouts.map(workout => (
                              <SelectItem key={workout.id} value={workout.id}>
                                {workout.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEntry.startTime}
                        onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this practice session..."
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4">
                    <Button 
                      onClick={() => addScheduleEntry()}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      disabled={(!newEntry.drillId && !newEntry.workoutId) || !newEntry.date || !newEntry.startTime}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Practice
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar */}
          <Card className="border-orange-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  {monthName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const entries = getEntriesForDate(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <Droppable key={index} droppableId={`calendar-${day.toISOString()}`}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.01 }}
                          className={`min-h-24 p-2 border border-gray-200 ${
                            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${isToday ? 'border-orange-600 bg-orange-50' : ''} ${
                            isPast ? 'opacity-60' : ''
                          } ${snapshot.isDraggingOver ? 'bg-orange-100 border-orange-400' : ''
                          } hover:bg-gray-50 cursor-pointer transition-colors`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`text-sm font-medium ${
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${isToday ? 'text-orange-600' : ''}`}>
                            {day.getDate()}
                          </div>
                          
                          <div className="space-y-1 mt-1">
                            {entries.slice(0, 2).map(entry => (
                              <div
                                key={entry.id}
                                className={`text-xs px-1 py-0.5 rounded ${getStatusColor(entry.status)}`}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(entry.status)}
                                  <span className="truncate">
                                    {entry.drill?.name || entry.workout?.name || 'Practice'}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {entries.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{entries.length - 2} more
                              </div>
                            )}
                          </div>
                          {provided.placeholder}
                        </motion.div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          {selectedDate && (
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  {selectedDate.toLocaleDateString('default', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>
                  {getEntriesForDate(selectedDate).length} practice sessions scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEntriesForDate(selectedDate).map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{entry.drill?.name || entry.workout?.name || 'Practice'}</h4>
                          <Badge className={getStatusColor(entry.status)}>
                            {getStatusIcon(entry.status)}
                            <span className="ml-1">{entry.status}</span>
                          </Badge>
                          {entry.drill && (
                            <Badge className={getCategoryColor(entry.drill.category)}>
                              {entry.drill.category}
                            </Badge>
                          )}
                          {entry.workout && (
                            <Badge variant="outline">
                              Workout
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(entry.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                          {entry.notes && (
                            <div className="text-gray-700 mt-2">{entry.notes}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {entry.status === 'SCHEDULED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateScheduleEntry(entry.id, 'COMPLETED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateScheduleEntry(entry.id, 'CANCELLED')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteScheduleEntry(entry.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {getEntriesForDate(selectedDate).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No practice sessions scheduled for this date</p>
                      <p className="text-sm mt-1">
                        {showDragSidebar ? 'Drag an item here or click below to schedule' : 'Click below to schedule a practice'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setNewEntry({ 
                            ...newEntry, 
                            date: selectedDate.toISOString().split('T')[0] 
                          });
                          setShowAddDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Practice
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DragDropContext>
  );
} 