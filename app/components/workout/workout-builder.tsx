
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
  Upload,
  MessageCircle,
  Video,
  Image,
  Camera,
  FileText,
  ChevronDown,
  ChevronUp,
  Settings,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Drill, Workout, WorkoutDrill, WorkoutBuilderState } from '@/lib/types';
import MediaUpload from '@/components/media/media-upload';
import MediaViewer from '@/components/media/media-viewer';
import Comments from '@/components/ui/comments';
import { useToast } from '@/components/ui/use-toast';

interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface DrillEditState {
  name: string;
  description: string;
  category: string;
  skillLevel: string;
  equipment: string;
  stepByStep: string[];
  coachingTips: string[];
  duration: string;
}

export default function WorkoutBuilder() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddDrillDialog, setShowAddDrillDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedDrills, setExpandedDrills] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [mediaUploads, setMediaUploads] = useState<Record<string, any[]>>({});
  const { toast } = useToast();
  
  const [workoutState, setWorkoutState] = useState<WorkoutBuilderState>({
    name: '',
    description: '',
    drills: [],
    totalDuration: 0,
    isPublic: false,
  });

  const [editingDrill, setEditingDrill] = useState<string | null>(null);
  const [drillEditState, setDrillEditState] = useState<DrillEditState>({
    name: '',
    description: '',
    category: '',
    skillLevel: '',
    equipment: '',
    stepByStep: [],
    coachingTips: [],
    duration: ''
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
        toast({
          title: "Success",
          description: "Workout created successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workout",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Workout updated successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workout",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Workout deleted successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      });
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

  const toggleDrillExpansion = (drillId: string) => {
    setExpandedDrills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(drillId)) {
        newSet.delete(drillId);
      } else {
        newSet.add(drillId);
        // Fetch media uploads when expanding
        fetchMediaUploads(drillId);
      }
      return newSet;
    });
  };

  const fetchMediaUploads = async (drillId: string) => {
    try {
      const response = await fetch(`/api/media/upload?drillId=${drillId}`);
      if (response.ok) {
        const data = await response.json();
        setMediaUploads(prev => ({
          ...prev,
          [drillId]: data,
        }));
      }
    } catch (error) {
    }
  };

  const handleMediaUpload = async (drillId: string, files: FileUpload[]) => {
    try {
      const formData = new FormData();
      
      files.forEach((fileUpload, index) => {
        formData.append(`files`, fileUpload.file);
      });
      
      formData.append('drillId', drillId);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Media uploaded successfully!",
        });
        // Refresh media uploads for this drill
        fetchMediaUploads(drillId);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    }
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

  const startDrillEdit = (drill: Drill) => {
    setEditingDrill(drill.id);
    
    // Helper function to parse step-by-step instructions
    const parseStepByStep = (stepByStep: any): string[] => {
      if (Array.isArray(stepByStep)) {
        return stepByStep;
      }
      if (typeof stepByStep === 'string') {
        return stepByStep.split('\n').filter(step => step.trim() !== '');
      }
      return [];
    };
    
    // Helper function to parse coaching tips
    const parseCoachingTips = (coachingTips: any): string[] => {
      if (Array.isArray(coachingTips)) {
        return coachingTips;
      }
      if (typeof coachingTips === 'string') {
        return coachingTips.split('\n').filter(tip => tip.trim() !== '');
      }
      return [];
    };
    
    setDrillEditState({
      name: drill.name,
      description: drill.description,
      category: drill.category,
      skillLevel: drill.skillLevel,
      equipment: drill.equipment,
      stepByStep: parseStepByStep(drill.stepByStep),
      coachingTips: parseCoachingTips(drill.coachingTips),
      duration: drill.duration
    });
  };

  const saveDrillEdit = async () => {
    if (!editingDrill) return;

    try {
      const response = await fetch(`/api/drills/${editingDrill}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...drillEditState,
          stepByStep: drillEditState.stepByStep.join('\n'),
          coachingTips: drillEditState.coachingTips.join('\n'),
        }),
      });

      if (response.ok) {
        const updatedDrill = await response.json();
        
                 // Update the drill in the available drills list
         setDrills(prev => 
           prev.map(drill => drill.id === editingDrill ? updatedDrill : drill)
         );
        
        // Update the drill in the current workout
        setWorkoutState(prev => ({
          ...prev,
          drills: prev.drills.map(workoutDrill => 
            workoutDrill.drill.id === editingDrill 
              ? { ...workoutDrill, drill: updatedDrill }
              : workoutDrill
          )
        }));

        toast({
          title: "Success",
          description: "Drill updated successfully!",
        });
        
        setEditingDrill(null);
      } else {
        throw new Error('Failed to update drill');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update drill",
        variant: "destructive",
      });
    }
  };

  const cancelDrillEdit = () => {
    setEditingDrill(null);
    setDrillEditState({
      name: '',
      description: '',
      category: '',
      skillLevel: '',
      equipment: '',
      stepByStep: [],
      coachingTips: [],
      duration: ''
    });
  };

  const updateDrillEditField = (field: keyof DrillEditState, value: string | string[]) => {
    setDrillEditState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStepToEdit = () => {
    setDrillEditState(prev => ({
      ...prev,
      stepByStep: [...prev.stepByStep, '']
    }));
  };

  const updateStepInEdit = (index: number, value: string) => {
    setDrillEditState(prev => ({
      ...prev,
      stepByStep: prev.stepByStep.map((step, i) => i === index ? value : step)
    }));
  };

  const removeStepFromEdit = (index: number) => {
    setDrillEditState(prev => ({
      ...prev,
      stepByStep: prev.stepByStep.filter((_, i) => i !== index)
    }));
  };

  const addTipToEdit = () => {
    setDrillEditState(prev => ({
      ...prev,
      coachingTips: [...prev.coachingTips, '']
    }));
  };

  const updateTipInEdit = (index: number, value: string) => {
    setDrillEditState(prev => ({
      ...prev,
      coachingTips: prev.coachingTips.map((tip, i) => i === index ? value : tip)
    }));
  };

  const removeTipFromEdit = (index: number) => {
    setDrillEditState(prev => ({
      ...prev,
      coachingTips: prev.coachingTips.filter((_, i) => i !== index)
    }));
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
          <p className="text-gray-600">Create custom workout routines with media uploads and coaching feedback</p>
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
                  placeholder="Describe your workout..."
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

              {/* Add Drill Button */}
              <div className="flex items-center gap-2">
                <Dialog open={showAddDrillDialog} onOpenChange={setShowAddDrillDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Drill
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Drill to Workout</DialogTitle>
                      <DialogDescription>
                        Choose a drill to add to your workout
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {drills.map((drill) => (
                          <Card 
                            key={drill.id} 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => addDrillToWorkout(drill)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{drill.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={getCategoryColor(drill.category)}>
                                      {drill.category}
                                    </Badge>
                                    <Badge variant="outline">{drill.skillLevel}</Badge>
                                  </div>
                                </div>
                                <Plus className="h-5 w-5 text-gray-400" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Drills List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Workout Drills</h3>
                
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
                                className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                              >
                                {/* Drill Header */}
                                <div className="flex items-center gap-4 p-4">
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
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor={`duration-${index}`} className="text-sm">Duration (min):</Label>
                                      <Input
                                        id={`duration-${index}`}
                                        type="number"
                                        min="1"
                                        value={Math.floor((workoutDrill.duration || 0) / 60)}
                                        onChange={(e) => updateDrillDuration(index, parseInt(e.target.value) * 60)}
                                        className="w-20"
                                      />
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startDrillEdit(workoutDrill.drill)}
                                      className="bg-green-50 hover:bg-green-100 text-green-700"
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Edit Drill
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleDrillExpansion(workoutDrill.id)}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                                    >
                                      {expandedDrills.has(workoutDrill.id) ? (
                                        <>
                                          <ChevronUp className="h-4 w-4 mr-1" />
                                          Hide Details
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-4 w-4 mr-1" />
                                          Show Media & Comments
                                        </>
                                      )}
                                    </Button>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeDrillFromWorkout(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Expanded Drill Content */}
                                <AnimatePresence>
                                  {expandedDrills.has(workoutDrill.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="border-t border-gray-200 bg-gray-50"
                                    >
                                      <div className="p-4">
                                        <Tabs 
                                          value={activeTab[workoutDrill.id] || 'details'} 
                                          onValueChange={(value) => setActiveTab(prev => ({ ...prev, [workoutDrill.id]: value }))}
                                        >
                                          <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="details" className="flex items-center gap-2">
                                              <FileText className="h-4 w-4" />
                                              Details
                                            </TabsTrigger>
                                            <TabsTrigger value="media" className="flex items-center gap-2">
                                              <Camera className="h-4 w-4" />
                                              Media
                                            </TabsTrigger>
                                            <TabsTrigger value="comments" className="flex items-center gap-2">
                                              <MessageCircle className="h-4 w-4" />
                                              Comments
                                            </TabsTrigger>
                                          </TabsList>
                                          
                                          <TabsContent value="details" className="mt-4">
                                            <div className="space-y-4">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                  <h5 className="font-medium text-sm mb-2">Equipment Needed</h5>
                                                  <p className="text-sm text-gray-600">{workoutDrill.drill.equipment}</p>
                                                </div>
                                                <div>
                                                  <h5 className="font-medium text-sm mb-2">Skill Level</h5>
                                                  <Badge variant="outline">{workoutDrill.drill.skillLevel}</Badge>
                                                </div>
                                              </div>
                                              
                                              <div>
                                                <h5 className="font-medium text-sm mb-2">Step-by-Step Instructions</h5>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                  {Array.isArray(workoutDrill.drill.stepByStep) ? (
                                                    workoutDrill.drill.stepByStep.map((step, stepIndex) => (
                                                      <p key={stepIndex}>{stepIndex + 1}. {step}</p>
                                                    ))
                                                  ) : (
                                                    <p>{workoutDrill.drill.stepByStep}</p>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              <div>
                                                <h5 className="font-medium text-sm mb-2">Coaching Tips</h5>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                  {Array.isArray(workoutDrill.drill.coachingTips) ? (
                                                    workoutDrill.drill.coachingTips.map((tip, tipIndex) => (
                                                      <p key={tipIndex}>• {tip}</p>
                                                    ))
                                                  ) : (
                                                    <p>{workoutDrill.drill.coachingTips}</p>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </TabsContent>
                                          
                                          <TabsContent value="media" className="mt-4">
                                            <div className="space-y-6">
                                              {/* Upload Section */}
                                              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                                <CardHeader className="text-center pb-3">
                                                  <CardTitle className="text-lg flex items-center justify-center gap-2">
                                                    <Upload className="h-5 w-5 text-blue-600" />
                                                    Upload Practice Videos & Images
                                                  </CardTitle>
                                                  <CardDescription>
                                                    Record yourself performing this drill to get feedback from coaches and track your progress
                                                  </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                  <MediaUpload
                                                    onUpload={(files) => handleMediaUpload(workoutDrill.drill.id, files)}
                                                    acceptedTypes={['video/*', 'image/*']}
                                                    maxFileSize={100} // 100MB for videos
                                                    maxFiles={3}
                                                    className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-white hover:bg-blue-50 transition-colors"
                                                  />
                                                </CardContent>
                                              </Card>

                                              {/* Media Gallery */}
                                              <Card className="bg-gray-50 border-gray-200">
                                                <CardHeader>
                                                  <CardTitle className="text-lg flex items-center gap-2">
                                                    <Video className="h-5 w-5 text-gray-600" />
                                                    Your Practice Media
                                                  </CardTitle>
                                                  <CardDescription>
                                                    View and manage your uploaded practice videos and images
                                                  </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                  <MediaViewer
                                                    mediaUploads={mediaUploads[workoutDrill.drill.id] || []}
                                                    className="max-h-96 overflow-y-auto"
                                                  />
                                                </CardContent>
                                              </Card>
                                            </div>
                                          </TabsContent>
                                          
                                          <TabsContent value="comments" className="mt-4">
                                            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                              <CardHeader className="text-center pb-3">
                                                <CardTitle className="text-lg flex items-center justify-center gap-2">
                                                  <MessageCircle className="h-5 w-5 text-green-600" />
                                                  Drill Discussion
                                                </CardTitle>
                                                <CardDescription>
                                                  Ask questions, share tips, or get feedback from coaches and other players
                                                </CardDescription>
                                              </CardHeader>
                                              <CardContent>
                                                <Comments 
                                                  drillId={workoutDrill.drill.id}
                                                  className="max-h-96 overflow-y-auto bg-white rounded-lg p-4 border"
                                                />
                                              </CardContent>
                                            </Card>
                                          </TabsContent>
                                        </Tabs>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
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

      {/* Drill Edit Dialog */}
      <Dialog open={editingDrill !== null} onOpenChange={(open) => !open && cancelDrillEdit()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Drill
            </DialogTitle>
            <DialogDescription>
              Modify the drill details. Changes will be saved to your custom drill library.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drill-name">Drill Name</Label>
                <Input
                  id="drill-name"
                  value={drillEditState.name}
                  onChange={(e) => updateDrillEditField('name', e.target.value)}
                  placeholder="Enter drill name"
                />
              </div>
              <div>
                <Label htmlFor="drill-category">Category</Label>
                <Select 
                  value={drillEditState.category} 
                  onValueChange={(value) => updateDrillEditField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shooting">Shooting</SelectItem>
                    <SelectItem value="dribbling">Dribbling</SelectItem>
                    <SelectItem value="passing">Passing</SelectItem>
                    <SelectItem value="defense">Defense</SelectItem>
                    <SelectItem value="conditioning">Conditioning</SelectItem>
                    <SelectItem value="rebounding">Rebounding</SelectItem>
                    <SelectItem value="footwork">Footwork</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drill-skill-level">Skill Level</Label>
                <Select 
                  value={drillEditState.skillLevel} 
                  onValueChange={(value) => updateDrillEditField('skillLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="drill-duration">Duration (minutes)</Label>
                <Input
                  id="drill-duration"
                  type="number"
                  min="1"
                  value={parseInt(drillEditState.duration) || 0}
                  onChange={(e) => updateDrillEditField('duration', e.target.value)}
                  placeholder="15"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="drill-description">Description</Label>
              <Textarea
                id="drill-description"
                value={drillEditState.description}
                onChange={(e) => updateDrillEditField('description', e.target.value)}
                placeholder="Describe the drill..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="drill-equipment">Equipment Needed</Label>
              <Input
                id="drill-equipment"
                value={drillEditState.equipment}
                onChange={(e) => updateDrillEditField('equipment', e.target.value)}
                placeholder="Basketball, cones, etc."
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Step-by-Step Instructions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStepToEdit}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              <div className="space-y-2">
                {drillEditState.stepByStep.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">{index + 1}.</span>
                    <Input
                      value={step}
                      onChange={(e) => updateStepInEdit(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStepFromEdit(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Coaching Tips */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Coaching Tips</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTipToEdit}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tip
                </Button>
              </div>
              <div className="space-y-2">
                {drillEditState.coachingTips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8">•</span>
                    <Input
                      value={tip}
                      onChange={(e) => updateTipInEdit(index, e.target.value)}
                      placeholder={`Tip ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTipFromEdit(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={cancelDrillEdit}>
              Cancel
            </Button>
            <Button onClick={saveDrillEdit} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
