'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Reply, 
  User, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface WorkoutComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: 'PLAYER' | 'PARENT';
    image?: string;
  };
  replies?: WorkoutComment[];
}

interface WorkoutCommentsProps {
  workoutId: string;
  workoutCompletionId?: string;
  className?: string;
}

export default function WorkoutComments({ workoutId, workoutCompletionId, className }: WorkoutCommentsProps) {
  const [comments, setComments] = useState<WorkoutComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [workoutId, workoutCompletionId]);

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams();
      if (workoutId) params.append('workoutId', workoutId);
      if (workoutCompletionId) params.append('workoutCompletionId', workoutCompletionId);

      const response = await fetch(`/api/workout-comments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/workout-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId,
          workoutCompletionId,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        toast({
          title: "Success",
          description: "Comment posted successfully",
        });
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/workout-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId,
          workoutCompletionId,
          content: replyContent.trim(),
          parentCommentId,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        ));
        setReplyContent('');
        setReplyingTo(null);
        setExpandedComments(prev => new Set(prev).add(parentCommentId));
        toast({
          title: "Success",
          description: "Reply posted successfully",
        });
      } else {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getRoleBadgeColor = (role: 'PLAYER' | 'PARENT') => {
    switch (role) {
      case 'PLAYER':
        return 'bg-blue-100 text-blue-800';
      case 'PARENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <Textarea
            placeholder="Share your thoughts about this workout..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.image} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user.name}</span>
                        <Badge className={getRoleBadgeColor(comment.user.role)}>
                          {comment.user.role === 'PARENT' ? 'Coach' : 'Player'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="pl-11">
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>

                {/* Comment Actions */}
                <div className="pl-11 flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                  
                  {comment.replies && comment.replies.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(comment.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedComments.has(comment.id) ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                    </Button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-11 pt-3 border-t"
                  >
                    <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="space-y-3">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!replyContent.trim() || submitting}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3 mr-2" />
                              Reply
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-11 space-y-3 border-t pt-3"
                  >
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="border-l-2 border-gray-200 pl-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.user.image} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{reply.user.name}</span>
                              <Badge className={`${getRoleBadgeColor(reply.user.role)} text-xs`}>
                                {reply.user.role === 'PARENT' ? 'Coach' : 'Player'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-2 w-2" />
                              {format(new Date(reply.createdAt), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap pl-9">{reply.content}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 