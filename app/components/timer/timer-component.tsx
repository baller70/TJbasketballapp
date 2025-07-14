
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
  Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Drill, TimerState } from '@/lib/types';
import MediaUpload from '@/components/media/media-upload';

export default function TimerComponent() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    timeLeft: 0,
    totalTime: 0,
    currentDrill: undefined,
    drillIndex: 0,
    completedDrills: [],
  });
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customDuration, setCustomDuration] = useState(15); // minutes
  const [completionId, setCompletionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchDrills();
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

  const playSound = (type: 'start' | 'complete' | 'warning') => {
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
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = (drill: Drill) => {
    const durationInSeconds = customDuration * 60;
    setTimerState({
      isRunning: true,
      isPaused: false,
      timeLeft: durationInSeconds,
      totalTime: durationInSeconds,
      currentDrill: drill,
      drillIndex: 0,
      completedDrills: [],
    });
    playSound('start');
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
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
    playSound('complete');
    setShowCompletionDialog(true);
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
        // Keep dialog open for media upload
        setFeedback('');
        setRating(0);
      }
    } catch (error) {
      console.error('Error completing drill:', error);
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
      
      // Reset timer state
      setTimerState({
        isRunning: false,
        isPaused: false,
        timeLeft: 0,
        totalTime: 0,
        currentDrill: undefined,
        drillIndex: 0,
        completedDrills: [],
      });

    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSkipUpload = () => {
    setShowCompletionDialog(false);
    setCompletionId(null);
    
    // Reset timer state
    setTimerState({
      isRunning: false,
      isPaused: false,
      timeLeft: 0,
      totalTime: 0,
      currentDrill: undefined,
      drillIndex: 0,
      completedDrills: [],
    });
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
            {customDuration} min sessions
          </Badge>
        </div>
      </div>

      {/* Timer Display */}
      <Card className="border-orange-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-600" />
              {timerState.currentDrill ? timerState.currentDrill.name : 'Select a Drill'}
            </CardTitle>
            <div className="flex items-center gap-2">
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
            
            <div className="flex items-center justify-center gap-4">
              {!timerState.isRunning ? (
                <Select
                  value={selectedDrill?.id || ''}
                  onValueChange={(value) => {
                    const drill = drills.find(d => d.id === value);
                    if (drill) {
                      setSelectedDrill(drill);
                      startTimer(drill);
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Equipment Needed</h4>
                <div className="flex flex-wrap gap-2">
                  {timerState.currentDrill.equipment.map((item, idx) => (
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
                {timerState.currentDrill.stepByStep.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Coaching Tips</h4>
              <ul className="space-y-1">
                {timerState.currentDrill.coachingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Practice Complete!
            </DialogTitle>
            <DialogDescription>
              Great job completing your practice session! Rate your performance and optionally upload a video or image.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="feedback" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="upload" disabled={!completionId}>
                <Camera className="h-4 w-4 mr-2" />
                Upload Media
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
                {!completionId ? (
                  <Button
                    onClick={completeDrill}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Complete Practice
                  </Button>
                ) : (
                  <Button
                    onClick={handleSkipUpload}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finish
                  </Button>
                )}
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
                    Complete your practice feedback first to upload media.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
