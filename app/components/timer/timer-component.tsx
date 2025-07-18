
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Timer, 
  Clock, 
  Trophy,
  Star,
  CheckCircle,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Camera,
  Upload,
  ListChecks,
  Zap,
  ArrowRight,
  Target,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drill, Workout, TimerState } from '@/lib/types';
import MediaUpload from '@/components/media/media-upload';

interface WorkoutTimerState extends TimerState {
  currentWorkout?: Workout;
  workoutDrills: Drill[];
  completedDrills: string[];
  totalWorkoutDuration: number;
  workoutProgress: number;
}

export default function TimerComponent() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [mode, setMode] = useState<'drill' | 'workout'>('drill');
  const [timerState, setTimerState] = useState<WorkoutTimerState>({
    isRunning: false,
    isPaused: false,
    timeLeft: 0,
    totalTime: 0,
    currentDrill: undefined,
    drillIndex: 0,
    completedDrills: [],
    workoutDrills: [],
    totalWorkoutDuration: 0,
    workoutProgress: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customDuration, setCustomDuration] = useState(15); // minutes
  const [completionId, setCompletionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper function to normalize drill data from different sources
  const normalizeDrillData = (drill: any): Drill => {
    return {
      ...drill,
      skillLevel: drill.skillLevel || drill.difficulty || 'N/A',
      stepByStep: drill.stepByStep || drill.instructions || [],
      coachingTips: drill.coachingTips || [],
      equipment: drill.equipment || [],
    };
  };

  useEffect(() => {
    fetchDrills();
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused, timerState.timeLeft]);

  useEffect(() => {
    if (timerState.timeLeft === 0 && timerState.isRunning) {
      handleTimerComplete();
    }
  }, [timerState.timeLeft, timerState.isRunning]);

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

  const playSound = (type: 'start' | 'complete' | 'warning' | 'next') => {
    if (!soundEnabled) return;
    
    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      start: 800,
      complete: 1000,
      warning: 600,
      next: 900,
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startDrillTimer = (drill: Drill) => {
    const durationInSeconds = customDuration * 60;
    const normalizedDrill = normalizeDrillData(drill);
    setTimerState({
      isRunning: true,
      isPaused: false,
      timeLeft: durationInSeconds,
      totalTime: durationInSeconds,
      currentDrill: normalizedDrill,
      drillIndex: 0,
      completedDrills: [],
      workoutDrills: [],
      totalWorkoutDuration: 0,
      workoutProgress: 0,
    });
    playSound('start');
  };

  const startWorkoutTimer = (workout: Workout) => {
    if (!workout.workoutDrills || workout.workoutDrills.length === 0) {
      console.error('No drills found in workout');
      return;
    }

    const workoutDrills = workout.workoutDrills
      .sort((a, b) => a.order - b.order)
      .map(wd => normalizeDrillData(wd.drill));
    
    const firstDrill = workoutDrills[0];
    const totalWorkoutDuration = workout.workoutDrills.reduce((total, wd) => total + (wd.duration || 0), 0) * 60;
    const firstDrillDuration = (workout.workoutDrills[0].duration || customDuration) * 60;

    setTimerState({
      isRunning: true,
      isPaused: false,
      timeLeft: firstDrillDuration,
      totalTime: firstDrillDuration,
      currentDrill: firstDrill,
      currentWorkout: workout,
      drillIndex: 0,
      completedDrills: [],
      workoutDrills,
      totalWorkoutDuration,
      workoutProgress: 0,
    });
    playSound('start');
  };

  const moveToNextDrill = () => {
    if (!timerState.currentWorkout || !timerState.workoutDrills) return;

    const nextIndex = timerState.drillIndex + 1;
    
    if (nextIndex >= timerState.workoutDrills.length) {
      // Workout complete
      setShowWorkoutComplete(true);
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        workoutProgress: 100,
      }));
      playSound('complete');
      return;
    }

    const nextDrill = timerState.workoutDrills[nextIndex];
    const nextDrillDuration = (timerState.currentWorkout.workoutDrills?.[nextIndex]?.duration || customDuration) * 60;
    const completedDrillIds = [...timerState.completedDrills, timerState.currentDrill?.id || ''];
    const workoutProgress = (completedDrillIds.length / timerState.workoutDrills.length) * 100;

    setTimerState(prev => ({
      ...prev,
      currentDrill: nextDrill,
      drillIndex: nextIndex,
      timeLeft: nextDrillDuration,
      totalTime: nextDrillDuration,
      completedDrills: completedDrillIds,
      workoutProgress,
    }));
    
    playSound('next');
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const stopTimer = () => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      timeLeft: 0,
      totalTime: 0,
      currentDrill: undefined,
      drillIndex: 0,
      completedDrills: [],
      workoutDrills: [],
      totalWorkoutDuration: 0,
      workoutProgress: 0,
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setTimerState(prev => ({
      ...prev,
      timeLeft: prev.totalTime,
      isPaused: false,
    }));
  };

  const handleTimerComplete = () => {
    if (timerState.currentWorkout && timerState.drillIndex < timerState.workoutDrills.length - 1) {
      // More drills in workout - show completion dialog for current drill
      setShowCompletionDialog(true);
    } else {
      // Single drill or last drill in workout
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
      }));
      playSound('complete');
      setShowCompletionDialog(true);
    }
  };

  const completeDrill = async () => {
    if (!timerState.currentDrill) return;

    try {
      const response = await fetch('/api/drills/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drillId: timerState.currentDrill.id,
          duration: timerState.totalTime - timerState.timeLeft,
          rating,
          feedback,
        }),
      });

      if (response.ok) {
        const completion = await response.json();
        setCompletionId(completion.id);
        
        // Reset feedback for next drill
        setFeedback('');
        setRating(0);
        
        // If it's a workout, move to next drill
        if (timerState.currentWorkout) {
          setShowCompletionDialog(false);
          moveToNextDrill();
        }
      }
    } catch (error) {
      console.error('Error completing drill:', error);
    }
  };

  const completeWorkout = async () => {
    if (!timerState.currentWorkout) return;

    try {
      const response = await fetch('/api/workouts/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: timerState.currentWorkout.id,
          completedDrills: timerState.completedDrills,
          totalDuration: timerState.totalWorkoutDuration,
        }),
      });

      if (response.ok) {
        setShowWorkoutComplete(false);
        stopTimer();
      }
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleMediaUpload = async (files: any[]) => {
    if (!timerState.currentDrill || !completionId) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (fileUpload) => {
        const formData = new FormData();
        formData.append('file', fileUpload.file);
        formData.append('drillId', timerState.currentDrill!.id);
        formData.append('drillCompletionId', completionId);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      
      // Close dialog after successful upload
      setShowCompletionDialog(false);
      setCompletionId(null);
      
      // If single drill, reset timer
      if (!timerState.currentWorkout) {
        stopTimer();
      }

    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSkipUpload = () => {
    setShowCompletionDialog(false);
    setCompletionId(null);
    
    // If single drill, reset timer
    if (!timerState.currentWorkout) {
      stopTimer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (timerState.totalTime === 0) return 0;
    return ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100;
  };

  const getTimeColor = () => {
    const percentage = getProgressPercentage();
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCurrentTitle = () => {
    if (timerState.currentWorkout) {
      return `${timerState.currentWorkout.name} - ${timerState.currentDrill?.name || 'Select Drill'}`;
    }
    return timerState.currentDrill?.name || 'Select a Drill or Workout';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Practice Timer</h2>
          <p className="text-gray-600">Time your practice sessions and track your progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Badge variant="outline" className="text-gray-600">
            {customDuration} min default
          </Badge>
        </div>
      </div>

      {/* Mode Selection */}
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Practice Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'drill' | 'workout')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="drill" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Single Drill
              </TabsTrigger>
              <TabsTrigger value="workout" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Full Workout
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Timer Display */}
      <Card className="border-orange-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-600" />
              {getCurrentTitle()}
            </CardTitle>
            <div className="flex items-center gap-2">
              {mode === 'drill' && (
                <Select
                  value={customDuration.toString()}
                  onValueChange={(value) => setCustomDuration(parseInt(value))}
                  disabled={timerState.isRunning}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          {timerState.currentDrill && (
            <CardDescription>
              {timerState.currentDrill.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: timerState.isRunning ? 1.05 : 1 }}
              transition={{ duration: 0.3 }}
              className={`text-6xl font-bold ${getTimeColor()}`}
            >
              {formatTime(timerState.timeLeft)}
            </motion.div>
            
            <Progress 
              value={getProgressPercentage()} 
              className="h-3"
            />

            {/* Workout Progress */}
            {timerState.currentWorkout && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Workout Progress</span>
                  <span>{timerState.drillIndex + 1} of {timerState.workoutDrills.length} drills</span>
                </div>
                <Progress 
                  value={timerState.workoutProgress} 
                  className="h-2"
                />
                <div className="flex gap-1 justify-center">
                  {timerState.workoutDrills.map((drill, index) => (
                    <div
                      key={drill.id}
                      className={`w-3 h-3 rounded-full ${
                        index < timerState.drillIndex
                          ? 'bg-green-500'
                          : index === timerState.drillIndex
                          ? 'bg-orange-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4">
              {!timerState.isRunning ? (
                <>
                  {mode === 'drill' ? (
                    <Select
                      value={selectedDrill?.id || ''}
                      onValueChange={(value) => {
                        const drill = drills.find(d => d.id === value);
                        if (drill) {
                          setSelectedDrill(drill);
                          startDrillTimer(drill);
                        }
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select a drill to start" />
                      </SelectTrigger>
                      <SelectContent>
                        {drills.map(drill => (
                          <SelectItem key={drill.id} value={drill.id}>
                            {drill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={selectedWorkout?.id || ''}
                      onValueChange={(value) => {
                        const workout = workouts.find(w => w.id === value);
                        if (workout) {
                          setSelectedWorkout(workout);
                          startWorkoutTimer(workout);
                        }
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select a workout to start" />
                      </SelectTrigger>
                      <SelectContent>
                        {workouts.map(workout => (
                          <SelectItem key={workout.id} value={workout.id}>
                            <div className="flex items-center gap-2">
                              <span>{workout.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {workout.workoutDrills?.length || 0} drills
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    size="lg"
                  >
                    {timerState.isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    {timerState.isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                  
                  <Button
                    onClick={stopTimer}
                    variant="outline"
                    size="lg"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop
                  </Button>

                  {timerState.currentWorkout && (
                    <Button
                      onClick={moveToNextDrill}
                      variant="outline"
                      size="lg"
                    >
                      <SkipForward className="h-5 w-5 mr-2" />
                      Next Drill
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Drill Details */}
      {timerState.currentDrill && (
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              Current Drill Instructions
              {timerState.currentWorkout && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {timerState.drillIndex + 1} of {timerState.workoutDrills.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Equipment Needed</h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(timerState.currentDrill.equipment) ? timerState.currentDrill.equipment : []).map((item, idx) => (
                    <Badge key={idx} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Skill Level</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {timerState.currentDrill.skillLevel}
                </Badge>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="space-y-2">
                {(Array.isArray(timerState.currentDrill.stepByStep) ? timerState.currentDrill.stepByStep : []).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            {(timerState.currentDrill.coachingTips && timerState.currentDrill.coachingTips.length > 0) && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Coaching Tips</h4>
                <ul className="space-y-1">
                  {(Array.isArray(timerState.currentDrill.coachingTips) ? timerState.currentDrill.coachingTips : []).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workout Overview */}
      {timerState.currentWorkout && (
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              Workout Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timerState.workoutDrills.map((drill, index) => (
                <div
                  key={drill.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    index === timerState.drillIndex
                      ? 'border-orange-500 bg-orange-50'
                      : timerState.completedDrills.includes(drill.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === timerState.drillIndex
                            ? 'bg-orange-500 text-white'
                            : timerState.completedDrills.includes(drill.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {timerState.completedDrills.includes(drill.id) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{drill.name}</h4>
                        <p className="text-sm text-gray-600">{drill.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {timerState.currentWorkout?.workoutDrills?.[index]?.duration || customDuration} min
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drill Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Drill Complete!
            </DialogTitle>
            <DialogDescription>
              Great job completing {timerState.currentDrill?.name}! Rate your performance and optionally upload a video or image.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedback">Rate & Feedback</TabsTrigger>
              <TabsTrigger value="upload" disabled={!completionId}>
                <Camera className="h-4 w-4 mr-2" />
                Upload Video/Image
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="feedback" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rate your performance (1-5 stars)
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${
                        star <= rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (optional)
                </label>
                <Textarea
                  placeholder="How did the drill feel? Any observations or areas for improvement?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={completeDrill}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {timerState.currentWorkout ? 'Complete & Continue' : 'Complete Drill'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCompletionDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              {completionId ? (
                <>
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold mb-2">Share Your Performance</h3>
                    <p className="text-gray-600">
                      Upload a video or image of your practice session for your coach/parent to review and provide feedback.
                    </p>
                  </div>
                  
                  <MediaUpload
                    onUpload={handleMediaUpload}
                    acceptedTypes={['video/*', 'image/*']}
                    maxFileSize={50}
                    maxFiles={3}
                    disabled={uploading}
                  />
                  
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleSkipUpload}
                      disabled={uploading}
                    >
                      Skip Upload
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Complete your drill feedback first to upload media.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Workout Complete Dialog */}
      <Dialog open={showWorkoutComplete} onOpenChange={setShowWorkoutComplete}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Workout Complete!
            </DialogTitle>
                         <DialogDescription>
               Congratulations! You've completed the entire workout: {timerState.currentWorkout?.name || 'Unknown Workout'}
             </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {timerState.completedDrills.length}
              </div>
              <p className="text-gray-600">Drills Completed</p>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                onClick={completeWorkout}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Finish Workout
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWorkoutComplete(false)}
              >
                Continue Practice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
