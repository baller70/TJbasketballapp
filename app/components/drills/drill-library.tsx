
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Drill, DrillFilters } from '@/lib/types';

export default function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
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
    applyFilters();
  }, [drills, filters]);

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

  const applyFilters = () => {
    let filtered = drills;

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
      filtered = filtered.filter(drill => drill.duration.includes(filters.duration || ''));
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
          <p className="text-gray-600">Discover and practice basketball drills tailored for your skill level</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-gray-600">
            {filteredDrills.length} of {drills.length} drills
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="shooting">Shooting</SelectItem>
                <SelectItem value="dribbling">Dribbling</SelectItem>
                <SelectItem value="passing">Passing</SelectItem>
                <SelectItem value="defense">Defense</SelectItem>
                <SelectItem value="footwork">Footwork</SelectItem>
                <SelectItem value="conditioning">Conditioning</SelectItem>
                <SelectItem value="fundamentals">Fundamentals</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.skillLevel}
              onValueChange={(value) => setFilters({ ...filters, skillLevel: value === 'all' ? undefined : value as any })}
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
          </div>
        </CardContent>
      </Card>

      {/* Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrills.map((drill, index) => (
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
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {selectedDrill.duration}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Equipment Needed</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedDrill.equipment.map((item, idx) => (
                                <Badge key={idx} variant="outline">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Step-by-Step Instructions</h4>
                            <ol className="space-y-2">
                              {selectedDrill.stepByStep.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="text-gray-700">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Coaching Tips</h4>
                            <ul className="space-y-1">
                              {selectedDrill.coachingTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {selectedDrill.videoUrl && (
                            <div>
                              <h4 className="font-semibold mb-2">Video Tutorial</h4>
                              <Button 
                                variant="outline" 
                                asChild
                                className="w-full"
                              >
                                <a 
                                  href={selectedDrill.videoUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Watch Tutorial Video
                                </a>
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-4 border-t">
                            <Button 
                              className="flex-1 bg-orange-600 hover:bg-orange-700"
                              onClick={() => addToSchedule(selectedDrill.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Schedule
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Practice
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => addToSchedule(drill.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDrills.length === 0 && (
        <Card className="border-orange-100">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No drills found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find more drills.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
