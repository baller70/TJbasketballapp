import { logger } from '@/lib/logger';

// Use global to persist data across requests in development
declare global {
  var mockTeamsData: any[] | undefined;
}

// Initialize mock data if not already present
if (!global.mockTeamsData) {
  global.mockTeamsData = [
  {
    id: 'team1',
    name: 'Lightning Ballers',
    description: 'Fast-paced offensive team',
    color: '#3B82F6',
    createdById: 'parent1',
    createdAt: new Date().toISOString(),
    members: [
      {
        id: 'member1',
        user: { id: 'user1', name: 'Alex Johnson', email: 'alex@example.com' },
        role: 'captain',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'member2',
        user: { id: 'user2', name: 'Sarah Davis', email: 'sarah@example.com' },
        role: 'member',
        joinedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'team2',
    name: 'Defensive Eagles',
    description: 'Strong defensive specialists',
    color: '#10B981',
    createdById: 'parent1',
    createdAt: new Date().toISOString(),
    members: [
      {
        id: 'member3',
        user: { id: 'user3', name: 'Mike Wilson', email: 'mike@example.com' },
        role: 'member',
        joinedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'team3',
    name: 'Shooting Stars',
    description: 'Elite shooting specialists',
    color: '#F59E0B',
    createdById: 'parent1',
    createdAt: new Date().toISOString(),
    members: [],
  },
  ];
}

// Helper functions to manage mock data
export const getMockTeams = () => global.mockTeamsData || [];

export const addMemberToMockTeam = (teamId: string, userId: string, userName: string, userEmail: string) => {
  const teams = global.mockTeamsData || [];
  const team = teams.find(t => t.id === teamId);
  if (team) {
    // Check if user is already a member
    const existingMember = team.members.find((m: any) => m.user.id === userId);
    if (!existingMember) {
      team.members.push({
        id: `member-${Date.now()}`,
        user: { id: userId, name: userName, email: userEmail },
        role: 'member',
        joinedAt: new Date().toISOString(),
      });
      logger.info(`Added user to team`, { userId, userName, teamId, teamName: team.name });
    }
  }
};

export const removeMemberFromMockTeam = (teamId: string, userId: string) => {
  const teams = global.mockTeamsData || [];
  const team = teams.find((t: any) => t.id === teamId);
  if (team) {
    team.members = team.members.filter((m: any) => m.user.id !== userId);
    logger.info(`Removed user from team`, { userId, teamId, teamName: team.name });
  }
};

export const updateMockTeamName = (teamId: string, newName: string) => {
  const teams = global.mockTeamsData || [];
  const team = teams.find((t: any) => t.id === teamId);
  if (team) {
    team.name = newName;
    logger.info(`Updated team name`, { teamId, oldName: team.name, newName });
  }
};  