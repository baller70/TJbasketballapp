
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, PlayerProfile, DashboardStats } from '@/lib/types';
import DrillLibrary from '@/components/drills/drill-library';
import CalendarView from '@/components/calendar/calendar-view';
import TimerComponent from '@/components/timer/timer-component';
import WorkoutBuilder from '@/components/workout/workout-builder';
import AchievementsView from '@/components/achievements/achievements-view';
import AIChat from '@/components/ai/ai-chat';
import DailyInspiration from '@/components/daily-inspiration/daily-inspiration';

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

  useEffect(() => {
    fetchDashboardData();
    fetchMotivationalQuote();
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

  const levelInfo = {
    rookie: { next: 'Amateur', color: 'bg-gray-500', pointsNeeded: 500 },
    amateur: { next: 'Star', color: 'bg-blue-500', pointsNeeded: 1000 },
    star: { next: 'All-Star', color: 'bg-purple-500', pointsNeeded: 2000 },
    allstar: { next: 'Legend', color: 'bg-yellow-500', pointsNeeded: 5000 },
    legend: { next: 'Legend', color: 'bg-red-500', pointsNeeded: 10000 },
  };

  const currentLevel = user.playerProfile?.currentLevel || 'rookie';
  const levelData = levelInfo[currentLevel as keyof typeof levelInfo];

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
          <TabsList className="grid w-full grid-cols-6 bg-white border border-orange-100">
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
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Rewards
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
                          {stats.totalPoints}/{levelData.pointsNeeded} XP
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
                    <p className="text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        This week
                      </span>
                    </p>
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
                        <p className="text-sm text-gray-600 mb-1">Next Workout</p>
                        <p className="text-2xl font-bold text-gray-900">Tomorrow</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        Shooting Practice
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Jump into your practice session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700 text-white h-12"
                      onClick={() => setActiveTab('drills')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Drills
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 h-12"
                      onClick={() => setActiveTab('timer')}
                    >
                      <Timer className="h-4 w-4 mr-2" />
                      Start Timer
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 h-12"
                      onClick={() => setActiveTab('calendar')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="drills">
            <DrillLibrary />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="timer">
            <TimerComponent />
          </TabsContent>

          <TabsContent value="workouts">
            <WorkoutBuilder />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsView />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* AI Chat Component */}
      <AIChat />
    </div>
  );
}
