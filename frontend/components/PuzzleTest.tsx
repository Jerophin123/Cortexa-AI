import { useState, useEffect } from 'react'

interface PuzzleTestProps {
  onComplete: (errorRate: number) => void
  onBack?: () => void
}

const SEQUENCES = [
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [2, 4, 6, 8, 10],
  [10, 8, 6, 4, 2],
  [1, 3, 5, 7, 9]
]

export default function PuzzleTest({ onComplete, onBack }: PuzzleTestProps) {
  const [currentSequence, setCurrentSequence] = useState<number[]>([])
  const [shuffledSequence, setShuffledSequence] = useState<number[]>([])
  const [selectedOrder, setSelectedOrder] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [errors, setErrors] = useState(0)
  const [round, setRound] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [totalAttempts, setTotalAttempts] = useState(0)

  const TOTAL_ROUNDS = 3

  useEffect(() => {
    startNewRound()
  }, [])

  const startNewRound = () => {
    const sequence = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)]
    const shuffled = [...sequence].sort(() => Math.random() - 0.5)
    setCurrentSequence(sequence)
    setShuffledSequence(shuffled)
    setSelectedOrder([])
    setAttempts(0)
    // Ensure totalAttempts is at least the number of rounds completed
    setTotalAttempts(prev => Math.max(prev, round + 1))
  }

  const handleNumberClick = (num: number) => {
    if (selectedOrder.includes(num)) {
      // Remove if already selected
      setSelectedOrder(prev => prev.filter(n => n !== num))
    } else {
      // Add to selection
      setSelectedOrder(prev => [...prev, num])
    }
  }

  const handleCheck = () => {
    if (selectedOrder.length !== currentSequence.length) {
      alert('Please select all numbers in the correct order.')
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setTotalAttempts(prev => prev + 1)
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(currentSequence)

    if (!isCorrect) {
      const newErrors = errors + 1
      setErrors(newErrors)
      alert('Incorrect order. Try again!')
      setSelectedOrder([])
    } else {
      // Correct! Move to next round
      if (round < TOTAL_ROUNDS - 1) {
        setTimeout(() => {
          setRound(prev => prev + 1)
          startNewRound()
        }, 1000)
      } else {
        // All rounds complete - ensure totalAttempts is updated before setting complete
        setTotalAttempts(prev => {
          // Ensure we have at least one attempt per round completed
          const minAttempts = round + 1
          return Math.max(prev, minAttempts)
        })
        // Use setTimeout to ensure state is updated before setting complete
        setTimeout(() => {
          setIsComplete(true)
        }, 100)
      }
    }
  }

  const handleReset = () => {
    setSelectedOrder([])
  }

  const handleContinue = () => {
    try {
      // Calculate error rate: errors / total attempts
      // Use the state variable totalAttempts, ensuring it's at least the number of rounds completed
      const finalTotalAttempts = totalAttempts > 0 ? totalAttempts : TOTAL_ROUNDS
      const errorRate = finalTotalAttempts > 0 ? errors / finalTotalAttempts : 0
      const cappedErrorRate = Math.min(errorRate, 1) // Cap at 1
      
      console.log('PuzzleTest handleContinue:', { 
        errors, 
        totalAttempts, 
        finalTotalAttempts, 
        errorRate, 
        cappedErrorRate,
        round,
        TOTAL_ROUNDS
      })
      
      if (onComplete) {
        onComplete(cappedErrorRate)
      } else {
        console.error('PuzzleTest: onComplete callback is not defined')
      }
    } catch (error) {
      console.error('PuzzleTest handleContinue error:', error)
      // Fallback: call onComplete with 0 error rate if calculation fails
      if (onComplete) {
        onComplete(0)
      }
    }
  }

  if (isComplete) {
    // Use state variable, not a local one
    const calculatedTotalAttempts = totalAttempts > 0 ? totalAttempts : (round + 1)
    const errorRate = calculatedTotalAttempts > 0 ? errors / calculatedTotalAttempts : 0

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
        <div style={{ flexShrink: 0 }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Task Performance Test</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5', fontSize: '0.95rem' }}>
            Puzzle test complete!
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            background: 'var(--bg-glass)',
            backdropFilter: 'var(--blur-glass)',
            WebkitBackdropFilter: 'var(--blur-glass)',
            border: '1px solid var(--border-glass)', 
            borderRadius: '20px',
            boxShadow: 'var(--shadow-glass)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>
              Results:
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.9rem' }}>
              Total Errors: {errors}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.9rem' }}>
              Total Attempts: {calculatedTotalAttempts}
            </div>
            <div style={{ fontSize: '1.1rem', marginTop: '12px', background: 'var(--accent-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: '600' }}>
              Error Rate: {(errorRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', flexShrink: 0 }}>
          {onBack && (
            <button style={{ padding: '10px 24px', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: 'var(--text-primary)' }} onClick={onBack}>
              Back
            </button>
          )}
          <button style={{ padding: '10px 24px', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', background: 'var(--accent-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-glass)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} onClick={handleContinue}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
              pointerEvents: 'none',
              opacity: 0.6
            }} />
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Task Performance Test</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.5', fontSize: '0.95rem' }}>
          Arrange the numbers in the correct order. Round {round + 1} of {TOTAL_ROUNDS}
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '12px', 
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          border: '1px solid var(--border-glass)', 
          borderRadius: '16px',
          flexShrink: 0,
          boxShadow: 'var(--shadow-glass)',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius: '16px 16px 0 0'
          }} />
          <div style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Target Sequence:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {currentSequence.map((num, idx) => (
              <div
                key={idx}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--accent-primary)',
                  color: 'var(--text-inverse)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Click numbers in order:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {shuffledSequence.map((num, idx) => {
              const isSelected = selectedOrder.includes(num)
              const selectedIndex = selectedOrder.indexOf(num)
              return (
                <div
                  key={idx}
                  onClick={() => handleNumberClick(num)}
                  style={{
                    width: '48px',
                    height: '48px',
                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-glass)',
                    backdropFilter: isSelected ? 'none' : 'var(--blur-glass)',
                    WebkitBackdropFilter: isSelected ? 'none' : 'var(--blur-glass)',
                    color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? '2px solid rgba(102, 126, 234, 0.5)' : '2px solid var(--border-glass)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <div>{num}</div>
                  {isSelected && (
                    <div style={{ fontSize: '0.65rem', marginTop: '1px', lineHeight: '1' }}>
                      #{selectedIndex + 1}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {selectedOrder.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px',
            background: 'var(--bg-glass)',
            backdropFilter: 'var(--blur-glass)',
            WebkitBackdropFilter: 'var(--blur-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            flexShrink: 0
          }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Your order:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedOrder.join(' → ')}</span>
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          flexShrink: 0
        }}>
          Attempts: {attempts} | Errors: {errors} | Total: {totalAttempts}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', flexShrink: 0 }}>
        {onBack && (
          <button style={{ padding: '10px 24px', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M19 12H5"></path>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>
        )}
        <button 
          style={{ 
            padding: '10px 24px', 
            border: '1px solid var(--border-glass)', 
            borderRadius: '12px', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            cursor: selectedOrder.length === 0 ? 'not-allowed' : 'pointer',
            background: 'var(--bg-glass)',
            backdropFilter: 'var(--blur-glass)',
            WebkitBackdropFilter: 'var(--blur-glass)',
            color: 'var(--text-primary)',
            opacity: selectedOrder.length === 0 ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} 
          onClick={handleReset}
          disabled={selectedOrder.length === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Reset
        </button>
        <button 
          style={{ 
            padding: '10px 24px', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            cursor: selectedOrder.length !== currentSequence.length ? 'not-allowed' : 'pointer',
            background: selectedOrder.length !== currentSequence.length ? '#ccc' : 'var(--accent-primary)',
            color: 'var(--text-inverse)',
            opacity: selectedOrder.length !== currentSequence.length ? 0.6 : 1,
            boxShadow: selectedOrder.length === currentSequence.length ? 'var(--shadow-sm)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} 
          onClick={handleCheck}
          disabled={selectedOrder.length !== currentSequence.length}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Check Answer
        </button>
      </div>
    </div>
  )
}

