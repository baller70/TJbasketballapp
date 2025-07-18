
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Video,
  Image as ImageIcon,
  Star,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MediaUpload } from '@/lib/types';
import { format } from 'date-fns';

interface MediaViewerProps {
  mediaUploads: MediaUpload[];
  onProvideFeedback?: (uploadId: string, feedback: string) => Promise<void>;
  showFeedbackForm?: boolean;
  className?: string;
}

export default function MediaViewer({
  mediaUploads,
  onProvideFeedback,
  showFeedbackForm = false,
  className = ''
}: MediaViewerProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaUpload | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [providingFeedback, setProvidingFeedback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedMedia || !onProvideFeedback || !feedback.trim()) return;
    
    setProvidingFeedback(true);
    try {
      await onProvideFeedback(selectedMedia.id, feedback);
      setFeedback('');
      setSelectedMedia(null);
    } catch (error) {
      console.error('Error providing feedback:', error);
    } finally {
      setProvidingFeedback(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (mediaUploads.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No media uploads yet</h3>
              <p className="text-gray-600 mt-1">
                Media uploads from practice sessions will appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaUploads.map((upload, index) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-orange-100 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div 
                className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden"
                onClick={() => setSelectedMedia(upload)}
              >
                {upload.mediaType === 'IMAGE' ? (
                  <img 
                    src={upload.fileUrl} 
                    alt={upload.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {upload.thumbnailUrl ? (
                      <img 
                        src={upload.thumbnailUrl} 
                        alt={upload.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
                
                {/* Media Type Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {upload.mediaType === 'VIDEO' ? (
                      <Video className="h-3 w-3 mr-1" />
                    ) : (
                      <ImageIcon className="h-3 w-3 mr-1" />
                    )}
                    {upload.mediaType}
                  </Badge>
                </div>

                {/* Duration Badge for videos */}
                {upload.mediaType === 'VIDEO' && upload.duration && (
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(upload.duration)}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm truncate">{upload.drill.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="h-3 w-3" />
                    <span>{upload.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>{upload.createdAt && !isNaN(new Date(upload.createdAt).getTime()) ? format(new Date(upload.createdAt), 'MMM d, yyyy') : 'Date not available'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{formatFileSize(upload.fileSize)}</span>
                  </div>
                  
                  {/* Feedback Status */}
                  {upload.feedback && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <MessageSquare className="h-3 w-3" />
                      <span>Feedback provided</span>
                    </div>
                  )}
                  
                  {!upload.feedback && showFeedbackForm && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageSquare className="h-3 w-3" />
                      <span>No feedback yet</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedMedia.mediaType === 'VIDEO' ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                  {selectedMedia.filename}
                </DialogTitle>
                <DialogDescription>
                  Drill: {selectedMedia.drill.name} • Uploaded by {selectedMedia.user.name} • {selectedMedia.createdAt && !isNaN(new Date(selectedMedia.createdAt).getTime()) ? format(new Date(selectedMedia.createdAt), 'MMM d, yyyy') : 'Date not available'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Media Display */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {selectedMedia.mediaType === 'IMAGE' ? (
                    <img 
                      src={selectedMedia.fileUrl} 
                      alt={selectedMedia.filename}
                      className="w-full max-h-96 object-contain"
                    />
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={selectedMedia.fileUrl}
                        className="w-full max-h-96"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Existing Feedback */}
                {selectedMedia.feedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Feedback from Coach/Parent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedMedia.feedback}</p>
                      {selectedMedia.reviewedAt && !isNaN(new Date(selectedMedia.reviewedAt).getTime()) && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reviewed on {format(new Date(selectedMedia.reviewedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Feedback Form */}
                {showFeedbackForm && !selectedMedia.feedback && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Provide Feedback</CardTitle>
                      <CardDescription>
                        Share your thoughts and suggestions about this performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Great form! Try to keep your elbow aligned with the basket for better accuracy..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={4}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedMedia(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitFeedback}
                          disabled={!feedback.trim() || providingFeedback}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {providingFeedback ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Feedback
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
