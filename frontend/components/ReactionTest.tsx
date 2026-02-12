import { useState, useEffect, useRef } from 'react'

interface ReactionTestProps {
  onComplete: (averageReactionTime: number) => void
  onBack?: () => void
}

export default function ReactionTest({ onComplete, onBack }: ReactionTestProps) {
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'clicked'>('waiting')
  const [round, setRound] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [currentReactionTime, setCurrentReactionTime] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const TOTAL_ROUNDS = 5

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (countdownRef.current) clearTimeout(countdownRef.current)
    }
  }, [])

  const startRound = () => {
    setPhase('waiting')
    setCountdown(0)
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000
    
    countdownRef.current = setTimeout(() => {
      setPhase('ready')
      startTimeRef.current = Date.now()
      
      // Update reaction time every 10ms
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setCurrentReactionTime(Date.now() - startTimeRef.current)
        }
      }, 10)
    }, delay)
  }

  useEffect(() => {
    if (round < TOTAL_ROUNDS && phase === 'waiting') {
      startRound()
    }
  }, [round, phase])

  const handleClick = () => {
    if (phase === 'ready' && startTimeRef.current) {
      const reactionTime = Date.now() - startTimeRef.current
      
      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
        countdownRef.current = null
      }
      
      setCurrentReactionTime(reactionTime)
      setPhase('clicked')
      
      // Update reaction times
      const newTimes = [...reactionTimes, reactionTime]
      setReactionTimes(newTimes)
      
      // Move to next round or complete after 2 seconds
      setTimeout(() => {
        if (newTimes.length >= TOTAL_ROUNDS) {
          // Calculate average for all rounds
          const average = newTimes.reduce((a, b) => a + b, 0) / newTimes.length
          onComplete(Math.round(average))
        } else {
          // Move to next round
          setRound(prev => prev + 1)
          setCurrentReactionTime(0)
          setPhase('waiting')
        }
      }, 2000)
    } else if (phase === 'waiting') {
      // Clicked too early
      alert('Wait for the box to appear before clicking!')
    }
  }

  const getBoxColor = () => {
    if (phase === 'waiting') return '#e0e0e0'
    if (phase === 'ready') return '#4caf50'
    if (phase === 'clicked') return '#2196f3'
    return '#e0e0e0'
  }

  const getBoxText = () => {
    if (phase === 'waiting') return 'Wait...'
    if (phase === 'ready') return 'CLICK NOW!'
    if (phase === 'clicked') return `${currentReactionTime}ms`
    return 'Wait...'
  }

  return (
    <div>
      <h2>Reaction Time Test</h2>
      <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
        Click the box as soon as it turns green. You will complete {TOTAL_ROUNDS} rounds.
      </p>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#666' }}>
          Round {round + 1} of {TOTAL_ROUNDS}
        </div>
        
        {reactionTimes.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Previous times:</strong>{' '}
            {reactionTimes.map((time, idx) => (
              <span key={idx} style={{ margin: '0 5px' }}>
                {time}ms
              </span>
            ))}
          </div>
        )}

        <div
          onClick={handleClick}
          style={{
            width: '300px',
            height: '300px',
            backgroundColor: getBoxColor(),
            borderRadius: '8px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: phase === 'waiting' ? '#999' : 'white',
            cursor: phase === 'ready' ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
            userSelect: 'none'
          }}
        >
          {getBoxText()}
        </div>

        {phase === 'ready' && (
          <div style={{ marginTop: '20px', fontSize: '1.5rem', color: '#4caf50' }}>
            {currentReactionTime}ms
          </div>
        )}
      </div>

      {phase === 'clicked' && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          {reactionTimes.length < TOTAL_ROUNDS ? 'Moving to next round...' : 'Calculating results...'}
        </div>
      )}

      {onBack && phase === 'waiting' && round === 0 && (
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: '#f5f5f5', color: '#333' }} onClick={onBack}>
            Back
          </button>
        </div>
      )}
    </div>
  )
}

