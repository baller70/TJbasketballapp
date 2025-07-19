'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Star,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  Users,
  FileText
} from 'lucide-react';

interface AIBrainInsightsProps {
  userId: string;
  children: any[];
  userRole: 'PARENT' | 'PLAYER';
}

interface WeeklySummary {
  playerId: string;
  playerName: string;
  weekStartDate: string;
  weekEndDate: string;
  sessionsCompleted: number;
  sessionsMissed: number;
  totalPracticeTime: number;
  skillImprovements: string[];
  areasNeedingFocus: string[];
  motivationalMessage: string;
  nextWeekRecommendations: string[];
}

interface AnomalyDetection {
  playerId: string;
  playerName: string;
  anomalies: {
    type: 'missed_sessions' | 'performance_dip' | 'engagement_drop';
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    detectedAt: string;
  }[];
}

export default function AIBrainInsights({ userId, children, userRole }: AIBrainInsightsProps) {
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  useEffect(() => {
    if (children.length > 0) {
      setSelectedPlayer(children[0].id);
      loadInsights();
    }
  }, [children]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const playerIds = userRole === 'PARENT' ? children.map(c => c.id) : [userId];
      
      const summaryPromises = playerIds.map(playerId =>
        fetch('/api/ai/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'weekly_summary',
            targetUserId: playerId,
          }),
        }).then(res => res.json())
      );

      const anomalyPromises = playerIds.map(playerId =>
        fetch('/api/ai/brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operation: 'anomaly_detection',
            targetUserId: playerId,
          }),
        }).then(res => res.json())
      );

      const [summaryResults, anomalyResults] = await Promise.all([
        Promise.all(summaryPromises),
        Promise.all(anomalyPromises)
      ]);

      setWeeklySummaries(summaryResults.map(r => r.result).filter(Boolean));
      setAnomalies(anomalyResults.map(r => r.result).filter(Boolean));
    } catch (error) {
      console.error('Error loading AI Brain insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'missed_sessions': return <Calendar className="h-4 w-4" />;
      case 'performance_dip': return <TrendingUp className="h-4 w-4" />;
      case 'engagement_drop': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const selectedSummary = weeklySummaries.find(s => s.playerId === selectedPlayer);
  const selectedAnomalies = anomalies.find(a => a.playerId === selectedPlayer);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Brain Insights
            <Badge variant="secondary" className="ml-2">
              Powered by AI
            </Badge>
          </CardTitle>
          <CardDescription>
            Comprehensive AI-powered analysis of player development and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button onClick={loadInsights} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh Insights'}
            </Button>
            {userRole === 'PARENT' && children.length > 1 && (
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Weekly Summary
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
          <TabsTrigger value="motivation" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Motivation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          {selectedSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Practice Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedSummary.sessionsCompleted}
                      </div>
                      <div className="text-sm text-green-700">Sessions Completed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedSummary.totalPracticeTime}m
                      </div>
                      <div className="text-sm text-blue-700">Practice Time</div>
                    </div>
                  </div>
                  {selectedSummary.sessionsMissed > 0 && (
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedSummary.sessionsMissed}
                      </div>
                      <div className="text-sm text-orange-700">Sessions Missed</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skill Development</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Improvements</h4>
                    <ul className="space-y-1">
                      {selectedSummary.skillImprovements.map((improvement, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Focus Areas</h4>
                    <ul className="space-y-1">
                      {selectedSummary.areasNeedingFocus.map((area, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Target className="h-4 w-4 text-orange-500" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Next Week Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedSummary.nextWeekRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Motivational Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <p className="text-purple-800 font-medium">
                      {selectedSummary.motivationalMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No weekly summary available. Click "Refresh Insights" to generate one.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          {selectedAnomalies && selectedAnomalies.anomalies.length > 0 ? (
            <div className="space-y-4">
              {selectedAnomalies.anomalies.map((anomaly, index) => (
                <Card key={index} className={`border-l-4 ${
                  anomaly.severity === 'high' ? 'border-l-red-500' : 
                  anomaly.severity === 'medium' ? 'border-l-yellow-500' : 
                  'border-l-blue-500'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {getAnomalyIcon(anomaly.type)}
                      {anomaly.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <Badge className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{anomaly.description}</p>
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {anomaly.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-xs text-gray-500">
                      Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : selectedAnomalies ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-green-600 font-medium">No anomalies detected!</p>
                <p className="text-gray-600 text-sm mt-2">Player is maintaining consistent performance and engagement.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No anomaly data available. Click "Refresh Insights" to analyze patterns.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="motivation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Personalized Motivation
              </CardTitle>
              <CardDescription>
                AI-generated motivational content based on recent performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-800">Motivational Message</span>
                </div>
                <p className="text-purple-800 text-lg leading-relaxed">
                  "Keep up the amazing work! Every practice session makes you stronger and more skilled. Your dedication is inspiring!"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
