'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  Star, 
  CheckCircle,
  RefreshCw,
  Trophy,
  X,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Speech Recognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface DailyInspirationProps {
  userId: string;
}

interface DailyQuote {
  id: string;
  quote: string;
  author?: string;
  date: string;
}

interface RecordingProgress {
  recording1: { completed: boolean; verified: boolean; transcript?: string };
  recording2: { completed: boolean; verified: boolean; transcript?: string };
  recording3: { completed: boolean; verified: boolean; transcript?: string };
  completed: boolean;
  points: number;
}

export default function DailyInspiration({ userId }: DailyInspirationProps) {
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState<RecordingProgress>({
    recording1: { completed: false, verified: false },
    recording2: { completed: false, verified: false },
    recording3: { completed: false, verified: false },
    completed: false,
    points: 0
  });
  const [currentRecording, setCurrentRecording] = useState<number>(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentRecordingNumber, setCurrentRecordingNumber] = useState<1 | 2 | 3>(1);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Ensure we're on the client side and initialize speech recognition
  useEffect(() => {
    setIsClient(true);
    
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        setSpeechRecognition(recognition);
      }
    }
  }, []);

  // Fetch daily quote
  useEffect(() => {
    fetchDailyQuote();
    loadRecordingProgress();
  }, []);

  // Function to verify if the spoken text matches the quote
  const verifyQuoteMatch = (spokenText: string, originalQuote: string): boolean => {
    // Normalize both texts for comparison
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };

    const normalizedSpoken = normalizeText(spokenText);
    const normalizedQuote = normalizeText(originalQuote);

    // Calculate similarity using a simple approach
    const similarity = calculateSimilarity(normalizedSpoken, normalizedQuote);
    
    // Require at least 80% similarity to pass
    return similarity >= 0.8;
  };

  // Simple similarity calculation using Levenshtein distance
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance calculation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const fetchDailyQuote = async () => {
    try {
      setIsLoading(true);
      
      // Get today's date and check if we already have a quote for today
      const today = new Date().toISOString().split('T')[0];
      const savedQuote = localStorage.getItem(`daily-quote-${today}`);
      
      if (savedQuote) {
        // Always use the saved quote for today - no new quotes allowed
        setDailyQuote(JSON.parse(savedQuote));
        setIsLoading(false);
        return;
      }
      
      // Only generate a new quote if we don't have one for today
      // Use day of year to ensure different quotes for different days
      const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const dailyQuotes = [
        "Practice makes progress, not perfection!",
        "Champions are made in the off-season.",
        "Hard work beats talent when talent doesn't work hard.",
        "The only way to improve is to step out of your comfort zone.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Don't watch the clock; do what it does. Keep going.",
        "You miss 100% of the shots you don't take.",
        "Excellence is not a skill, it's an attitude.",
        "The difference between ordinary and extraordinary is that little extra.",
        "Champions train, losers complain.",
        "Your only limit is your mind.",
        "Push yourself because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Dream it. Wish it. Do it.",
        "Success doesn't just find you. You have to go out and get it.",
        "The harder you work for something, the greater you'll feel when you achieve it.",
        "Don't stop when you're tired. Stop when you're done.",
        "Wake up with determination. Go to bed with satisfaction.",
        "Do something today that your future self will thank you for.",
        "Little things make big days.",
        "It's going to be hard, but hard does not mean impossible.",
        "Don't wait for opportunity. Create it.",
        "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
        "The key to success is to focus on goals, not obstacles.",
        "Believe you can and you're halfway there."
      ];
      
      // Use day of year to select quote, ensuring same quote for the entire day
      const quoteIndex = dayOfYear % dailyQuotes.length;
      const quote = dailyQuotes[quoteIndex];
      
      const dailyQuoteData = {
        id: `quote-${today}`,
        quote: quote,
        author: 'Coach AI',
        date: today
      };
      
      setDailyQuote(dailyQuoteData);
      // Save to localStorage so user gets same quote all day
      localStorage.setItem(`daily-quote-${today}`, JSON.stringify(dailyQuoteData));
      
    } catch (error) {
      console.error('Error fetching daily quote:', error);
      // Final fallback
      setDailyQuote({
        id: `quote-${new Date().toISOString().split('T')[0]}`,
        quote: "Practice makes progress, not perfection!",
        author: 'Coach AI',
        date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecordingProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`daily-inspiration-${userId}-${today}`);
    if (saved) {
      setRecordingProgress(JSON.parse(saved));
    }
  };

  const saveRecordingProgress = (progress: RecordingProgress) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`daily-inspiration-${userId}-${today}`, JSON.stringify(progress));
    setRecordingProgress(progress);
  };

  const playQuote = () => {
    if (!dailyQuote) {
      toast.error('No quote available to play');
      return;
    }

    if (!speechSynthesis) {
      toast.error('Speech synthesis not supported in this browser');
      return;
    }

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(dailyQuote.quote);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        toast.success('Playing quote...');
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        toast.success('Quote finished playing');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        toast.error('Error playing quote');
      };
      
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in playQuote:', error);
      setIsPlaying(false);
      toast.error('Error playing quote');
    }
  };

  const startRecording = async () => {
    if (!dailyQuote) {
      toast.error('Please wait for the quote to load');
      return;
    }

    if (!speechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    try {
      setIsRecording(true);
      setIsListening(true);
      
      speechRecognition.onstart = () => {
        toast.success(`Recording ${currentRecordingNumber}/3 started! Say the quote now.`);
      };
      
      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const isVerified = verifyQuoteMatch(transcript, dailyQuote.quote);
        
        setIsRecording(false);
        setIsListening(false);
        
        completeRecording(transcript, isVerified);
      };
      
      speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
      };
      
      speechRecognition.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };
      
      speechRecognition.start();
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
      setIsListening(false);
      toast.error('Unable to start speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
      setIsRecording(false);
      setIsListening(false);
      toast.info('Recording stopped');
    }
  };

  const completeRecording = (transcript: string, isVerified: boolean) => {
    const recordingKey = `recording${currentRecordingNumber}` as keyof Pick<RecordingProgress, 'recording1' | 'recording2' | 'recording3'>;
    const newProgress = { 
      ...recordingProgress,
      [recordingKey]: { 
        completed: true, 
        verified: isVerified, 
        transcript 
      }
    };
    
    // Check if all recordings are completed and verified
    const allCompleted = newProgress.recording1.completed && newProgress.recording2.completed && newProgress.recording3.completed;
    const allVerified = newProgress.recording1.verified && newProgress.recording2.verified && newProgress.recording3.verified;
    
    if (allCompleted && allVerified) {
      newProgress.completed = true;
      newProgress.points = 50; // Award 50 points for completing all 3 verified recordings
      toast.success('Daily Inspiration completed! +50 points earned!');
    } else if (isVerified) {
      toast.success(`Recording ${currentRecordingNumber} verified! ${3 - currentRecordingNumber} more to go.`);
      setCurrentRecordingNumber(Math.min(currentRecordingNumber + 1, 3) as 1 | 2 | 3);
    } else {
      toast.error(`Recording ${currentRecordingNumber} did not match the quote. Please try again.`);
    }
    
    saveRecordingProgress(newProgress);
  };



  const getNextRecordingNumber = () => {
    if (!recordingProgress.recording1.completed) return 1;
    if (!recordingProgress.recording2.completed) return 2;
    if (!recordingProgress.recording3.completed) return 3;
    return 3;
  };

  if (isLoading) {
    return (
      <Card className="border-orange-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-orange-100 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Daily Inspiration
            </CardTitle>
            {/* Points Display in Top Right Corner */}
            <div className="flex items-center gap-2">
              {recordingProgress.completed && (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  +{recordingProgress.points} Points
                </Badge>
              )}
              {!recordingProgress.completed && recordingProgress.points === 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Star className="h-3 w-3 mr-1" />
                  50 Points Available
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Listen to today's inspirational quote and record yourself saying it 3 times to earn 50 points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quote Display */}
          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
            <blockquote className="text-lg font-medium text-gray-900 italic">
              "{dailyQuote?.quote}"
            </blockquote>
            {dailyQuote?.author && (
              <cite className="text-sm text-gray-600 mt-2 block">
                - {dailyQuote.author}
              </cite>
            )}
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={playQuote}
              variant={isPlaying ? "secondary" : "default"}
              className="flex items-center gap-2"
              disabled={!isClient}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Listen
                </>
              )}
            </Button>
            

          </div>

          {/* Recording Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recording Progress</span>
              <span className="text-sm text-gray-600">
                {[recordingProgress.recording1, recordingProgress.recording2, recordingProgress.recording3].filter(r => r.completed && r.verified).length}/3 verified
              </span>
            </div>
            
            <Progress 
              value={([recordingProgress.recording1, recordingProgress.recording2, recordingProgress.recording3].filter(r => r.completed && r.verified).length / 3) * 100} 
              className="h-2"
            />
            
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => {
                const recording = num === 1 ? recordingProgress.recording1 : 
                                  num === 2 ? recordingProgress.recording2 : 
                                  recordingProgress.recording3;
                return (
                  <div key={num} className="flex items-center gap-2">
                    {recording.completed && recording.verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : recording.completed && !recording.verified ? (
                      <X className="h-5 w-5 text-red-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className="text-sm text-gray-600">
                      Recording {num}
                      {recording.completed && !recording.verified && (
                        <span className="text-red-500 ml-1">(Failed)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recording Controls */}
          {!recordingProgress.completed && (
            <div className="flex items-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center gap-2"
                disabled={recordingProgress.completed || !isClient}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Record #{getNextRecordingNumber()}
                  </>
                )}
              </Button>
              
              {isRecording && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording...</span>
                </div>
              )}
            </div>
          )}

          {/* Completion Message */}
          {recordingProgress.completed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Trophy className="h-5 w-5" />
                <span className="font-medium">Daily Inspiration Completed!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Great job! You've earned {recordingProgress.points} points for completing today's inspiration challenge.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 