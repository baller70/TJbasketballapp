'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Star, BarChart3, MessageSquare, Save, User } from 'lucide-react';

interface ReportCardFormProps {
  childId: string;
  childName: string;
  onSuccess?: () => void;
}

export default function ReportCardForm({ childId, childName, onSuccess }: ReportCardFormProps) {
  const [formData, setFormData] = useState({
    // Basketball Skills (1-10)
    ballHandling: 5,
    ballHandlingNotes: '',
    shooting: 5,
    shootingNotes: '',
    passing: 5,
    passingNotes: '',
    defense: 5,
    defenseNotes: '',
    rebounding: 5,
    reboundingNotes: '',
    footwork: 5,
    footworkNotes: '',
    conditioning: 5,
    conditioningNotes: '',
    teamwork: 5,
    teamworkNotes: '',
    leadership: 5,
    leadershipNotes: '',
    basketballIQ: 5,
    basketballIQNotes: '',
    
    // Personal Attributes (1-10)
    effort: 5,
    effortNotes: '',
    attitude: 5,
    attitudeNotes: '',
    coachability: 5,
    coachabilityNotes: '',
    consistency: 5,
    consistencyNotes: '',
    improvement: 5,
    improvementNotes: '',
    
    // Written Feedback
    strengths: '',
    areasForImprovement: '',
    specificGoals: '',
    parentNotes: '',
    
    // Overall Ratings
    overallRating: 5,
    recommendedFocus: '',
    nextLevelReadiness: 5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: childId,
          ...formData,
        }),
      });

      if (response.ok) {
        toast({
          title: "Report Card Submitted",
          description: `Basketball report card for ${childName} has been successfully submitted.`,
        });
        onSuccess?.();
      } else {
        throw new Error('Failed to submit report card');
      }
    } catch (error) {
      console.error('Error submitting report card:', error);
      toast({
        title: "Error",
        description: "Failed to submit report card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    if (rating >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 8) return 'Very Good';
    if (rating >= 7) return 'Good';
    if (rating >= 6) return 'Above Average';
    if (rating >= 5) return 'Average';
    if (rating >= 4) return 'Below Average';
    if (rating >= 3) return 'Needs Work';
    if (rating >= 2) return 'Poor';
    return 'Very Poor';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Basketball Report Card for {childName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basketball Skills Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Basketball Skills Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'ballHandling', label: 'Ball Handling', description: 'Dribbling, control, and ball security' },
                { key: 'shooting', label: 'Shooting', description: 'Form, accuracy, and range' },
                { key: 'passing', label: 'Passing', description: 'Accuracy, decision-making, and variety' },
                { key: 'defense', label: 'Defense', description: 'Positioning, effort, and technique' },
                { key: 'rebounding', label: 'Rebounding', description: 'Boxing out, positioning, and hustle' },
                { key: 'footwork', label: 'Footwork', description: 'Agility, balance, and movement' },
                { key: 'conditioning', label: 'Conditioning', description: 'Endurance, speed, and fitness' },
                { key: 'teamwork', label: 'Teamwork', description: 'Communication and cooperation' },
                { key: 'leadership', label: 'Leadership', description: 'Encouragement and taking charge' },
                { key: 'basketballIQ', label: 'Basketball IQ', description: 'Game awareness and decision-making' },
              ].map((skill) => (
                <div key={skill.key} className="space-y-3 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">{skill.label}</Label>
                    <p className="text-xs text-gray-500">{skill.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[formData[skill.key as keyof typeof formData] as number]}
                      onValueChange={(value) => handleSliderChange(skill.key, value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">1 (Poor)</span>
                      <span className={`text-sm font-medium ${getRatingColor(formData[skill.key as keyof typeof formData] as number)}`}>
                        {formData[skill.key as keyof typeof formData]}/10 - {getRatingLabel(formData[skill.key as keyof typeof formData] as number)}
                      </span>
                      <span className="text-sm text-gray-500">10 (Excellent)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Coach Notes
                    </Label>
                    <Textarea
                      placeholder={`Add specific notes about ${skill.label.toLowerCase()}...`}
                      value={formData[`${skill.key}Notes` as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(`${skill.key}Notes`, e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Attributes Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" />
              Personal Attributes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'effort', label: 'Effort', description: 'Tries hard and gives maximum effort' },
                { key: 'attitude', label: 'Attitude', description: 'Positive mindset and sportsmanship' },
                { key: 'coachability', label: 'Coachability', description: 'Listens to feedback and applies it' },
                { key: 'consistency', label: 'Consistency', description: 'Performs at a steady level' },
                { key: 'improvement', label: 'Improvement', description: 'Shows progress over time' },
              ].map((attribute) => (
                <div key={attribute.key} className="space-y-3 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">{attribute.label}</Label>
                    <p className="text-xs text-gray-500">{attribute.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={[formData[attribute.key as keyof typeof formData] as number]}
                      onValueChange={(value) => handleSliderChange(attribute.key, value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">1 (Poor)</span>
                      <span className={`text-sm font-medium ${getRatingColor(formData[attribute.key as keyof typeof formData] as number)}`}>
                        {formData[attribute.key as keyof typeof formData]}/10 - {getRatingLabel(formData[attribute.key as keyof typeof formData] as number)}
                      </span>
                      <span className="text-sm text-gray-500">10 (Excellent)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Coach Notes
                    </Label>
                    <Textarea
                      placeholder={`Add specific notes about ${attribute.label.toLowerCase()}...`}
                      value={formData[`${attribute.key}Notes` as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(`${attribute.key}Notes`, e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Written Feedback Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Written Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="strengths">Strengths</Label>
                <Textarea
                  id="strengths"
                  placeholder="What are your child's basketball strengths?"
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areasForImprovement">Areas for Improvement</Label>
                <Textarea
                  id="areasForImprovement"
                  placeholder="What areas need the most work?"
                  value={formData.areasForImprovement}
                  onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specificGoals">Specific Goals</Label>
                <Textarea
                  id="specificGoals"
                  placeholder="What specific goals should your child work on?"
                  value={formData.specificGoals}
                  onChange={(e) => handleInputChange('specificGoals', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentNotes">Additional Notes</Label>
                <Textarea
                  id="parentNotes"
                  placeholder="Any additional observations or comments?"
                  value={formData.parentNotes}
                  onChange={(e) => handleInputChange('parentNotes', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Overall Assessment Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Overall Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Overall Rating</Label>
                <div className="space-y-2">
                  <Slider
                    value={[formData.overallRating]}
                    onValueChange={(value) => handleSliderChange('overallRating', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">1 (Poor)</span>
                    <span className={`text-sm font-medium ${getRatingColor(formData.overallRating)}`}>
                      {formData.overallRating}/10 - {getRatingLabel(formData.overallRating)}
                    </span>
                    <span className="text-sm text-gray-500">10 (Excellent)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Next Level Readiness</Label>
                <div className="space-y-2">
                  <Slider
                    value={[formData.nextLevelReadiness]}
                    onValueChange={(value) => handleSliderChange('nextLevelReadiness', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">1 (Not Ready)</span>
                    <span className={`text-sm font-medium ${getRatingColor(formData.nextLevelReadiness)}`}>
                      {formData.nextLevelReadiness}/10 - {getRatingLabel(formData.nextLevelReadiness)}
                    </span>
                    <span className="text-sm text-gray-500">10 (Very Ready)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="recommendedFocus">Recommended Focus Area</Label>
                <Input
                  id="recommendedFocus"
                  placeholder="e.g., Shooting form, Ball handling, Defense"
                  value={formData.recommendedFocus}
                  onChange={(e) => handleInputChange('recommendedFocus', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Report Card'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 