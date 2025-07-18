'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  MessageCircle,
  Award,
  Video,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  Palette,
  Crown,
  User as UserIcon,
  Edit2,
  Check,
  X,
  Mail,
  Save,
  Bot,
  CheckCircle2
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { User, DrillCompletion, Notification, ParentDashboardData, MediaUpload } from '@/lib/types';
import MediaViewer from '@/components/media/media-viewer';
import ReportCardForm from '@/components/parent/report-card-form';
import UserProfile from '@/components/user/user-profile';
import AICoachAssistant from '@/components/ai/ai-coach-assistant';

interface ParentDashboardProps {
  user: User & { children: (User & { playerProfile: any })[] };
}

export default function ParentDashboard({ user }: ParentDashboardProps) {
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<ParentDashboardData>({
    children: [],
    recentActivities: [],
    notifications: [],
    mediaUploads: [],
    weeklyProgress: {},
  });
  const [loading, setLoading] = useState(true);
  const [emailSettings, setEmailSettings] = useState({
    notificationEmail: '',
    receiveAllCompletions: false,
    receiveAchievements: true,
    receiveWeeklyReports: true,
    receiveMediaUploads: true,
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [draggedUser, setDraggedUser] = useState<any>(null);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<string>('');
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [availableDrills, setAvailableDrills] = useState<any[]>([]);
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  
  // AI Assignment and Assessment states
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<any[]>([]);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [pendingAssessments, setPendingAssessments] = useState<any[]>([]);
  const [aiAssignmentMode, setAiAssignmentMode] = useState<'manual' | 'auto' | 'mixed'>('manual');
  const [aiAssessmentMode, setAiAssessmentMode] = useState<'manual' | 'auto' | 'mixed'>('manual');
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<'drill' | 'workout'>('drill');
  const [bulkAssignmentSettings, setBulkAssignmentSettings] = useState({
    difficulty: 'medium',
    focusArea: 'all',
    duration: 15,
    frequency: 'daily'
  });

  // AI Enhanced Commenting System
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [currentCommentTarget, setCurrentCommentTarget] = useState<{
    id: string;
    type: 'drill' | 'workout' | 'media' | 'assessment';
    name: string;
  } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isAiCommentMode, setIsAiCommentMode] = useState(false);
  const [aiCommentSuggestions, setAiCommentSuggestions] = useState<string[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [commentHistory, setCommentHistory] = useState<any[]>([]);
  const [selectedCommentType, setSelectedCommentType] = useState<'encouragement' | 'technical' | 'improvement' | 'general'>('encouragement');

  useEffect(() => {
    fetchDashboardData();
    fetchTeams();
    fetchAllUsers();
    fetchAvailableDrills();
    fetchAvailableWorkouts();
    fetchAssignmentData();
    fetchAssessmentData();
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
      // Optimistically update the UI
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      }));

      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert the optimistic update on error
      fetchDashboardData();
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Optimistically update the UI
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true }))
      }));

      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch(`/api/notifications/${notification.id}/mark-read`, {
            method: 'PATCH',
          })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert the optimistic update on error
      fetchDashboardData();
    }
  };

  const saveEmailSettings = async () => {
    try {
      const response = await fetch('/api/parent/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailSettings),
      });

      if (response.ok) {
        alert('Email settings saved successfully!');
      } else {
        alert('Failed to save email settings');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      alert('Error saving email settings');
    }
  };

  const loadEmailSettings = async () => {
    try {
      const response = await fetch('/api/parent/email-settings');
      if (response.ok) {
        const settings = await response.json();
        setEmailSettings(settings);
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    }
  };

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const fetchTeams = async () => {
    try {
      console.log('Fetching teams...');
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        console.log('Teams fetched:', data);
        setTeams(data);
      } else {
        console.error('Failed to fetch teams, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAvailableDrills = async () => {
    try {
      const response = await fetch('/api/drills/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableDrills(data);
      }
    } catch (error) {
      console.error('Error fetching available drills:', error);
    }
  };

  const fetchAvailableWorkouts = async () => {
    try {
      const response = await fetch('/api/workouts/available');
      if (response.ok) {
        const data = await response.json();
        setAvailableWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching available workouts:', error);
    }
  };

  const createTeam = async () => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTeam),
      });

      if (response.ok) {
        const team = await response.json();
        setTeams([...teams, team]);
        setNewTeam({ name: '', description: '', color: '#3B82F6' });
        setShowCreateTeam(false);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const addUserToTeam = async (teamId: string, userId: string) => {
    try {
      console.log('Making API call to add user:', userId, 'to team:', teamId);
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        console.log('User added successfully, refreshing teams and users');
        // Force refresh both teams and users data
        await fetchTeams();
        await fetchAllUsers();
        
        // Force a visual update by temporarily showing success
        const teamElement = document.querySelector(`[data-team-id="${teamId}"]`);
        if (teamElement) {
          teamElement.classList.add('bg-green-50', 'border-green-300');
          setTimeout(() => {
            teamElement.classList.remove('bg-green-50', 'border-green-300');
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error adding user to team:', error);
    }
  };

  const removeUserFromTeam = async (teamId: string, userId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchTeams(); // Refresh teams
      }
    } catch (error) {
      console.error('Error removing user from team:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, user: any) => {
    console.log('Drag started for user:', user.name);
    setDraggedUser(user);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', user.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, teamId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    console.log('Drop event triggered for team:', teamId, 'with user:', draggedUser?.name);
    
    if (draggedUser) {
      console.log('Adding user to team:', draggedUser.id, 'to team:', teamId);
      
      // Show loading state
      e.currentTarget.classList.add('opacity-75');
      
      await addUserToTeam(teamId, draggedUser.id);
      setDraggedUser(null);
      
      // Remove loading state
      e.currentTarget.classList.remove('opacity-75');
    }
  };

  const startEditingTeam = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingTeamName(currentName);
  };

  const cancelEditingTeam = () => {
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const saveTeamName = async (teamId: string) => {
    if (!editingTeamName.trim()) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingTeamName.trim() }),
      });

      if (response.ok) {
        fetchTeams(); // Refresh teams to get updated data
        setEditingTeamId(null);
        setEditingTeamName('');
      }
    } catch (error) {
      console.error('Error updating team name:', error);
    }
  };

  const getUnassignedUsers = () => {
    const assignedUserIds = teams.flatMap(team => team.members?.map((member: any) => member.user.id) || []);
    return allUsers.filter(user => !assignedUserIds.includes(user.id));
  };

  const handleProvideFeedback = async (uploadId: string, feedback: string) => {
    try {
      const response = await fetch(`/api/media/${uploadId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        // Refresh dashboard data to get updated media uploads
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
    }
  };

  const handleBulkAssignDrill = async (target: string) => {
    if (!selectedDrill) return;
    
    try {
      let response;
      let playerIds: string[] = [];
      
      if (target === 'selected') {
        // Use selected users
        playerIds = selectedUserIds;
        
        // Assign to selected players
        response = await fetch('/api/assignments/bulk-drill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            drillId: selectedDrill,
            playerIds: playerIds,
            note: assignmentNote,
            assignedBy: user.id
          }),
        });
      } else {
        // Assign to specific team
        response = await fetch(`/api/teams/${target}/bulk-assign-drill`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            drillId: selectedDrill,
            note: assignmentNote,
            assignedBy: user.id
          }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk drill assignment successful:', result);
        
        // Send notifications to all assigned players
        for (const playerId of playerIds) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: playerId,
              type: 'drill_assigned',
              title: 'New Drill Assignment',
              message: `You have been assigned a new drill: ${availableDrills.find(d => d.id === selectedDrill)?.name}`,
              metadata: {
                drillId: selectedDrill,
                assignedBy: user.id,
                note: assignmentNote
              }
            }),
          });
        }
        
        // Reset form
        setSelectedDrill('');
        setAssignmentNote('');
        setSelectedUserIds([]);
        setSelectAllUsers(false);
        
        // Show success message
        alert(`Drill assigned successfully to ${playerIds.length} players!`);
      }
    } catch (error) {
      console.error('Error assigning drill:', error);
      alert('Error assigning drill. Please try again.');
    }
  };

  const handleBulkAssignWorkout = async (target: string) => {
    if (!selectedWorkout) return;
    
    try {
      let response;
      let playerIds: string[] = [];
      
      if (target === 'selected') {
        // Use selected users
        playerIds = selectedUserIds;
        
        // Assign to selected players
        response = await fetch('/api/assignments/bulk-workout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workoutId: selectedWorkout,
            playerIds: playerIds,
            note: assignmentNote,
            assignedBy: user.id
          }),
        });
      } else {
        // Assign to specific team
        response = await fetch(`/api/teams/${target}/bulk-assign-workout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workoutId: selectedWorkout,
            note: assignmentNote,
            assignedBy: user.id
          }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk workout assignment successful:', result);
        
        // Send notifications to all assigned players
        for (const playerId of playerIds) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: playerId,
              type: 'workout_assigned',
              title: 'New Workout Assignment',
              message: `You have been assigned a new workout: ${availableWorkouts.find(w => w.id === selectedWorkout)?.name}`,
              metadata: {
                workoutId: selectedWorkout,
                assignedBy: user.id,
                note: assignmentNote
              }
            }),
          });
        }
        
        // Reset form
        setSelectedWorkout('');
        setAssignmentNote('');
        setSelectedUserIds([]);
        setSelectAllUsers(false);
        
        // Show success message
        alert(`Workout assigned successfully to ${playerIds.length} players!`);
      }
    } catch (error) {
      console.error('Error assigning workout:', error);
      alert('Error assigning workout. Please try again.');
    }
  };

  const handleUserSelection = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (isSelected: boolean) => {
    setSelectAllUsers(isSelected);
    if (isSelected) {
      setSelectedUserIds(allUsers.map(user => user.id));
    } else {
      setSelectedUserIds([]);
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

  const bulkAssignDrill = async (teamId: string) => {
    if (!selectedDrill) {
      alert('Please select a drill to assign.');
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/bulk-assign-drill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drillId: selectedDrill,
          note: assignmentNote,
        }),
      });

      if (response.ok) {
        alert(`Drill "${availableDrills.find(d => d.id === selectedDrill)?.name}" assigned to all team members.`);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to assign drill: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error bulk assigning drill:', error);
      alert('Error bulk assigning drill.');
    }
  };

  const bulkAssignWorkout = async (teamId: string) => {
    if (!selectedWorkout) {
      alert('Please select a workout to assign.');
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/bulk-assign-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: selectedWorkout,
          note: assignmentNote,
        }),
      });

      if (response.ok) {
        alert(`Workout "${availableWorkouts.find(w => w.id === selectedWorkout)?.name}" assigned to all team members.`);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to assign workout: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error bulk assigning workout:', error);
      alert('Error bulk assigning workout.');
    }
  };

  // AI Functions
  const generateBulkAssessments = async (playerIds: string[]) => {
    try {
      for (const playerId of playerIds) {
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

        if (response.ok) {
          console.log(`Assessment generated for player ${playerId}`);
        }
      }
      alert('AI assessments generated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating assessments:', error);
      alert('Error generating AI assessments.');
    }
  };

  const generateAutoComments = async (playerIds: string[], contentType: string) => {
    try {
      for (const playerId of playerIds) {
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
          console.log(`Comments generated for player ${playerId}`);
        }
      }
      alert('AI comments generated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating comments:', error);
      alert('Error generating AI comments.');
    }
  };

  const generateSkillEvaluations = async (playerIds: string[]) => {
    try {
      for (const playerId of playerIds) {
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
          console.log(`Skill evaluation generated for player ${playerId}`);
        }
      }
      alert('AI skill evaluations generated successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating skill evaluations:', error);
      alert('Error generating AI skill evaluations.');
    }
  };

  const generateCustomDrills = async (playerIds: string[], parameters: any) => {
    try {
      for (const playerId of playerIds) {
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
          console.log(`Custom drill created for player ${playerId}`);
        }
      }
      alert('Custom drills created successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating custom drills:', error);
      alert('Error creating custom drills.');
    }
  };

  // AI Enhanced Commenting Functions
  const openCommentBox = (target: { id: string; type: 'drill' | 'workout' | 'media' | 'assessment'; name: string }) => {
    setCurrentCommentTarget(target);
    setShowCommentBox(true);
    setCommentText('');
    setAiCommentSuggestions([]);
    setIsAiCommentMode(false);
  };

  const closeCommentBox = () => {
    setShowCommentBox(false);
    setCurrentCommentTarget(null);
    setCommentText('');
    setAiCommentSuggestions([]);
    setIsAiCommentMode(false);
  };

  const generateAiCommentSuggestions = async () => {
    if (!currentCommentTarget) return;
    
    setLoadingAiSuggestions(true);
    try {
      const response = await fetch('/api/ai/auto-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentCommentTarget.id,
          contentType: currentCommentTarget.type,
          commentType: selectedCommentType,
          generateMultiple: true,
          count: 3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiCommentSuggestions(data.suggestions || []);
        setIsAiCommentMode(true);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  const saveComment = async () => {
    if (!currentCommentTarget || !commentText.trim()) return;

    try {
      const endpoint = currentCommentTarget.type === 'drill' 
        ? `/api/drills/${currentCommentTarget.id}/comments`
        : currentCommentTarget.type === 'workout'
        ? `/api/workouts/${currentCommentTarget.id}/comments`
        : currentCommentTarget.type === 'media'
        ? `/api/media/${currentCommentTarget.id}/feedback`
        : `/api/assessments/${currentCommentTarget.id}/comments`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: commentText.trim(),
          type: selectedCommentType,
          isAiGenerated: isAiCommentMode,
        }),
      });

      if (response.ok) {
        alert('Comment saved successfully!');
        closeCommentBox();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Error saving comment.');
    }
  };

  // AI Assignment Functions
  const generateSmartAssignments = async (playerIds: string[], assignmentType: 'drill' | 'workout') => {
    try {
      for (const playerId of playerIds) {
        const response = await fetch('/api/ai/smart-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            assignmentType,
            settings: bulkAssignmentSettings,
            mode: aiAssignmentMode,
          }),
        });

        if (response.ok) {
          console.log(`Smart assignment created for player ${playerId}`);
        }
      }
      alert(`AI ${assignmentType} assignments created successfully!`);
      fetchAssignmentData();
    } catch (error) {
      console.error('Error creating smart assignments:', error);
      alert('Error creating AI assignments.');
    }
  };

  const autoEvaluateAssignments = async (assignmentIds: string[]) => {
    try {
      for (const assignmentId of assignmentIds) {
        const response = await fetch('/api/ai/evaluate-assignment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentId,
            includeProgressTracking: true,
            generateFeedback: true,
          }),
        });

        if (response.ok) {
          console.log(`Assignment ${assignmentId} evaluated`);
        }
      }
      alert('AI assignment evaluations completed!');
      fetchAssignmentData();
    } catch (error) {
      console.error('Error evaluating assignments:', error);
      alert('Error evaluating assignments.');
    }
  };

  // AI Assessment Functions
  const generateAutoAssessments = async (playerIds: string[]) => {
    try {
      for (const playerId of playerIds) {
        const response = await fetch('/api/ai/auto-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            assessmentType: 'comprehensive',
            includeVideoAnalysis: true,
            includePerformanceMetrics: true,
            generateRecommendations: true,
            mode: aiAssessmentMode,
          }),
        });

        if (response.ok) {
          console.log(`Auto assessment created for player ${playerId}`);
        }
      }
      alert('AI assessments generated successfully!');
      fetchAssessmentData();
    } catch (error) {
      console.error('Error generating auto assessments:', error);
      alert('Error generating AI assessments.');
    }
  };

  const analyzeSkillProgression = async (playerIds: string[]) => {
    try {
      for (const playerId of playerIds) {
        const response = await fetch('/api/ai/skill-progression', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            timeframe: '30days',
            includeComparisons: true,
            generateInsights: true,
          }),
        });

        if (response.ok) {
          console.log(`Skill progression analyzed for player ${playerId}`);
        }
      }
      alert('AI skill progression analysis completed!');
      fetchAssessmentData();
    } catch (error) {
      console.error('Error analyzing skill progression:', error);
      alert('Error analyzing skill progression.');
    }
  };

  // Data fetching functions
  const fetchAssignmentData = async () => {
    try {
      const [pendingRes, completedRes] = await Promise.all([
        fetch('/api/assignments/pending'),
        fetch('/api/assignments/completed')
      ]);

      if (pendingRes.ok && completedRes.ok) {
        const [pending, completed] = await Promise.all([
          pendingRes.json(),
          completedRes.json()
        ]);
        setPendingAssignments(pending);
        setCompletedAssignments(completed);
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    }
  };

  const fetchAssessmentData = async () => {
    try {
      const [historyRes, pendingRes] = await Promise.all([
        fetch('/api/assessments/history'),
        fetch('/api/assessments/pending')
      ]);

      if (historyRes.ok && pendingRes.ok) {
        const [history, pending] = await Promise.all([
          historyRes.json(),
          pendingRes.json()
        ]);
        setAssessmentHistory(history);
        setPendingAssessments(pending);
      }
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    }
  };

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
          <TabsList className="grid w-full grid-cols-10 bg-white border border-blue-100">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Assistant
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                AI
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Children
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                AI
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Assignments
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs">
                AI
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Assessments
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                AI
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="report-cards" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Report Cards
            </TabsTrigger>
            <TabsTrigger value="email-settings" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Email Settings
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Media Review
              <Badge variant="secondary" className="ml-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs">
                AI
              </Badge>
              {dashboardData.mediaUploads?.filter(upload => !upload.feedback).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {dashboardData.mediaUploads?.filter(upload => !upload.feedback).length}
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
                  <Card 
                    className="border-blue-100 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                    onClick={() => {
                      setSelectedUserId(child.id);
                      setShowUserProfile(true);
                    }}
                  >
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
                        <div className="flex items-center gap-2">
                          {activity.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{activity.rating}</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCommentBox({
                              id: activity.id,
                              type: 'drill',
                              name: activity.drill.name
                            })}
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Comment
                          </Button>
                        </div>
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

          <TabsContent value="ai-assistant" className="space-y-6">
            <AICoachAssistant 
              userId={user.id}
              children={dashboardData.children}
              onModeChange={(mode) => {
                console.log('AI mode changed to:', mode);
                // Handle global AI mode changes
              }}
              onPlayerModeChange={(playerId, mode) => {
                console.log('Player AI mode changed:', playerId, mode);
                // Handle individual player AI mode changes
              }}
            />
          </TabsContent>

          <TabsContent value="children">
            <div className="space-y-6">
              {/* Header with Create Team Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Team Management</h2>
                  <p className="text-gray-600">Create custom teams and organize players</p>
                </div>
                <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Set up a new team and customize its appearance
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                          id="team-name"
                          value={newTeam.name}
                          onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                          placeholder="Enter team name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-description">Description</Label>
                        <Textarea
                          id="team-description"
                          value={newTeam.description}
                          onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                          placeholder="Team description (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="team-color">Team Color</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            id="team-color"
                            value={newTeam.color}
                            onChange={(e) => setNewTeam({...newTeam, color: e.target.value})}
                            className="w-12 h-8 rounded border"
                          />
                          <span className="text-sm text-gray-600">{newTeam.color}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createTeam} disabled={!newTeam.name}>
                          Create Team
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Bulk Assignment Section */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <UserPlus className="h-5 w-5" />
                    Bulk Assignment - All Players
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Assign drills or workouts to selected players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                          <Plus className="h-4 w-4 mr-2" />
                          Bulk Assign Drill
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Assign Drill to Selected Players</DialogTitle>
                          <DialogDescription>
                            Select which players to assign the drill to
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bulk-drill-select">Select Drill</Label>
                            <Select value={selectedDrill} onValueChange={setSelectedDrill}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a drill" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDrills.map((drill) => (
                                  <SelectItem key={drill.id} value={drill.id}>
                                    {drill.name} - {drill.difficulty} ({drill.duration}min)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* User Selection Section */}
                          <div>
                            <Label>Select Players</Label>
                            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                              <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
                                <input
                                  type="checkbox"
                                  id="select-all-users"
                                  checked={selectAllUsers}
                                  onChange={(e) => handleSelectAllUsers(e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor="select-all-users" className="font-medium">
                                  Select All ({allUsers.length} players)
                                </Label>
                              </div>
                              <div className="space-y-2">
                                {allUsers.map((user) => (
                                  <div key={user.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`user-${user.id}`}
                                      checked={selectedUserIds.includes(user.id)}
                                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                      className="rounded"
                                    />
                                    <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                          <UserIcon className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">{user.name}</p>
                                          <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {selectedUserIds.length} player{selectedUserIds.length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="bulk-drill-note">Assignment Note</Label>
                            <Textarea
                              id="bulk-drill-note"
                              value={assignmentNote}
                              onChange={(e) => setAssignmentNote(e.target.value)}
                              placeholder="Add a note for this assignment (optional)"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                              setSelectedDrill('');
                              setSelectedUserIds([]);
                              setSelectAllUsers(false);
                            }}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleBulkAssignDrill('selected')}
                              disabled={!selectedDrill || selectedUserIds.length === 0}
                            >
                              Assign to {selectedUserIds.length} Player{selectedUserIds.length !== 1 ? 's' : ''}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                          <Plus className="h-4 w-4 mr-2" />
                          Bulk Assign Workout
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Assign Workout to Selected Players</DialogTitle>
                          <DialogDescription>
                            Select which players to assign the workout to
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bulk-workout-select">Select Workout</Label>
                            <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a workout" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableWorkouts.map((workout) => (
                                  <SelectItem key={workout.id} value={workout.id}>
                                    {workout.name} - {workout.difficulty} ({workout.duration}min)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* User Selection Section */}
                          <div>
                            <Label>Select Players</Label>
                            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                              <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
                                <input
                                  type="checkbox"
                                  id="select-all-users-workout"
                                  checked={selectAllUsers}
                                  onChange={(e) => handleSelectAllUsers(e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor="select-all-users-workout" className="font-medium">
                                  Select All ({allUsers.length} players)
                                </Label>
                              </div>
                              <div className="space-y-2">
                                {allUsers.map((user) => (
                                  <div key={user.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`user-workout-${user.id}`}
                                      checked={selectedUserIds.includes(user.id)}
                                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                      className="rounded"
                                    />
                                    <Label htmlFor={`user-workout-${user.id}`} className="flex-1 cursor-pointer">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                          <UserIcon className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">{user.name}</p>
                                          <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {selectedUserIds.length} player{selectedUserIds.length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor="bulk-workout-note">Assignment Note</Label>
                            <Textarea
                              id="bulk-workout-note"
                              value={assignmentNote}
                              onChange={(e) => setAssignmentNote(e.target.value)}
                              placeholder="Add a note for this assignment (optional)"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => {
                              setSelectedWorkout('');
                              setSelectedUserIds([]);
                              setSelectAllUsers(false);
                            }}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => handleBulkAssignWorkout('selected')}
                              disabled={!selectedWorkout || selectedUserIds.length === 0}
                            >
                              Assign to {selectedUserIds.length} Player{selectedUserIds.length !== 1 ? 's' : ''}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Teams Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <Card 
                    key={team.id} 
                    data-team-id={team.id}
                    className="border-2 transition-all hover:shadow-lg drop-zone"
                    style={{ borderColor: team.color }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, team.id)}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('drag-over');
                      console.log('Drag enter on team:', team.name);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('drag-over');
                      console.log('Drag leave on team:', team.name);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          {editingTeamId === team.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingTeamName}
                                onChange={(e) => setEditingTeamName(e.target.value)}
                                className="text-lg font-semibold"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveTeamName(team.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditingTeam();
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => saveTeamName(team.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditingTeam}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <CardTitle className="text-lg">{team.name}</CardTitle>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingTeam(team.id, team.name)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {team.members?.length || 0} members
                        </Badge>
                      </div>
                      {team.description && (
                        <CardDescription>{team.description}</CardDescription>
                      )}
                      
                      {/* Bulk Assignment Buttons */}
                      <div className="flex gap-2 mt-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              Bulk Assign Drill
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Bulk Assign Drill to {team.name}</DialogTitle>
                              <DialogDescription>
                                Assign a drill to all members of this team
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="bulk-drill-select">Select Drill</Label>
                                <Select value={selectedDrill} onValueChange={setSelectedDrill}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a drill" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableDrills.map((drill: any) => (
                                      <SelectItem key={drill.id} value={drill.id}>
                                        {drill.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="bulk-drill-note">Note (Optional)</Label>
                                <Textarea
                                  id="bulk-drill-note"
                                  value={assignmentNote}
                                  onChange={(e) => setAssignmentNote(e.target.value)}
                                  placeholder="Add any specific instructions..."
                                />
                              </div>
                              <Button 
                                onClick={() => bulkAssignDrill(team.id)} 
                                className="w-full"
                              >
                                Assign to All Team Members
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Play className="h-3 w-3 mr-1" />
                              Bulk Assign Workout
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Bulk Assign Workout to {team.name}</DialogTitle>
                              <DialogDescription>
                                Assign a workout to all members of this team
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="bulk-workout-select">Select Workout</Label>
                                <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a workout" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableWorkouts.map((workout: any) => (
                                      <SelectItem key={workout.id} value={workout.id}>
                                        {workout.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="bulk-workout-note">Note (Optional)</Label>
                                <Textarea
                                  id="bulk-workout-note"
                                  value={assignmentNote}
                                  onChange={(e) => setAssignmentNote(e.target.value)}
                                  placeholder="Add any specific instructions..."
                                />
                              </div>
                              <Button 
                                onClick={() => bulkAssignWorkout(team.id)} 
                                className="w-full"
                              >
                                Assign to All Team Members
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {team.members?.map((member: any) => (
                          <div 
                            key={member.id} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedUserId(member.user.id);
                              setShowUserProfile(true);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{member.user.name}</p>
                                <p className="text-xs text-gray-500">{member.user.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {member.role === 'captain' && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent opening user profile when clicking delete
                                  removeUserFromTeam(team.id, member.user.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {(!team.members || team.members.length === 0) && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Drop players here to add them to the team
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Unassigned Players */}
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    All Players ({allUsers.length})
                  </CardTitle>
                  <CardDescription>
                    Drag and drop players into teams to organize them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allUsers.map((user) => (
                      <div
                        key={user.id}
                        draggable
                        onDragStart={(e) => {
                          handleDragStart(e, user);
                          e.currentTarget.classList.add('dragging');
                          console.log('Started dragging user:', user.name);
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('dragging');
                          console.log('Finished dragging user:', user.name);
                        }}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowUserProfile(true);
                        }}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.playerProfile && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {user.playerProfile.currentLevel || 'Rookie'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {user.playerProfile.totalPoints || 0} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            {/* AI Activity Analysis */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  AI Activity Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered insights and auto-commenting for your children's activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => generateAutoComments(dashboardData.children.map(c => c.id), 'recent_activities')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Auto-Comment Recent Activities
                  </Button>
                  <Button 
                    onClick={() => generateSkillEvaluations(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Generate Skill Analysis
                  </Button>
                  <Button 
                    onClick={() => generateBulkAssessments(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Create AI Assessments
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Activity Feed
                  <Badge variant="secondary" className="ml-2">
                    AI Enhanced
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Complete history of your children's basketball activities with AI insights
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(activity.duration / 60)}min {activity.duration % 60}s
                            </span>
                            <span>Category: {activity.drill.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCommentBox({
                                id: activity.id,
                                type: 'drill',
                                name: activity.drill.name
                              })}
                              className="flex items-center gap-1"
                            >
                              <MessageCircle className="h-3 w-3" />
                              Comment
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCommentBox({
                                id: activity.id,
                                type: 'drill',
                                name: activity.drill.name
                              })}
                              className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                            >
                              <Bot className="h-3 w-3" />
                              AI Comment
                            </Button>
                          </div>
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
                <div className="flex items-center justify-between">
                  <div>
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
                  </div>
                  {unreadNotifications.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'PARENT_NOTIFICATION' 
                            ? 'bg-green-100' 
                            : notification.type === 'ACHIEVEMENT'
                            ? 'bg-yellow-100'
                            : String(notification.type) === 'MEDIA_UPLOAD'
                            ? 'bg-purple-100'
                            : 'bg-blue-100'
                        }`}>
                          {notification.type === 'PARENT_NOTIFICATION' && (
                            <Trophy className="h-5 w-5 text-green-600" />
                          )}
                          {notification.type === 'ACHIEVEMENT' && (
                            <Award className="h-5 w-5 text-yellow-600" />
                          )}
                          {String(notification.type) === 'MEDIA_UPLOAD' && (
                            <Video className="h-5 w-5 text-purple-600" />
                          )}
                          {!['PARENT_NOTIFICATION', 'ACHIEVEMENT', 'MEDIA_UPLOAD'].includes(String(notification.type)) && (
                            <Bell className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{notification.title}</p>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
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

          <TabsContent value="report-cards">
            {/* AI Report Card Generation */}
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-600" />
                  AI Report Card Assistant
                </CardTitle>
                <CardDescription>
                  Generate comprehensive AI-powered report cards based on performance data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => generateBulkAssessments(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Star className="h-4 w-4" />
                    Generate AI Report Cards
                  </Button>
                  <Button 
                    onClick={() => generateSkillEvaluations(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Auto-Fill Skill Assessments
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>AI will analyze video uploads, drill completions, and performance data to automatically generate detailed report cards.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  Basketball Report Cards
                  <Badge variant="secondary" className="ml-2">
                    AI Enhanced
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Assess your children's basketball skills and progress with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.children && user.children.length > 0 ? (
                  <div className="space-y-6">
                    {user.children.map((child) => (
                      <div key={child.id} className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {child.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{child.name}</h3>
                            <p className="text-sm text-gray-600">
                              Current Level: {child.playerProfile?.currentLevel || 'Rookie'}
                            </p>
                          </div>
                        </div>
                        <ReportCardForm
                          childId={child.id}
                          childName={child.name || 'Child'}
                          onSuccess={() => {
                            // Refresh dashboard data or show success message
                            fetchDashboardData();
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No children found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Children will appear here when they are added to your account
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email-settings">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Email Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications about your children's basketball activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-email">Notification Email Address</Label>
                    <Input
                      id="notification-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={emailSettings.notificationEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                      className="max-w-md"
                    />
                    <p className="text-sm text-gray-500">
                      All notifications will be sent to this email address
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Notification Preferences</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-green-600" />
                            <span className="font-medium">All Drill & Workout Completions</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Receive an email every time any child completes a drill or workout
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.receiveAllCompletions}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, receiveAllCompletions: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Achievements & Level Ups</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get notified when children unlock achievements or level up
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.receiveAchievements}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, receiveAchievements: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Weekly Progress Reports</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Receive weekly summaries of all children's activities and progress
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.receiveWeeklyReports}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, receiveWeeklyReports: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Media Uploads</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get notified when children upload practice videos or photos
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailSettings.receiveMediaUploads}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, receiveMediaUploads: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      onClick={saveEmailSettings}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!emailSettings.notificationEmail}
                    >
                      Save Email Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            {/* AI Media Analysis */}
            <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-orange-600" />
                  AI Media Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered video analysis and automated feedback generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => generateAutoComments(dashboardData.children.map(c => c.id), 'media_uploads')}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Auto-Comment All Media
                  </Button>
                  <Button 
                    onClick={() => generateSkillEvaluations(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4" />
                    AI Video Analysis
                  </Button>
                  <Button 
                    onClick={() => generateBulkAssessments(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Star className="h-4 w-4" />
                    Generate Skill Reports
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>AI will analyze uploaded videos and images to provide technical feedback, identify improvement areas, and generate encouraging comments.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  Media Review
                  <Badge variant="secondary" className="ml-2">
                    AI Enhanced
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Review and provide feedback on your children's practice videos and images with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaViewer
                  mediaUploads={dashboardData.mediaUploads || []}
                  onProvideFeedback={handleProvideFeedback}
                  showFeedbackForm={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            {/* AI Assignment Management */}
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-green-600" />
                  AI Assignment Management
                </CardTitle>
                <CardDescription>
                  Intelligent assignment creation and management with AI-powered recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-assignment-mode">AI Mode</Label>
                    <Select value={aiAssignmentMode} onValueChange={(value) => setAiAssignmentMode(value as 'manual' | 'auto' | 'mixed')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Only</SelectItem>
                        <SelectItem value="auto">Full Auto</SelectItem>
                        <SelectItem value="mixed">Mixed Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignment-type">Assignment Type</Label>
                    <Select value={selectedAssignmentType} onValueChange={(value) => setSelectedAssignmentType(value as 'drill' | 'workout')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drill">Drills</SelectItem>
                        <SelectItem value="workout">Workouts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={bulkAssignmentSettings.difficulty} 
                      onValueChange={(value) => setBulkAssignmentSettings(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="adaptive">AI Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => generateSmartAssignments(dashboardData.children.map(c => c.id), selectedAssignmentType)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Target className="h-4 w-4" />
                    Generate Smart Assignments
                  </Button>
                  <Button 
                    onClick={() => autoEvaluateAssignments(completedAssignments.map(a => a.id))}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Auto-Evaluate Completed
                  </Button>
                  <Button 
                    onClick={() => generateAutoComments(dashboardData.children.map(c => c.id), 'assignments')}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Auto-Comment All
                  </Button>
                  <Button 
                    onClick={() => generateCustomDrills(dashboardData.children.map(c => c.id), bulkAssignmentSettings)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom Drills
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Pending Assignments
                    <Badge variant="secondary" className="ml-2">
                      AI Enhanced
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Active assignments waiting for completion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Target className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{assignment.type === 'drill' ? 'Drill' : 'Workout'} Assignment</p>
                            <Badge variant="outline" className="text-xs">
                              {assignment.aiGenerated ? 'AI Generated' : 'Manual'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {assignment.title} - Assigned to {assignment.playerName}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            <span>Difficulty: {assignment.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingAssignments.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No pending assignments. Create some AI-powered assignments!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Completed Assignments
                    <Badge variant="secondary" className="ml-2">
                      AI Enhanced
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Recently completed assignments with AI feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{assignment.title}</p>
                            <div className="flex items-center gap-2">
                              {assignment.aiEvaluated && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  AI Evaluated
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {assignment.score}/100
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Completed by {assignment.playerName} on {new Date(assignment.completedAt).toLocaleDateString()}
                          </p>
                          {assignment.aiFeedback && (
                            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                              AI Feedback: {assignment.aiFeedback}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {completedAssignments.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No completed assignments yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            {/* AI Assessment Management */}
            <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-yellow-600" />
                  AI Assessment Management
                </CardTitle>
                <CardDescription>
                  Automated skill assessments and progress tracking with AI insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-assessment-mode">AI Mode</Label>
                    <Select value={aiAssessmentMode} onValueChange={(value) => setAiAssessmentMode(value as 'manual' | 'auto' | 'mixed')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Only</SelectItem>
                        <SelectItem value="auto">Full Auto</SelectItem>
                        <SelectItem value="mixed">Mixed Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assessment Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assessment Type</Label>
                    <Select defaultValue="comprehensive">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        <SelectItem value="skills-only">Skills Only</SelectItem>
                        <SelectItem value="progress-tracking">Progress Tracking</SelectItem>
                        <SelectItem value="video-analysis">Video Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => generateAutoAssessments(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Award className="h-4 w-4" />
                    Generate AI Assessments
                  </Button>
                  <Button 
                    onClick={() => analyzeSkillProgression(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Analyze Skill Progression
                  </Button>
                  <Button 
                    onClick={() => generateSkillEvaluations(dashboardData.children.map(c => c.id))}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Star className="h-4 w-4" />
                    Generate Skill Reports
                  </Button>
                  <Button 
                    onClick={() => generateAutoComments(dashboardData.children.map(c => c.id), 'assessments')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Auto-Comment All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Pending Assessments
                    <Badge variant="secondary" className="ml-2">
                      AI Enhanced
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Scheduled assessments waiting to be completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingAssessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{assessment.type} Assessment</p>
                            <Badge variant="outline" className="text-xs">
                              {assessment.aiGenerated ? 'AI Generated' : 'Manual'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {assessment.playerName} - {assessment.skillFocus}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Due: {new Date(assessment.dueDate).toLocaleDateString()}</span>
                            <span>Type: {assessment.assessmentType}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingAssessments.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No pending assessments. Schedule AI assessments for your children!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Assessment History
                    <Badge variant="secondary" className="ml-2">
                      AI Enhanced
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Completed assessments with AI-generated insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentHistory.map((assessment) => (
                      <div key={assessment.id} className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{assessment.playerName}</p>
                            <div className="flex items-center gap-2">
                              {assessment.aiGenerated && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  AI Generated
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Overall: {assessment.overallScore}/10
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Assessed on {new Date(assessment.assessedAt).toLocaleDateString()} by {assessment.assessorName}
                          </p>
                          {assessment.aiInsights && (
                            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                              AI Insights: {assessment.aiInsights}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>Skills: {assessment.skillsAssessed}</span>
                            <span>Recommendations: {assessment.recommendationsCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {assessmentHistory.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        No assessment history yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* User Profile Modal */}
      {showUserProfile && selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          onBack={() => {
            setShowUserProfile(false);
            setSelectedUserId(null);
          }}
        />
      )}

      {/* AI Enhanced Commenting Dialog */}
      {showCommentBox && currentCommentTarget && (
        <Dialog open={showCommentBox} onOpenChange={closeCommentBox}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comment on {currentCommentTarget.name}
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  AI Enhanced
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Add your comment or use AI to generate suggestions based on the activity.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Comment Type Selection */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Comment Type:</Label>
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

              {/* AI Mode Toggle */}
              <div className="flex items-center gap-4">
                <Button 
                  variant={isAiCommentMode ? "default" : "outline"}
                  onClick={() => setIsAiCommentMode(!isAiCommentMode)}
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  {isAiCommentMode ? "AI Mode On" : "AI Mode Off"}
                </Button>
                
                {isAiCommentMode && (
                  <Button 
                    variant="outline" 
                    onClick={generateAiCommentSuggestions}
                    disabled={loadingAiSuggestions}
                    className="flex items-center gap-2"
                  >
                    {loadingAiSuggestions ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        Generate AI Suggestions
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* AI Suggestions */}
              {isAiCommentMode && aiCommentSuggestions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI Suggestions:</Label>
                  <div className="space-y-2">
                    {aiCommentSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => setCommentText(suggestion)}
                      >
                        <p className="text-sm">{suggestion}</p>
                        <p className="text-xs text-blue-600 mt-1">Click to use this suggestion</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment Text Area */}
              <div className="space-y-2">
                <Label htmlFor="comment-text">Your Comment:</Label>
                <Textarea
                  id="comment-text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Write your ${selectedCommentType} comment here...`}
                  className="min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {isAiCommentMode && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600">
                      AI Enhanced
                    </Badge>
                  )}
                  <span>Type: {selectedCommentType}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={closeCommentBox}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveComment}
                    disabled={!commentText.trim()}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Save Comment
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
