
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Award,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Achievement, UserAchievement, Challenge, UserChallenge } from '@/lib/types';

export default function AchievementsView() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState('rookie');

  useEffect(() => {
    fetchAchievements();
    fetchChallenges();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.userAchievements || []);
        setAvailableAchievements(data.availableAchievements || []);
        setTotalPoints(data.totalPoints || 0);
        setCurrentLevel(data.currentLevel || 'rookie');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      starter: 'bg-gray-100 text-gray-800',
      common: 'bg-blue-100 text-blue-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800',
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      starter: <Medal className="h-5 w-5" />,
      common: <Award className="h-5 w-5" />,
      uncommon: <Star className="h-5 w-5" />,
      rare: <Trophy className="h-5 w-5" />,
      legendary: <Crown className="h-5 w-5" />,
    };
    return icons[rarity as keyof typeof icons] || <Medal className="h-5 w-5" />;
  };

  const getChallengeTypeColor = (type: string) => {
    const colors = {
      DAILY: 'bg-green-100 text-green-800',
      WEEKLY: 'bg-blue-100 text-blue-800',
      MONTHLY: 'bg-purple-100 text-purple-800',
      MILESTONE: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChallengeStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelInfo = (level: string) => {
    const levels = {
      rookie: { name: 'Rookie', color: 'text-gray-600', icon: <Medal className="h-5 w-5" /> },
      amateur: { name: 'Amateur', color: 'text-blue-600', icon: <Award className="h-5 w-5" /> },
      star: { name: 'Star', color: 'text-purple-600', icon: <Star className="h-5 w-5" /> },
      allstar: { name: 'All-Star', color: 'text-yellow-600', icon: <Trophy className="h-5 w-5" /> },
      legend: { name: 'Legend', color: 'text-red-600', icon: <Crown className="h-5 w-5" /> },
    };
    return levels[level as keyof typeof levels] || levels.rookie;
  };

  const activeChallenges = challenges.filter(c => c.status === 'ACTIVE');
  const completedChallenges = challenges.filter(c => c.status === 'COMPLETED');
  const levelInfo = getLevelInfo(currentLevel);

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
          <h2 className="text-2xl font-bold text-gray-900">Achievements & Rewards</h2>
          <p className="text-gray-600">Track your progress and unlock amazing rewards</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={levelInfo.color}>
              {levelInfo.icon}
            </div>
            <div>
              <div className={`font-semibold ${levelInfo.color}`}>{levelInfo.name}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-orange-100">
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          {/* Progress Overview */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{achievements.length}</div>
                  <div className="text-sm text-gray-600">Unlocked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{availableAchievements.length}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((achievements.length / (achievements.length + availableAchievements.length)) * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unlocked Achievements */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Unlocked Achievements ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((userAchievement, index) => (
                  <motion.div
                    key={userAchievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            {getRarityIcon(userAchievement.achievement.rarity)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900">
                              {userAchievement.achievement.name}
                            </h3>
                            <Badge className={getRarityColor(userAchievement.achievement.rarity)}>
                              {userAchievement.achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-green-700 mb-2">
                          {userAchievement.achievement.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-green-600">
                          <span>+{userAchievement.achievement.points} points</span>
                          <span>{new Date(userAchievement.unlockedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              {achievements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No achievements unlocked yet</p>
                  <p className="text-sm">Complete drills and challenges to earn your first achievement!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Achievements */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-600" />
                Available Achievements ({availableAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-gray-200 hover:border-orange-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getRarityIcon(achievement.rarity)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {achievement.name}
                            </h3>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Reward: {achievement.points} points</span>
                          <span>{achievement.category}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          {/* Active Challenges */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Active Challenges ({activeChallenges.length})
              </CardTitle>
              <CardDescription>
                Complete these challenges to earn rewards and advance your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <Card key={challenge.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-blue-900">
                              {challenge.challenge.name}
                            </h3>
                            <Badge className={getChallengeTypeColor(challenge.challenge.type)}>
                              {challenge.challenge.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-700">
                            {challenge.challenge.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {challenge.progress}%
                          </div>
                          <div className="text-xs text-blue-600">Complete</div>
                        </div>
                      </div>
                      <Progress value={challenge.progress} className="mb-3" />
                      <div className="flex items-center justify-between text-xs text-blue-600">
                        <span>Started: {new Date(challenge.startedAt).toLocaleDateString()}</span>
                        {challenge.challenge.timeLimit && (
                          <span>Time limit: {challenge.challenge.timeLimit}h</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {activeChallenges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No active challenges</p>
                    <p className="text-sm">New challenges are automatically assigned based on your progress</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completed Challenges */}
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Completed Challenges ({completedChallenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-green-900">
                              {challenge.challenge.name}
                            </h3>
                            <Badge className={getChallengeTypeColor(challenge.challenge.type)}>
                              {challenge.challenge.type}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              COMPLETED
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700">
                            {challenge.challenge.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div className="text-xs text-green-600">
                            {challenge.completedAt && new Date(challenge.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {completedChallenges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No completed challenges yet</p>
                    <p className="text-sm">Complete active challenges to see them here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-orange-600" />
                Reward System
              </CardTitle>
              <CardDescription>
                Earn points and level up by completing drills and challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{totalPoints}</div>
                  <div className="text-gray-600">Total Points Earned</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Point Values</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Complete a drill</span>
                        <span className="font-semibold">+10 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Perfect drill rating</span>
                        <span className="font-semibold">+5 bonus</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Daily streak</span>
                        <span className="font-semibold">+20 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Complete challenge</span>
                        <span className="font-semibold">+50 points</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Level Requirements</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rookie → Amateur</span>
                        <span className="font-semibold">500 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amateur → Star</span>
                        <span className="font-semibold">1,000 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Star → All-Star</span>
                        <span className="font-semibold">2,000 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">All-Star → Legend</span>
                        <span className="font-semibold">5,000 points</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
