'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Star, Target, Trophy, Lock, CheckCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Level {
  id: string;
  levelNumber: number;
  name: string;
  description: string;
  pointsRequired: number;
  badgeIcon: string;
  badgeColor: string;
  rewards: any;
  isCustom: boolean;
  userProgress: {
    status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    completedGoals: number;
    totalGoals: number;
    totalPoints: number;
  };
  goals: Goal[];
}

interface Goal {
  id: string;
  goalNumber: number;
  name: string;
  description: string;
  type: string;
  criteria: any;
  points: number;
  isLevelTest: boolean;
  isCustom: boolean;
  userProgress: {
    status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    progress: number;
    pointsEarned: number;
  };
}

interface WeeklyGoal {
  id: string;
  name: string;
  description: string;
  type: string;
  criteria: any;
  points: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCustom: boolean;
  userProgress: {
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';
    progress: number;
    pointsEarned: number;
  };
}

export default function RewardSystem() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [activeTab, setActiveTab] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateLevel, setShowCreateLevel] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showCreateWeeklyGoal, setShowCreateWeeklyGoal] = useState(false);

  // Form states
  const [levelForm, setLevelForm] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    badgeIcon: '🏀',
    badgeColor: '#10B981',
    rewards: ''
  });

  const [goalForm, setGoalForm] = useState({
    levelId: '',
    name: '',
    description: '',
    type: 'DRILL_COMPLETION',
    criteria: '',
    points: '',
    isLevelTest: false
  });

  const [weeklyGoalForm, setWeeklyGoalForm] = useState({
    name: '',
    description: '',
    type: 'PRACTICE_FREQUENCY',
    criteria: '',
    points: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLevels();
    fetchWeeklyGoals();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/levels');
      if (response.ok) {
        const data = await response.json();
        setLevels(data);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Failed to fetch levels');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyGoals = async () => {
    try {
      const response = await fetch('/api/weekly-goals?active=true');
      if (response.ok) {
        const data = await response.json();
        setWeeklyGoals(data);
      }
    } catch (error) {
      console.error('Error fetching weekly goals:', error);
    }
  };

  const handleCreateLevel = async () => {
    try {
      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...levelForm,
          pointsRequired: parseInt(levelForm.pointsRequired),
          rewards: levelForm.rewards ? JSON.parse(levelForm.rewards) : {}
        })
      });

      if (response.ok) {
        toast.success('Level created successfully!');
        setShowCreateLevel(false);
        setLevelForm({ name: '', description: '', pointsRequired: '', badgeIcon: '🏀', badgeColor: '#10B981', rewards: '' });
        fetchLevels();
      } else {
        toast.error('Failed to create level');
      }
    } catch (error) {
      console.error('Error creating level:', error);
      toast.error('Failed to create level');
    }
  };

  const handleCreateGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goalForm,
          points: parseInt(goalForm.points),
          criteria: goalForm.criteria ? JSON.parse(goalForm.criteria) : {}
        })
      });

      if (response.ok) {
        toast.success('Goal created successfully!');
        setShowCreateGoal(false);
        setGoalForm({ levelId: '', name: '', description: '', type: 'DRILL_COMPLETION', criteria: '', points: '', isLevelTest: false });
        fetchLevels();
      } else {
        toast.error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    }
  };

  const handleCreateWeeklyGoal = async () => {
    try {
      const response = await fetch('/api/weekly-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...weeklyGoalForm,
          points: parseInt(weeklyGoalForm.points),
          criteria: weeklyGoalForm.criteria ? JSON.parse(weeklyGoalForm.criteria) : {}
        })
      });

      if (response.ok) {
        toast.success('Weekly goal created successfully!');
        setShowCreateWeeklyGoal(false);
        setWeeklyGoalForm({ name: '', description: '', type: 'PRACTICE_FREQUENCY', criteria: '', points: '', startDate: '', endDate: '' });
        fetchWeeklyGoals();
      } else {
        toast.error('Failed to create weekly goal');
      }
    } catch (error) {
      console.error('Error creating weekly goal:', error);
      toast.error('Failed to create weekly goal');
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number, completed: boolean = false) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, completed })
      });

      if (response.ok) {
        toast.success('Progress updated!');
        fetchLevels();
      } else {
        toast.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return <Lock className="w-4 h-4 text-gray-400" />;
      case 'UNLOCKED':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return 'bg-gray-100 text-gray-600';
      case 'UNLOCKED':
        return 'bg-blue-100 text-blue-600';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-600';
      case 'COMPLETED':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reward System</h2>
          <p className="text-gray-600">Track your progress through 10 levels with goals and weekly challenges</p>
        </div>
        <Button onClick={() => setShowCreateLevel(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Level
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="levels">Levels & Goals</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Goals</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => (
              <Card key={level.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{level.badgeIcon}</span>
                      <div>
                        <CardTitle className="text-lg">{level.name}</CardTitle>
                        <p className="text-sm text-gray-600">Level {level.levelNumber}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(level.userProgress.status)}>
                      {getStatusIcon(level.userProgress.status)}
                      {level.userProgress.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{level.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Goals Progress</span>
                      <span>{level.userProgress.completedGoals}/{level.userProgress.totalGoals}</span>
                    </div>
                    <Progress value={(level.userProgress.completedGoals / level.userProgress.totalGoals) * 100} />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Points Required</span>
                    <span>{level.pointsRequired}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Points Earned</span>
                    <span>{level.userProgress.totalPoints}</span>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Goals
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-2xl">{level.badgeIcon}</span>
                            {level.name} - Goals
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {level.goals.map((goal) => (
                            <Card key={goal.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">Goal {goal.goalNumber}</span>
                                    {goal.isLevelTest && (
                                      <Badge variant="destructive">Level Test</Badge>
                                    )}
                                    <Badge className={getStatusColor(goal.userProgress.status)}>
                                      {getStatusIcon(goal.userProgress.status)}
                                      {goal.userProgress.status}
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium">{goal.name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span>Points: {goal.points}</span>
                                    <span>Type: {goal.type}</span>
                                  </div>
                                  <div className="mt-2">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Progress</span>
                                      <span>{goal.userProgress.progress}%</span>
                                    </div>
                                    <Progress value={goal.userProgress.progress} />
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {goal.userProgress.status === 'UNLOCKED' || goal.userProgress.status === 'IN_PROGRESS' ? (
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateGoalProgress(goal.id, 100, true)}
                                    >
                                      Complete
                                    </Button>
                                  ) : null}
                                  {goal.isCustom && (
                                    <Button variant="outline" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                          <Button 
                            onClick={() => {
                              setGoalForm({ ...goalForm, levelId: level.id });
                              setShowCreateGoal(true);
                            }}
                            className="w-full"
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Goal
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {level.isCustom && (
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">This Week's Goals</h3>
            <Button onClick={() => setShowCreateWeeklyGoal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Weekly Goal
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <Badge className={getStatusColor(goal.userProgress.status)}>
                      {goal.userProgress.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{goal.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.userProgress.progress}%</span>
                    </div>
                    <Progress value={goal.userProgress.progress} />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Points</span>
                    <span>{goal.points}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Period</span>
                    <span>{new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}</span>
                  </div>

                  {goal.isCustom && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {levels.reduce((sum, level) => sum + level.userProgress.totalPoints, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Completed Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {levels.reduce((sum, level) => sum + level.userProgress.completedGoals, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-500" />
                  Current Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {levels.find(l => l.userProgress.status === 'IN_PROGRESS' || l.userProgress.status === 'UNLOCKED')?.levelNumber || 1}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Level Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {levels.map((level) => (
                  <div key={level.id} className="flex items-center gap-4">
                    <span className="text-2xl">{level.badgeIcon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{level.name}</span>
                        <span className="text-sm text-gray-600">
                          {level.userProgress.completedGoals}/{level.userProgress.totalGoals} goals
                        </span>
                      </div>
                      <Progress value={(level.userProgress.completedGoals / level.userProgress.totalGoals) * 100} />
                    </div>
                    <Badge className={getStatusColor(level.userProgress.status)}>
                      {level.userProgress.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Level Dialog */}
      <Dialog open={showCreateLevel} onOpenChange={setShowCreateLevel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Level</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="levelName">Level Name</Label>
              <Input
                id="levelName"
                value={levelForm.name}
                onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                placeholder="Enter level name"
              />
            </div>
            <div>
              <Label htmlFor="levelDescription">Description</Label>
              <Textarea
                id="levelDescription"
                value={levelForm.description}
                onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                placeholder="Enter level description"
              />
            </div>
            <div>
              <Label htmlFor="pointsRequired">Points Required</Label>
              <Input
                id="pointsRequired"
                type="number"
                value={levelForm.pointsRequired}
                onChange={(e) => setLevelForm({ ...levelForm, pointsRequired: e.target.value })}
                placeholder="Enter points required"
              />
            </div>
            <div>
              <Label htmlFor="badgeIcon">Badge Icon</Label>
              <Input
                id="badgeIcon"
                value={levelForm.badgeIcon}
                onChange={(e) => setLevelForm({ ...levelForm, badgeIcon: e.target.value })}
                placeholder="Enter emoji for badge"
              />
            </div>
            <div>
              <Label htmlFor="badgeColor">Badge Color</Label>
              <Input
                id="badgeColor"
                type="color"
                value={levelForm.badgeColor}
                onChange={(e) => setLevelForm({ ...levelForm, badgeColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="rewards">Rewards (JSON)</Label>
              <Textarea
                id="rewards"
                value={levelForm.rewards}
                onChange={(e) => setLevelForm({ ...levelForm, rewards: e.target.value })}
                placeholder='{"badge": "Custom Badge", "unlocks": ["Feature 1", "Feature 2"]}'
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateLevel} className="flex-1">
                Create Level
              </Button>
              <Button variant="outline" onClick={() => setShowCreateLevel(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalLevel">Level</Label>
              <Select value={goalForm.levelId} onValueChange={(value) => setGoalForm({ ...goalForm, levelId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="Enter goal name"
              />
            </div>
            <div>
              <Label htmlFor="goalDescription">Description</Label>
              <Textarea
                id="goalDescription"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Enter goal description"
              />
            </div>
            <div>
              <Label htmlFor="goalType">Type</Label>
              <Select value={goalForm.type} onValueChange={(value) => setGoalForm({ ...goalForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRILL_COMPLETION">Drill Completion</SelectItem>
                  <SelectItem value="SKILL_PRACTICE">Skill Practice</SelectItem>
                  <SelectItem value="STREAK_MAINTENANCE">Streak Maintenance</SelectItem>
                  <SelectItem value="POINTS_ACCUMULATION">Points Accumulation</SelectItem>
                  <SelectItem value="LEVEL_TEST">Level Test</SelectItem>
                  <SelectItem value="CUSTOM_CHALLENGE">Custom Challenge</SelectItem>
                  <SelectItem value="TEAM_PARTICIPATION">Team Participation</SelectItem>
                  <SelectItem value="IMPROVEMENT_TRACKING">Improvement Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goalCriteria">Criteria (JSON)</Label>
              <Textarea
                id="goalCriteria"
                value={goalForm.criteria}
                onChange={(e) => setGoalForm({ ...goalForm, criteria: e.target.value })}
                placeholder='{"skillType": "shooting", "shots": 10, "accuracy": 80}'
              />
            </div>
            <div>
              <Label htmlFor="goalPoints">Points</Label>
              <Input
                id="goalPoints"
                type="number"
                value={goalForm.points}
                onChange={(e) => setGoalForm({ ...goalForm, points: e.target.value })}
                placeholder="Enter points"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateGoal} className="flex-1">
                Create Goal
              </Button>
              <Button variant="outline" onClick={() => setShowCreateGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Weekly Goal Dialog */}
      <Dialog open={showCreateWeeklyGoal} onOpenChange={setShowCreateWeeklyGoal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Weekly Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="weeklyGoalName">Goal Name</Label>
              <Input
                id="weeklyGoalName"
                value={weeklyGoalForm.name}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, name: e.target.value })}
                placeholder="Enter goal name"
              />
            </div>
            <div>
              <Label htmlFor="weeklyGoalDescription">Description</Label>
              <Textarea
                id="weeklyGoalDescription"
                value={weeklyGoalForm.description}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, description: e.target.value })}
                placeholder="Enter goal description"
              />
            </div>
            <div>
              <Label htmlFor="weeklyGoalType">Type</Label>
              <Select value={weeklyGoalForm.type} onValueChange={(value) => setWeeklyGoalForm({ ...weeklyGoalForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRACTICE_FREQUENCY">Practice Frequency</SelectItem>
                  <SelectItem value="SKILL_FOCUS">Skill Focus</SelectItem>
                  <SelectItem value="DRILL_VARIETY">Drill Variety</SelectItem>
                  <SelectItem value="CONSISTENCY">Consistency</SelectItem>
                  <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                  <SelectItem value="TEAM_ACTIVITY">Team Activity</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weeklyGoalCriteria">Criteria (JSON)</Label>
              <Textarea
                id="weeklyGoalCriteria"
                value={weeklyGoalForm.criteria}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, criteria: e.target.value })}
                placeholder='{"sessions": 4, "timeframe": "week"}'
              />
            </div>
            <div>
              <Label htmlFor="weeklyGoalPoints">Points</Label>
              <Input
                id="weeklyGoalPoints"
                type="number"
                value={weeklyGoalForm.points}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, points: e.target.value })}
                placeholder="Enter points"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateWeeklyGoal} className="flex-1">
                Create Weekly Goal
              </Button>
              <Button variant="outline" onClick={() => setShowCreateWeeklyGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 