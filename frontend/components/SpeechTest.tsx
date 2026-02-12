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
  const startTimeRef = useRef<number | null>(null)
  const wordTimingsRef = useRef<Array<{ word: string; time: number }>>([])
  const isRecordingRef = useRef<boolean>(false)
  const timeElapsedRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const finalTranscriptRef = useRef<string>('')
  const lastFinalIndexRef = useRef<number>(0)

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
      // Get microphone access with better audio constraints for speech recognition
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      streamRef.current = stream

      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      // Create analyser node
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      // Connect microphone to analyser
      const microphone = audioContext.createMediaStreamSource(stream)
      microphoneRef.current = microphone
      microphone.connect(analyser)

      // Analyze audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateAudioLevel = () => {
        if (!analyserRef.current || !isRecordingRef.current) {
          return
        }

        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Calculate average volume
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const average = sum / dataArray.length
        
        // Convert to 0-100 scale (normalize)
        const level = Math.min(100, (average / 255) * 100 * 2) // Multiply by 2 for better visibility
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

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    // Improve word detection sensitivity
    recognition.maxAlternatives = 1

    let recognitionActive = true
    let restartAttempts = 0
    const MAX_RESTART_ATTEMPTS = 10

    recognition.onstart = () => {
      console.log('Speech recognition started')
      recognitionActive = true
      restartAttempts = 0
    }

    recognition.onresult = (event: any) => {
      let newFinalText = ''
      let interimText = ''
      let hasNewFinal = false

      // Process only new results since last update
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript.trim()
        
        // Skip empty or very short transcripts (likely noise)
        if (!transcript || transcript.length < 1) {
          continue
        }

        if (result.isFinal) {
          // Process final results - these are confirmed words
          hasNewFinal = true
          
          // Clean and normalize the transcript
          const cleaned = transcript
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
          
          if (cleaned.length > 0) {
            // Split into words and filter
            const words = cleaned.split(/\s+/).filter(word => {
              // Filter out very short words (likely partial/incorrect)
              if (word.length < 2) return false
              // Filter out words that are just repeated characters
              if (/^(.)\1+$/.test(word)) return false
              return true
            })
            
            if (words.length > 0) {
              const finalWords = words.join(' ')
              newFinalText += finalWords + ' '
              
              // Record timing for final words
              const currentTime = Date.now()
              words.forEach((word: string) => {
                const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
                if (cleanWord.length >= 2) {
                  wordTimingsRef.current.push({
                    word: cleanWord,
                    time: currentTime
                  })
                }
              })
            }
          }
        } else {
          // For interim results, only show if we have substantial text
          // and it's not just repeating the last final result
          if (transcript.length > 3) {
            const cleaned = transcript.trim()
            // Only show interim if it's meaningfully different from final
            if (!finalTranscriptRef.current.endsWith(cleaned.toLowerCase())) {
              interimText = cleaned
            }
          }
        }
      }

      // Update final transcript
      if (hasNewFinal && newFinalText) {
        finalTranscriptRef.current += newFinalText
        
        // Remove duplicate consecutive words
        const words = finalTranscriptRef.current.split(/\s+/)
        const deduplicated: string[] = []
        let lastWord = ''
        
        for (const word of words) {
          const normalized = word.toLowerCase().trim()
          // Only add if it's different from the last word (prevents immediate duplicates)
          if (normalized && normalized !== lastWord && normalized.length >= 2) {
            deduplicated.push(word)
            lastWord = normalized
          }
        }
        
        finalTranscriptRef.current = deduplicated.join(' ') + ' '
      }

      // Update display: show final transcript + current interim (if any)
      const displayText = finalTranscriptRef.current + (interimText ? interimText : '')
      setTranscript(displayText.trim())
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      recognitionActive = false
      
      if (event.error === 'no-speech') {
        // Don't stop recording on no-speech, just continue listening
        console.log('No speech detected, continuing to listen...')
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
      
      // Check if we should restart using refs to get current values
      const shouldRestart = timeElapsedRef.current < 60 && isRecordingRef.current && restartAttempts < MAX_RESTART_ATTEMPTS
      
      if (shouldRestart) {
        restartAttempts++
        console.log(`Attempting to restart recognition (attempt ${restartAttempts})`)
        
        // Add a small delay to avoid immediate restart issues
        setTimeout(() => {
          // Double-check state before restarting using refs
          if (timeElapsedRef.current < 60 && isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
              recognitionActive = true
            } catch (e: any) {
              console.error('Failed to restart recognition:', e)
              // If restart fails multiple times, stop
              if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
                setError('Unable to maintain microphone connection. Please try again.')
                stopRecording()
              }
            }
          } else {
            console.log('Not restarting - conditions not met')
          }
        }, 200)
      } else {
        // If we shouldn't restart, make sure we stop properly
        if (timeElapsedRef.current < 60 && isRecordingRef.current) {
          console.log('Recognition ended prematurely, stopping recording')
          stopRecording()
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
    // More words = better (assuming 60 seconds, aim for 100+ words = good)
    // For 60 seconds, 100 words = 100 WPM = full score
    const wordsPerMinute = (words.length / 60) * 60 // words per minute
    const wordCountScore = Math.min(30, (wordsPerMinute / 100) * 30)
    console.log('Word count score:', wordCountScore, 'WPM:', wordsPerMinute)
    score += wordCountScore

    // 2. Speech fluency score (0-30 points)
    // Lower pause time = better (ideal: 200-400ms, max penalty at 1000ms+)
    const idealPause = 300
    const pauseDeviation = Math.abs(metrics.speechPauseMs - idealPause)
    const pauseScore = Math.max(0, 30 - (pauseDeviation / 20)) // Penalize deviation
    console.log('Pause score:', pauseScore, 'Pause deviation:', pauseDeviation, 'Avg pause:', metrics.speechPauseMs)
    score += pauseScore

    // 3. Vocabulary diversity score (0-25 points)
    // Lower repetition = better
    const uniqueWords = new Set(words).size
    const diversityRatio = uniqueWords / words.length
    const diversityScore = diversityRatio * 25
    console.log('Diversity score:', diversityScore, 'Unique words:', uniqueWords, 'Total words:', words.length)
    score += diversityScore

    // 4. Speech consistency score (0-15 points)
    // Based on word timing consistency
    if (wordTimingsRef.current.length > 1) {
      const pauses = []
      for (let i = 1; i < wordTimingsRef.current.length; i++) {
        const pause = wordTimingsRef.current[i].time - wordTimingsRef.current[i - 1].time
        if (pause > 100 && pause < 5000) {
          pauses.push(pause)
        }
      }
      if (pauses.length > 0) {
        const avgPause = pauses.reduce((a, b) => a + b, 0) / pauses.length
        const variance = pauses.reduce((sum, p) => sum + Math.pow(p - avgPause, 2), 0) / pauses.length
        const consistency = Math.max(0, 15 - (variance / 10000)) // Lower variance = better
        console.log('Consistency score:', consistency, 'Variance:', variance)
        score += consistency
      } else {
        console.log('No valid pauses found for consistency calculation')
      }
    } else {
      console.log('Not enough word timings for consistency calculation')
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
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Speech Test
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px', lineHeight: '1.6', fontSize: '1rem' }}>
          Describe your day for 60 seconds. Click "Start Recording" and speak naturally.
        </p>
      </div>

      {error && error !== 'No speech detected. Please try again.' && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #c62828', flexShrink: 0 }}>
          {error}
        </div>
      )}
      {isRecording && (
        <div style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #1976d2', flexShrink: 0 }}>
          🎤 Listening... Please speak clearly into your microphone.
          {transcript.trim().length === 0 && timeElapsed > 5 && (
            <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#1565c0' }}>
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
            flex: '0 0 45%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
            <div style={{ 
              flex: 1,
              textAlign: 'center',
              padding: '24px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%)',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 0
            }}>
              <div style={{ 
                fontSize: '3.5rem', 
                fontWeight: 700, 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em'
              }}>
                {60 - timeElapsed}s
              </div>
              
              {!isRecording && timeElapsed === 0 && (
                <button 
                  style={{ 
                    padding: '14px 36px', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    cursor: 'pointer', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    margin: '0 auto'
                  }} 
                  onClick={startRecording}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  Start Recording
                </button>
              )}
              
              {isRecording && (
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f44336',
                    margin: '0 auto 20px',
                    animation: 'pulse 1s infinite'
                  }} />
                  
                  {/* Audio Intensity Meter */}
                  <div style={{ margin: '0 auto', maxWidth: '100%' }}>
                    <div style={{ 
                      marginBottom: '10px', 
                      fontSize: '0.9rem', 
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Microphone Level:</span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: audioLevel > 10 ? '#4caf50' : '#999',
                        fontWeight: 'bold'
                      }}>
                        {audioLevel > 10 ? '✓ Active' : '⚠️ Check Mic'}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '32px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '2px solid #ccc'
                    }}>
                      <div style={{
                        width: `${audioLevel}%`,
                        height: '100%',
                        background: audioLevel < 20 
                          ? 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)'
                          : audioLevel < 60
                          ? 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)'
                          : 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                        transition: 'width 0.1s ease-out, background 0.3s ease',
                        borderRadius: '16px',
                        boxShadow: audioLevel > 10 ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none'
                      }} />
                      {/* Level markers */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '33%',
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.2)'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '66%',
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#999', 
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      {audioLevel < 10 && 'Speak louder or check microphone connection'}
                      {audioLevel >= 10 && audioLevel < 30 && 'Good - keep speaking'}
                      {audioLevel >= 30 && 'Excellent audio level'}
                    </div>
                  </div>

                  <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                    Recording in progress... Please continue speaking. The recording will automatically complete after 60 seconds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Transcript */}
          <div style={{ 
            flex: '1 1 55%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
            <div style={{ 
              flex: 1,
              padding: '24px', 
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <strong style={{ 
                display: 'block', 
                marginBottom: '16px', 
                color: '#1a1a1a', 
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
                    color: '#4b5563',
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
                    color: '#9ca3af',
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
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
            border: '1px solid #86efac',
            borderRadius: '10px', 
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
            flexShrink: 0
          }}>
            <strong style={{ display: 'block', marginBottom: '4px', color: '#166534', fontSize: '0.9rem' }}>
              ✓ Recording complete!
            </strong>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.85rem', lineHeight: '1.4' }}>
              Your speech has been analyzed. Review your results below.
            </p>
          </div>
          
          {/* Speech Score Display */}
          {speechScore !== null && (
            <div style={{ 
              flex: 1,
              padding: '20px', 
              backgroundColor: '#fff3e0', 
              borderRadius: '12px',
              border: '2px solid #ff9800',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0
            }}>
              <div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#e65100',
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
                    color: speechScore >= 70 ? '#4caf50' : speechScore >= 50 ? '#ff9800' : '#f44336',
                    lineHeight: '1',
                    marginBottom: '6px'
                  }}>
                    {speechScore}/100
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#666',
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
                background: 'white',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                      fontWeight: '500'
                    }}>
                      Word Count
                    </div>
                    <div style={{ 
                      color: '#1a1a1a', 
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {finalTranscriptRef.current.trim().split(/\s+/).filter(w => w.length > 0).length}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                      fontWeight: '500'
                    }}>
                      Avg Pause
                    </div>
                    <div style={{ 
                      color: '#1a1a1a', 
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      {calculateMetrics().speechPauseMs}ms
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                      fontWeight: '500'
                    }}>
                      Diversity
                    </div>
                    <div style={{ 
                      color: '#1a1a1a', 
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
        borderTop: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
        {onBack && timeElapsed < 60 && (
          <button 
            style={{ 
              padding: '14px 36px', 
              border: '2px solid #e5e7eb', 
              borderRadius: '10px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: 'pointer', 
              background: '#ffffff', 
              color: '#4b5563',
              transition: 'all 0.3s ease'
            }} 
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb'
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff'
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Back
          </button>
        )}
        {timeElapsed >= 60 && (
          <button 
            style={{ 
              padding: '14px 36px', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '1rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }} 
            onClick={handleComplete}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
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

