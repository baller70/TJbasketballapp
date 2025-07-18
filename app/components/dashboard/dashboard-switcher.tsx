'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardSwitcherProps {
  currentView: string;
  userRole: string;
}

export default function DashboardSwitcher({ currentView, userRole }: DashboardSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchView = (view: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={userRole === 'PARENT' ? 'default' : 'secondary'}>
                Actual Role: {userRole}
              </Badge>
              <Badge variant={currentView === 'parent' ? 'default' : 'outline'}>
                Current View: {currentView === 'parent' ? 'Parent Portal' : 'Player Portal'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={currentView === 'parent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchView('parent')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Parent Portal
            </Button>
            
            <div className="mx-2 text-gray-400">
              {currentView === 'parent' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            </div>
            
            <Button
              variant={currentView === 'player' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchView('player')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Player Portal
            </Button>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {currentView === 'parent' 
            ? "👨‍👩‍👧‍👦 Viewing the parent dashboard - manage your children's basketball training"
            : "🏀 Viewing the player dashboard - access drills, track progress, and improve your game"
          }
        </div>
      </CardContent>
    </Card>
  );
} 