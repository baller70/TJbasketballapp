
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Play, 
  Clock, 
  GripVertical,
  Copy,
  Share,
  BookOpen,
  Target,
  Trophy,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Drill, Workout, WorkoutDrill, WorkoutBuilderState } from '@/lib/types';

export default function WorkoutBuilder() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddDrillDialog, setShowAddDrillDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workoutState, setWorkoutState] = useState<WorkoutBuilderState>({
    name: '',
    description: '',
    drills: [],
    totalDuration: 0,
    isPublic: false,
  });

  useEffect(() => {
    fetchDrills();
    fetchWorkouts();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const createWorkout = async () => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutState),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        resetWorkoutState();
        fetchWorkouts();
      }
    } catch (error) {
      console.error('Error creating workout:', error);
    }
  };

  const updateWorkout = async () => {
    if (!selectedWorkout) return;

    try {
      const response = await fetch(`/api/workouts/${selectedWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutState),
      });

      if (response.ok) {
        fetchWorkouts();
        setSelectedWorkout(null);
        resetWorkoutState();
      }
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchWorkouts();
        if (selectedWorkout?.id === workoutId) {
          setSelectedWorkout(null);
          resetWorkoutState();
        }
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const addDrillToWorkout = (drill: Drill) => {
    const newWorkoutDrill: WorkoutDrill = {
      id: `temp-${Date.now()}`,
      workoutId: '',
      drillId: drill.id,
      order: workoutState.drills.length,
      duration: 10 * 60, // 10 minutes default
      notes: '',
      drill,
    };

    setWorkoutState(prev => ({
      ...prev,
      drills: [...prev.drills, newWorkoutDrill],
      totalDuration: prev.totalDuration + (newWorkoutDrill.duration || 0),
    }));
    setShowAddDrillDialog(false);
  };

  const removeDrillFromWorkout = (index: number) => {
    const removedDrill = workoutState.drills[index];
    setWorkoutState(prev => ({
      ...prev,
      drills: prev.drills.filter((_, i) => i !== index),
      totalDuration: prev.totalDuration - (removedDrill.duration || 0),
    }));
  };

  const updateDrillDuration = (index: number, duration: number) => {
    const oldDuration = workoutState.drills[index].duration || 0;
    const newDrills = [...workoutState.drills];
    newDrills[index] = { ...newDrills[index], duration };
    
    setWorkoutState(prev => ({
      ...prev,
      drills: newDrills,
      totalDuration: prev.totalDuration - oldDuration + duration,
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(workoutState.drills);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setWorkoutState(prev => ({
      ...prev,
      drills: updatedItems,
    }));
  };

  const resetWorkoutState = () => {
    setWorkoutState({
      name: '',
      description: '',
      drills: [],
      totalDuration: 0,
      isPublic: false,
    });
  };

  const loadWorkoutForEditing = (workout: Workout) => {
    setSelectedWorkout(workout);
    setWorkoutState({
      name: workout.name,
      description: workout.description || '',
      drills: workout.workoutDrills || [],
      totalDuration: workout.totalDuration,
      isPublic: workout.isPublic,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      shooting: 'bg-red-100 text-red-800',
      dribbling: 'bg-blue-100 text-blue-800',
      passing: 'bg-green-100 text-green-800',
      defense: 'bg-purple-100 text-purple-800',
      footwork: 'bg-yellow-100 text-yellow-800',
      conditioning: 'bg-pink-100 text-pink-800',
      fundamentals: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workout Builder</h2>
          <p className="text-gray-600">Create custom workout routines by combining drills</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedWorkout ? 'Edit Workout' : 'Create New Workout'}
              </DialogTitle>
              <DialogDescription>
                Build a custom workout by adding drills and setting durations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Workout Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workout Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter workout name"
                    value={workoutState.name}
                    onChange={(e) => setWorkoutState(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Total Duration</Label>
                  <Input
                    id="duration"
                    value={formatDuration(workoutState.totalDuration)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the workout and its goals"
                  value={workoutState.description}
                  onChange={(e) => setWorkoutState(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={workoutState.isPublic}
                  onCheckedChange={(checked) => setWorkoutState(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="public">Make this workout public</Label>
              </div>
              
              {/* Drills List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Drills ({workoutState.drills.length})</h3>
                  <Dialog open={showAddDrillDialog} onOpenChange={setShowAddDrillDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Drill
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Drill to Workout</DialogTitle>
                        <DialogDescription>
                          Select a drill to add to your workout
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                        {drills.map(drill => (
                          <Card key={drill.id} className="cursor-pointer hover:bg-gray-50" onClick={() => addDrillToWorkout(drill)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{drill.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getCategoryColor(drill.category)}>
                                      {drill.category}
                                    </Badge>
                                    <Badge variant="outline">
                                      {drill.skillLevel}
                                    </Badge>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="drills">
                    {(provided: any) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {workoutState.drills.map((workoutDrill, index) => (
                          <Draggable key={workoutDrill.id} draggableId={workoutDrill.id} index={index}>
                            {(provided: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white"
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{index + 1}.</span>
                                    <h4 className="font-medium">{workoutDrill.drill.name}</h4>
                                    <Badge className={getCategoryColor(workoutDrill.drill.category)}>
                                      {workoutDrill.drill.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {workoutDrill.drill.description}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Duration (min)"
                                    value={Math.floor((workoutDrill.duration || 0) / 60)}
                                    onChange={(e) => updateDrillDuration(index, parseInt(e.target.value || '0') * 60)}
                                    className="w-20"
                                  />
                                  <span className="text-sm text-gray-600">min</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDrillFromWorkout(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                {workoutState.drills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No drills added yet</p>
                    <p className="text-sm">Click "Add Drill" to start building your workout</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={selectedWorkout ? updateWorkout : createWorkout}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={!workoutState.name || workoutState.drills.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {selectedWorkout ? 'Update Workout' : 'Create Workout'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setSelectedWorkout(null);
                    resetWorkoutState();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workouts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-orange-100 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{workout.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {workout.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(workout.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{workout.workoutDrills?.length || 0} drills</span>
                  </div>
                  {workout.isPublic && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      loadWorkoutForEditing(workout);
                      setShowCreateDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWorkout(workout.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {workouts.length === 0 && (
        <Card className="border-orange-100">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first workout by combining drills into a structured routine.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
