
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    // Handle case where there's no session (mock mode)
    if (!userId) {
      logger.info('No session found, using mock challenges data');
      
      // Return 10 comprehensive basketball challenges
      const mockChallenges = {
        activeChallenges: [
          {
            id: 'daily-free-throw-master',
            name: 'Free Throw Master',
            description: 'Make 20 consecutive free throws without missing',
            type: 'DAILY',
            difficulty: 'HARD',
            category: 'SHOOTING',
            criteria: {
              consecutiveShots: 20,
              shotType: 'free_throw',
              accuracy: 100
            },
            reward: {
              type: 'POINTS',
              value: 50,
              bonus: 'Free Throw Master Badge'
            },
            timeLimit: 24 * 60 * 60 * 1000, // 24 hours
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 65, // 13/20 shots
              currentValue: 13,
              targetValue: 20,
              startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'daily-defensive-lockdown',
            name: 'Defensive Lockdown',
            description: 'Complete 15 defensive drills with perfect form',
            type: 'DAILY',
            difficulty: 'MEDIUM',
            category: 'DEFENSE',
            criteria: {
              drillCount: 15,
              category: 'defense',
              minFormScore: 95
            },
            reward: {
              type: 'POINTS',
              value: 40,
              bonus: 'Lockdown Defender Badge'
            },
            timeLimit: 24 * 60 * 60 * 1000,
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 47, // 7/15 drills
              currentValue: 7,
              targetValue: 15,
              startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 45 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'weekly-triple-threat',
            name: 'Triple Threat Mastery',
            description: 'Excel in shooting, dribbling, and passing this week',
            type: 'WEEKLY',
            difficulty: 'HARD',
            category: 'SKILLS',
            criteria: {
              shootingAccuracy: 85,
              dribblingSkills: 3,
              passingAccuracy: 90,
              timeFrame: 'week'
            },
            reward: {
              type: 'BADGE',
              value: 'Triple Threat Master',
              bonus: '75 bonus points'
            },
            timeLimit: 7 * 24 * 60 * 60 * 1000,
            isActive: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 60,
              currentValue: 60,
              targetValue: 100,
              startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'weekly-conditioning-beast',
            name: 'Conditioning Beast',
            description: 'Complete 6 high-intensity conditioning sessions',
            type: 'WEEKLY',
            difficulty: 'EXTREME',
            category: 'CONDITIONING',
            criteria: {
              sessions: 6,
              intensity: 'high',
              category: 'conditioning'
            },
            reward: {
              type: 'POINTS',
              value: 80,
              bonus: 'Iron Will Badge'
            },
            timeLimit: 7 * 24 * 60 * 60 * 1000,
            isActive: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 33, // 2/6 sessions
              currentValue: 2,
              targetValue: 6,
              startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'monthly-consistency-king',
            name: 'Consistency King',
            description: 'Practice basketball for 25 out of 30 days',
            type: 'MONTHLY',
            difficulty: 'MEDIUM',
            category: 'CONSISTENCY',
            criteria: {
              practiceDays: 25,
              totalDays: 30,
              minDuration: 30 // minutes
            },
            reward: {
              type: 'POINTS',
              value: 100,
              bonus: 'Consistency Crown'
            },
            timeLimit: 30 * 24 * 60 * 60 * 1000,
            isActive: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 40, // 10/25 days
              currentValue: 10,
              targetValue: 25,
              startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'milestone-century-club',
            name: 'Century Club',
            description: 'Complete 100 basketball drills total',
            type: 'MILESTONE',
            difficulty: 'MEDIUM',
            category: 'ACHIEVEMENT',
            criteria: {
              totalDrills: 100,
              category: 'all'
            },
            reward: {
              type: 'BADGE',
              value: 'Century Club Member',
              bonus: '150 bonus points'
            },
            timeLimit: null, // No time limit for milestone
            isActive: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: null,
            userProgress: {
              status: 'ACTIVE',
              progress: 73, // 73/100 drills
              currentValue: 73,
              targetValue: 100,
              startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'skill-clutch-performer',
            name: 'Clutch Performer',
            description: 'Make 10 game-winning shots in pressure situations',
            type: 'SKILL',
            difficulty: 'EXTREME',
            category: 'MENTAL',
            criteria: {
              clutchShots: 10,
              pressure: 'high',
              gameWinning: true
            },
            reward: {
              type: 'BADGE',
              value: 'Clutch Gene',
              bonus: '120 bonus points'
            },
            timeLimit: null,
            isActive: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: null,
            userProgress: {
              status: 'ACTIVE',
              progress: 30, // 3/10 shots
              currentValue: 3,
              targetValue: 10,
              startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'team-leadership-challenge',
            name: 'Leadership Challenge',
            description: 'Lead 5 team practices and mentor 3 younger players',
            type: 'TEAM',
            difficulty: 'HARD',
            category: 'LEADERSHIP',
            criteria: {
              practicesLed: 5,
              playersmentored: 3,
              leadershipScore: 85
            },
            reward: {
              type: 'BADGE',
              value: 'Team Captain',
              bonus: '90 bonus points'
            },
            timeLimit: 14 * 24 * 60 * 60 * 1000, // 2 weeks
            isActive: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 40, // 2/5 practices, 1/3 players
              currentValue: 40,
              targetValue: 100,
              startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            }
          },
          {
            id: 'speed-agility-master',
            name: 'Speed & Agility Master',
            description: 'Complete suicide runs in under 25 seconds 5 times',
            type: 'PERFORMANCE',
            difficulty: 'EXTREME',
            category: 'CONDITIONING',
            criteria: {
              exercise: 'suicide_runs',
              maxTime: 25,
              completions: 5
            },
            reward: {
              type: 'BADGE',
              value: 'Speed Demon',
              bonus: '70 bonus points'
            },
            timeLimit: 7 * 24 * 60 * 60 * 1000,
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 20, // 1/5 completions
              currentValue: 1,
              targetValue: 5,
              startedAt: new Date().toISOString(),
              completedAt: null,
              lastUpdate: new Date().toISOString()
            }
          },
          {
            id: 'perfect-form-master',
            name: 'Perfect Form Master',
            description: 'Achieve perfect form score (100%) in 20 different drills',
            type: 'TECHNIQUE',
            difficulty: 'HARD',
            category: 'FORM',
            criteria: {
              perfectFormDrills: 20,
              formScore: 100,
              variety: true
            },
            reward: {
              type: 'BADGE',
              value: 'Form Perfectionist',
              bonus: '85 bonus points'
            },
            timeLimit: 21 * 24 * 60 * 60 * 1000, // 3 weeks
            isActive: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            userProgress: {
              status: 'ACTIVE',
              progress: 35, // 7/20 drills
              currentValue: 7,
              targetValue: 20,
              startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              completedAt: null,
              lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          }
        ],
        challengeStats: {
          totalChallenges: 10,
          completedChallenges: 0,
          activeChallenges: 10,
          totalPoints: 0,
          potentialPoints: 760, // Sum of all challenge points
          completionRate: 0,
          averageProgress: 42, // Average of all progress percentages
          streakDays: 5,
          lastActivity: new Date().toISOString()
        },
        challengeCategories: [
          {
            category: 'SHOOTING',
            totalChallenges: 2,
            completedChallenges: 0,
            averageProgress: 65,
            points: 50
          },
          {
            category: 'DEFENSE',
            totalChallenges: 1,
            completedChallenges: 0,
            averageProgress: 47,
            points: 40
          },
          {
            category: 'CONDITIONING',
            totalChallenges: 2,
            completedChallenges: 0,
            averageProgress: 27,
            points: 150
          },
          {
            category: 'SKILLS',
            totalChallenges: 1,
            completedChallenges: 0,
            averageProgress: 60,
            points: 75
          },
          {
            category: 'MENTAL',
            totalChallenges: 1,
            completedChallenges: 0,
            averageProgress: 30,
            points: 120
          },
          {
            category: 'LEADERSHIP',
            totalChallenges: 1,
            completedChallenges: 0,
            averageProgress: 40,
            points: 90
          },
          {
            category: 'FORM',
            totalChallenges: 1,
            completedChallenges: 0,
            averageProgress: 35,
            points: 85
          },
          {
            category: 'CONSISTENCY',
            totalChallenges: 1,
            completedChallenges: 0,
            averageProgress: 40,
            points: 100
          }
        ],
        recentActivity: [
          {
            type: 'CHALLENGE_PROGRESS',
            title: 'Free Throw Master',
            description: 'Made 13 consecutive free throws',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            progress: 65,
            points: 0
          },
          {
            type: 'CHALLENGE_PROGRESS',
            title: 'Defensive Lockdown',
            description: 'Completed 7 defensive drills',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            progress: 47,
            points: 0
          },
          {
            type: 'CHALLENGE_STARTED',
            title: 'Speed & Agility Master',
            description: 'Started new performance challenge',
            timestamp: new Date().toISOString(),
            progress: 0,
            points: 0
          },
          {
            type: 'CHALLENGE_PROGRESS',
            title: 'Century Club',
            description: 'Completed drill #73',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            progress: 73,
            points: 0
          }
        ]
      };

      return NextResponse.json(mockChallenges);
    }

    // Real implementation would go here for authenticated users
    // For now, return the mock data
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  } catch (error) {
    logger.error('Error fetching challenges', error as Error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
