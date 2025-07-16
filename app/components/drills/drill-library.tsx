
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Star, 
  BookOpen, 
  Users,
  Target,
  Trophy,
  ExternalLink,
  Plus,
  CheckCircle,
  Upload,
  Camera,
  Video,
  Zap,
  Shield,
  Navigation,
  Activity,
  Layers,
  MessageCircle,
  Send,
  Image,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Drill, DrillFilters, SkillLevel } from '@/lib/types';
import MediaUpload from '@/components/media/media-upload';

// Category configuration with icons and descriptions
const SKILL_CATEGORIES = {
  shooting: {
    name: 'Shooting',
    icon: Target,
    description: 'Master your shooting form and accuracy',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  dribbling: {
    name: 'Dribbling & Ball Handling',
    icon: Zap,
    description: 'Improve your ball control and dribbling skills',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  passing: {
    name: 'Passing',
    icon: Users,
    description: 'Learn different types of passes and teamwork',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  defense: {
    name: 'Defense & Rebounding',
    icon: Shield,
    description: 'Develop defensive skills and rebounding techniques',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  footwork: {
    name: 'Footwork & Movement',
    icon: Navigation,
    description: 'Build agility and proper movement patterns',
    color: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  conditioning: {
    name: 'Conditioning & Agility',
    icon: Activity,
    description: 'Build strength, speed, and endurance',
    color: 'bg-pink-100 text-pink-800',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  fundamentals: {
    name: 'Fundamentals & Fun Games',
    icon: Layers,
    description: 'Learn basic skills through fun activities',
    color: 'bg-gray-100 text-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

export default function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [showDrillDialog, setShowDrillDialog] = useState(false);
  const [uploadDrill, setUploadDrill] = useState<Drill | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [mediaUploads, setMediaUploads] = useState<any[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showCustomDrillDialog, setShowCustomDrillDialog] = useState(false);
  const [customDrill, setCustomDrill] = useState({
    name: '',
    description: '',
    category: '',
    skillLevel: '',
    duration: '',
    equipment: '',
    stepByStep: '',
    coachingTips: '',
    videoUrl: ''
  });
  const [creatingDrill, setCreatingDrill] = useState(false);
  const [filters, setFilters] = useState<DrillFilters>({
    category: undefined,
    skillLevel: undefined,
    searchTerm: '',
    duration: undefined,
  });

  useEffect(() => {
    fetchDrills();
  }, []);

  useEffect(() => {
    filterDrills();
  }, [drills, filters, activeCategory]);

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

  const filterDrills = () => {
    let filtered = drills;

    // Filter by active category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(drill => drill.category === activeCategory);
    }

    // Apply other filters
    if (filters.category) {
      filtered = filtered.filter(drill => drill.category === filters.category);
    }

    if (filters.skillLevel) {
      filtered = filtered.filter(drill => drill.skillLevel === filters.skillLevel);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(drill => 
        drill.name.toLowerCase().includes(filters.searchTerm?.toLowerCase() || '') ||
        drill.description.toLowerCase().includes(filters.searchTerm?.toLowerCase() || '')
      );
    }

    if (filters.duration) {
      filtered = filtered.filter(drill => {
        const duration = parseInt(drill.duration);
        if (filters.duration === '5') return duration <= 5;
        if (filters.duration === '10') return duration <= 10;
        if (filters.duration === '15') return duration <= 15;
        if (filters.duration === '20') return duration >= 20;
        return true;
      });
    }

    setFilteredDrills(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      shooting: 'bg-red-100 text-red-800',
      dribbling: 'bg-blue-100 text-blue-800',
      passing: 'bg-green-100 text-green-800',
      defense: 'bg-purple-100 text-purple-800',
      footwork: 'bg-yellow-100 text-yellow-800',
      conditioning: 'bg-pink-100 text-pink-800',
      fundamentals: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSkillLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const addToSchedule = async (drillId: string) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drillId,
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Show success message
        console.log('Drill added to schedule');
      }
    } catch (error) {
      console.error('Error adding drill to schedule:', error);
    }
  };

  const handleUploadMedia = (drill: Drill) => {
    setUploadDrill(drill);
    setShowUploadDialog(true);
  };

  const handleMediaUpload = async (files: any[]) => {
    if (!uploadDrill) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (fileUpload) => {
        const formData = new FormData();
        formData.append('file', fileUpload.file);
        formData.append('drillId', uploadDrill.id);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      
      // Close dialog after successful upload
      setShowUploadDialog(false);
      setUploadDrill(null);
      
      // Show success message
      console.log('Media uploaded successfully');

    } catch (error) {
      console.error('Error uploading media:', error);
    } finally {
      setUploading(false);
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
    }
  };

  const fetchMediaUploads = async (drillId: string) => {
    try {
      const response = await fetch(`/api/drills/${drillId}/media`);
      if (response.ok) {
        const data = await response.json();
        setMediaUploads(data);
      }
    } catch (error) {
      console.error('Error fetching media uploads:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedDrill || !newComment.trim()) return;

    try {
      const response = await fetch(`/api/drills/${selectedDrill.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedDrill) return;

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/drills/${selectedDrill.id}/media`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedMedia = await response.json();
        setMediaUploads([uploadedMedia, ...mediaUploads]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreateCustomDrill = async () => {
    if (!customDrill.name || !customDrill.description || !customDrill.category || !customDrill.skillLevel) {
      alert('Please fill in all required fields (name, description, category, and skill level)');
      return;
    }

    setCreatingDrill(true);
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
        setDrills([newDrill, ...drills]);
        setCustomDrill({
          name: '',
          description: '',
          category: '',
          skillLevel: '',
          duration: '',
          equipment: '',
          stepByStep: '',
          coachingTips: '',
          videoUrl: ''
        });
        setShowCustomDrillDialog(false);
        alert('Custom drill created successfully!');
      } else {
        const error = await response.json();
        alert(`Error creating drill: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating custom drill:', error);
      alert('Error creating custom drill');
    } finally {
      setCreatingDrill(false);
    }
  };

  const getDrillsByCategory = (category: string) => {
    return drills.filter(drill => drill.category === category);
  };

  const renderDrillCard = (drill: Drill, index: number) => (
    <motion.div
      key={drill.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-orange-100 hover:shadow-lg transition-all duration-300 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{drill.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {drill.description}
              </CardDescription>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getCategoryColor(drill.category)}>
              {drill.category}
            </Badge>
            <Badge className={getSkillLevelColor(drill.skillLevel)}>
              {drill.skillLevel}
            </Badge>
            {(drill as any).isCustom && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Custom
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{drill.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>{drill.equipment.length} equipment needed</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedDrill(drill)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-orange-600" />
                    {selectedDrill?.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedDrill?.description}
                  </DialogDescription>
                </DialogHeader>
                
                {selectedDrill && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge className={getCategoryColor(selectedDrill.category)}>
                        {selectedDrill.category}
                      </Badge>
                      <Badge className={getSkillLevelColor(selectedDrill.skillLevel)}>
                        {selectedDrill.skillLevel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{selectedDrill.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{selectedDrill.equipment.length} equipment</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Equipment Needed:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDrill.equipment.map((item, index) => (
                          <Badge key={index} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Step-by-Step Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedDrill.stepByStep.map((step, index) => (
                          <li key={index} className="text-sm text-gray-700">{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Coaching Tips:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedDrill.coachingTips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-700">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedDrill.alternativeVideos && selectedDrill.alternativeVideos.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Video Resources:</h4>
                        <div className="space-y-2">
                          {selectedDrill.alternativeVideos.map((video, index) => (
                            <a
                              key={index}
                              href={video as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Video {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => addToSchedule(selectedDrill.id)}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Schedule
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleUploadMedia(selectedDrill)}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Media
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              onClick={() => addToSchedule(drill.id)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Drill Library</h2>
          <p className="text-gray-600">Discover and practice basketball drills organized by skill type</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-gray-600">
            {drills.length} total drills
          </Badge>
          <Dialog open={showCustomDrillDialog} onOpenChange={setShowCustomDrillDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Drill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Drill</DialogTitle>
                <DialogDescription>
                  Design your own basketball drill with custom instructions and requirements
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Drill Name *</label>
                    <Input
                      placeholder="Enter drill name"
                      value={customDrill.name}
                      onChange={(e) => setCustomDrill({ ...customDrill, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Input
                      type="number"
                      placeholder="15"
                      value={customDrill.duration}
                      onChange={(e) => setCustomDrill({ ...customDrill, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <Textarea
                    placeholder="Describe what this drill is about and its purpose"
                    value={customDrill.description}
                    onChange={(e) => setCustomDrill({ ...customDrill, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <Select
                      value={customDrill.category}
                      onValueChange={(value) => setCustomDrill({ ...customDrill, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                          <SelectItem key={key} value={key}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Skill Level *</label>
                    <Select
                      value={customDrill.skillLevel}
                      onValueChange={(value) => setCustomDrill({ ...customDrill, skillLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Equipment</label>
                  <Input
                    placeholder="Basketball, cones, ladder (separate with commas)"
                    value={customDrill.equipment}
                    onChange={(e) => setCustomDrill({ ...customDrill, equipment: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Step-by-Step Instructions</label>
                  <Textarea
                    placeholder="1. Start in athletic stance&#10;2. Dribble with right hand&#10;3. Switch to left hand&#10;(each line will be a separate step)"
                    value={customDrill.stepByStep}
                    onChange={(e) => setCustomDrill({ ...customDrill, stepByStep: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Coaching Tips</label>
                  <Textarea
                    placeholder="Keep your head up&#10;Focus on ball control&#10;Maintain proper form&#10;(each line will be a separate tip)"
                    value={customDrill.coachingTips}
                    onChange={(e) => setCustomDrill({ ...customDrill, coachingTips: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Video URL (optional)</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={customDrill.videoUrl}
                    onChange={(e) => setCustomDrill({ ...customDrill, videoUrl: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomDrillDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCustomDrill}
                    disabled={creatingDrill}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {creatingDrill ? 'Creating...' : 'Create Drill'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search drills..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.skillLevel}
              onValueChange={(value) => setFilters({ ...filters, skillLevel: value === 'all' ? undefined : value as SkillLevel })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.duration}
              onValueChange={(value) => setFilters({ ...filters, duration: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20+ minutes</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => setFilters({ category: undefined, skillLevel: undefined, searchTerm: '', duration: undefined })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skill Categories Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All Skills</TabsTrigger>
          {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-1">
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {/* Show all categories */}
          {Object.entries(SKILL_CATEGORIES).map(([categoryKey, category]) => {
            const categoryDrills = getDrillsByCategory(categoryKey);
            if (categoryDrills.length === 0) return null;

            return (
              <div key={categoryKey} className="space-y-4">
                <Card className={`${category.bgColor} ${category.borderColor} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {category.description} • {categoryDrills.length} drills
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryDrills.slice(0, 6).map((drill, index) => renderDrillCard(drill, index))}
                </div>
                
                {categoryDrills.length > 6 && (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveCategory(categoryKey)}
                      className="mt-4"
                    >
                      View All {category.name} Drills ({categoryDrills.length})
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        {/* Individual category tabs */}
        {Object.entries(SKILL_CATEGORIES).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey} className="space-y-6">
            <Card className={`${category.bgColor} ${category.borderColor} border-2`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${category.color}`}>
                    <category.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{category.name}</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrills.map((drill, index) => renderDrillCard(drill, index))}
            </div>

            {filteredDrills.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="text-gray-500">
                    <category.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No drills found for the current filters.</p>
                    <p className="text-sm mt-2">Try adjusting your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media for {uploadDrill?.name}</DialogTitle>
            <DialogDescription>
              Upload videos or images to demonstrate this drill
            </DialogDescription>
          </DialogHeader>
          
          <MediaUpload
            onUpload={handleMediaUpload}
            disabled={uploading}
            acceptedTypes={['video/*', 'image/*']}
            maxFiles={5}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
