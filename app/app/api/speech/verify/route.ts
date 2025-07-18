import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

// Simple text similarity calculation using Levenshtein distance
function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => 
    text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normalized1 = normalize(text1);
  const normalized2 = normalize(text2);

  if (normalized1 === normalized2) return 100;

  // Calculate Levenshtein distance
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
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
    
    return matrix[b.length][a.length];
  };

  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(Math.max(0, similarity));
}

// Enhanced mock speech-to-text that can simulate various accuracy levels
async function mockSpeechToText(targetText: string): Promise<string> {
  const cleanTarget = targetText.replace(/^"|"$/g, '').split(' - ')[0];
  
  // Simulate different accuracy levels randomly
  const accuracyLevel = Math.random();
  
  if (accuracyLevel > 0.8) {
    // High accuracy - return exact text
    return cleanTarget;
  } else if (accuracyLevel > 0.6) {
    // Medium accuracy - minor variations
    return cleanTarget
      .replace(/\bthe\b/g, 'the')
      .replace(/\band\b/g, 'and')
      .replace(/\bis\b/g, 'is');
  } else if (accuracyLevel > 0.4) {
    // Lower accuracy - some word changes
    const words = cleanTarget.split(' ');
    const variations = words.map(word => {
      if (Math.random() > 0.8) {
        // Simulate common speech recognition errors
        const commonErrors: { [key: string]: string } = {
          'to': 'too',
          'you': 'u',
          'your': 'you\'re',
          'great': 'grade',
          'work': 'word',
          'love': 'live',
          'do': 'due',
          'what': 'what\'s',
          'success': 'success',
          'failure': 'failure',
          'courage': 'current',
          'continue': 'continues',
          'future': 'feature',
          'believe': 'believes',
          'dreams': 'dream',
          'matter': 'matters',
          'slowly': 'slowly',
          'stop': 'stopped'
        };
        return commonErrors[word.toLowerCase()] || word;
      }
      return word;
    });
    return variations.join(' ');
  } else {
    // Very low accuracy - significant changes
    const words = cleanTarget.split(' ');
    return words.slice(0, Math.max(2, Math.floor(words.length * 0.6))).join(' ') + ' and something else';
  }
}

// Real implementation would use a service like OpenAI Whisper
async function whisperSpeechToText(audioFilePath: string, targetText: string): Promise<string> {
  try {
    // This would be the real implementation using OpenAI Whisper or similar
    // For now, we'll use a mock response that's contextually relevant
    
    // Example of how you might use OpenAI Whisper:
    /*
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });

    return transcription.text;
    */
    
    // Mock implementation - replace with real service
    return await mockSpeechToText(targetText);
  } catch (error) {
    logger.error('Speech-to-text error', error as Error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetText = formData.get('targetText') as string;

    if (!audioFile || !targetText) {
      return NextResponse.json(
        { error: 'Missing audio file or target text' },
        { status: 400 }
      );
    }

    // Save the audio file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${uuidv4()}.wav`;
    const filePath = join(process.cwd(), 'tmp', fileName);

    // Ensure tmp directory exists
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // Create tmp directory if it doesn't exist
      const { mkdir } = await import('fs/promises');
      await mkdir(join(process.cwd(), 'tmp'), { recursive: true });
      await writeFile(filePath, buffer);
    }

    try {
      // Convert speech to text
      const transcription = await whisperSpeechToText(filePath, targetText);
      
      // Clean up the target text (remove quotes and author if present)
      const cleanTargetText = targetText.replace(/^"|"$/g, '').split(' - ')[0];
      
      // Calculate similarity
      const accuracy = calculateSimilarity(transcription, cleanTargetText);
      
      // Consider it correct if accuracy is above 80%
      const isCorrect = accuracy >= 80;
      
      return NextResponse.json({
        isCorrect,
        accuracy,
        transcription,
        targetText: cleanTargetText,
      });

    } finally {
      // Clean up the temporary file
      try {
        await unlink(filePath);
      } catch (error) {
        logger.error('Error deleting temporary file', error as Error);
      }
    }

  } catch (error) {
    logger.error('Speech verification error', error as Error);
    return NextResponse.json(
      { error: 'Failed to verify speech' },
      { status: 500 }
    );
  }
}

// For testing purposes - in production, remove this
export async function GET() {
  return NextResponse.json({
    message: 'Speech verification API is running',
    note: 'This is a mock implementation. In production, integrate with a real speech-to-text service like OpenAI Whisper.',
    features: [
      'Audio file upload and temporary storage',
      'Mock speech-to-text conversion',
      'Text similarity calculation using Levenshtein distance',
      'Accuracy scoring and verification',
      'Proper cleanup of temporary files'
    ]
  });
}  