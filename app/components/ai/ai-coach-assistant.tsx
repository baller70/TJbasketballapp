'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings, 
  Users, 
  Activity, 
  MessageCircle, 
  FileText, 
  Video, 
  Star,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Wand2,
  User,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type AIMode = 'manual' | 'auto' | 'mixed';

interface AICoachAssistantProps {
  userId: string;
  children: any[];
  onModeChange?: (mode: AIMode) => void;
  onPlayerModeChange?: (playerId: string, mode: AIMode) => void;
}

interface AITaskStatus {
  id: string;
  type: 'assessment' | 'drill_creation' | 'workout_creation' | 'commenting' | 'skill_evaluation' | 'weekly_summary' | 'anomaly_detection' | 'motivational_feedback';
  playerId?: string;
  playerName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface PlayerAISettings {
  playerId: string;
  playerName: string;
  mode: AIMode;
  autoAssessment: boolean;
  autoCommenting: boolean;
  autoSkillEvaluation: boolean;
  autoDrillCreation: boolean;
  autoWorkoutCreation: boolean;
}

export default function AICoachAssistant({ 
  userId, 
  children, 
  onModeChange, 
  onPlayerModeChange 
}: AICoachAssistantProps) {
  const [currentMode, setCurrentMode] = useState<AIMode>('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<AITaskStatus[]>([]);
  const [playerSettings, setPlayerSettings] = useState<PlayerAISettings[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [bulkOperations, setBulkOperations] = useState({
    selectedPlayers: [] as string[],
    operation: '',
    parameters: {}
  });

  // Initialize player settings
  useEffect(() => {
    const initialSettings = children.map(child => ({
      playerId: child.id,
      playerName: child.name,
      mode: 'manual' as AIMode,
      autoAssessment: false,
      autoCommenting: false,
      autoSkillEvaluation: false,
      autoDrillCreation: false,
      autoWorkoutCreation: false,
    }));
    setPlayerSettings(initialSettings);
  }, [children]);

  // Handle mode changes
  const handleModeChange = (mode: AIMode) => {
    setCurrentMode(mode);
    onModeChange?.(mode);
    
    // Update all player settings based on global mode
    if (mode === 'auto') {
      setPlayerSettings(prev => prev.map(setting => ({
        ...setting,
        mode: 'auto',
        autoAssessment: true,
        autoCommenting: true,
        autoSkillEvaluation: true,
        autoDrillCreation: true,
        autoWorkoutCreation: true,
      })));
    } else if (mode === 'manual') {
      setPlayerSettings(prev => prev.map(setting => ({
        ...setting,
        mode: 'manual',
        autoAssessment: false,
        autoCommenting: false,
        autoSkillEvaluation: false,
        autoDrillCreation: false,
        autoWorkoutCreation: false,
      })));
    }
  };

  // Handle individual player mode changes
  const handlePlayerModeChange = (playerId: string, mode: AIMode) => {
    setPlayerSettings(prev => prev.map(setting => 
      setting.playerId === playerId 
        ? { 
            ...setting, 
            mode,
            autoAssessment: mode === 'auto',
            autoCommenting: mode === 'auto',
            autoSkillEvaluation: mode === 'auto',
            autoDrillCreation: mode === 'auto',
            autoWorkoutCreation: mode === 'auto',
          }
        : setting
    ));
    onPlayerModeChange?.(playerId, mode);
  };

  // AI Task Management
  const addTask = (task: Omit<AITaskStatus, 'id' | 'createdAt'>) => {
    const newTask: AITaskStatus = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  };

  const updateTask = (taskId: string, updates: Partial<AITaskStatus>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, completedAt: updates.status === 'completed' ? new Date() : task.completedAt }
        : task
    ));
  };

  // AI Operations
  const generateBulkAssessments = async (playerIds: string[]) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'assessment',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        updateTask(taskId, { progress: 25 });
        
        // Call AI assessment API
        const response = await fetch('/api/ai/bulk-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            includeSkillAnalysis: true,
            includeRecommendations: true,
            includeGoals: true,
          }),
        });

        updateTask(taskId, { progress: 75 });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result 
          });
        } else {
          throw new Error('Assessment generation failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  const generateCustomDrills = async (playerIds: string[], parameters: any) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'drill_creation',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        const response = await fetch('/api/ai/create-custom-drill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            skillLevel: parameters.skillLevel,
            focusArea: parameters.focusArea,
            difficulty: parameters.difficulty,
            duration: parameters.duration,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result 
          });
        } else {
          throw new Error('Drill creation failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  const generateAutoComments = async (playerIds: string[], contentType: string) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'commenting',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        const response = await fetch('/api/ai/auto-comment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            contentType,
            generateEncouragement: true,
            generateTechnicalFeedback: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result 
          });
        } else {
          throw new Error('Comment generation failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  const generateSkillEvaluations = async (playerIds: string[]) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'skill_evaluation',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        const response = await fetch('/api/ai/skill-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            includeVideoAnalysis: true,
            includePerformanceMetrics: true,
            includeProgressTracking: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result 
          });
        } else {
          throw new Error('Skill evaluation failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  const generateWeeklySummaries = async (playerIds: string[]) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'weekly_summary',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        const response = await fetch('/api/ai/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'weekly_summary',
            targetUserId: playerId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result: result.result 
          });
        } else {
          throw new Error('Weekly summary generation failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  const detectAnomalies = async (playerIds: string[]) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'anomaly_detection',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        const response = await fetch('/api/ai/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'anomaly_detection',
            targetUserId: playerId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result: result.result 
          });
        } else {
          throw new Error('Anomaly detection failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  const generateMotivationalFeedback = async (playerIds: string[]) => {
    setIsProcessing(true);
    
    for (const playerId of playerIds) {
      const player = children.find(c => c.id === playerId);
      if (!player) continue;

      const taskId = addTask({
        type: 'motivational_feedback',
        playerId,
        playerName: player.name,
        status: 'processing',
        progress: 0,
      });

      try {
        const response = await fetch('/api/ai/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'motivational_feedback',
            targetUserId: playerId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          updateTask(taskId, { 
            status: 'completed', 
            progress: 100, 
            result: result.result 
          });
        } else {
          throw new Error('Motivational feedback generation failed');
        }
      } catch (error) {
        updateTask(taskId, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    setIsProcessing(false);
  };

  // Get AI insights
  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/ai/parent-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: userId,
          childrenIds: children.map(c => c.id),
        }),
      });

      if (response.ok) {
        const insights = await response.json();
        setAiInsights(insights);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const activeTasks = tasks.filter(task => task.status === 'processing');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const failedTasks = tasks.filter(task => task.status === 'failed');

  return (
    <div className="space-y-6">
      {/* AI Mode Selector */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Coach Assistant
            <Badge variant="secondary" className="ml-2">
              {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
            </Badge>
          </CardTitle>
          <CardDescription>
            Choose how AI assists you in managing your players' development
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${currentMode === 'manual' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleModeChange('manual')}
            >
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <h3 className="font-semibold">Manual Mode</h3>
                <p className="text-sm text-gray-600">You handle everything yourself</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${currentMode === 'auto' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleModeChange('auto')}
            >
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Auto Mode</h3>
                <p className="text-sm text-gray-600">AI handles everything automatically</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${currentMode === 'mixed' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleModeChange('mixed')}
            >
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Mixed Mode</h3>
                <p className="text-sm text-gray-600">Choose per player</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* AI Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{activeTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Mode</p>
                <p className="text-lg font-bold text-purple-600">
                  {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}
                </p>
              </div>
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mixed Mode Player Settings */}
      {currentMode === 'mixed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Individual Player AI Settings
            </CardTitle>
            <CardDescription>
              Configure AI assistance for each player individually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playerSettings.map((setting) => (
                <div key={setting.playerId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{setting.playerName}</h4>
                      <p className="text-sm text-gray-600">
                        Mode: {setting.mode.charAt(0).toUpperCase() + setting.mode.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={setting.mode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePlayerModeChange(setting.playerId, 'manual')}
                    >
                      Manual
                    </Button>
                    <Button
                      variant={setting.mode === 'auto' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePlayerModeChange(setting.playerId, 'auto')}
                    >
                      Auto
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Operations Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Operations
          </CardTitle>
          <CardDescription>
            Perform bulk AI operations on selected players
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Selection */}
          <div>
            <Label>Select Players</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {children.map((child) => (
                <div key={child.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`player-${child.id}`}
                    checked={bulkOperations.selectedPlayers.includes(child.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkOperations(prev => ({
                          ...prev,
                          selectedPlayers: [...prev.selectedPlayers, child.id]
                        }));
                      } else {
                        setBulkOperations(prev => ({
                          ...prev,
                          selectedPlayers: prev.selectedPlayers.filter(id => id !== child.id)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={`player-${child.id}`} className="text-sm">
                    {child.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => generateBulkAssessments(bulkOperations.selectedPlayers)}
              disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Generate Assessments
            </Button>

            <Button
              onClick={() => generateCustomDrills(bulkOperations.selectedPlayers, {
                skillLevel: 'adaptive',
                focusArea: 'improvement_areas',
                difficulty: 'progressive',
                duration: 'optimal'
              })}
              disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Create Custom Drills
            </Button>

            <Button
              onClick={() => generateAutoComments(bulkOperations.selectedPlayers, 'all')}
              disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Auto Comments
            </Button>

            <Button
              onClick={() => generateSkillEvaluations(bulkOperations.selectedPlayers)}
              disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Skill Evaluations
            </Button>
          </div>

          {/* AI Brain Operations */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-blue-600">AI Brain Operations</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => generateWeeklySummaries(bulkOperations.selectedPlayers)}
                disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-4 w-4" />
                Weekly Summaries
              </Button>

              <Button
                onClick={() => detectAnomalies(bulkOperations.selectedPlayers)}
                disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <AlertCircle className="h-4 w-4" />
                Detect Anomalies
              </Button>

              <Button
                onClick={() => generateMotivationalFeedback(bulkOperations.selectedPlayers)}
                disabled={isProcessing || bulkOperations.selectedPlayers.length === 0}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Sparkles className="h-4 w-4" />
                Motivational Feedback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active AI Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{task.playerName}</span>
                      <Badge variant="outline">{task.type.replace('_', ' ')}</Badge>
                    </div>
                    <span className="text-sm text-gray-600">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Team Performance</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {aiInsights.teamPerformance || 'Analyzing team performance...'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Improvement Areas</h4>
                <p className="text-sm text-green-700 mt-1">
                  {aiInsights.improvementAreas || 'Identifying improvement opportunities...'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Recommendations</h4>
                <p className="text-sm text-purple-700 mt-1">
                  {aiInsights.recommendations || 'Generating personalized recommendations...'}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900">Next Steps</h4>
                <p className="text-sm text-orange-700 mt-1">
                  {aiInsights.nextSteps || 'Planning next development steps...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}    