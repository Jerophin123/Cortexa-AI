import { useState, useEffect, useRef } from 'react'

interface SpeechTestProps {
  onComplete: (speechPauseMs: number, wordRepetitionRate: number) => void
  onBack?: () => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function SpeechTest({ onComplete, onBack }: SpeechTestProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0) // 0-100 for volume intensity
  const [speechScore, setSpeechScore] = useState<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const wordTimingsRef = useRef<Array<{ word: string; time: number }>>([])
  const isRecordingRef = useRef<boolean>(false)
  const timeElapsedRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const finalTranscriptRef = useRef<string>('')
  const lastFinalIndexRef = useRef<number>(0)
  const lastResultTimeRef = useRef<number>(0)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      stopAudioAnalysis()
    }
  }, [])

  const getSpeechRecognition = () => {
    if (typeof window === 'undefined') {
      return null
    }
    return window.SpeechRecognition || window.webkitSpeechRecognition || null
  }

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect()
      gainNodeRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setAudioLevel(0)
  }

  const startAudioAnalysis = async () => {
    try {
      // Get microphone access with optimized audio constraints for better sensitivity
      // Reduced noise suppression and echo cancellation to preserve speech clarity
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false, // Disable to preserve speech clarity
          noiseSuppression: false, // Disable to capture all audio including accents
          autoGainControl: true, // Keep enabled for consistent volume
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1, // Mono for speech recognition
          // Chrome-specific constraints (cast to any to avoid type errors)
          ...({
            googEchoCancellation: false,
            googNoiseSuppression: false,
            googAutoGainControl: true,
            googHighpassFilter: false,
            googTypingNoiseDetection: false
          } as any)
        } 
      })
      streamRef.current = stream

      // Create audio context with higher sample rate
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext({ sampleRate: 48000 })
      audioContextRef.current = audioContext

      // Create gain node to boost microphone input
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 1.5 // Boost input by 50% for better sensitivity
      gainNodeRef.current = gainNode

      // Create analyser node with better settings
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512 // Larger FFT for better frequency analysis
      analyser.smoothingTimeConstant = 0.3 // Less smoothing for more responsive detection
      analyserRef.current = analyser

      // Connect microphone -> gain -> analyser for boosted audio
      const microphone = audioContext.createMediaStreamSource(stream)
      microphoneRef.current = microphone
      microphone.connect(gainNode)
      gainNode.connect(analyser)

      // Analyze audio levels with better sensitivity
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const timeDataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateAudioLevel = () => {
        if (!analyserRef.current || !isRecordingRef.current) {
          return
        }

        // Get both frequency and time domain data for better sensitivity
        analyserRef.current.getByteFrequencyData(dataArray)
        analyserRef.current.getByteTimeDomainData(timeDataArray)
        
        // Calculate RMS (Root Mean Square) for more accurate volume detection
        let sumSquares = 0
        for (let i = 0; i < timeDataArray.length; i++) {
          const normalized = (timeDataArray[i] - 128) / 128
          sumSquares += normalized * normalized
        }
        const rms = Math.sqrt(sumSquares / timeDataArray.length)
        
        // Also calculate peak frequency for speech range (300-3400 Hz)
        let speechSum = 0
        let speechCount = 0
        const speechStartFreq = Math.floor((300 / (audioContext.sampleRate / 2)) * dataArray.length)
        const speechEndFreq = Math.floor((3400 / (audioContext.sampleRate / 2)) * dataArray.length)
        
        for (let i = speechStartFreq; i < Math.min(speechEndFreq, dataArray.length); i++) {
          speechSum += dataArray[i]
          speechCount++
        }
        const speechAvg = speechCount > 0 ? speechSum / speechCount : 0
        
        // Combine RMS and speech frequency for better sensitivity
        const combinedLevel = (rms * 100 * 3) + (speechAvg / 255 * 100 * 2)
        const level = Math.min(100, Math.max(0, combinedLevel))
        
        setAudioLevel(level)

        if (isRecordingRef.current) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (err: any) {
      console.error('Error accessing microphone for audio analysis:', err)
      // Don't show error if it's just for visualization
      // The speech recognition will handle its own microphone access
    }
  }

  const startRecording = () => {
    if (typeof window === 'undefined') {
      setError('Speech recognition not available')
      return
    }

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setError('Speech recognition not available')
      return
    }

    setError(null)
    setTranscript('')
    setTimeElapsed(0)
    timeElapsedRef.current = 0
    wordTimingsRef.current = []
    startTimeRef.current = Date.now()
    finalTranscriptRef.current = ''
    lastFinalIndexRef.current = 0
    
    console.log('Starting recording, reset all transcript refs')

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    // Support multiple English variants for better accent recognition
    // Try to detect user's language preference or use broader English
    recognition.lang = 'en-US' // Primary language
    // Increase alternatives for better recognition of accents
    recognition.maxAlternatives = 3 // Allow multiple interpretations
    
    // Additional settings if available (Chrome/Edge specific)
    if ('serviceURI' in recognition) {
      // Use default service for best compatibility
    }

    let recognitionActive = true
    let restartAttempts = 0
    const MAX_RESTART_ATTEMPTS = 50 // Increased for longer sessions
    lastResultTimeRef.current = Date.now()

    recognition.onstart = () => {
      console.log('Speech recognition started')
      recognitionActive = true
      restartAttempts = 0
      lastResultTimeRef.current = Date.now()
      // Don't reset lastFinalIndexRef here - it tracks across restarts
      // The results array resets on restart, so we'll process from 0 again
      
      // Start health check to ensure recognition stays active
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
      }
      healthCheckIntervalRef.current = setInterval(() => {
        // Check if recognition is still active
        if (isRecordingRef.current && timeElapsedRef.current < 60) {
          const timeSinceLastResult = Date.now() - lastResultTimeRef.current
          // If no results for 5 seconds and recognition seems inactive, restart
          if (timeSinceLastResult > 5000 && !recognitionActive) {
            console.log('Health check: Recognition appears inactive, attempting restart')
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start()
                recognitionActive = true
              }
            } catch (e) {
              console.log('Health check restart failed, will retry on next onend')
            }
          }
        } else {
          if (healthCheckIntervalRef.current) {
            clearInterval(healthCheckIntervalRef.current)
            healthCheckIntervalRef.current = null
          }
        }
      }, 2000) // Check every 2 seconds
    }

    recognition.onresult = (event: any) => {
      const currentTime = Date.now()
      lastResultTimeRef.current = currentTime // Update last result time
      recognitionActive = true // Mark as active when we get results
      
      console.log('onresult called, resultIndex:', event.resultIndex, 'results.length:', event.results.length)
      
      let fullFinalText = ''
      let interimText = ''
      
      // Process ALL results from the beginning each time
      // The results array contains all results, and when results become final they replace interim versions
      // We need to rebuild the full transcript from all final results to ensure nothing is missed
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        
        // Get the best alternative (first one is usually best, but check confidence if available)
        let bestAlternative = result[0]
        let bestConfidence = bestAlternative.confidence || 0
        
        // If multiple alternatives available, try to find the best one
        if (result.length > 1) {
          for (let altIdx = 0; altIdx < Math.min(result.length, 3); altIdx++) {
            const alt = result[altIdx]
            const altConfidence = alt.confidence || 0
            // Prefer alternatives with higher confidence or longer transcripts
            if (altConfidence > bestConfidence || 
                (altConfidence === bestConfidence && alt.transcript.length > bestAlternative.transcript.length)) {
              bestAlternative = alt
              bestConfidence = altConfidence
            }
          }
        }
        
        const transcript = bestAlternative.transcript.trim()
        
        // Skip empty transcripts
        if (!transcript || transcript.length === 0) {
          continue
        }

        if (result.isFinal) {
          // Process final results - these are confirmed words
          console.log(`Final result at index ${i}:`, transcript)
          
          // Clean and normalize the transcript
          const cleaned = transcript
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
          
          if (cleaned.length > 0) {
            // Split into words - minimal filtering
            const words = cleaned.split(/\s+/).filter((word: string) => {
              const trimmed = word.trim()
              // Only filter out completely empty strings
              if (!trimmed || trimmed.length === 0) return false
              // Allow all words including single characters
              return true
            })
            
            if (words.length > 0) {
              // Add to full final text (rebuilding from all final results)
              fullFinalText += words.join(' ') + ' '
              
              // Record timing for new final words (only if this is a newly finalized result)
              if (i >= event.resultIndex) {
                words.forEach((word: string) => {
                  const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
                  // Record any word that has at least one alphanumeric character
                  if (cleanWord.length > 0) {
                    wordTimingsRef.current.push({
                      word: cleanWord,
                      time: currentTime
                    })
                  }
                })
              }
            }
          }
        } else {
          // For interim results, get the last one for display
          // Interim results show what's currently being recognized
          if (transcript.length > 0 && i === event.results.length - 1) {
            // Show the last interim result
            interimText = transcript.trim()
            console.log('Interim result:', interimText)
          }
        }
      }

      // Rebuild final transcript from all final results to ensure completeness
      // This handles cases where recognition restarts and results array resets
      if (fullFinalText.length > 0) {
        // Store the complete final transcript built from all final results
        finalTranscriptRef.current = fullFinalText
        
        // Simple deduplication - only remove immediate consecutive duplicates
        const words = finalTranscriptRef.current.split(/\s+/)
        const deduplicated: string[] = []
        let lastWord = ''
        
        for (const word of words) {
          const normalized = word.toLowerCase().trim()
          if (normalized && normalized.length > 0) {
            // Only skip if it's exactly the same as the previous word (immediate duplicate)
            if (normalized !== lastWord) {
              deduplicated.push(word)
              lastWord = normalized
            }
          }
        }
        
        finalTranscriptRef.current = deduplicated.join(' ')
        console.log('Updated final transcript:', finalTranscriptRef.current, 'word count:', deduplicated.length)
      }

      // Always update display: show final transcript + current interim (if any)
      const displayText = finalTranscriptRef.current + (interimText ? ' ' + interimText : '')
      setTranscript(displayText.trim())
      console.log('Display text updated:', displayText.trim())
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      recognitionActive = false
      
      if (event.error === 'no-speech') {
        // Don't stop recording on no-speech, just continue listening
        console.log('No speech detected, continuing to listen...')
        // Try to restart immediately to keep listening
        setTimeout(() => {
          if (isRecordingRef.current && timeElapsedRef.current < 60) {
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start()
                recognitionActive = true
              }
            } catch (e) {
              console.log('Failed to restart after no-speech, will retry on onend')
            }
          }
        }, 100)
        return
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access and refresh the page.')
        stopRecording()
        return
      } else if (event.error === 'aborted') {
        // Recognition was aborted, this is normal when restarting
        console.log('Recognition aborted (normal during restart)')
        return
      } else if (event.error === 'network') {
        setError('Network error. Please check your internet connection.')
        stopRecording()
        return
      } else if (event.error === 'service-not-allowed') {
        setError('Speech recognition service not available. Please try again later.')
        stopRecording()
        return
      } else {
        console.error(`Speech recognition error: ${event.error}`)
        // For other errors, try to continue but log them
      }
    }

    recognition.onend = () => {
      console.log('Speech recognition ended. isRecording:', isRecordingRef.current, 'timeElapsed:', timeElapsedRef.current)
      recognitionActive = false
      
      // Always try to restart if we're still recording and haven't hit time limit
      const shouldRestart = timeElapsedRef.current < 60 && isRecordingRef.current
      
      if (shouldRestart) {
        // Don't increment restart attempts too aggressively - Web Speech API often stops and restarts
        if (restartAttempts < MAX_RESTART_ATTEMPTS) {
          restartAttempts++
          console.log(`Attempting to restart recognition (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})`)
        }
        
        // Very short delay to avoid immediate restart issues
        setTimeout(() => {
          // Double-check state before restarting using refs
          if (timeElapsedRef.current < 60 && isRecordingRef.current) {
            try {
              // Try to restart the same recognition object first
              if (recognitionRef.current) {
                recognitionRef.current.start()
                recognitionActive = true
                // Reset attempts on successful restart
                if (recognitionActive) {
                  restartAttempts = 0
                }
              }
            } catch (e: any) {
              console.log('Failed to restart same recognition, creating new instance:', e.message)
              // If restart fails, immediately create a new instance
              try {
                const SpeechRecognition = getSpeechRecognition()
                if (SpeechRecognition && timeElapsedRef.current < 60 && isRecordingRef.current) {
                  // Create new recognition instance with same settings
                  const newRecognition = new SpeechRecognition()
                  newRecognition.continuous = true
                  newRecognition.interimResults = true
                  newRecognition.lang = 'en-US'
                  newRecognition.maxAlternatives = 3
                  
                  // Re-attach all handlers
                  newRecognition.onstart = recognition.onstart
                  newRecognition.onresult = recognition.onresult
                  newRecognition.onerror = recognition.onerror
                  newRecognition.onend = recognition.onend
                  
                  recognitionRef.current = newRecognition
                  newRecognition.start()
                  recognitionActive = true
                  restartAttempts = 0
                }
              } catch (retryError: any) {
                console.error('Failed to create new recognition instance:', retryError)
                // Don't give up - try again on next onend
                if (restartAttempts < MAX_RESTART_ATTEMPTS) {
                  // Will retry on next onend event
                  console.log('Will retry restart on next cycle')
                } else {
                  setError('Having trouble maintaining microphone connection. Please try speaking again.')
                  // Don't stop - let it keep trying
                }
              }
            }
          }
        }, 50) // Very short delay for faster recovery
      } else {
        // If we shouldn't restart, make sure we stop properly
        if (timeElapsedRef.current < 60 && isRecordingRef.current) {
          console.log('Recognition ended and should not restart')
        }
      }
    }

    recognitionRef.current = recognition
    
    try {
      recognition.start()
      setIsRecording(true)
      isRecordingRef.current = true
      recognitionActive = true
      
      // Start audio analysis for visualization
      startAudioAnalysis()
    } catch (e: any) {
      console.error('Failed to start recognition:', e)
      setError('Failed to start microphone. Please check your browser permissions.')
      setIsRecording(false)
      isRecordingRef.current = false
      stopAudioAnalysis()
      return
    }

    // Timer
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1
        timeElapsedRef.current = newTime
        if (newTime >= 60) {
          stopRecording()
          return 60
        }
        return newTime
      })
    }, 1000)
  }

  const stopRecording = () => {
    console.log('Stopping recording...')
    isRecordingRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.error('Error stopping recognition:', e)
      }
      recognitionRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current)
      healthCheckIntervalRef.current = null
    }
    setIsRecording(false)
    stopAudioAnalysis()
    
    // Wait a bit for final transcript to be processed, then calculate score
    setTimeout(() => {
      calculateAndDisplayScore()
    }, 500)
  }

  // Auto-stop recording when 60 seconds are up
  useEffect(() => {
    if (timeElapsed >= 60 && isRecording) {
      stopRecording()
    }
  }, [timeElapsed, isRecording])

  const calculateMetrics = () => {
    // Use the ref for accurate metrics calculation
    const finalText = finalTranscriptRef.current.trim()
    const words = finalText.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    
    if (words.length === 0) {
      return { speechPauseMs: 500, wordRepetitionRate: 0 }
    }

    // Calculate average pause between words
    let totalPause = 0
    let pauseCount = 0
    if (wordTimingsRef.current.length > 1) {
      for (let i = 1; i < wordTimingsRef.current.length; i++) {
        const pause = wordTimingsRef.current[i].time - wordTimingsRef.current[i - 1].time
        if (pause > 100 && pause < 5000) { // Filter out unrealistic pauses
          totalPause += pause
          pauseCount++
        }
      }
    }
    const speechPauseMs = pauseCount > 0 ? totalPause / pauseCount : 500

    // Calculate word repetition rate
    const wordCounts: { [key: string]: number } = {}
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })
    const repeatedWords = Object.values(wordCounts).filter(count => count > 1).length
    const wordRepetitionRate = words.length > 0 ? repeatedWords / words.length : 0

    return {
      speechPauseMs: Math.round(speechPauseMs),
      wordRepetitionRate: Math.min(wordRepetitionRate, 1) // Cap at 1
    }
  }

  const calculateAndDisplayScore = () => {
    // Use the ref which has the actual final transcript, not the state which might be stale
    const finalText = finalTranscriptRef.current.trim()
    const words = finalText.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    
    console.log('Calculating score - Final transcript:', finalText)
    console.log('Word count:', words.length)
    console.log('Word timings:', wordTimingsRef.current.length)
    
    if (words.length === 0) {
      console.log('No words found, setting score to 0')
      setSpeechScore(0)
      return
    }

    // Calculate metrics using the final transcript
    const metrics = calculateMetrics()
    console.log('Metrics:', metrics)

    // Calculate score based on multiple factors (0-100 scale)
    let score = 0

    // 1. Word count score (0-30 points)
    // More words = better. For 60 seconds:
    // - 60+ words (1 WPM) = 18 points (60% of max)
    // - 90+ words (1.5 WPM) = 27 points (90% of max)
    // - 120+ words (2 WPM) = 30 points (full score)
    const wordsPerMinute = words.length // Since it's 60 seconds, WPM = word count
    const wordCountScore = Math.min(30, (wordsPerMinute / 120) * 30)
    console.log('Word count score:', wordCountScore, 'WPM:', wordsPerMinute, 'words:', words.length)
    score += wordCountScore

    // 2. Speech fluency score (0-30 points)
    // Natural speech has pauses. More lenient scoring:
    // - Ideal pause: 300-500ms (full points)
    // - 200-700ms: good (most points)
    // - 100-1000ms: acceptable (some points)
    const idealPauseMin = 300
    const idealPauseMax = 500
    let pauseScore = 30
    
    if (metrics.speechPauseMs < idealPauseMin) {
      // Too fast - slight penalty
      const deviation = idealPauseMin - metrics.speechPauseMs
      pauseScore = Math.max(20, 30 - (deviation / 10))
    } else if (metrics.speechPauseMs > idealPauseMax) {
      // Too slow - gradual penalty
      const deviation = metrics.speechPauseMs - idealPauseMax
      pauseScore = Math.max(15, 30 - (deviation / 15))
    }
    // If within ideal range, full points
    
    console.log('Pause score:', pauseScore, 'Avg pause:', metrics.speechPauseMs, 'ms')
    score += pauseScore

    // 3. Vocabulary diversity score (0-25 points)
    // More unique words = better, but allow some repetition (natural in speech)
    const uniqueWords = new Set(words).size
    const diversityRatio = uniqueWords / words.length
    // More lenient: 70%+ unique = full score, 50%+ = good score
    const diversityScore = Math.min(25, (diversityRatio / 0.7) * 25)
    console.log('Diversity score:', diversityScore, 'Unique words:', uniqueWords, 'Total words:', words.length, 'Ratio:', diversityRatio.toFixed(2))
    score += diversityScore

    // 4. Speech consistency score (0-15 points)
    // Based on word timing consistency - more lenient
    if (wordTimingsRef.current.length > 1) {
      const pauses = []
      for (let i = 1; i < wordTimingsRef.current.length; i++) {
        const pause = wordTimingsRef.current[i].time - wordTimingsRef.current[i - 1].time
        if (pause > 50 && pause < 5000) { // More lenient range
          pauses.push(pause)
        }
      }
      if (pauses.length > 0) {
        const avgPause = pauses.reduce((a, b) => a + b, 0) / pauses.length
        const variance = pauses.reduce((sum, p) => sum + Math.pow(p - avgPause, 2), 0) / pauses.length
        // More lenient: variance up to 50000 still gets some points
        const consistency = Math.max(10, 15 - (variance / 50000)) // Less harsh penalty
        console.log('Consistency score:', consistency, 'Variance:', variance, 'Avg pause:', avgPause)
        score += consistency
      } else {
        // If no valid pauses, give default score
        console.log('No valid pauses found for consistency calculation, giving default score')
        score += 12 // Default consistency score
      }
    } else {
      // If not enough timings, give default score
      console.log('Not enough word timings for consistency calculation, giving default score')
      score += 12 // Default consistency score
    }

    console.log('Total score before rounding:', score)
    // Round to nearest integer
    const finalScore = Math.round(Math.min(100, Math.max(0, score)))
    console.log('Final score:', finalScore)
    setSpeechScore(finalScore)
  }

  const handleComplete = () => {
    // If no transcript, use default values
    if (transcript.trim().length === 0) {
      // Use default values if no speech was detected
      onComplete(500, 0) // Default pause time and no repetition
      return
    }

    const metrics = calculateMetrics()
    onComplete(metrics.speechPauseMs, metrics.wordRepetitionRate)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Speech Test
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6', fontSize: '1rem' }}>
          Describe your day for 60 seconds. Click "Start Recording" and speak naturally.
        </p>
      </div>

      {error && error !== 'No speech detected. Please try again.' && (
        <div style={{ background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: '#ef4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-glass)', flexShrink: 0, boxShadow: 'var(--shadow-glass)', position: 'relative', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius: '12px 12px 0 0'
          }} />
          {error}
        </div>
      )}
      {isRecording && (
        <div style={{ background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: '#3b82f6', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', flexShrink: 0, boxShadow: 'var(--shadow-glass)', position: 'relative', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius: '12px 12px 0 0'
          }} />
          🎤 Listening... Please speak clearly into your microphone.
          {transcript.trim().length === 0 && timeElapsed > 5 && (
            <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#2563eb' }}>
              ⚠️ No speech detected yet. Please check your microphone is working and permissions are granted.
            </div>
          )}
        </div>
      )}

      {/* Show recording interface only when not completed */}
      {timeElapsed < 60 && (
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          flex: 1, 
          minHeight: 0,
          marginBottom: '20px'
        }}>
          {/* Left Side - Recording Controls */}
          <div style={{ 
            flex: '0 0 48%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
            <div style={{ 
              flex: 1,
              padding: '20px',
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              borderRadius: '24px',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 0,
              gap: '16px'
            }}>
              {!isRecording && timeElapsed === 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '20px' 
                }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    letterSpacing: '-0.02em',
                    lineHeight: '1'
                  }}>
                    60s
                  </div>
                  <button 
                    style={{ 
                      padding: '14px 36px', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      cursor: 'pointer', 
                      background: 'var(--accent-primary)', 
                      color: 'var(--text-inverse)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.3s ease'
                    }} 
                    onClick={startRecording}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }}
                  >
                    Start Recording
                  </button>
                </div>
              )}
              
              {isRecording && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Timer and Recording Indicator - Horizontal Layout */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginBottom: '4px'
                  }}>
                    {/* Recording Indicator */}
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#ef4444',
                      boxShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                      animation: 'pulse 1s infinite',
                      flexShrink: 0
                    }} />
                    {/* Timer */}
                    <div style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      {60 - timeElapsed}s
                    </div>
                  </div>
                  
                  {/* Audio Intensity Meter */}
                  <div style={{ width: '100%' }}>
                    <div style={{ 
                      marginBottom: '8px', 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: '500' }}>Microphone Level:</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: audioLevel > 10 ? '#22c55e' : 'var(--text-tertiary)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {audioLevel > 10 ? '✓ Active' : '⚠️ Check Mic'}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '24px',
                      background: 'var(--bg-glass)',
                      backdropFilter: 'var(--blur-glass)',
                      WebkitBackdropFilter: 'var(--blur-glass)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid var(--border-glass)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{
                        width: `${audioLevel}%`,
                        height: '100%',
                        background: audioLevel < 20 
                          ? 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)'
                          : audioLevel < 60
                          ? 'linear-gradient(90deg, #f59e0b 0%, #eab308 100%)'
                          : 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)',
                        transition: 'width 0.1s ease-out, background 0.3s ease',
                        borderRadius: '12px',
                        boxShadow: audioLevel > 10 ? '0 0 8px rgba(34, 197, 94, 0.3)' : 'none'
                      }} />
                      {/* Level markers */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '33%',
                        width: '1px',
                        height: '100%',
                        backgroundColor: 'var(--border-glass)',
                        opacity: 0.4
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '66%',
                        width: '1px',
                        height: '100%',
                        backgroundColor: 'var(--border-glass)',
                        opacity: 0.4
                      }} />
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--text-tertiary)', 
                      marginTop: '6px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {audioLevel < 10 && 'Speak louder or check microphone connection'}
                      {audioLevel >= 10 && audioLevel < 30 && 'Good - keep speaking'}
                      {audioLevel >= 30 && 'Excellent audio level'}
                    </div>
                  </div>

                  <p style={{ 
                    marginTop: '4px', 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)', 
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    Recording in progress... Please continue speaking. The recording will automatically complete after 60 seconds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Transcript */}
          <div style={{ 
            flex: '1 1 52%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
            <div style={{ 
              flex: 1,
              padding: '24px', 
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-glass)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <strong style={{ 
                display: 'block', 
                marginBottom: '16px', 
                color: 'var(--text-primary)', 
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                flexShrink: 0
              }}>
                Live Transcript:
              </strong>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                minHeight: 0
              }}>
                {transcript ? (
                  <p style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    color: 'var(--text-secondary)',
                    lineHeight: '1.8',
                    wordWrap: 'break-word',
                    fontSize: '0.95rem'
                  }}>
                    {transcript}
                  </p>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                  }}>
                    {isRecording ? 'Waiting for speech...' : 'Transcript will appear here when you start recording'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show results only when completed */}
      {timeElapsed >= 60 && !isRecording && (
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          marginBottom: '20px',
          gap: '12px'
        }}>
          <div style={{ 
            padding: '12px 16px', 
            background: 'var(--bg-glass)',
            backdropFilter: 'var(--blur-glass)',
            WebkitBackdropFilter: 'var(--blur-glass)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: '#22c55e', fontSize: '0.9rem' }}>
              ✓ Recording complete!
            </strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
              Your speech has been analyzed. Review your results below.
            </p>
          </div>
          
          {/* Speech Score Display */}
          {speechScore !== null && (
            <div style={{ 
              flex: 1,
              padding: '20px', 
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              borderRadius: '24px',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0
            }}>
              <div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Speech Analysis Score
                </h3>
                
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    background: speechScore >= 70 ? 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' : speechScore >= 50 ? 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)' : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: '1',
                    marginBottom: '6px'
                  }}>
                    {speechScore}/100
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>
                    {speechScore >= 80 && 'Excellent! 🌟'}
                    {speechScore >= 60 && speechScore < 80 && 'Good! 👍'}
                    {speechScore >= 40 && speechScore < 60 && 'Fair'}
                    {speechScore < 40 && 'Needs Improvement'}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ 
                      color: 'var(--text-tertiary)', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                      fontWeight: '500'
                    }}>
                      Word Count
                    </div>
                    <div style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {finalTranscriptRef.current.trim().split(/\s+/).filter(w => w.length > 0).length}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      color: 'var(--text-tertiary)', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                      fontWeight: '500'
                    }}>
                      Avg Pause
                    </div>
                    <div style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {calculateMetrics().speechPauseMs}ms
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      color: 'var(--text-tertiary)', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                      fontWeight: '500'
                    }}>
                      Diversity
                    </div>
                    <div style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {(() => {
                        const words = finalTranscriptRef.current.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0)
                        const uniqueWords = new Set(words).size
                        return words.length > 0 ? `${Math.round((uniqueWords / words.length) * 100)}%` : '0%'
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end', 
        marginTop: 'auto',
        paddingTop: '24px',
        flexShrink: 0
      }}>
        {timeElapsed >= 60 && (
          <button 
            style={{ 
              padding: '14px 36px', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              background: 'var(--accent-primary)',
              color: 'var(--text-inverse)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s ease'
            }} 
            onClick={handleComplete}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            Continue
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

