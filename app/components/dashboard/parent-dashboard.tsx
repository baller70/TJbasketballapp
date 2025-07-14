
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  Bell, 
  Settings, 
  TrendingUp,
  Calendar,
  Trophy,
  Star,
  Clock,
  Target,
  Play,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, DrillCompletion, Notification, ParentDashboardData } from '@/lib/types';

interface ParentDashboardProps {
  user: User & { children: (User & { playerProfile: any })[] };
}

export default function ParentDashboard({ user }: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<ParentDashboardData>({
    children: [],
    recentActivities: [],
    notifications: [],
    weeklyProgress: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/parent/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'PATCH',
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'drill_completed':
        return <Trophy className="h-4 w-4 text-orange-600" />;
      case 'achievement_unlocked':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'streak_milestone':
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const unreadNotifications = dashboardData.notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HoopsQuest Parent</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-gray-900">{user.children?.length || 0}</span>
                <span className="text-sm text-gray-600">Children</span>
              </div>
              {unreadNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  <Badge variant="destructive" className="text-xs">
                    {unreadNotifications.length}
                  </Badge>
                </div>
              )}
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
          <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-100">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Children
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Parent Dashboard 👨‍👩‍👧‍👦
                      </h2>
                      <p className="text-blue-100 mb-4">
                        Monitor your children's basketball progress and achievements
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-white text-blue-600 font-semibold">
                          {user.children?.length || 0} Children
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span className="text-sm">Active Monitoring</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{dashboardData.recentActivities.length}</div>
                      <div className="text-blue-100 text-sm">Recent Activities</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Children Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.children?.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-blue-100 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{child.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {child.playerProfile?.skillLevel || 'Beginner'} • {child.playerProfile?.currentLevel || 'Rookie'}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Points</span>
                          <span className="font-semibold">{child.playerProfile?.totalPoints || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Streak</span>
                          <span className="font-semibold">{child.playerProfile?.currentStreak || 0} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">This Week</span>
                          <span className="font-semibold">
                            {dashboardData.weeklyProgress[child.id]?.completed || 0}/
                            {dashboardData.weeklyProgress[child.id]?.scheduled || 0}
                          </span>
                        </div>
                        <Progress 
                          value={dashboardData.weeklyProgress[child.id]?.completed 
                            ? (dashboardData.weeklyProgress[child.id].completed / (dashboardData.weeklyProgress[child.id].scheduled || 1)) * 100 
                            : 0} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest activities from your children
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        {getActivityIcon('drill_completed')}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Completed "{activity.drill.name}"
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(activity.completedAt).toLocaleDateString()} • 
                            {Math.floor(activity.duration / 60)}min {activity.duration % 60}s
                          </p>
                        </div>
                        {activity.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{activity.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {dashboardData.recentActivities.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No recent activities yet. Encourage your children to start practicing!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="children">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {user.children?.map((child) => (
                <Card key={child.id} className="border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {child.name}
                    </CardTitle>
                    <CardDescription>
                      {child.playerProfile?.skillLevel || 'Beginner'} Level • 
                      {child.playerProfile?.favoritePosition || 'No position set'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {child.playerProfile?.totalPoints || 0}
                          </div>
                          <div className="text-sm text-gray-600">Total Points</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {child.playerProfile?.currentStreak || 0}
                          </div>
                          <div className="text-sm text-gray-600">Day Streak</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current Level</span>
                          <Badge variant="outline">
                            {child.playerProfile?.currentLevel || 'Rookie'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Longest Streak</span>
                          <span className="font-semibold">
                            {child.playerProfile?.longestStreak || 0} days
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Active</span>
                          <span className="text-sm">
                            {child.playerProfile?.lastActiveDate 
                              ? new Date(child.playerProfile.lastActiveDate).toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Goals</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Daily: {child.playerProfile?.goals?.daily || 'No goal set'}</div>
                          <div>Weekly: {child.playerProfile?.goals?.weekly || 'No goal set'}</div>
                          <div>Monthly: {child.playerProfile?.goals?.monthly || 'No goal set'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Activity Feed
                </CardTitle>
                <CardDescription>
                  Complete history of your children's basketball activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">Drill Completed</p>
                          <span className="text-sm text-gray-500">
                            {new Date(activity.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Completed "{activity.drill.name}" 
                          {activity.rating && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {activity.rating}/5
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(activity.duration / 60)}min {activity.duration % 60}s
                          </span>
                          <span>Category: {activity.drill.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.recentActivities.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No activities yet. Your children haven't started practicing!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notifications
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadNotifications.length} unread
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Stay updated on your children's progress and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${
                        notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              notification.read ? 'bg-gray-400' : 'bg-blue-600'
                            }`} />
                            <p className="font-medium">{notification.title}</p>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {dashboardData.notifications.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No notifications yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
