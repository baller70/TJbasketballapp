'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Edit3, 
  Trophy, 
  Target, 
  Calendar,
  Ruler,
  Weight,
  Activity,
  MapPin,
  Users,
  Star,
  Award,
  TrendingUp,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    playerProfile?: {
      totalPoints: number;
      currentLevel: string;
      currentStreak: number;
      longestStreak: number;
      skillLevel: string;
      favoritePosition: string;
      dateOfBirth?: string;
      height?: number; // in inches
      weight?: number; // in pounds
      wingspan?: number; // in inches
      verticalJump?: number; // in inches
      team?: string;
      jerseyNumber?: number;
      yearsPlaying?: number;
      dominantHand?: string;
      avatar?: string;
    };
  };
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(user.playerProfile || null);
  const [editFormData, setEditFormData] = useState({
    height: user.playerProfile?.height || '',
    weight: user.playerProfile?.weight || '',
    wingspan: user.playerProfile?.wingspan || '',
    verticalJump: user.playerProfile?.verticalJump || '',
    favoritePosition: user.playerProfile?.favoritePosition || '',
    team: user.playerProfile?.team || '',
    jerseyNumber: user.playerProfile?.jerseyNumber || '',
    yearsPlaying: user.playerProfile?.yearsPlaying || '',
    dominantHand: user.playerProfile?.dominantHand || '',
    skillLevel: user.playerProfile?.skillLevel || 'beginner',
    dateOfBirth: user.playerProfile?.dateOfBirth || '',
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        setIsEditDialogOpen(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatHeight = (inches: number | undefined) => {
    if (!inches) return 'Not set';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return 'Not set';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getSkillLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'rookie': return 'bg-gray-100 text-gray-800';
      case 'amateur': return 'bg-green-100 text-green-800';
      case 'semi-pro': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'all-star': return 'bg-yellow-100 text-yellow-800';
      case 'superstar': return 'bg-orange-100 text-orange-800';
      case 'mvp': return 'bg-red-100 text-red-800';
      case 'hall of fame': return 'bg-pink-100 text-pink-800';
      case 'basketball legend': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getNextLevelProgress = () => {
    const currentLevel = profileData?.currentLevel || 'rookie';
    const totalPoints = profileData?.totalPoints || 0;
    
    // Simple level progression calculation
    const levels = ['rookie', 'amateur', 'semi-pro', 'professional', 'all-star', 'superstar', 'mvp', 'hall of fame', 'basketball legend'];
    const currentIndex = levels.indexOf(currentLevel.toLowerCase());
    const nextIndex = Math.min(currentIndex + 1, levels.length - 1);
    
    const pointsForNextLevel = (nextIndex + 1) * 1000; // 1000 points per level
    const progress = Math.min((totalPoints / pointsForNextLevel) * 100, 100);
    
    return {
      nextLevel: levels[nextIndex],
      progress,
      pointsNeeded: Math.max(0, pointsForNextLevel - totalPoints)
    };
  };

  const nextLevelInfo = getNextLevelProgress();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-6 w-6" />
              Basketball Profile
            </CardTitle>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Basketball Profile</DialogTitle>
                  <DialogDescription>
                    Update your basketball measurements and information
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Height (inches)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={editFormData.height}
                        onChange={(e) => setEditFormData({...editFormData, height: e.target.value})}
                        placeholder="e.g., 72"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={editFormData.weight}
                        onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})}
                        placeholder="e.g., 180"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wingspan">Wingspan (inches)</Label>
                      <Input
                        id="wingspan"
                        type="number"
                        value={editFormData.wingspan}
                        onChange={(e) => setEditFormData({...editFormData, wingspan: e.target.value})}
                        placeholder="e.g., 75"
                      />
                    </div>
                    <div>
                      <Label htmlFor="verticalJump">Vertical Jump (inches)</Label>
                      <Input
                        id="verticalJump"
                        type="number"
                        value={editFormData.verticalJump}
                        onChange={(e) => setEditFormData({...editFormData, verticalJump: e.target.value})}
                        placeholder="e.g., 28"
                      />
                    </div>
                    <div>
                      <Label htmlFor="team">Team/School</Label>
                      <Input
                        id="team"
                        value={editFormData.team}
                        onChange={(e) => setEditFormData({...editFormData, team: e.target.value})}
                        placeholder="e.g., Lakers"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jerseyNumber">Jersey Number</Label>
                      <Input
                        id="jerseyNumber"
                        type="number"
                        value={editFormData.jerseyNumber}
                        onChange={(e) => setEditFormData({...editFormData, jerseyNumber: e.target.value})}
                        placeholder="e.g., 23"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsPlaying">Years Playing</Label>
                      <Input
                        id="yearsPlaying"
                        type="number"
                        value={editFormData.yearsPlaying}
                        onChange={(e) => setEditFormData({...editFormData, yearsPlaying: e.target.value})}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dominantHand">Dominant Hand</Label>
                      <Select value={editFormData.dominantHand} onValueChange={(value) => setEditFormData({...editFormData, dominantHand: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="ambidextrous">Ambidextrous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="skillLevel">Skill Level</Label>
                      <Select value={editFormData.skillLevel} onValueChange={(value) => setEditFormData({...editFormData, skillLevel: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="favoritePosition">Favorite Position</Label>
                      <Select value={editFormData.favoritePosition} onValueChange={(value) => setEditFormData({...editFormData, favoritePosition: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="point-guard">Point Guard</SelectItem>
                          <SelectItem value="shooting-guard">Shooting Guard</SelectItem>
                          <SelectItem value="small-forward">Small Forward</SelectItem>
                          <SelectItem value="power-forward">Power Forward</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editFormData.dateOfBirth}
                        onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData?.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8"
                onClick={() => toast.info('Photo upload feature coming soon!')}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-2">
                <Badge className={`${getLevelColor(profileData?.currentLevel || 'rookie')} text-sm`}>
                  {(profileData?.currentLevel || 'rookie').toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{profileData?.totalPoints || 0} points</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="measurements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="basketball">Basketball Info</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-orange-600" />
                  Physical Measurements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Height</span>
                  <span className="font-semibold">{formatHeight(profileData?.height)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-semibold">{profileData?.weight ? `${profileData.weight} lbs` : 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wingspan</span>
                  <span className="font-semibold">{formatHeight(profileData?.wingspan)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vertical Jump</span>
                  <span className="font-semibold">{profileData?.verticalJump ? `${profileData.verticalJump}"` : 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Age</span>
                  <span className="font-semibold">{calculateAge(profileData?.dateOfBirth)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="basketball" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Athletic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dominant Hand</span>
                  <span className="font-semibold">{profileData?.dominantHand || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Skill Level</span>
                  <Badge className={getSkillLevelColor(profileData?.skillLevel || 'beginner')}>
                    {profileData?.skillLevel || 'Beginner'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Years Playing</span>
                  <span className="font-semibold">{profileData?.yearsPlaying || 0} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Favorite Position</span>
                  <span className="font-semibold">{profileData?.favoritePosition || 'Not set'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Team Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Team/School</span>
                  <span className="font-semibold">{profileData?.team || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jersey Number</span>
                  <span className="font-semibold">{profileData?.jerseyNumber || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Position</span>
                  <span className="font-semibold">{profileData?.favoritePosition || 'Not set'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Player Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getLevelColor(profileData?.currentLevel || 'rookie')} text-lg px-4 py-2`}>
                    {(profileData?.currentLevel || 'rookie').toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">Current Level</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{profileData?.totalPoints || 0}</div>
                  <p className="text-sm text-gray-600">Total Points Earned</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold-600" />
                  Achievement Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{profileData?.currentStreak || 0}</div>
                    <div className="text-sm text-gray-500">days</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Longest Streak</span>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{profileData?.longestStreak || 0}</div>
                    <div className="text-sm text-gray-500">days</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Points</span>
                  <div className="text-right">
                    <div className="font-semibold text-lg">{profileData?.totalPoints || 0}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Level Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getLevelColor(profileData?.currentLevel || 'rookie')} text-lg px-4 py-2`}>
                    {(profileData?.currentLevel || 'rookie').toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {nextLevelInfo.nextLevel}</span>
                    <span>{Math.round(nextLevelInfo.progress)}%</span>
                  </div>
                  <Progress value={nextLevelInfo.progress} className="h-2" />
                  <p className="text-xs text-gray-600 text-center">
                    {nextLevelInfo.pointsNeeded} points needed for next level
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 