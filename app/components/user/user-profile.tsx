'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  User, 
  Trophy, 
  Calendar, 
  MessageCircle, 
  Camera, 
  Play, 
  Plus, 
  Star,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Send,
  Eye,
  Edit2,
  Save,
  ArrowLeft,
  Pencil,
  Eraser,
  Circle,
  Square,
  ArrowRight,
  Type,
  Palette,
  Download,
  RotateCcw,
  Trash2,
  Video,
  Image as ImageIcon,
  FileText,
  Filter,
  Search,
  SortDesc,
  Calendar as CalendarIcon,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  History,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileProps {
  userId: string;
  onBack: () => void;
}

interface MediaSubmission {
  id: string;
  type: 'image' | 'video';
  url: string;
  comments: string;
  submittedAt: string;
  coachComments?: string;
  coachAnalysis?: {
    annotations: Array<{
      type: 'arrow' | 'circle' | 'rectangle' | 'text';
      x: number;
      y: number;
      width?: number;
      height?: number;
      text?: string;
      color: string;
    }>;
    feedback: string;
  };
}

interface SkillAssessment {
  id: string;
  assessedBy: string;
  assessorName: string;
  assessedAt: string;
  overallComment: string;
  skills: {
    ballHandling: number;
    shooting: number;
    passing: number;
    defense: number;
    rebounding: number;
    footwork: number;
    conditioning: number;
    teamwork: number;
    leadership: number;
    basketballIQ: number;
  };
  skillComments: {
    [key: string]: string;
  };
  recommendations: string[];
  nextAssessmentDate?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  playerProfile: {
    skillLevel: string;
    currentLevel: string;
    totalPoints: number;
    currentStreak: number;
    favoritePosition: string;
  };
  assessments: {
    ballHandling: number;
    shooting: number;
    passing: number;
    defense: number;
    rebounding: number;
    footwork: number;
    conditioning: number;
    teamwork: number;
    leadership: number;
    basketballIQ: number;
    lastAssessment: string;
  };
  assessmentHistory: SkillAssessment[];
  drillHistory: Array<{
    id: string;
    name: string;
    completedAt: string;
    rating: number;
    comments: string;
    coachComments?: string;
    mediaSubmissions: MediaSubmission[];
  }>;
  workoutHistory: Array<{
    id: string;
    name: string;
    completedAt: string;
    rating: number;
    comments: string;
    coachComments?: string;
    mediaSubmissions: MediaSubmission[];
  }>;
  mediaSubmissions: MediaSubmission[];
}

// Drawing Tools Component
const DrawingTools = ({ onAnnotate, selectedTool, onToolChange, selectedColor, onColorChange }: any) => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];
  
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
      <Button
        variant={selectedTool === 'arrow' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('arrow')}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedTool === 'circle' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('circle')}
      >
        <Circle className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('rectangle')}
      >
        <Square className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedTool === 'text' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('text')}
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant={selectedTool === 'eraser' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange('eraser')}
      >
        <Eraser className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1 ml-4">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-white' : 'border-gray-600'}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

// Media Upload Component
const MediaUpload = ({ onUpload }: { onUpload: (file: File, note: string) => void }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNote, setUploadNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, uploadNote);
      setSelectedFile(null);
      setUploadNote('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="hidden"
        />
        {selectedFile ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
            <Button onClick={() => setSelectedFile(null)} variant="outline" size="sm">
              Change File
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Camera className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">Click to select image or video</p>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              Select File
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="uploadNote">Training Note</Label>
        <Textarea
          id="uploadNote"
          value={uploadNote}
          onChange={(e) => setUploadNote(e.target.value)}
          placeholder="Add context about this training session..."
          rows={3}
        />
      </div>

      <Button onClick={handleUpload} disabled={!selectedFile} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        Upload Media
      </Button>
    </div>
  );
};

export default function UserProfile({ userId, onBack }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAssessment, setEditingAssessment] = useState(false);
  const [assessmentValues, setAssessmentValues] = useState<any>({});
  const [assessmentComments, setAssessmentComments] = useState<any>({});
  const [overallComment, setOverallComment] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>(['']);
  const [nextAssessmentDate, setNextAssessmentDate] = useState('');
  const [commentingOnId, setCommentingOnId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [selectedDrill, setSelectedDrill] = useState<string>('');
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [availableDrills, setAvailableDrills] = useState<any[]>([]);
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaSubmission | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'drills' | 'workouts' | 'media'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'name'>('date');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Drawing tools state
  const [drawingTool, setDrawingTool] = useState<'pencil' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'eraser'>('pencil');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Analysis state
  const [coachFeedback, setCoachFeedback] = useState('');
  const [improvementNotes, setImprovementNotes] = useState('');
  const [positiveNotes, setPositiveNotes] = useState('');
  const [overallRating, setOverallRating] = useState(0);

  // State for coaching toolkit persistence and stability
  const [isCoachingActive, setIsCoachingActive] = useState(false);
  const [toolkitLocked, setToolkitLocked] = useState(false);
  const [persistentAnalysis, setPersistentAnalysis] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [toolkitStable, setToolkitStable] = useState(false);

  // Analysis functions
  const clearCanvas = () => {
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Visual feedback for clearing
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(10, 10, 80, 25);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText('CLEARED', 15, 28);
        ctx.restore();
        
        // Clear the feedback after 1 second
        setTimeout(() => {
          ctx.clearRect(10, 10, 80, 25);
        }, 1000);
      }
    }
    setAnnotations([]);
  };

  // Enhanced test function
  const testCoachingToolkit = () => {
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    const image = document.getElementById('analysis-image') as HTMLImageElement;
    
    if (canvas && image) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Test drawing different shapes
        ctx.save();
        
        // Test pencil (red line)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(100, 100);
        ctx.stroke();
        
        // Test rectangle (blue)
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(120, 10, 80, 60);
        
        // Test circle (green)
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(160, 120, 30, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Test arrow (purple)
        ctx.strokeStyle = '#800080';
        ctx.lineWidth = 3;
        drawArrow(ctx, 50, 150, 150, 200);
        
        // Test text
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('TEST COMPLETE', 10, 250);
        
        ctx.restore();
        
        // Show success message
        alert('Coaching toolkit test completed! Check the canvas for test drawings.');
      }
    } else {
      alert('Canvas or image not found! Make sure you have selected an image for analysis.');
    }
  };

  const saveAnalysis = async () => {
    if (!selectedMedia) return;
    
    const analysisData = {
      mediaId: selectedMedia.id,
      coachFeedback,
      improvementNotes,
      positiveNotes,
      overallRating,
      annotations,
      analyzedAt: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/media/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Analysis saved successfully! 🎉');
        
        // Reset form
        setCoachFeedback('');
        setImprovementNotes('');
        setPositiveNotes('');
        setOverallRating(0);
        setAnnotations([]);
        clearCanvas();
        setShowAnalysis(false);
      } else {
        alert('Error saving analysis: ' + result.error);
      }
      
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis. Please try again.');
    }
  };

  // Drawing functions
  const initializeCanvas = () => {
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    const image = document.getElementById('analysis-image') as HTMLImageElement;
    
    if (canvas && image) {
      // Wait for image to load and DOM to be ready
      const setup = () => {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          setupCanvas(canvas, image);
        }, 50);
      };
      
      if (image.complete && image.naturalHeight > 0) {
        setup();
      } else {
        image.onload = setup;
        // Fallback in case image is already loaded but onload didn't fire
        setTimeout(setup, 100);
      }
    } else {
      // Retry if elements aren't ready yet
      setTimeout(initializeCanvas, 100);
    }
  };

  // Helper function to get cursor for each tool
  const getCursorForTool = useCallback((tool: string) => {
    switch (tool) {
      case 'pencil': return 'crosshair';
      case 'arrow': return 'crosshair';
      case 'circle': return 'crosshair';
      case 'rectangle': return 'crosshair';
      case 'text': return 'text';
      case 'eraser': return 'grab';
      default: return 'crosshair';
    }
  }, []);

  // Draw annotation helper function
  const drawAnnotation = useCallback((ctx: CanvasRenderingContext2D, annotation: any) => {
    ctx.save();
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (annotation.type === 'rectangle') {
      const width = annotation.endX - annotation.startX;
      const height = annotation.endY - annotation.startY;
      ctx.strokeRect(annotation.startX, annotation.startY, width, height);
    } else if (annotation.type === 'circle') {
      const radius = Math.sqrt(Math.pow(annotation.endX - annotation.startX, 2) + Math.pow(annotation.endY - annotation.startY, 2));
      ctx.beginPath();
      ctx.arc(annotation.startX, annotation.startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (annotation.type === 'arrow') {
      drawArrow(ctx, annotation.startX, annotation.startY, annotation.endX, annotation.endY);
    } else if (annotation.type === 'text' && annotation.text) {
      ctx.fillStyle = annotation.color;
      ctx.font = `${annotation.size * 2}px Arial`;
      ctx.fillText(annotation.text, annotation.startX, annotation.startY);
    }
    
    ctx.restore();
  }, []);

  // Draw arrow helper function
  const drawArrow = useCallback((ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    const headLength = 20;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }, []);

  // Enhanced event handlers with better error handling and visual feedback
  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setStartX(x);
    setStartY(y);
    setCurrentX(x);
    setCurrentY(y);
    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawingTool === 'pencil') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
    
    // Visual feedback
    canvas.style.cursor = 'crosshair';
  }, [drawingTool, drawingColor, brushSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = e.target as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setCurrentX(x);
    setCurrentY(y);
    
    if (ctx) {
      if (drawingTool === 'pencil') {
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        // For shapes, clear and redraw preview
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw existing annotations
        annotations.forEach(annotation => {
          drawAnnotation(ctx, annotation);
        });
        
        // Draw current shape preview
        ctx.save();
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = 0.7;
        
        if (drawingTool === 'rectangle') {
          const width = x - startX;
          const height = y - startY;
          ctx.strokeRect(startX, startY, width, height);
        } else if (drawingTool === 'circle') {
          const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          console.log('Circle preview:', { startX, startY, radius });
        } else if (drawingTool === 'arrow') {
          drawArrow(ctx, startX, startY, x, y);
          console.log('Arrow preview:', { startX, startY, x, y });
        }
        
        ctx.restore();
      }
    }
  }, [isDrawing, drawingTool, drawingColor, brushSize, startX, startY, annotations, drawAnnotation, drawArrow]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== MOUSE UP EVENT ===');
    
    const canvas = e.target as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setCurrentX(x);
    setCurrentY(y);
    setIsDrawing(false);
    
    // Finalize the drawing
    if (ctx) {
      if (drawingTool === 'pencil') {
        // Pencil drawing is already complete
        console.log('Pencil drawing finalized');
      } else {
        // Clear the canvas and redraw everything including the final shape
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw existing annotations
        annotations.forEach(annotation => {
          drawAnnotation(ctx, annotation);
        });
        
        // Draw the final shape
        ctx.save();
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = 1.0;
        
        if (drawingTool === 'rectangle') {
          const width = x - startX;
          const height = y - startY;
          ctx.strokeRect(startX, startY, width, height);
          console.log('Rectangle finalized:', { startX, startY, width, height });
        } else if (drawingTool === 'circle') {
          const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          console.log('Circle finalized:', { startX, startY, radius });
        } else if (drawingTool === 'arrow') {
          drawArrow(ctx, startX, startY, x, y);
          console.log('Arrow finalized:', { startX, startY, x, y });
        }
        
        ctx.restore();
      }
      
      // Save the annotation
      const newAnnotation = {
        id: Date.now().toString(),
        type: drawingTool,
        startX,
        startY,
        endX: x,
        endY: y,
        color: drawingColor,
        size: brushSize,
        timestamp: new Date().toISOString()
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
      console.log('Annotation saved:', newAnnotation);
    }
    
    // Reset cursor
    canvas.style.cursor = getCursorForTool(drawingTool);
    
    console.log('Mouse up processed:', { x, y, tool: drawingTool, annotationsCount: annotations.length + 1 });
  }, [isDrawing, drawingTool, drawingColor, brushSize, startX, startY, annotations, getCursorForTool, drawAnnotation, drawArrow]);

  // Handle canvas click for text tool
  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (drawingTool === 'text') {
      const canvas = e.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      
      // Create temporary input for text
      const textInputEl = document.createElement('input');
      textInputEl.type = 'text';
      textInputEl.style.position = 'absolute';
      textInputEl.style.left = (rect.left + x) + 'px';
      textInputEl.style.top = (rect.top + y) + 'px';
      textInputEl.style.zIndex = '1000';
      textInputEl.style.fontSize = `${Math.max(12, brushSize)}px`;
      textInputEl.style.color = drawingColor;
      textInputEl.style.backgroundColor = 'transparent';
      textInputEl.style.border = '1px solid ' + drawingColor;
      textInputEl.style.outline = 'none';
      textInputEl.placeholder = 'Enter text...';
      
      document.body.appendChild(textInputEl);
      textInputEl.focus();
      
      textInputEl.addEventListener('keydown', (keyEvent) => {
        if (keyEvent.key === 'Enter') {
          const text = textInputEl.value.trim();
          if (text) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = drawingColor;
              ctx.font = `${Math.max(12, brushSize)}px Arial`;
              ctx.fillText(text, x, y);
              
              // Save annotation
              const annotation = {
                type: 'text',
                startX: x,
                startY: y,
                endX: x,
                endY: y,
                color: drawingColor,
                size: brushSize,
                text: text,
                timestamp: Date.now()
              };
              
              setAnnotations(prev => [...prev, annotation]);
              console.log('Added text annotation:', annotation);
            }
          }
          
          if (document.body.contains(textInputEl)) {
            document.body.removeChild(textInputEl);
          }
        }
      });
      
      textInputEl.addEventListener('blur', () => {
        if (document.body.contains(textInputEl)) {
          document.body.removeChild(textInputEl);
        }
      });
    }
  }, [drawingTool, brushSize, drawingColor]);

  // Setup canvas function - moved before useEffect to avoid initialization error
  const setupCanvas = useCallback((canvas: HTMLCanvasElement, image: HTMLImageElement) => {
    try {
      // Get the actual rendered size of the image
      const imageRect = image.getBoundingClientRect();
      const imageContainer = image.parentElement;
      
      if (!imageContainer) return;
      
      // Set canvas size to match the image display size exactly
      canvas.width = imageRect.width;
      canvas.height = imageRect.height;
      
      // Position canvas exactly over the image
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = imageRect.width + 'px';
      canvas.style.height = imageRect.height + 'px';
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = getCursorForTool(drawingTool);
      canvas.style.zIndex = '10';
      canvas.style.backgroundColor = 'transparent';
      
      // Remove existing event listeners properly
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseUp);
      canvas.removeEventListener('click', handleCanvasClick);
      
      // Add fresh event listeners
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseout', handleMouseUp);
      canvas.addEventListener('click', handleCanvasClick);
      
      // Initialize drawing context
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.imageSmoothingEnabled = true;
        ctx.globalAlpha = 1.0;
      }
      
      console.log('Canvas setup complete:', {
        width: canvas.width,
        height: canvas.height,
        tool: drawingTool,
        color: drawingColor,
        size: brushSize,
        hasEventListeners: true,
        cursor: getCursorForTool(drawingTool),
        canvasId: canvas.id
      });
      
      // Test draw to verify canvas is working
      if (ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, 60, 20);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = '12px Arial';
        ctx.fillText('READY', 10, 18);
        ctx.restore();
        
        // Clear indicator after 3 seconds
        setTimeout(() => {
          ctx.clearRect(5, 5, 60, 20);
        }, 3000);
      }
      
      return true;
    } catch (error) {
      console.error('Canvas setup failed:', error);
      return false;
    }
  }, [drawingTool, brushSize, drawingColor, handleMouseDown, handleMouseMove, handleMouseUp, handleCanvasClick, getCursorForTool]);

  // Initialize canvas when media is selected or analysis mode changes
  useEffect(() => {
    if (selectedMedia && selectedMedia.type === 'image' && showAnalysis) {
      console.log('Initializing canvas for image analysis...');
      
      // Multiple attempts to ensure canvas is initialized
      const initAttempts = [50, 100, 300, 500, 1000, 2000];
      
      initAttempts.forEach((delay, index) => {
        setTimeout(() => {
          const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
          const image = document.getElementById('analysis-image') as HTMLImageElement;
          
          if (canvas && image && image.complete && image.naturalHeight > 0) {
            console.log(`Canvas init attempt ${index + 1} at ${delay}ms - Success`);
            setupCanvas(canvas, image);
            
            // Update canvas cursor when tool changes
            canvas.style.cursor = getCursorForTool(drawingTool);
            
            // Add visual indicator that canvas is ready
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.save();
              ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
              ctx.fillRect(canvas.width - 60, 5, 50, 20);
              ctx.fillStyle = 'white';
              ctx.font = '12px Arial';
              ctx.fillText('READY', canvas.width - 55, 18);
              ctx.restore();
              
              // Clear indicator after 3 seconds
              setTimeout(() => {
                ctx.clearRect(canvas.width - 60, 5, 50, 20);
              }, 3000);
            }
          } else {
            console.log(`Canvas init attempt ${index + 1} at ${delay}ms - Failed`, { 
              canvas: !!canvas, 
              image: !!image, 
              complete: image?.complete, 
              naturalHeight: image?.naturalHeight 
            });
          }
        }, delay);
      });
    }
  }, [selectedMedia, showAnalysis, setupCanvas]);

  // Update canvas cursor when drawing tool changes
  useEffect(() => {
    if (showAnalysis && selectedMedia?.type === 'image') {
      const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
      if (canvas) {
        canvas.style.cursor = getCursorForTool(drawingTool);
        console.log('Tool changed to:', drawingTool, 'Cursor:', getCursorForTool(drawingTool));
      }
    }
  }, [drawingTool, showAnalysis, selectedMedia]);

  // Handle text input for text tool
  const handleTextInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim()) {
      const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
      const ctx = canvas?.getContext('2d');
      
      if (ctx) {
        ctx.font = `${brushSize * 4}px Arial`;
        ctx.fillStyle = drawingColor;
        ctx.fillText(textInput, textPosition.x, textPosition.y);
        setTextInput('');
      }
    }
  };

  const skillLabels = {
    ballHandling: 'Ball Handling',
    shooting: 'Shooting',
    passing: 'Passing',
    defense: 'Defense',
    rebounding: 'Rebounding',
    footwork: 'Footwork',
    conditioning: 'Conditioning',
    teamwork: 'Teamwork',
    leadership: 'Leadership',
    basketballIQ: 'Basketball IQ'
  };

  useEffect(() => {
    fetchUserData();
    fetchAvailableDrills();
    fetchAvailableWorkouts();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Fetch user basic info
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = userResponse.ok ? await userResponse.json() : null;
      
      // Fetch assessments
      const assessmentsResponse = await fetch(`/api/users/${userId}/assessments`);
      const assessmentsData = assessmentsResponse.ok ? await assessmentsResponse.json() : { assessments: [] };
      
      // Fetch media uploads
      const mediaResponse = await fetch(`/api/media/upload?userId=${userId}`);
      const mediaData = mediaResponse.ok ? await mediaResponse.json() : { data: [] };
      
      // Fetch drill history
      const drillsResponse = await fetch(`/api/users/${userId}/drills`);
      const drillsData = drillsResponse.ok ? await drillsResponse.json() : { drills: [] };
      
      // Fetch workout history
      const workoutsResponse = await fetch(`/api/users/${userId}/workouts`);
      const workoutsData = workoutsResponse.ok ? await workoutsResponse.json() : { workouts: [] };

      // Transform media uploads to match the expected format
      const mediaUploads = mediaData.data || [];
      const transformedMediaUploads = mediaUploads.map((upload: any) => ({
        id: upload.id,
        type: upload.fileType?.startsWith('video/') ? 'video' : 'image',
        url: upload.fileUrl,
        submittedAt: upload.uploadedAt,
        feedback: upload.note || '',
        rating: null,
        comments: upload.note || '',
        fileName: upload.fileName
      }));

      // Create mock drill history with real media submissions
      const mockDrillHistory = [
        {
          id: 'drill-1',
          name: 'Ball Handling Practice',
          category: 'Dribbling',
          completedAt: new Date().toISOString(),
          rating: 4,
          comments: 'Great improvement in control',
          mediaSubmissions: transformedMediaUploads.filter((media: any) => media.type === 'image' || media.type === 'video')
        },
        {
          id: 'drill-2', 
          name: 'Shooting Form',
          category: 'Shooting',
          completedAt: new Date(Date.now() - 86400000).toISOString(),
          rating: 5,
          comments: 'Perfect form today',
          mediaSubmissions: []
        }
      ];

      // If we have media uploads, add them to the first drill
      if (transformedMediaUploads.length > 0) {
        mockDrillHistory[0].mediaSubmissions = transformedMediaUploads;
      }

      // Combine all data
      const combinedData: UserData = {
        id: userId,
        name: userData?.name || 'Unknown User',
        email: userData?.email || '',
        playerProfile: userData?.playerProfile || {
          skillLevel: 'Beginner',
          currentLevel: 'Rookie',
          totalPoints: 0,
          currentStreak: 0,
          favoritePosition: 'Point Guard'
        },
        assessments: assessmentsData.assessments.length > 0 ? assessmentsData.assessments[0].skillRatings : {
          ballHandling: 1,
          shooting: 1,
          passing: 1,
          defense: 1,
          rebounding: 1,
          footwork: 1,
          conditioning: 1,
          teamwork: 1,
          leadership: 1,
          basketballIQ: 1,
          lastAssessment: null
        },
        assessmentHistory: assessmentsData.assessments.map((assessment: any) => ({
          id: assessment.id,
          assessedBy: assessment.assessorId,
          assessorName: assessment.assessorName,
          assessedAt: assessment.assessmentDate,
          overallComment: assessment.feedback?.parentNotes || '',
          skills: assessment.skillRatings,
          skillComments: assessment.skillComments,
          recommendations: assessment.feedback?.specificGoals ? assessment.feedback.specificGoals.split(', ') : [],
          nextAssessmentDate: null
        })),
        drillHistory: mockDrillHistory,
        workoutHistory: workoutsData.workouts || [],
        mediaSubmissions: transformedMediaUploads // Add media submissions directly to user data
      };

      setUserData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
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

  const handleMediaUpload = async (file: File, note: string) => {
    try {
      // First ensure default drill exists
      await fetch('/api/drills/seed-default', { method: 'POST' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('note', note);
      formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');
      
      // Get the General Training drill ID
      const drillsResponse = await fetch('/api/drills');
      const drillsData = await drillsResponse.json();
      const generalDrill = drillsData.find((drill: any) => drill.name === 'General Training');
      
      if (generalDrill) {
        formData.append('drillId', generalDrill.id);
      } else {
        throw new Error('Default drill not found');
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowUpload(false);
        fetchUserData();
        alert('Media uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const saveAssessment = async () => {
    try {
      const assessmentData = {
        skillRatings: assessmentValues,
        skillComments: assessmentComments,
        overallAssessment: {
          overallRating: assessmentValues.overall || 5,
          strengths: overallComment,
          areasForImprovement: '',
          parentNotes: overallComment,
          recommendedFocus: recommendations.join(', '),
          nextLevelReadiness: 5
        },
        recommendations: recommendations.filter(r => r.trim()),
        nextAssessmentDate: nextAssessmentDate || undefined
      };

      const response = await fetch(`/api/users/${userId}/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok) {
        setEditingAssessment(false);
        setAssessmentValues({});
        setAssessmentComments({});
        setOverallComment('');
        setRecommendations(['']);
        setNextAssessmentDate('');
        fetchUserData();
        alert('Assessment saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save assessment: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment. Please try again.');
    }
  };

  const saveComment = async (itemId: string, type: 'drill' | 'workout') => {
    try {
      const endpoint = type === 'drill' 
        ? `/api/drills/${itemId}/comments`
        : `/api/workouts/${itemId}/comments`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        setCommentingOnId(null);
        fetchUserData();
      }
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const assignDrill = async () => {
    try {
      const response = await fetch('/api/assignments/drill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          drillId: selectedDrill,
          note: assignmentNote,
        }),
      });

      if (response.ok) {
        setSelectedDrill('');
        setAssignmentNote('');
        alert('Drill assigned successfully!');
      }
    } catch (error) {
      console.error('Error assigning drill:', error);
    }
  };

  const assignWorkout = async () => {
    try {
      const response = await fetch('/api/assignments/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          workoutId: selectedWorkout,
          note: assignmentNote,
        }),
      });

      if (response.ok) {
        setSelectedWorkout('');
        setAssignmentNote('');
        alert('Workout assigned successfully!');
      }
    } catch (error) {
      console.error('Error assigning workout:', error);
    }
  };

  const addRecommendation = () => {
    setRecommendations([...recommendations, '']);
  };

  const updateRecommendation = (index: number, value: string) => {
    const newRecommendations = [...recommendations];
    newRecommendations[index] = value;
    setRecommendations(newRecommendations);
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const filteredActivities = React.useMemo(() => {
    if (!userData) return [];

    let activities: any[] = [];

    if (filterType === 'all' || filterType === 'drills') {
      activities = [...activities, ...userData.drillHistory.map(drill => ({ ...drill, type: 'drill' }))];
    }

    if (filterType === 'all' || filterType === 'workouts') {
      activities = [...activities, ...userData.workoutHistory.map(workout => ({ ...workout, type: 'workout' }))];
    }

    if (filterType === 'all' || filterType === 'media') {
      const mediaActivities = userData.drillHistory.flatMap(drill => 
        drill.mediaSubmissions.map(media => ({
          ...media,
          type: 'media',
          drillName: drill.name,
          completedAt: media.submittedAt
        }))
      );
      activities = [...activities, ...mediaActivities];
    }

    // Filter by search term
    if (searchTerm) {
      activities = activities.filter(activity =>
        activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.drillName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.comments?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort activities
    activities.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'name') {
        return (a.name || a.drillName || '').localeCompare(b.name || b.drillName || '');
      }
      return 0;
    });

    return activities;
  }, [userData, filterType, searchTerm, sortBy]);

  // Test individual tools
  const testIndividualTool = (tool: 'pencil' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'eraser') => {
    console.log(`=== TESTING INDIVIDUAL TOOL: ${tool} ===`);
    
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found');
      return;
    }
    
    // Set the tool
    setDrawingTool(tool);
    
    // Update canvas cursor
    canvas.style.cursor = getCursorForTool(tool);
    
    // Test the tool by simulating drawing
    ctx.save();
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = brushSize;
    
    const testX = 50 + Math.random() * 100;
    const testY = 50 + Math.random() * 100;
    
    switch (tool) {
      case 'pencil':
        ctx.beginPath();
        ctx.moveTo(testX, testY);
        ctx.lineTo(testX + 50, testY + 50);
        ctx.stroke();
        console.log('Pencil test completed');
        break;
        
      case 'rectangle':
        ctx.strokeRect(testX, testY, 60, 40);
        console.log('Rectangle test completed');
        break;
        
      case 'circle':
        ctx.beginPath();
        ctx.arc(testX, testY, 30, 0, 2 * Math.PI);
        ctx.stroke();
        console.log('Circle test completed');
        break;
        
      case 'arrow':
        drawArrow(ctx, testX, testY, testX + 50, testY + 50);
        console.log('Arrow test completed');
        break;
        
      case 'text':
        ctx.fillStyle = drawingColor;
        ctx.font = `${brushSize * 4}px Arial`;
        ctx.fillText('TEST', testX, testY);
        console.log('Text test completed');
        break;
    }
    
    ctx.restore();
    
    console.log(`Tool ${tool} test completed successfully`);
  };

  // Enhanced tool selection with visual feedback
  const selectTool = (tool: 'pencil' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'eraser') => {
    console.log(`=== SELECTING TOOL: ${tool} ===`);
    setDrawingTool(tool);
    
    // Update canvas cursor immediately
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.style.cursor = getCursorForTool(tool);
      console.log('Canvas cursor updated to:', getCursorForTool(tool));
      
      // Add visual feedback on canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.fillRect(canvas.width - 100, 5, 90, 20);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`Tool: ${tool}`, canvas.width - 95, 18);
        ctx.restore();
        
        // Clear indicator after 2 seconds
        setTimeout(() => {
          ctx.clearRect(canvas.width - 100, 5, 90, 20);
        }, 2000);
      }
    }
    
    console.log('Tool selected:', tool);
  };

  // Simple canvas test function
  const testCanvasBasic = () => {
    console.log('=== TESTING CANVAS BASIC FUNCTIONALITY ===');
    
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found');
      alert('Canvas not found! Please try opening a player profile first.');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found');
      alert('Canvas context not found!');
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Test basic drawing
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(100, 100);
    ctx.stroke();
    
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(20, 20, 80, 60);
    
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(150, 50, 30, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'purple';
    ctx.font = '16px Arial';
    ctx.fillText('CANVAS WORKS!', 50, 150);
    
    ctx.restore();
    
    console.log('Canvas test completed successfully!');
    alert('Canvas test completed! Check the image for drawings.');
  };

  // Simple test function to verify coaching toolkit is working
  const testCoachingToolkitBasic = () => {
    console.log('=== TESTING COACHING TOOLKIT BASIC FUNCTIONALITY ===');
    
    const canvas = document.getElementById('drawing-canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas not found! Make sure to open a player profile first.');
      alert('Canvas not found! Please click on a player card to open their profile first.');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found!');
      alert('Canvas context not found!');
      return;
    }
    
    console.log('Canvas found and working:', {
      width: canvas.width,
      height: canvas.height,
      id: canvas.id,
      hasContext: !!ctx
    });
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Test basic drawing
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(120, 20);
    ctx.lineTo(120, 80);
    ctx.lineTo(20, 80);
    ctx.closePath();
    ctx.stroke();
    
    // Test text
    ctx.fillStyle = 'blue';
    ctx.font = '16px Arial';
    ctx.fillText('TOOLKIT WORKING!', 30, 50);
    
    ctx.restore();
    
    console.log('✅ Basic canvas test completed successfully!');
    alert('✅ Canvas test completed! You should see a red rectangle with blue text.');
  };

  // Enhanced coaching toolkit activation with persistence
  const activateCoachingToolkit = useCallback((mediaItem: any) => {
    console.log('🎯 Activating coaching toolkit for:', mediaItem.type);
    
    // Set all states to ensure toolkit stays active
    setSelectedMedia(mediaItem);
    setShowAnalysis(true);
    setIsCoachingActive(true);
    setToolkitStable(true);
    setLastInteraction(Date.now());
    setPersistentAnalysis(true);
    
    // Lock the toolkit for 10 seconds to prevent accidental closing
    setToolkitLocked(true);
    setTimeout(() => {
      setToolkitLocked(false);
      console.log('🔓 Coaching toolkit unlocked');
    }, 10000);
    
    // Add visual feedback
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '🎯 Coaching Toolkit Activated! (Locked for 10 seconds)';
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Coaching toolkit activated and locked');
  }, []);

  // Enhanced deactivation with confirmation
  const deactivateCoachingToolkit = useCallback(() => {
    if (toolkitLocked) {
      alert('🔒 Coaching toolkit is locked. Please wait a moment before closing.');
      return;
    }
    
    const confirmClose = confirm('Are you sure you want to close the coaching toolkit? Any unsaved annotations will be lost.');
    if (confirmClose) {
      setShowAnalysis(false);
      setIsCoachingActive(false);
      setToolkitStable(false);
      setSelectedMedia(null);
      setPersistentAnalysis(false);
      setAnnotations([]);
      console.log('🔒 Coaching toolkit deactivated');
    }
  }, [toolkitLocked]);

  // Prevent accidental closing during interactions
  const handleToolkitInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    if (isCoachingActive) {
      setToolkitStable(true);
    }
  }, [isCoachingActive]);

  // Keep toolkit active with periodic updates
  useEffect(() => {
    if (isCoachingActive && toolkitStable) {
      const interval = setInterval(() => {
        setLastInteraction(Date.now());
        console.log('🔄 Coaching toolkit heartbeat:', new Date().toLocaleTimeString());
      }, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isCoachingActive, toolkitStable]);

  // Prevent toolkit from being closed by external state changes
  useEffect(() => {
    if (persistentAnalysis && !showAnalysis) {
      console.log('🔄 Restoring coaching toolkit state');
      setShowAnalysis(true);
    }
  }, [persistentAnalysis, showAnalysis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{userData.name}</h1>
            <p className="text-gray-600">{userData.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Training Media</DialogTitle>
                <DialogDescription>
                  Upload images or videos from training sessions
                </DialogDescription>
              </DialogHeader>
              <MediaUpload onUpload={handleMediaUpload} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Player Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skill Level</p>
                <p className="text-2xl font-bold">{userData.playerProfile.skillLevel}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-2xl font-bold">{userData.playerProfile.currentLevel}</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{userData.playerProfile.totalPoints}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold">{userData.playerProfile.currentStreak}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="text-2xl font-bold">{userData.playerProfile.favoritePosition}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.drillHistory.slice(0, 3).map((drill) => (
                    <div key={drill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{drill.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(drill.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < drill.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                {userData.assessmentHistory.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assessed by {userData.assessmentHistory[0].assessorName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(userData.assessmentHistory[0].assessedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {userData.assessmentHistory[0].recommendations.length} recommendations
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {userData.assessmentHistory[0].overallComment}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No assessments yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Assessment */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Skill Assessment</CardTitle>
                    <CardDescription>
                      Last updated: {new Date(userData.assessments.lastAssessment).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant={editingAssessment ? "default" : "outline"}
                    onClick={() => {
                      if (editingAssessment) {
                        saveAssessment();
                      } else {
                        setEditingAssessment(true);
                        setAssessmentValues(userData.assessments);
                      }
                    }}
                  >
                    {editingAssessment ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Complete Assessment
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        New Assessment
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(userData.assessments).filter(([key]) => key !== 'lastAssessment').map(([skill, value]) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">
                            {skillLabels[skill as keyof typeof skillLabels]}
                          </Label>
                          <span className="text-sm text-gray-600">
                            {editingAssessment ? (assessmentValues[skill] || value) : value}/10
                          </span>
                        </div>
                        {editingAssessment ? (
                          <div className="space-y-2">
                            <Slider
                              value={[assessmentValues[skill] || value]}
                              onValueChange={(newValue) => 
                                setAssessmentValues((prev: any) => ({ ...prev, [skill]: newValue[0] }))
                              }
                              max={10}
                              min={0}
                              step={1}
                              className="w-full"
                            />
                            <Textarea
                              placeholder={`Comments on ${skillLabels[skill as keyof typeof skillLabels]}...`}
                              value={assessmentComments[skill] || ''}
                              onChange={(e) => 
                                setAssessmentComments((prev: any) => ({ ...prev, [skill]: e.target.value }))
                              }
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${(Number(value) / 10) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Assessment Form Fields */}
                  {editingAssessment && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="overallComment">Overall Assessment</Label>
                        <Textarea
                          id="overallComment"
                          placeholder="Provide an overall assessment of the player's performance..."
                          value={overallComment}
                          onChange={(e) => setOverallComment(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Recommendations</Label>
                        {recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="Add a recommendation..."
                              value={rec}
                              onChange={(e) => updateRecommendation(index, e.target.value)}
                            />
                            {recommendations.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeRecommendation(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addRecommendation}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Recommendation
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nextAssessment">Next Assessment Date</Label>
                        <Input
                          id="nextAssessment"
                          type="date"
                          value={nextAssessmentDate}
                          onChange={(e) => setNextAssessmentDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assessment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Assessment History
                </CardTitle>
                <CardDescription>
                  View all previous skill assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {userData.assessmentHistory.map((assessment) => (
                    <Card key={assessment.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{assessment.assessorName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(assessment.assessedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAssessmentId(
                            selectedAssessmentId === assessment.id ? null : assessment.id
                          )}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {selectedAssessmentId === assessment.id ? 'Hide' : 'View'}
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {assessment.overallComment}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {assessment.recommendations.length} recommendations
                        </Badge>
                        {assessment.nextAssessmentDate && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Next: {new Date(assessment.nextAssessmentDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      <AnimatePresence>
                        {selectedAssessmentId === assessment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t space-y-4"
                          >
                            {/* Skills Breakdown */}
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(assessment.skills).map(([skill, value]) => (
                                <div key={skill} className="flex items-center justify-between text-sm">
                                  <span>{skillLabels[skill as keyof typeof skillLabels]}</span>
                                  <span className="font-medium">{value}/10</span>
                                </div>
                              ))}
                            </div>

                            {/* Skill Comments */}
                            {Object.keys(assessment.skillComments).length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Skill Comments:</h4>
                                {Object.entries(assessment.skillComments).map(([skill, comment]) => (
                                  <div key={skill} className="text-sm">
                                    <span className="font-medium">{skillLabels[skill as keyof typeof skillLabels]}:</span>
                                    <span className="ml-2 text-gray-600">{comment}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Recommendations */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Recommendations:</h4>
                              <ul className="space-y-1">
                                {assessment.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                  
                  {userData.assessmentHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No assessment history yet</p>
                      <p className="text-sm">Complete your first assessment to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="drills">Drills Only</SelectItem>
                    <SelectItem value="workouts">Workouts Only</SelectItem>
                    <SelectItem value="media">Media Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="rating">Sort by Rating</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{activity.name || activity.drillName}</h3>
                        <Badge variant="outline">
                          {activity.type}
                        </Badge>
                        {activity.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < activity.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(activity.completedAt).toLocaleDateString()} at {new Date(activity.completedAt).toLocaleTimeString()}
                      </p>
                      {activity.comments && (
                        <p className="text-sm text-gray-700 mb-2">{activity.comments}</p>
                      )}
                      {activity.coachComments && (
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Coach Comments:</p>
                          <p className="text-sm text-blue-800">{activity.coachComments}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.type === 'media' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateCoachingToolkit(activity)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCommentingOnId(commentingOnId === activity.id ? null : activity.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                  
                  {commentingOnId === activity.id && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <Textarea
                        placeholder="Add your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveComment(activity.id, activity.type as 'drill' | 'workout')}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCommentingOnId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Submissions</CardTitle>
              <CardDescription>
                View and analyze uploaded training media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Display uploaded media from API */}
                {userData.mediaSubmissions && userData.mediaSubmissions.map((media: any) => (
                  <Card key={media.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                      {media.type === 'video' ? (
                        media.url ? (
                          <video 
                            src={media.url} 
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <Video className="h-12 w-12 text-gray-400" />
                        )
                      ) : (
                        media.url ? (
                          <img 
                            src={media.url} 
                            alt="Uploaded media"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        )
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">General Training</p>
                      <p className="text-xs text-gray-600 mb-2">
                        {new Date(media.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 mb-3">{media.comments}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateCoachingToolkit(media)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMedia(media);
                            setShowAnalysis(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Analyze
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Display mock drill history media if no uploaded media */}
                {(!userData.mediaSubmissions || userData.mediaSubmissions.length === 0) && 
                  userData.drillHistory.flatMap(drill => 
                    drill.mediaSubmissions.map(media => (
                      <Card key={media.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          {media.type === 'video' ? (
                            <Video className="h-12 w-12 text-gray-400" />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium mb-2">{drill.name}</p>
                          <p className="text-xs text-gray-600 mb-2">
                            {new Date(media.submittedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-700 mb-3">{media.comments}</p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => activateCoachingToolkit(media)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMedia(media);
                                setShowAnalysis(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Analyze
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assign Drill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Drill</Label>
                  <Select value={selectedDrill} onValueChange={setSelectedDrill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a drill" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrills.map((drill) => (
                        <SelectItem key={drill.id} value={drill.id}>
                          {drill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignment Note</Label>
                  <Textarea
                    placeholder="Add any specific instructions..."
                    value={assignmentNote}
                    onChange={(e) => setAssignmentNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={assignDrill} disabled={!selectedDrill}>
                  <Send className="h-4 w-4 mr-2" />
                  Assign Drill
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assign Workout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Workout</Label>
                  <Select value={selectedWorkout} onValueChange={setSelectedWorkout}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a workout" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkouts.map((workout) => (
                        <SelectItem key={workout.id} value={workout.id}>
                          {workout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignment Note</Label>
                  <Textarea
                    placeholder="Add any specific instructions..."
                    value={assignmentNote}
                    onChange={(e) => setAssignmentNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={assignWorkout} disabled={!selectedWorkout}>
                  <Send className="h-4 w-4 mr-2" />
                  Assign Workout
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Media Analysis Dialog */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Media Analysis & Coaching Tools</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Media Display with Drawing Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  {selectedMedia.type === 'video' ? (
                    selectedMedia.url ? (
                      <video 
                        src={selectedMedia.url} 
                        className="w-full h-auto max-h-[500px] object-contain"
                        controls
                        autoPlay={false}
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <Video className="h-16 w-16 text-gray-400" />
                      </div>
                    )
                  ) : (
                    selectedMedia.url ? (
                      <div className="relative">
                        <img 
                          src={selectedMedia.url} 
                          alt="Uploaded media"
                          className="w-full h-auto max-h-[500px] object-contain"
                          id="analysis-image"
                        />
                        {/* Drawing Canvas Overlay */}
                        <canvas
                          id="drawing-canvas"
                          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                          style={{ pointerEvents: showAnalysis ? 'auto' : 'none' }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )
                  )}
                </div>
                
                {/* Drawing Tools */}
                {showAnalysis && selectedMedia.type === 'image' && (
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-lg"
                       onClick={handleToolkitInteraction}
                       onMouseEnter={handleToolkitInteraction}
                       onMouseMove={handleToolkitInteraction}
                       onFocus={handleToolkitInteraction}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          🎯 Coaching Toolkit
                          {toolkitLocked && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              🔒 Locked
                            </Badge>
                          )}
                          {isCoachingActive && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              ✅ Active
                            </Badge>
                          )}
                          {toolkitStable && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              🛡️ Stable
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="text-sm text-gray-500">
                          {lastInteraction && (
                            <span>Last active: {new Date(lastInteraction).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <div className="space-y-4">
                      {/* Drawing Tools */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Drawing Tools</label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={drawingTool === 'pencil' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => selectTool('pencil')}
                            className={`transition-all ${drawingTool === 'pencil' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-blue-50'}`}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Pencil
                          </Button>
                          <Button
                            variant={drawingTool === 'arrow' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => selectTool('arrow')}
                            className={`transition-all ${drawingTool === 'arrow' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-blue-50'}`}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Arrow
                          </Button>
                          <Button
                            variant={drawingTool === 'circle' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => selectTool('circle')}
                            className={`transition-all ${drawingTool === 'circle' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-blue-50'}`}
                          >
                            <Circle className="h-4 w-4 mr-1" />
                            Circle
                          </Button>
                          <Button
                            variant={drawingTool === 'rectangle' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => selectTool('rectangle')}
                            className={`transition-all ${drawingTool === 'rectangle' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-blue-50'}`}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Rectangle
                          </Button>
                          <Button
                            variant={drawingTool === 'text' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => selectTool('text')}
                            className={`transition-all ${drawingTool === 'text' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-blue-50'}`}
                          >
                            <Type className="h-4 w-4 mr-1" />
                            Text
                          </Button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Actions</label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearCanvas()}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={testCoachingToolkit}
                            className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Test All Tools
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={testCanvasBasic}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Test Canvas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={testCoachingToolkitBasic}
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Test Basic
                          </Button>
                        </div>
                        
                        {/* Individual Tool Test Buttons */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIndividualTool('pencil')}
                            className="text-xs hover:bg-blue-50"
                          >
                            Test Pencil
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIndividualTool('arrow')}
                            className="text-xs hover:bg-blue-50"
                          >
                            Test Arrow
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIndividualTool('circle')}
                            className="text-xs hover:bg-blue-50"
                          >
                            Test Circle
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIndividualTool('rectangle')}
                            className="text-xs hover:bg-blue-50"
                          >
                            Test Rectangle
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testIndividualTool('text')}
                            className="text-xs hover:bg-blue-50"
                          >
                            Test Text
                          </Button>
                        </div>
                      </div>
                      
                      {/* Color Palette */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Color Palette</label>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { color: '#ef4444', name: 'Red' },
                            { color: '#f97316', name: 'Orange' },
                            { color: '#eab308', name: 'Yellow' },
                            { color: '#22c55e', name: 'Green' },
                            { color: '#3b82f6', name: 'Blue' },
                            { color: '#8b5cf6', name: 'Purple' },
                            { color: '#000000', name: 'Black' },
                            { color: '#ffffff', name: 'White' }
                          ].map(({ color, name }) => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                drawingColor === color ? 'border-gray-800 shadow-lg scale-110' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setDrawingColor(color)}
                              title={name}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Brush Size */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Brush Size: {brushSize}px
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">1</span>
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs text-gray-500">20</span>
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center"
                            style={{ backgroundColor: drawingColor }}
                          >
                            <div 
                              className="rounded-full"
                              style={{ 
                                width: `${Math.min(brushSize * 2, 20)}px`, 
                                height: `${Math.min(brushSize * 2, 20)}px`,
                                backgroundColor: drawingColor === '#ffffff' ? '#000000' : '#ffffff'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Current Tool Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Selected Tool: <span className="capitalize">{drawingTool}</span>
                            </p>
                            <p className="text-xs text-blue-600">
                              Color: {drawingColor} | Size: {brushSize}px
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-600">
                              Annotations: {annotations.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Analysis Panel */}
              <div className="space-y-4">
                {/* Media Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Media Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type</p>
                      <p className="capitalize">{selectedMedia.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Uploaded</p>
                      <p>{new Date(selectedMedia.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Player Comments</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{selectedMedia.comments}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Coach Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coach Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Feedback</label>
                      <Textarea
                        placeholder="Add your coaching feedback here..."
                        value={coachFeedback}
                        onChange={(e) => setCoachFeedback(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Areas for Improvement</label>
                      <Textarea
                        placeholder="List specific areas the player should focus on..."
                        value={improvementNotes}
                        onChange={(e) => setImprovementNotes(e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Positive Observations</label>
                      <Textarea
                        placeholder="What did the player do well?"
                        value={positiveNotes}
                        onChange={(e) => setPositiveNotes(e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Overall Rating</label>
                      <select
                        value={overallRating}
                        onChange={(e) => setOverallRating(parseInt(e.target.value))}
                        className="mt-1 w-full p-2 border rounded-md"
                      >
                        <option value={0}>Select Rating</option>
                        <option value={1}>1 - Needs Significant Improvement</option>
                        <option value={2}>2 - Below Average</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4 - Above Average</option>
                        <option value={5}>5 - Excellent</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={saveAnalysis}
                        className="flex-1"
                        disabled={!coachFeedback.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Analysis
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (showAnalysis) {
                            deactivateCoachingToolkit();
                          } else {
                            setShowAnalysis(true);
                            setIsCoachingActive(true);
                            setToolkitStable(true);
                            setPersistentAnalysis(true);
                          }
                        }}
                      >
                        {showAnalysis ? 'Close Toolkit' : 'Open Toolkit'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}  