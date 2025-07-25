'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, Square, Volume2 } from 'lucide-react'

interface ReadAloudProps {
  text: string
  title?: string
  onComplete?: () => void
  onPause?: () => void
  className?: string
}

export default function ReadAloud({ 
  text, 
  title = "Inspirational Quote", 
  onComplete, 
  onPause,
  className = ""
}: ReadAloudProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isSupported, setIsSupported] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const wordsRef = useRef<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
      
      // Load voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        // Try to find a good voice for reading
        const preferredVoice = voices.find(v => 
          v.name.includes('Alex') || 
          v.name.includes('Google') || 
          v.name.includes('Microsoft') ||
          v.lang.startsWith('en')
        )
        setVoice(preferredVoice || voices[0])
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }

    // Split text into words for highlighting
    wordsRef.current = text.split(' ')
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }
    }
  }, [text])

  const startReading = () => {
    if (!isSupported) return

    // Cancel any existing speech
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance
    
    if (voice) {
      utterance.voice = voice
    }
    
    utterance.rate = 0.8 // Slightly slower for better comprehension
    utterance.pitch = 1
    utterance.volume = 0.8

    // Track word highlighting
    let wordIndex = 0
    const words = wordsRef.current
    const avgWordDuration = (utterance.text.length / words.length) * 100 // Rough estimate
    
    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
      setCurrentWordIndex(0)
      
      // Start word highlighting interval
      intervalRef.current = setInterval(() => {
        if (wordIndex < words.length) {
          setCurrentWordIndex(wordIndex)
          wordIndex++
        }
      }, avgWordDuration)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentWordIndex(0)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      onComplete?.()
    }

    utterance.onerror = (event) => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentWordIndex(0)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    speechSynthesis.speak(utterance)
  }

  const pauseReading = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      onPause?.()
    }
  }

  const resumeReading = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      
      // Resume word highlighting
      let wordIndex = currentWordIndex
      const words = wordsRef.current
      const avgWordDuration = (utteranceRef.current?.text.length || 0) / words.length * 100
      
      intervalRef.current = setInterval(() => {
        if (wordIndex < words.length) {
          setCurrentWordIndex(wordIndex)
          wordIndex++
        }
      }, avgWordDuration)
    }
  }

  const stopReading = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentWordIndex(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  if (!isSupported) {
    return (
      <Card className={`border-amber-200 bg-amber-50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{text}</p>
          <p className="text-sm text-gray-500 mt-2">
            Text-to-speech is not supported in this browser
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-amber-200 bg-amber-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed text-lg">
            {wordsRef.current.map((word, index) => (
              <span
                key={index}
                className={`${
                  index === currentWordIndex 
                    ? 'bg-yellow-300 text-gray-900 font-medium' 
                    : index < currentWordIndex 
                    ? 'text-gray-500' 
                    : 'text-gray-700'
                } transition-colors duration-200`}
              >
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isPlaying && !isPaused && (
            <Button
              onClick={startReading}
              className="flex items-center gap-2"
              variant="default"
            >
              <Play className="h-4 w-4" />
              Read Aloud
            </Button>
          )}
          
          {isPlaying && (
            <Button
              onClick={pauseReading}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          {isPaused && (
            <Button
              onClick={resumeReading}
              className="flex items-center gap-2"
              variant="default"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          
          {(isPlaying || isPaused) && (
            <Button
              onClick={stopReading}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}  