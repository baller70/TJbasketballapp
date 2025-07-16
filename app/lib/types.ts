
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'PARENT' | 'PLAYER';
  parentId: string | null;
  playerProfile?: PlayerProfile;
  children?: User[];
  parent?: User;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  skillLevel: string;
  favoritePosition: string | null;
  totalPoints: number;
  currentLevel: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  avatarItems: any;
  goals: any;
  preferences: any;
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  category: string;
  skillLevel: string;
  duration: string;
  equipment: string[];
  stepByStep: string[];
  coachingTips: string[];
  videoUrl: string | null;
  alternativeVideos: string[];
  isCustom?: boolean;
  createdBy?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string | null;
  totalDuration: number;
  userId: string;
  isPublic: boolean;
  workoutDrills: WorkoutDrill[];
}

export interface WorkoutDrill {
  id: string;
  workoutId: string;
  drillId: string;
  order: number;
  duration: number | null;
  notes: string | null;
  drill: Drill;
}

export interface ScheduleEntry {
  id: string;
  userId: string;
  date: Date;
  startTime: Date;
  endTime: Date | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  drillId: string | null;
  workoutId: string | null;
  notes: string | null;
  completedAt: Date | null;
  drill?: Drill;
  workout?: Workout;
}

export interface DrillCompletion {
  id: string;
  userId: string;
  drillId: string;
  completedAt: Date;
  duration: number;
  performance: any;
  aiAnalysis: any;
  feedback: string | null;
  rating: number | null;
  drill: Drill;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: string;
  points: number;
  category: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  achievement: Achievement;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE';
  criteria: any;
  reward: any;
  timeLimit: number | null;
  isActive: boolean;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  progress: number;
  startedAt: Date;
  completedAt: Date | null;
  challenge: Challenge;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'REMINDER' | 'ACHIEVEMENT' | 'PARENT_NOTIFICATION' | 'SYSTEM' | 'AI_FEEDBACK';
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: Date;
}

export interface AIInteraction {
  id: string;
  userId: string;
  type: 'DRILL_RECOMMENDATION' | 'VIDEO_ANALYSIS' | 'MOTIVATIONAL_MESSAGE' | 'COACHING_TIP' | 'CHAT_CONVERSATION' | 'PROGRESS_INSIGHT';
  input: string;
  output: string;
  context: any;
  feedback: string | null;
  createdAt: Date;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  skillType: string;
  skillName: string;
  value: number;
  unit: string;
  date: Date;
  context: any;
}

export type DrillCategory = 'shooting' | 'dribbling' | 'passing' | 'defense' | 'footwork' | 'conditioning' | 'fundamentals';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlayerLevel = 'rookie' | 'amateur' | 'star' | 'allstar' | 'legend';

export interface DrillFilters {
  category?: DrillCategory;
  skillLevel?: SkillLevel;
  searchTerm?: string;
  duration?: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeLeft: number;
  totalTime: number;
  currentDrill?: Drill;
  drillIndex: number;
  completedDrills: string[];
}

export interface WorkoutBuilderState {
  name: string;
  description: string;
  drills: WorkoutDrill[];
  totalDuration: number;
  isPublic: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  type: 'drill' | 'workout' | 'free-play';
  status: 'scheduled' | 'completed' | 'missed';
  drill?: Drill;
  workout?: Workout;
}

export interface DashboardStats {
  totalDrills: number;
  completedDrills: number;
  currentStreak: number;
  totalPoints: number;
  averageRating: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface MediaUpload {
  id: string;
  userId: string;
  drillId: string;
  drillCompletionId: string | null;
  mediaType: 'VIDEO' | 'IMAGE';
  fileUrl: string;
  thumbnailUrl: string | null;
  filename: string;
  fileSize: number;
  duration: number | null;
  analysis: any;
  feedback: string | null;
  parentNotified: boolean;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  drill: Drill;
  user: User;
}

export interface ParentDashboardData {
  children: User[];
  recentActivities: DrillCompletion[];
  notifications: Notification[];
  mediaUploads: MediaUpload[];
  weeklyProgress: {
    [childId: string]: {
      completed: number;
      scheduled: number;
      points: number;
    };
  };
}
