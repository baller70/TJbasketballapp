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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: 'PLAYER' | 'PARENT';
    image?: string;
  };
  replies?: Comment[];
}

interface CommentsProps {
  drillId: string;
  drillCompletionId?: string;
  mediaUploadId?: string;
  className?: string;
}

export default function Comments({ 
  drillId, 
  drillCompletionId, 
  mediaUploadId,
  className = '' 
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [drillId, drillCompletionId, mediaUploadId]);

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams({
        drillId,
        ...(drillCompletionId && { drillCompletionId }),
        ...(mediaUploadId && { mediaUploadId }),
      });

      const response = await fetch(`/api/comments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
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

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
          drillId,
          drillCompletionId,
          mediaUploadId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await fetchComments();
        toast({
          title: "Success",
          description: "Comment posted successfully!",
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

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent.trim(),
          drillId,
          drillCompletionId,
          mediaUploadId,
          parentCommentId,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyTo(null);
        await fetchComments();
        toast({
          title: "Success",
          description: "Reply posted successfully!",
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

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getRoleColor = (role: 'PLAYER' | 'PARENT') => {
    return role === 'PLAYER' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800';
  };

  const getRoleLabel = (role: 'PLAYER' | 'PARENT') => {
    return role === 'PLAYER' ? 'Player' : 'Coach';
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
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
      <CardContent>
        <div className="space-y-6">
          {/* New Comment Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts or ask a question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.image} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.user.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getRoleColor(comment.user.role)}`}
                        >
                          {getRoleLabel(comment.user.role)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {format(new Date(comment.createdAt), 'PPp')}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      
                      {/* Reply Button */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        
                        {/* Show/Hide Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReplies(comment.id)}
                          >
                            {expandedComments.has(comment.id) ? (
                              <ChevronUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 mr-1" />
                            )}
                            {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                          </Button>
                        )}
                      </div>

                      {/* Reply Form */}
                      {replyTo === comment.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-2"
                        >
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyTo(null);
                                setReplyContent('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyContent.trim() || submitting}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {submitting ? 'Posting...' : 'Reply'}
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4"
                        >
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={reply.user.image} />
                                <AvatarFallback>
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{reply.user.name}</span>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getRoleColor(reply.user.role)}`}
                                  >
                                    {getRoleLabel(reply.user.role)}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(reply.createdAt), 'PPp')}
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No comments yet. Be the first to start the conversation!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 