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
import { Crown, Star, Target, Trophy, Lock, CheckCircle, Clock, Plus, Edit, Trash2, Zap, Calendar, Award, Gift } from 'lucide-react';
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

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE';
  criteria: any;
  reward: any;
  timeLimit: number | null;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
}

interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  progress: number;
  startedAt: string;
  completedAt: string | null;
  challenge: Challenge;
}

export default function RewardSystem() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
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
    fetchChallenges();
  }, []);

  const fetchLevels = async () => {
    try {
      console.log('🔍 Fetching levels...');
      const response = await fetch('/api/levels');
      console.log('📡 Levels response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Levels data:', data);
        setLevels(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Levels error:', errorData);
        toast.error('Failed to fetch levels: ' + (errorData.error || 'Unknown error'));
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
      console.log('🔍 Fetching weekly goals...');
      const response = await fetch('/api/weekly-goals?active=true');
      console.log('📡 Weekly goals response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Weekly goals data:', data);
        setWeeklyGoals(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Weekly goals error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching weekly goals:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      console.log('🔍 Fetching challenges...');
      const response = await fetch('/api/challenges');
      console.log('📡 Challenges response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Challenges data:', data);
        setChallenges(data);
      } else {
        const errorData = await response.json();
        console.error('❌ Challenges error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to fetch challenges');
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
          rewards: levelForm.rewards ? JSON.parse(levelForm.rewards) : null
        })
      });

      if (response.ok) {
        toast.success('Level created successfully');
        setShowCreateLevel(false);
        setLevelForm({
          name: '',
          description: '',
          pointsRequired: '',
          badgeIcon: '🏀',
          badgeColor: '#10B981',
          rewards: ''
        });
        fetchLevels();
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
        toast.success('Goal created successfully');
        setShowCreateGoal(false);
        setGoalForm({
          levelId: '',
          name: '',
          description: '',
          type: 'DRILL_COMPLETION',
          criteria: '',
          points: '',
          isLevelTest: false
        });
        fetchLevels();
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
        toast.success('Weekly goal created successfully');
        setShowCreateWeeklyGoal(false);
        setWeeklyGoalForm({
          name: '',
          description: '',
          type: 'PRACTICE_FREQUENCY',
          criteria: '',
          points: '',
          startDate: '',
          endDate: ''
        });
        fetchWeeklyGoals();
      }
    } catch (error) {
      console.error('Error creating weekly goal:', error);
      toast.error('Failed to create weekly goal');
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 100 })
      });

      if (response.ok) {
        toast.success('Goal completed!');
        fetchLevels();
      }
    } catch (error) {
      console.error('Error completing goal:', error);
      toast.error('Failed to complete goal');
    }
  };

  const handleDeleteLevel = async (levelId: string) => {
    if (window.confirm('Are you sure you want to delete this level? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/levels/${levelId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Level deleted successfully');
          fetchLevels();
        } else {
          const errorData = await response.json();
          console.error('❌ Delete level error:', errorData);
          toast.error('Failed to delete level: ' + (errorData.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting level:', error);
        toast.error('Failed to delete level');
      }
    }
  };

  const handleCompleteWeeklyGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/weekly-goals/${goalId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Weekly goal completed successfully!');
        fetchWeeklyGoals();
      } else {
        const errorData = await response.json();
        console.error('❌ Complete weekly goal error:', errorData);
        toast.error('Failed to complete weekly goal: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error completing weekly goal:', error);
      toast.error('Failed to complete weekly goal');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return <Lock className="w-4 h-4 text-gray-400" />;
      case 'UNLOCKED':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'IN_PROGRESS':
      case 'ACTIVE':
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
      case 'ACTIVE':
        return 'bg-yellow-100 text-yellow-600';
      case 'COMPLETED':
        return 'bg-green-100 text-green-600';
      case 'FAILED':
        return 'bg-red-100 text-red-600';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'DAILY':
        return <Zap className="w-4 h-4" />;
      case 'WEEKLY':
        return <Calendar className="w-4 h-4" />;
      case 'MONTHLY':
        return <Trophy className="w-4 h-4" />;
      case 'MILESTONE':
        return <Award className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'DAILY':
        return 'bg-green-100 text-green-800';
      case 'WEEKLY':
        return 'bg-blue-100 text-blue-800';
      case 'MONTHLY':
        return 'bg-purple-100 text-purple-800';
      case 'MILESTONE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = (expiresAt: string | null, startedAt: string, timeLimit: number | null) => {
    if (!timeLimit) return 'No time limit';
    
    const started = new Date(startedAt);
    const expires = new Date(started.getTime() + timeLimit * 60 * 60 * 1000);
    const now = new Date();
    
    if (now > expires) return 'Expired';
    
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  // Filter challenges by status
  const activeChallenges = challenges.filter(c => c.status === 'ACTIVE');
  const completedChallenges = challenges.filter(c => c.status === 'COMPLETED');
  const expiredChallenges = challenges.filter(c => c.status === 'EXPIRED' || c.status === 'FAILED');

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
          <p className="text-gray-600">Track your progress through 10 levels with goals, weekly challenges, and special challenges</p>
        </div>
        <Button onClick={() => setShowCreateLevel(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Level
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="levels">Levels & Goals</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Goals</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          {levels.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No levels found</h3>
              <p className="text-gray-500 mb-4">
                {loading ? 'Loading levels...' : 'No levels are available yet. Create your first level to get started!'}
              </p>
              <Button onClick={() => setShowCreateLevel(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create First Level
              </Button>
            </div>
          ) : (
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
                              <Card key={goal.id} className={`${goal.isLevelTest ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{goal.name}</h4>
                                        {goal.isLevelTest && (
                                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                            Level Test
                                          </Badge>
                                        )}
                                        <Badge className={getStatusColor(goal.userProgress.status)}>
                                          {getStatusIcon(goal.userProgress.status)}
                                          {goal.userProgress.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                      <div className="flex justify-between text-sm">
                                        <span>Points: {goal.points}</span>
                                        <span>Progress: {goal.userProgress.progress}%</span>
                                      </div>
                                    </div>
                                    {goal.userProgress.status === 'UNLOCKED' && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleCompleteGoal(goal.id)}
                                        className="ml-2"
                                      >
                                        Complete
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {level.isCustom && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteLevel(level.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">This Week's Goals</h3>
            <Button onClick={() => setShowCreateWeeklyGoal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Weekly Goal
            </Button>
          </div>
          
          {weeklyGoals.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No weekly goals found</h3>
              <p className="text-gray-500 mb-4">
                No weekly goals are available yet. Create your first weekly goal to get started!
              </p>
              <Button onClick={() => setShowCreateWeeklyGoal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create First Weekly Goal
              </Button>
            </div>
          ) : (
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
                      <span>Duration</span>
                      <span>{new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}</span>
                    </div>

                    {goal.userProgress.status === 'ACTIVE' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteWeeklyGoal(goal.id)}
                        className="w-full"
                      >
                        Complete Goal
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Special Challenges</h3>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50">
                <Zap className="w-3 h-3 mr-1" />
                Daily
              </Badge>
              <Badge variant="outline" className="bg-blue-50">
                <Calendar className="w-3 h-3 mr-1" />
                Weekly
              </Badge>
              <Badge variant="outline" className="bg-purple-50">
                <Trophy className="w-3 h-3 mr-1" />
                Monthly
              </Badge>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
              <p className="text-gray-500 mb-4">
                No challenges are available yet. Check back later for new challenges!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Challenges */}
              {activeChallenges.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Active Challenges ({activeChallenges.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeChallenges.map((userChallenge) => (
                      <Card key={userChallenge.id} className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getChallengeTypeIcon(userChallenge.challenge.type)}
                              <CardTitle className="text-lg">{userChallenge.challenge.name}</CardTitle>
                            </div>
                            <Badge className={getChallengeTypeColor(userChallenge.challenge.type)}>
                              {userChallenge.challenge.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-700">{userChallenge.challenge.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{userChallenge.progress}%</span>
                            </div>
                            <Progress value={userChallenge.progress} />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Reward</span>
                            <span className="font-medium text-green-600">
                              {typeof userChallenge.challenge.reward === 'string' 
                                ? userChallenge.challenge.reward 
                                : userChallenge.challenge.reward.description || 'Special reward'}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Time Remaining</span>
                            <span className="font-medium text-orange-600">
                              {getTimeRemaining(userChallenge.challenge.expiresAt, userChallenge.startedAt, userChallenge.challenge.timeLimit)}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Started</span>
                            <span>{new Date(userChallenge.startedAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Challenges */}
              {completedChallenges.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Completed Challenges ({completedChallenges.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedChallenges.map((userChallenge) => (
                      <Card key={userChallenge.id} className="border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getChallengeTypeIcon(userChallenge.challenge.type)}
                              <CardTitle className="text-lg">{userChallenge.challenge.name}</CardTitle>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              COMPLETED
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-700">{userChallenge.challenge.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="text-green-600 font-medium">100%</span>
                            </div>
                            <Progress value={100} className="bg-green-200" />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Reward Earned</span>
                            <span className="font-medium text-green-600 flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              {typeof userChallenge.challenge.reward === 'string' 
                                ? userChallenge.challenge.reward 
                                : userChallenge.challenge.reward.description || 'Special reward'}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Completed</span>
                            <span>{userChallenge.completedAt ? new Date(userChallenge.completedAt).toLocaleDateString() : 'Recently'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message if no active or completed challenges */}
              {activeChallenges.length === 0 && completedChallenges.length === 0 && (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active challenges</h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any active challenges yet. Complete some drills to unlock new challenges!
                  </p>
                </div>
              )}
            </div>
          )}
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
                  <Crown className="w-5 h-5 text-purple-500" />
                  Current Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {levels.find(l => l.userProgress.status === 'IN_PROGRESS')?.levelNumber || 1}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Goals Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {levels.reduce((sum, level) => sum + level.userProgress.completedGoals, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {levels.slice(0, 5).map((level) => (
                  <div key={level.id} className="flex items-center gap-4">
                    <span className="text-2xl">{level.badgeIcon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{level.name}</span>
                        <span>{level.userProgress.completedGoals}/{level.userProgress.totalGoals}</span>
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
                placeholder="Enter emoji or icon"
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
                placeholder='{"special_item": "Basketball Legend Badge"}'
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
              <Label htmlFor="goalType">Goal Type</Label>
              <Select value={goalForm.type} onValueChange={(value) => setGoalForm({ ...goalForm, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRILL_COMPLETION">Drill Completion</SelectItem>
                  <SelectItem value="SKILL_PRACTICE">Skill Practice</SelectItem>
                  <SelectItem value="STREAK_MAINTENANCE">Streak Maintenance</SelectItem>
                  <SelectItem value="POINTS_ACCUMULATION">Points Accumulation</SelectItem>
                  <SelectItem value="LEVEL_TEST">Level Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goalPoints">Points</Label>
              <Input
                id="goalPoints"
                type="number"
                value={goalForm.points}
                onChange={(e) => setGoalForm({ ...goalForm, points: e.target.value })}
                placeholder="Enter points reward"
              />
            </div>
            <div>
              <Label htmlFor="goalCriteria">Criteria (JSON)</Label>
              <Textarea
                id="goalCriteria"
                value={goalForm.criteria}
                onChange={(e) => setGoalForm({ ...goalForm, criteria: e.target.value })}
                placeholder='{"drills_required": 5, "category": "shooting"}'
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isLevelTest"
                checked={goalForm.isLevelTest}
                onChange={(e) => setGoalForm({ ...goalForm, isLevelTest: e.target.checked })}
              />
              <Label htmlFor="isLevelTest">This is a level test</Label>
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
            <DialogTitle>Create New Weekly Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="weeklyGoalName">Goal Name</Label>
              <Input
                id="weeklyGoalName"
                value={weeklyGoalForm.name}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, name: e.target.value })}
                placeholder="Enter weekly goal name"
              />
            </div>
            <div>
              <Label htmlFor="weeklyGoalDescription">Description</Label>
              <Textarea
                id="weeklyGoalDescription"
                value={weeklyGoalForm.description}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, description: e.target.value })}
                placeholder="Enter weekly goal description"
              />
            </div>
            <div>
              <Label htmlFor="weeklyGoalType">Goal Type</Label>
              <Select value={weeklyGoalForm.type} onValueChange={(value) => setWeeklyGoalForm({ ...weeklyGoalForm, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRACTICE_FREQUENCY">Practice Frequency</SelectItem>
                  <SelectItem value="SKILL_FOCUS">Skill Focus</SelectItem>
                  <SelectItem value="DRILL_VARIETY">Drill Variety</SelectItem>
                  <SelectItem value="CONSISTENCY">Consistency</SelectItem>
                  <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weeklyGoalPoints">Points</Label>
              <Input
                id="weeklyGoalPoints"
                type="number"
                value={weeklyGoalForm.points}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, points: e.target.value })}
                placeholder="Enter points reward"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={weeklyGoalForm.startDate}
                  onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={weeklyGoalForm.endDate}
                  onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="weeklyGoalCriteria">Criteria (JSON)</Label>
              <Textarea
                id="weeklyGoalCriteria"
                value={weeklyGoalForm.criteria}
                onChange={(e) => setWeeklyGoalForm({ ...weeklyGoalForm, criteria: e.target.value })}
                placeholder='{"sessions_required": 5, "min_duration": 30}'
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