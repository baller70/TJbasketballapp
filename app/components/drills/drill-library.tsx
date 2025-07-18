
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Target, 
  Zap, 
  Users, 
  Shield, 
  Navigation, 
  Activity, 
  Layers, 
  Plus,
  ChevronDown,
  ChevronRight,
  Clock, 
  Trophy,
  Calendar,
  Play,
  Upload,
  MessageSquare,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Drill } from '@/lib/types';

const SKILL_CATEGORIES = [
  { 
    id: 'shooting', 
    name: 'Shooting', 
    icon: Target, 
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    description: 'Improve your shooting accuracy and form'
  },
  { 
    id: 'dribbling', 
    name: 'Dribbling & Ball Handling', 
    icon: Zap, 
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    description: 'Master ball control and dribbling techniques'
  },
  { 
    id: 'passing', 
    name: 'Passing', 
    icon: Users, 
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    description: 'Develop precise passing skills'
  },
  { 
    id: 'defense', 
    name: 'Defense', 
    icon: Shield, 
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: 'Build strong defensive fundamentals'
  },
  { 
    id: 'footwork', 
    name: 'Footwork', 
    icon: Navigation, 
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    description: 'Enhance agility and movement'
  },
  { 
    id: 'conditioning', 
    name: 'Conditioning', 
    icon: Activity, 
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    description: 'Build endurance and strength'
  },
  { 
    id: 'fundamentals', 
    name: 'Fundamentals', 
    icon: Layers, 
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    description: 'Master the basics of basketball'
  }
];

export default function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [customDrill, setCustomDrill] = useState({
    name: '',
    description: '',
    category: '',
    skillLevel: '',
    duration: 15,
    equipment: '',
    stepByStep: '',
    coachingTips: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchDrills();
  }, []);

  const fetchDrills = async () => {
    try {
      const response = await fetch('/api/drills');
      if (response.ok) {
        const data = await response.json();
        setDrills(data);
      }
    } catch (error) {
      console.error('Error fetching drills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (drillId: string) => {
    try {
      const response = await fetch(`/api/drills/${drillId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const fetchMedia = async (drillId: string) => {
    try {
      const response = await fetch(`/api/drills/${drillId}/media`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
    }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
    }
  };

  const handleCreateDrill = async () => {
    if (!customDrill.name || !customDrill.description || !customDrill.category || !customDrill.skillLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/drills/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customDrill),
      });

      if (response.ok) {
        const newDrill = await response.json();
        setDrills([...drills, newDrill]);
        setShowCreateDialog(false);
        setCustomDrill({
          name: '',
          description: '',
          category: '',
          skillLevel: '',
          duration: 15,
          equipment: '',
          stepByStep: '',
          coachingTips: '',
          videoUrl: ''
        });
        toast.success('Custom drill created successfully!');
      } else {
        toast.error('Failed to create drill');
      }
    } catch (error) {
      console.error('Error creating drill:', error);
      toast.error('Error creating drill');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddToSchedule = async (drill: Drill) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: drill.name,
          description: drill.description,
          date: new Date().toISOString(),
          type: 'drill'
        }),
      });

      if (response.ok) {
        toast.success('Drill added to schedule!');
      } else {
        toast.error('Failed to add drill to schedule');
      }
    } catch (error) {
      console.error('Error adding drill to schedule:', error);
      toast.error('Error adding drill to schedule');
    }
  };

  const handleDrillClick = (drill: Drill) => {
    setSelectedDrill(drill);
    fetchComments(drill.id);
    fetchMedia(drill.id);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getFilteredDrills = (categoryId: string) => {
    return drills.filter(drill => drill.category.toLowerCase() === categoryId);
  };

  const renderDrillCard = (drill: Drill, index: number) => (
    <Card 
      key={drill.id}
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-white to-orange-50/30 border-orange-200/50"
      onClick={() => handleDrillClick(drill)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
              {drill.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {drill.description}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1 ml-3">
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium ${
                drill.skillLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
                drill.skillLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}
            >
              {drill.skillLevel}
            </Badge>
            {drill.isCustom && (
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                Custom
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{drill.duration} min</span>
            </div>
            {drill.equipment && drill.equipment.length > 0 && (
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{drill.equipment}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToSchedule(drill);
              }}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Add to Schedule
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3 border-orange-200 hover:bg-orange-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDrillClick(drill);
              }}
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryDropdown = (category: any) => {
    const categoryDrills = getFilteredDrills(category.id);
    const isExpanded = expandedCategories[category.id];
    const Icon = category.icon;

    return (
      <div key={category.id} className="mb-6">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleCategory(category.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-6 h-auto hover:bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {categoryDrills.length} drill{categoryDrills.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
              {categoryDrills.map((drill, index) => renderDrillCard(drill, index))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading drills...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Drill Library</h2>
          <p className="text-gray-600 mt-1">Choose from our collection of basketball drills</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Drill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Drill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Drill Name *</Label>
              <Input
                    id="name"
                    value={customDrill.name}
                    onChange={(e) => setCustomDrill({...customDrill, name: e.target.value})}
                    placeholder="Enter drill name"
              />
            </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={customDrill.category} onValueChange={(value) => setCustomDrill({...customDrill, category: value})}>
              <SelectTrigger>
                      <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                      {SKILL_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
              </SelectContent>
            </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={customDrill.description}
                  onChange={(e) => setCustomDrill({...customDrill, description: e.target.value})}
                  placeholder="Describe what this drill teaches"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skillLevel">Skill Level *</Label>
                  <Select value={customDrill.skillLevel} onValueChange={(value) => setCustomDrill({...customDrill, skillLevel: value})}>
              <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={customDrill.duration}
                    onChange={(e) => setCustomDrill({...customDrill, duration: parseInt(e.target.value) || 15})}
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                <Input
                  id="equipment"
                  value={customDrill.equipment}
                  onChange={(e) => setCustomDrill({...customDrill, equipment: e.target.value})}
                  placeholder="Basketball, Cones, etc."
                />
              </div>

              <div>
                <Label htmlFor="stepByStep">Step-by-Step Instructions</Label>
                <Textarea
                  id="stepByStep"
                  value={customDrill.stepByStep}
                  onChange={(e) => setCustomDrill({...customDrill, stepByStep: e.target.value})}
                  placeholder="Enter each step on a new line"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="coachingTips">Coaching Tips</Label>
                <Textarea
                  id="coachingTips"
                  value={customDrill.coachingTips}
                  onChange={(e) => setCustomDrill({...customDrill, coachingTips: e.target.value})}
                  placeholder="Enter each tip on a new line"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL (optional)</Label>
                <Input
                  id="videoUrl"
                  value={customDrill.videoUrl}
                  onChange={(e) => setCustomDrill({...customDrill, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDrill} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Drill'}
                </Button>
              </div>
                  </div>
          </DialogContent>
        </Dialog>
                  </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8 bg-gray-100">
          <TabsTrigger value="all" className="text-sm">All Skills</TabsTrigger>
          {SKILL_CATEGORIES.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Skills Tab */}
        <TabsContent value="all" className="space-y-6">
          {SKILL_CATEGORIES.map(category => renderCategoryDropdown(category))}
        </TabsContent>

        {/* Individual Category Tabs */}
        {SKILL_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {renderCategoryDropdown(category)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Drill Details Dialog */}
      <Dialog open={!!selectedDrill} onOpenChange={() => setSelectedDrill(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedDrill && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedDrill.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Badge variant="secondary">{selectedDrill.skillLevel}</Badge>
                  <Badge variant="outline">{selectedDrill.category}</Badge>
                  {selectedDrill.isCustom && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-700">Custom</Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700">{selectedDrill.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Duration</h4>
                    <p className="text-gray-600">{selectedDrill.duration} minutes</p>
                  </div>
                  {selectedDrill.equipment && selectedDrill.equipment.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">Equipment</h4>
                      <p className="text-gray-600">{selectedDrill.equipment}</p>
                  </div>
                  )}
                </div>

                {selectedDrill.stepByStep && selectedDrill.stepByStep.length > 0 && (
                          <div>
                    <h3 className="font-semibold text-lg mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedDrill.stepByStep.split(',').map((instruction: string, index: number) => (
                        <li key={index} className="text-gray-700">{instruction.trim()}</li>
                      ))}
                    </ol>
                          </div>
                )}

                {selectedDrill.coachingTips && selectedDrill.coachingTips.length > 0 && (
                          <div>
                    <h3 className="font-semibold text-lg mb-2">Coaching Tips</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedDrill.coachingTips.split(',').map((tip: string, index: number) => (
                        <li key={index} className="text-gray-700">{tip.trim()}</li>
                      ))}
                    </ul>
                          </div>
                )}

                          {selectedDrill.videoUrl && (
                            <div>
                    <h3 className="font-semibold text-lg mb-2">Video</h3>
                                <a 
                                  href={selectedDrill.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                                >
                      Watch Video
                                </a>
                            </div>
                          )}

                {/* Media Upload Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Media
                  </h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Click to upload images or videos</p>
                      </label>
                          </div>
                    {uploadFile && (
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm">{uploadFile.name}</span>
                        <Button size="sm">Upload</Button>
                        </div>
                      )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments
                  </h3>
          <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
              </div>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <Button size="sm" className="mt-2">
                          Post Comment
              </Button>
            </div>
          </div>
                    
                    {comments.map((comment, index) => (
                      <div key={index} className="flex gap-3 bg-gray-50 p-3 rounded">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{comment.author}</p>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{comment.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
