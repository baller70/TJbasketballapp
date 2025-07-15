import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, Square, CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  targetText: string;
  onVerificationComplete: (isCorrect: boolean, accuracy: number) => void;
  className?: string;
}

export default function VoiceRecorder({ targetText, onVerificationComplete, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isCorrect: boolean;
    accuracy: number;
    transcription: string;
  } | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setHasRecorded(true);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setVerificationResult(null);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const uploadAndVerify = async () => {
    if (!audioBlob) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('targetText', targetText);
      
      const response = await fetch('/api/speech/verify', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify speech');
      }
      
      const result = await response.json();
      setVerificationResult(result);
      onVerificationComplete(result.isCorrect, result.accuracy);
      
      if (result.isCorrect) {
        toast({
          title: "Perfect! 🎉",
          description: `Great job! You said it correctly with ${result.accuracy}% accuracy.`,
        });
      } else {
        toast({
          title: "Try Again",
          description: `Close, but not quite right. You said: "${result.transcription}"`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error verifying speech:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify your recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setHasRecorded(false);
    setVerificationResult(null);
    setRecordingTime(0);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Instructions */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Record yourself saying the quote above
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic">
                "{targetText.replace(/^"|"$/g, '').split(' - ')[0]}"
              </div>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-4">
              {/* Recording Status */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-600">
                      Recording... {formatTime(recordingTime)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Controls */}
              <div className="flex items-center gap-3">
                {!hasRecorded ? (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-5 w-5" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5" />
                        Start Recording
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={isPlaying ? pausePlayback : playRecording}
                      variant="outline"
                      size="sm"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      onClick={uploadAndVerify}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Check Answer
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetRecording}
                      variant="outline"
                      size="sm"
                    >
                      Record Again
                    </Button>
                  </div>
                )}
              </div>

              {/* Verification Result */}
              <AnimatePresence>
                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                  >
                    <Card className={`border-2 ${
                      verificationResult.isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {verificationResult.isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-medium ${
                                verificationResult.isCorrect ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {verificationResult.isCorrect ? 'Correct!' : 'Try Again'}
                              </span>
                              <Badge variant={verificationResult.isCorrect ? 'default' : 'destructive'}>
                                {verificationResult.accuracy}% accuracy
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">You said:</span>
                                <p className="text-gray-600 italic">"{verificationResult.transcription}"</p>
                              </div>
                              
                              {verificationResult.accuracy < 100 && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Accuracy:</span>
                                  <Progress 
                                    value={verificationResult.accuracy} 
                                    className="h-2 mt-1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
} 