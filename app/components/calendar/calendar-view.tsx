
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
  BookOpen,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ScheduleEntry, Drill, Workout } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarViewProps {
  showDragSidebar?: boolean;
}

export default function CalendarView({ showDragSidebar = true }: CalendarViewProps) {
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'drills' | 'workouts'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [newEntry, setNewEntry] = useState({
    drillId: '',
    workoutId: '',
    date: '',
    startTime: '',
    notes: '',
  });

  // Load schedule entries from localStorage on component mount
  useEffect(() => {
    const savedScheduleEntries = localStorage.getItem('basketballScheduleEntries');
    if (savedScheduleEntries) {
      try {
        const parsedEntries = JSON.parse(savedScheduleEntries);
        // Convert string dates back to Date objects
        const entriesWithDates = parsedEntries.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : null,
          completedAt: entry.completedAt ? new Date(entry.completedAt) : null,
        }));
        setScheduleEntries(entriesWithDates);
      } catch (error) {
      }
    }
  }, []);

  // Save schedule entries to localStorage whenever they change
  useEffect(() => {
    if (scheduleEntries.length > 0) {
      localStorage.setItem('basketballScheduleEntries', JSON.stringify(scheduleEntries));
    }
  }, [scheduleEntries]);

  useEffect(() => {
    fetchScheduleEntries();
    fetchDrills();
    fetchWorkouts();
  }, [currentDate, currentView]);

  const fetchScheduleEntries = async () => {
    try {
      const { start, end } = getDateRange();
      
      const response = await fetch(
        `/api/schedule?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Only update if we don't have localStorage data or if API data is newer
        const savedData = localStorage.getItem('basketballScheduleEntries');
        if (!savedData || scheduleEntries.length === 0) {
          setScheduleEntries(data);
        }
      } else {
        // Handle non-200 responses gracefully - using localStorage data
        // Don't clear scheduleEntries here, keep localStorage data
      }
    } catch (error) {
      // API unavailable - keep localStorage data
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
      } else {
        // Mock data for drills
        setDrills([
          { id: '1', name: 'Free Throw Practice', category: 'shooting', description: 'Practice free throws', duration: '300', skillLevel: 'BEGINNER', equipment: 'Basketball', stepByStep: 'Stand at free throw line, Aim for the rim, Shoot with proper form', coachingTips: 'Keep your elbow aligned', videoUrl: null, alternativeVideos: '', isCustom: false, createdBy: 'mock-user' },
          { id: '2', name: 'Dribbling Drills', category: 'dribbling', description: 'Basic dribbling exercises', duration: '600', skillLevel: 'BEGINNER', equipment: 'Basketball', stepByStep: 'Start with stationary dribbling, Practice with both hands, Increase speed gradually', coachingTips: 'Keep your head up', videoUrl: null, alternativeVideos: '', isCustom: false, createdBy: 'mock-user' },
          { id: '3', name: 'Defensive Stance', category: 'defense', description: 'Practice defensive positioning', duration: '450', skillLevel: 'BEGINNER', equipment: 'None', stepByStep: 'Wide stance, Bend knees, Keep arms active', coachingTips: 'Stay low and balanced', videoUrl: null, alternativeVideos: '', isCustom: false, createdBy: 'mock-user' },
          { id: '4', name: 'Layup Practice', category: 'shooting', description: 'Practice layups from both sides', duration: '900', skillLevel: 'INTERMEDIATE', equipment: 'Basketball', stepByStep: 'Approach at angle, Use proper footwork, Soft touch on backboard', coachingTips: 'Use the backboard', videoUrl: null, alternativeVideos: '', isCustom: false, createdBy: 'mock-user' },
          { id: '5', name: 'Passing Drills', category: 'passing', description: 'Various passing techniques', duration: '720', skillLevel: 'BEGINNER', equipment: 'Basketball', stepByStep: 'Chest pass, Bounce pass, Overhead pass', coachingTips: 'Step into the pass', videoUrl: null, alternativeVideos: '', isCustom: false, createdBy: 'mock-user' },
        ]);
      }
    } catch (error) {
      setDrills([]);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts');
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        // Mock data for workouts
        setWorkouts([
          { id: '1', name: 'Morning Workout', description: 'Complete morning training session', totalDuration: 3600, isPublic: true, userId: 'mock-user', workoutDrills: [] },
          { id: '2', name: 'Shooting Focus', description: 'Focused shooting practice', totalDuration: 2700, isPublic: true, userId: 'mock-user', workoutDrills: [] },
          { id: '3', name: 'Conditioning', description: 'Physical conditioning workout', totalDuration: 1800, isPublic: true, userId: 'mock-user', workoutDrills: [] },
        ]);
      }
    } catch (error) {
      setWorkouts([]);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (currentView === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else if (currentView === 'week') {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const handleDragStart = (start: any) => {
    setIsDragging(true);
    const { draggableId } = start;
    
    // Find the dragged item
    const isDrill = draggableId.startsWith('drill-');
    const isWorkout = draggableId.startsWith('workout-');
    
    if (isDrill) {
      const drillId = draggableId.replace('drill-', '');
      const drill = drills.find(d => d.id === drillId);
      setDraggedItem({ ...drill, type: 'drill' });
    } else if (isWorkout) {
      const workoutId = draggableId.replace('workout-', '');
      const workout = workouts.find(w => w.id === workoutId);
      setDraggedItem({ ...workout, type: 'workout' });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    setDraggedItem(null);
    
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    
    // Check if dropped on a calendar date
    if (destination.droppableId.startsWith('calendar-')) {
      const dateStr = destination.droppableId.replace('calendar-', '');
      const targetDate = new Date(dateStr);
      
      // Validate date
      if (isNaN(targetDate.getTime())) {
        toast({
          title: "Invalid Date",
          description: "Unable to schedule on the selected date.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        toast({
          title: "Past Date",
          description: "Cannot schedule activities in the past.",
          variant: "destructive",
        });
        return;
      }
      
      // Determine if it's a drill or workout
      const isDrill = draggableId.startsWith('drill-');
      const isWorkout = draggableId.startsWith('workout-');
      
      if (isDrill) {
        const drillId = draggableId.replace('drill-', '');
        const drill = drills.find(d => d.id === drillId);
        if (drill) {
          await addScheduleEntry(drillId, null, targetDate, drill.name);
        }
      } else if (isWorkout) {
        const workoutId = draggableId.replace('workout-', '');
        const workout = workouts.find(w => w.id === workoutId);
        if (workout) {
          await addScheduleEntry(null, workoutId, targetDate, workout.name);
        }
      }
    }
  };

  const addScheduleEntry = async (drillId?: string | null, workoutId?: string | null, date?: Date, itemName?: string) => {
    try {
      const scheduleDate = date || new Date(newEntry.date);
      const startTime = date ? '09:00' : newEntry.startTime;
      
      // For now, just add to local state since API might not be available
      const newScheduleEntry: ScheduleEntry = {
        id: Date.now().toString(),
        userId: 'mock-user',
        drillId: drillId || newEntry.drillId || null,
        workoutId: workoutId || newEntry.workoutId || null,
        date: scheduleDate,
        startTime: new Date(`${scheduleDate.toISOString().split('T')[0]}T${startTime}:00`),
        endTime: null,
        status: 'SCHEDULED' as const,
        notes: newEntry.notes || null,
        completedAt: null,
        drill: drillId ? drills.find(d => d.id === drillId) : undefined,
        workout: workoutId ? workouts.find(w => w.id === workoutId) : undefined,
      };
      
      setScheduleEntries(prev => [...prev, newScheduleEntry]);
      
      toast({
        title: "Scheduled Successfully",
        description: `${itemName || 'Activity'} has been scheduled for ${scheduleDate.toLocaleDateString()}.`,
      });
      
      // Try to save to API if available
      try {
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
          const savedEntry = await response.json();
          // Update with server response
          setScheduleEntries(prev => 
            prev.map(entry => 
              entry.id === newScheduleEntry.id ? savedEntry : entry
            )
          );
        }
      } catch (error) {
      }
      
      setShowAddDialog(false);
      setNewEntry({ drillId: '', workoutId: '', date: '', startTime: '', notes: '' });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule the activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateScheduleEntry = async (id: string, status: string) => {
    try {
      // Update local state
      setScheduleEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, status: status as ScheduleEntry['status'] } : entry
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Activity status changed to ${status.toLowerCase()}.`,
      });
      
      // Try to update via API if available
      try {
        await fetch(`/api/schedule/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
      } catch (error) {
      }
    } catch (error) {
    }
  };

  const deleteScheduleEntry = async (id: string) => {
    try {
      // Remove from local state
      setScheduleEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Deleted",
        description: "Activity has been removed from your schedule.",
      });
      
      // Try to delete via API if available
      try {
        await fetch(`/api/schedule/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
      }
    } catch (error) {
    }
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

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getUniqueCategories = () => {
    const categories = new Set<string>();
    drills.forEach(drill => {
      if (drill.category) categories.add(drill.category);
    });
    return Array.from(categories);
  };

  const filteredItems = () => {
    let items: any[] = [];
    
    if (sidebarFilter === 'all' || sidebarFilter === 'drills') {
      items = [...items, ...drills.map(drill => ({ ...drill, type: 'drill' }))];
    }
    
    if (sidebarFilter === 'all' || sidebarFilter === 'workouts') {
      items = [...items, ...workouts.map(workout => ({ ...workout, type: 'workout' }))];
    }
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }
    
    return items;
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

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="space-y-4">
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
                    className={`min-h-24 p-2 border border-gray-200 rounded-lg ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'border-orange-600 bg-orange-50' : ''} ${
                      isPast ? 'opacity-60' : ''
                    } ${snapshot.isDraggingOver ? 'bg-orange-100 border-orange-400 shadow-lg' : ''
                    } hover:bg-gray-50 cursor-pointer transition-all duration-200`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isToday ? 'text-orange-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1 mt-1">
                      {entries.slice(0, 3).map(entry => (
                        <div
                          key={entry.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(entry.status)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(entry.status)}
                            <span className="truncate">
                              {entry.drill?.name || entry.workout?.name || 'Practice'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {entries.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{entries.length - 3} more
                        </div>
                      )}
                    </div>
                    
                    {/* Drop indicator */}
                    {snapshot.isDraggingOver && isDragging && (
                      <div className="absolute inset-0 bg-orange-200 bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="text-orange-800 text-xs font-medium">
                          Drop here to schedule
                        </div>
                      </div>
                    )}
                    
                    {provided.placeholder}
                  </motion.div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const getWeekDays = (date: Date) => {
      const days = [];
      const startOfWeek = new Date(date);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
      
      return days;
    };

    const days = getWeekDays(currentDate);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-4">
          {days.map((day, index) => {
            const entries = getEntriesForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <Droppable key={index} droppableId={`calendar-${day.toISOString()}`}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-32 p-3 border-2 border-dashed rounded-lg ${
                      isToday ? 'border-orange-600 bg-orange-50' : 'border-gray-200 bg-white'
                    } ${isPast ? 'opacity-60' : ''} ${
                      snapshot.isDraggingOver ? 'border-orange-400 bg-orange-100' : ''
                    } hover:border-gray-300 transition-colors cursor-pointer`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-center mb-2">
                      <div className="text-sm font-medium text-gray-600">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {entries.map(entry => (
                        <div
                          key={entry.id}
                          className={`text-xs px-2 py-1 rounded ${getStatusColor(entry.status)}`}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(entry.status)}
                            <span className="truncate">
                              {entry.drill?.name || entry.workout?.name || 'Practice'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {provided.placeholder}
                  </motion.div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const entries = getEntriesForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <Droppable droppableId={`calendar-${currentDate.toISOString()}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-96 p-6 border-2 border-dashed rounded-lg ${
              isToday ? 'border-orange-600 bg-orange-50' : 'border-gray-200 bg-white'
            } ${snapshot.isDraggingOver ? 'border-orange-400 bg-orange-100' : ''}`}
          >
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="space-y-3">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border ${getStatusColor(entry.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(entry.status)}
                      <div>
                        <h4 className="font-medium">
                          {entry.drill?.name || entry.workout?.name || 'Practice'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateScheduleEntry(entry.id, 'COMPLETED')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteScheduleEntry(entry.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  const formatDateHeader = () => {
    if (currentView === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (currentView === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('default', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-screen">
        {/* Enhanced Sidebar with draggable items */}
        {showDragSidebar && (
          <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drills & Workouts
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag items to calendar dates to schedule them
                </p>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search drills and workouts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Filters */}
                <div className="space-y-2 mb-4">
                  <Tabs value={sidebarFilter} onValueChange={(value) => setSidebarFilter(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="drills">Drills</TabsTrigger>
                      <TabsTrigger value="workouts">Workouts</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {getUniqueCategories().length > 0 && (
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getUniqueCategories().map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              {/* Draggable Items */}
              <Droppable droppableId="drill-pool" isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
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
                            className={`p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-all duration-200 ${
                              snapshot.isDragging ? 'shadow-lg rotate-2 bg-white border-orange-400' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {item.type === 'drill' ? (
                                    <Target className="h-4 w-4 text-orange-600" />
                                  ) : (
                                    <Dumbbell className="h-4 w-4 text-blue-600" />
                                  )}
                                  <span className="font-medium text-sm">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.category}
                                    </Badge>
                                  )}
                                  {item.duration && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      <span>{Math.floor(item.duration / 60)}min</span>
                                    </div>
                                  )}
                                  {item.totalDuration && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      <span>{Math.floor(item.totalDuration / 60)}min</span>
                                    </div>
                                  )}
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
        <div className="flex-1 p-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Practice Schedule
                  </CardTitle>
                  <CardDescription>
                    {currentView === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    {currentView === 'week' && `Week of ${currentDate.toLocaleDateString()}`}
                    {currentView === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* View switcher */}
                  <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as CalendarView)}>
                    <TabsList>
                      <TabsTrigger value="month">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="week">
                        <CalendarRange className="h-4 w-4 mr-1" />
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="day">
                        <CalendarCheck className="h-4 w-4 mr-1" />
                        Day
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {/* Navigation */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentView === 'month') navigateMonth(-1);
                        else if (currentView === 'week') navigateWeek(-1);
                        else navigateDay(-1);
                      }}
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
                      onClick={() => {
                        if (currentView === 'month') navigateMonth(1);
                        else if (currentView === 'week') navigateWeek(1);
                        else navigateDay(1);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading calendar...</div>
                </div>
              ) : (
                <>
                  {currentView === 'month' && renderMonthView()}
                  {currentView === 'week' && renderWeekView()}
                  {currentView === 'day' && renderDayView()}
                </>
              )}
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          {selectedDate && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>
                  Scheduled activities for this date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateScheduleEntry(entry.id, 'IN_PROGRESS')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {entry.status === 'IN_PROGRESS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateScheduleEntry(entry.id, 'COMPLETED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
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

      {/* Add Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Practice</DialogTitle>
            <DialogDescription>
              Add a new practice session to your calendar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newEntry.startTime}
                onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="drill">Drill</Label>
              <Select value={newEntry.drillId} onValueChange={(value) => setNewEntry({ ...newEntry, drillId: value, workoutId: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a drill" />
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
            
            <div>
              <Label htmlFor="workout">Or Workout</Label>
              <Select value={newEntry.workoutId} onValueChange={(value) => setNewEntry({ ...newEntry, workoutId: value, drillId: '' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workout" />
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
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => addScheduleEntry()}>
              Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DragDropContext>
  );
}
