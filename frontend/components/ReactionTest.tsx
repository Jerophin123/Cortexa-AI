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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Reaction Time Test</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5', fontSize: '0.95rem' }}>
          Click the box as soon as it turns green. You will complete {TOTAL_ROUNDS} rounds.
        </p>
      </div>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 0,
        gap: '12px'
      }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Round {round + 1} of {TOTAL_ROUNDS}
        </div>
        
        {reactionTimes.length > 0 && (
          <div style={{ marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <strong>Previous:</strong>{' '}
            {reactionTimes.map((time, idx) => (
              <span key={idx} style={{ margin: '0 4px', color: 'var(--text-secondary)' }}>
                {time}ms
              </span>
            ))}
          </div>
        )}

        <div
          onClick={handleClick}
          style={{
            width: '240px',
            height: '240px',
            background: phase === 'waiting' ? 'var(--bg-glass)' : getBoxColor(),
            backdropFilter: phase === 'waiting' ? 'var(--blur-glass)' : 'none',
            WebkitBackdropFilter: phase === 'waiting' ? 'var(--blur-glass)' : 'none',
            border: phase === 'waiting' ? '1px solid var(--border-glass)' : 'none',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: phase === 'waiting' ? 'var(--text-secondary)' : 'white',
            cursor: phase === 'ready' ? 'pointer' : 'default',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            boxShadow: phase === 'ready' ? 'var(--shadow-glass-hover)' : (phase === 'waiting' ? 'var(--shadow-glass)' : 'var(--shadow-md)'),
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {phase === 'waiting' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
              pointerEvents: 'none',
              borderRadius: '20px 20px 0 0'
            }} />
          )}
          {getBoxText()}
        </div>

        {phase === 'ready' && (
          <div style={{ marginTop: '8px', fontSize: '1.25rem', background: 'var(--accent-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {currentReactionTime}ms
          </div>
        )}

        {phase === 'clicked' && (
          <div style={{ 
            marginTop: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            {reactionTimes.length < TOTAL_ROUNDS ? 'Moving to next round...' : 'Calculating results...'}
          </div>
        )}
      </div>

      {onBack && phase === 'waiting' && round === 0 && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', flexShrink: 0 }}>
          <button style={{ padding: '10px 24px', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M19 12H5"></path>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        </div>
      )}
    </div>
  )
}

