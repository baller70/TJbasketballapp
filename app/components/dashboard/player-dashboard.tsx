
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Calendar, 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  TrendingUp,
  BookOpen,
  Timer,
  Award,
  MessageCircle,
  Settings,
  LogOut,
  History,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, PlayerProfile, DashboardStats } from '@/lib/types';
import DrillLibrary from '@/components/drills/drill-library';
import CalendarView from '@/components/calendar/calendar-view';
import TimerComponent from '@/components/timer/timer-component';
import WorkoutBuilder from '@/components/workout/workout-builder';
import AchievementsView from '@/components/achievements/achievements-view';
import AIChat from '@/components/ai/ai-chat';
import DailyInspiration from '@/components/daily-inspiration/daily-inspiration';
import { RewardSystem } from '@/components/rewards/reward-system';
import ProfileView from '@/components/profile/profile-view';

interface SkillAssessment {
  id: string;
  assessedBy: string;
  assessorName: string;
  assessedAt: string;
  overallComment: string;
  skills: {
    ballHandling: number;
    shooting: number;
    passing: number;
    defense: number;
    rebounding: number;
    footwork: number;
    conditioning: number;
    teamwork: number;
    leadership: number;
    basketballIQ: number;
  };
  skillComments: {
    [key: string]: string;
  };
  recommendations: string[];
  nextAssessmentDate?: string;
  isNew?: boolean;
}

interface PlayerDashboardProps {
  user: User & { playerProfile: PlayerProfile };
}

export default function PlayerDashboard({ user }: PlayerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalDrills: 0,
    completedDrills: 0,
    currentStreak: 0,
    totalPoints: 0,
    averageRating: 0,
    weeklyGoal: 7,
    weeklyProgress: 0,
  });
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [assessmentHistory, setAssessmentHistory] = useState<SkillAssessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [newAssessmentNotification, setNewAssessmentNotification] = useState(false);

  // AI Enhanced Commenting System
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isAiCommentMode, setIsAiCommentMode] = useState(false);
  const [aiCommentSuggestions, setAiCommentSuggestions] = useState<string[]>([]);
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);
  const [selectedCommentType, setSelectedCommentType] = useState<'encouragement' | 'technical' | 'improvement' | 'general'>('encouragement');

  const skillLabels = {
    ballHandling: 'Ball Handling',
    shooting: 'Shooting',
    passing: 'Passing',
    defense: 'Defense',
    rebounding: 'Rebounding',
    footwork: 'Footwork',
    conditioning: 'Conditioning',
    teamwork: 'Teamwork',
    leadership: 'Leadership',
    basketballIQ: 'Basketball IQ'
  };

  useEffect(() => {
    fetchDashboardData();
    fetchMotivationalQuote();
    fetchAssessmentHistory();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchMotivationalQuote = async () => {
    try {
      const response = await fetch('/api/ai/motivational-quote');
      if (response.ok) {
        const data = await response.json();
        setMotivationalQuote(data.quote);
      }
    } catch (error) {
      console.error('Error fetching motivational quote:', error);
    }
  };

  const fetchAssessmentHistory = async () => {
    try {
      // Fetch real assessment data from API
      const response = await fetch(`/api/users/${user.id}/assessments`);
      
      if (response.ok) {
        const data = await response.json();
        const assessments = data.assessments.map((assessment: any) => ({
          id: assessment.id,
          assessedBy: assessment.assessorId,
          assessorName: assessment.assessorName,
          assessedAt: assessment.assessmentDate,
          overallComment: assessment.feedback?.parentNotes || assessment.feedback?.strengths || '',
          skills: assessment.skillRatings,
          skillComments: assessment.skillComments,
          recommendations: assessment.feedback?.specificGoals ? assessment.feedback.specificGoals.split(', ') : [],
          nextAssessmentDate: null,
          isNew: false // Mark as new if created in last 24 hours
        }));
        
        setAssessmentHistory(assessments);
        
        // Check for new assessments (created in last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const hasNewAssessment = assessments.some((assessment: any) => 
          new Date(assessment.assessedAt) > oneDayAgo
        );
        setNewAssessmentNotification(hasNewAssessment);
      } else {
        // Fallback to mock data if API fails
        console.log('Assessment API not available, using mock data');
        const mockAssessments: SkillAssessment[] = [
          {
            id: 'mock-assessment1',
            assessedBy: 'coach1',
            assessorName: 'Coach Smith',
            assessedAt: new Date().toISOString(),
            overallComment: 'Great improvement in ball handling and passing. Keep working on defensive positioning.',
            skills: {
              ballHandling: 8,
              shooting: 7,
              passing: 9,
              defense: 6,
              rebounding: 5,
              footwork: 7,
              conditioning: 8,
              teamwork: 9,
              leadership: 7,
              basketballIQ: 8
            },
            skillComments: {
              ballHandling: 'Excellent crossover technique improvement',
              shooting: 'Consistent form, work on range',
              passing: 'Outstanding court vision',
              defense: 'Focus on stance and positioning'
            },
            recommendations: [
              'Practice defensive slides daily',
              'Work on shooting from different angles',
              'Continue developing leadership skills'
            ],
            nextAssessmentDate: '2024-02-15',
            isNew: true
          }
        ];
        
        setAssessmentHistory(mockAssessments);
        setNewAssessmentNotification(true);
      }
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      setAssessmentHistory([]);
    }
  };

  const markAssessmentAsRead = (assessmentId: string) => {
    setAssessmentHistory(prev => 
      prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, isNew: false }
          : assessment
      )
    );
    
    // Check if there are any remaining new assessments
    const remainingNew = assessmentHistory.filter(a => a.id !== assessmentId && a.isNew);
    if (remainingNew.length === 0) {
      setNewAssessmentNotification(false);
    }
  };

  // AI Enhanced Commenting Functions
  const openCommentBox = (activityId: string) => {
    setSelectedActivityId(activityId);
    setShowCommentBox(true);
    setCommentText('');
    setAiCommentSuggestions([]);
    setIsAiCommentMode(false);
  };

  const closeCommentBox = () => {
    setShowCommentBox(false);
    setSelectedActivityId(null);
    setCommentText('');
    setAiCommentSuggestions([]);
    setIsAiCommentMode(false);
  };

  const generateAiCommentSuggestions = async () => {
    if (!selectedActivityId) return;
    
    setIsGeneratingComment(true);
    try {
      const response = await fetch('/api/ai/auto-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: selectedActivityId,
          activityType: 'assessment',
          commentType: selectedCommentType,
          context: 'player_dashboard'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiCommentSuggestions(data.suggestions || []);
        setIsAiCommentMode(true);
      }
    } catch (error) {
      console.error('Error generating AI comment suggestions:', error);
    } finally {
      setIsGeneratingComment(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !selectedActivityId) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: selectedActivityId,
          content: commentText,
          type: selectedCommentType,
          isAiGenerated: isAiCommentMode,
          context: 'assessment'
        }),
      });

      if (response.ok) {
        closeCommentBox();
        // Refresh assessment history to show new comment
        await fetchAssessmentHistory();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const levelInfo = {
    rookie: { next: 'Amateur', color: 'bg-gray-500', pointsNeeded: 500 },
    amateur: { next: 'Star', color: 'bg-blue-500', pointsNeeded: 1000 },
    star: { next: 'All-Star', color: 'bg-purple-500', pointsNeeded: 2000 },
    allstar: { next: 'Legend', color: 'bg-yellow-500', pointsNeeded: 5000 },
    legend: { next: 'Legend', color: 'bg-red-500', pointsNeeded: 10000 },
  };

  const currentLevel = user.playerProfile?.currentLevel || 'rookie';
  const levelData = levelInfo[currentLevel as keyof typeof levelInfo] || levelInfo.rookie;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HoopsQuest</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {newAssessmentNotification && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">New Assessment!</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-gray-900">{stats.totalPoints}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-gray-900">{stats.currentStreak}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-white border border-orange-100">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="drills" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Drills
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Assessments
              {newAssessmentNotification && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Hey {user.name?.split(' ')[0]}! 🏀
                      </h2>
                      <p className="text-orange-100 mb-4">
                        {motivationalQuote || "Ready to take your game to the next level?"}
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-white text-orange-600 font-semibold">
                          {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="text-sm">Streak: {stats.currentStreak} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{stats.totalPoints}</div>
                      <div className="text-orange-100 text-sm">Total Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Inspiration Section */}
            <DailyInspiration userId={user.id} />

            {/* Big Cards Row - User Level and Weekly Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-orange-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-600" />
                      Player Level
                    </CardTitle>
                    <CardDescription>Track your basketball journey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-900 capitalize">
                          {currentLevel}
                        </p>
                        <p className="text-sm text-gray-600">Current Level</p>
                      </div>
                      <div className={`w-16 h-16 ${levelData.color} rounded-full flex items-center justify-center`}>
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress to {levelData.next}</span>
                        <span className="text-sm text-gray-600">
                          {Math.round((stats.totalPoints / levelData.pointsNeeded) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(stats.totalPoints / levelData.pointsNeeded) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {levelData.pointsNeeded - stats.totalPoints} XP needed for next level
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.totalPoints}</p>
                        <p className="text-xs text-gray-600">Total XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.currentStreak}</p>
                        <p className="text-xs text-gray-600">Day Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-orange-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Weekly Goals
                    </CardTitle>
                    <CardDescription>Stay on track with your training</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.weeklyProgress}/{stats.weeklyGoal}
                        </p>
                        <p className="text-sm text-gray-600">Sessions This Week</p>
                      </div>
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Weekly Progress</span>
                        <span className="text-sm text-gray-600">
                          {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {stats.weeklyGoal - stats.weeklyProgress} sessions remaining this week
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {stats.weeklyProgress > 0 ? Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100) : 0}%
                        </p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{7 - new Date().getDay()}</p>
                        <p className="text-xs text-gray-600">Days Left</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Smaller Cards Row - Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-orange-100 hover:shadow-lg transition-shadow h-32">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Drills Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedDrills}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stats.averageRating > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {stats.averageRating.toFixed(1)} avg rating
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-gray-400" />
                          No ratings yet
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-orange-100 hover:shadow-lg transition-shadow h-32">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Workouts Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.weeklyProgress}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Play className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">This week</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-orange-100 hover:shadow-lg transition-shadow h-32">
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Assessments</p>
                        <p className="text-2xl font-bold text-gray-900">{assessmentHistory.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {assessmentHistory.filter(a => a.isNew).length > 0 ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <AlertCircle className="h-4 w-4" />
                          {assessmentHistory.filter(a => a.isNew).length} new
                        </span>
                      ) : (
                        'All up to date'
                      )}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="drills" className="space-y-6">
            <DrillLibrary />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView />
          </TabsContent>

          <TabsContent value="timer" className="space-y-6">
            <TimerComponent />
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <WorkoutBuilder />
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  My Skill Assessments
                </CardTitle>
                <CardDescription>
                  View your skill assessments and track your progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentHistory.map((assessment) => (
                    <Card key={assessment.id} className={`p-4 ${assessment.isNew ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{assessment.assessorName}</p>
                              {assessment.isNew && (
                                <Badge className="bg-blue-500 text-white">New!</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(assessment.assessedAt).toLocaleDateString()} at {new Date(assessment.assessedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCommentBox(assessment.id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Comment
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssessmentId(
                                selectedAssessmentId === assessment.id ? null : assessment.id
                              );
                              if (assessment.isNew) {
                                markAssessmentAsRead(assessment.id);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {selectedAssessmentId === assessment.id ? 'Hide' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {assessment.overallComment}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">
                          {assessment.recommendations.length} recommendations
                        </Badge>
                        {assessment.nextAssessmentDate && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Next: {new Date(assessment.nextAssessmentDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      <AnimatePresence>
                        {selectedAssessmentId === assessment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t space-y-6"
                          >
                            {/* Skills Breakdown */}
                            <div>
                              <h4 className="font-medium mb-3">Skill Ratings</h4>
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(assessment.skills).map(([skill, value]) => (
                                  <div key={skill} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{skillLabels[skill as keyof typeof skillLabels]}</span>
                                      <span className="text-sm text-gray-600">{value}/10</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                      <div
                                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                        style={{ width: `${(value / 10) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Skill Comments */}
                            {Object.keys(assessment.skillComments).length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Detailed Feedback</h4>
                                <div className="space-y-3">
                                  {Object.entries(assessment.skillComments).map(([skill, comment]) => (
                                    <div key={skill} className="bg-gray-50 p-3 rounded-lg">
                                      <p className="font-medium text-sm text-gray-900 mb-1">
                                        {skillLabels[skill as keyof typeof skillLabels]}
                                      </p>
                                      <p className="text-sm text-gray-600">{comment}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            <div>
                              <h4 className="font-medium mb-3">Recommendations</h4>
                              <div className="space-y-2">
                                {assessment.recommendations.map((rec, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">{rec}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                  
                  {assessmentHistory.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No Assessments Yet</h3>
                      <p className="text-sm">Your coach will create skill assessments to track your progress.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <RewardSystem />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileView user={{
              ...user, 
              name: user.name || 'Unknown User',
              playerProfile: {
                ...user.playerProfile,
                favoritePosition: user.playerProfile?.favoritePosition || 'Point Guard'
              }
            }} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* AI Chat Component */}
      <AIChat />

      {/* AI Enhanced Commenting Dialog */}
      <Dialog open={showCommentBox} onOpenChange={setShowCommentBox}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Add Comment
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Add your comment or use AI to generate suggestions based on the assessment.
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Comment Type:</label>
              <Select value={selectedCommentType} onValueChange={(value) => setSelectedCommentType(value as 'encouragement' | 'technical' | 'improvement' | 'general')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="encouragement">Encouragement</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isAiCommentMode ? "default" : "outline"}
                onClick={() => setIsAiCommentMode(!isAiCommentMode)}
                size="sm"
              >
                {isAiCommentMode ? "AI Mode On" : "AI Mode Off"}
              </Button>
              {isAiCommentMode && (
                <Button
                  variant="outline"
                  onClick={generateAiCommentSuggestions}
                  disabled={isGeneratingComment}
                  size="sm"
                >
                  {isGeneratingComment ? "Generating..." : "Generate AI Suggestions"}
                </Button>
              )}
            </div>

            {isAiCommentMode && aiCommentSuggestions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Suggestions:</label>
                {aiCommentSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => setCommentText(suggestion)}
                  >
                    <p className="text-sm text-blue-900">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Comment:</label>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Write your ${selectedCommentType} comment here...`}
                className="min-h-[100px]"
              />
            </div>

            {isAiCommentMode && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>AI Mode:</span>
                <span>Type: {selectedCommentType}</span>
              </div>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={closeCommentBox}>
                Cancel
              </Button>
              <Button onClick={submitComment} disabled={!commentText.trim()}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Submit Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
