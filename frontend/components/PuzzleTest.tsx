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
        // All rounds complete
        setIsComplete(true)
      }
    }
  }

  const handleReset = () => {
    setSelectedOrder([])
  }

  const handleContinue = () => {
    // Calculate error rate: errors / total attempts
    const finalTotalAttempts = totalAttempts > 0 ? totalAttempts : TOTAL_ROUNDS // Fallback if no attempts recorded
    const errorRate = finalTotalAttempts > 0 ? errors / finalTotalAttempts : 0
    onComplete(Math.min(errorRate, 1)) // Cap at 1
  }

  if (isComplete) {
    const totalAttempts = attempts + (round + 1)
    const errorRate = totalAttempts > 0 ? errors / totalAttempts : 0

    return (
      <div>
        <h2>Task Performance Test</h2>
      <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
        Puzzle test complete!
      </p>

      <div style={{ 
        textAlign: 'center', 
        padding: '30px', 
        backgroundColor: '#e8f5e9', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
          <strong>Results:</strong>
        </div>
        <div style={{ color: '#666', marginBottom: '5px' }}>
          Total Errors: {errors}
        </div>
        <div style={{ color: '#666', marginBottom: '5px' }}>
          Total Attempts: {totalAttempts || TOTAL_ROUNDS}
        </div>
        <div style={{ fontSize: '1.2rem', marginTop: '15px', color: '#4caf50' }}>
          Error Rate: {((errors / (totalAttempts || TOTAL_ROUNDS)) * 100).toFixed(1)}%
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
        {onBack && (
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: '#f5f5f5', color: '#333' }} onClick={onBack}>
            Back
          </button>
        )}
        <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }} onClick={handleContinue}>
          Continue
        </button>
      </div>
      </div>
    )
  }

  return (
    <div>
      <h2>Task Performance Test</h2>
      <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
        Arrange the numbers in the correct order. Round {round + 1} of {TOTAL_ROUNDS}
      </p>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#666' }}>
            Target Sequence:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {currentSequence.map((num, idx) => (
              <div
                key={idx}
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px', textAlign: 'center' }}>
            Click numbers in order:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
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
                    width: '60px',
                    height: '60px',
                    backgroundColor: isSelected ? '#4caf50' : '#e0e0e0',
                    color: isSelected ? 'white' : '#333',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? '3px solid #2e7d32' : '3px solid transparent'
                  }}
                >
                  <div>{num}</div>
                  {isSelected && (
                    <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
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
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px'
          }}>
            <strong>Your order:</strong>{' '}
            {selectedOrder.join(' → ')}
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: '#666'
        }}>
          Attempts this round: {attempts} | Total errors: {errors} | Total attempts: {totalAttempts}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
        {onBack && (
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: '#f5f5f5', color: '#333' }} onClick={onBack}>
            Back
          </button>
        )}
        <button 
          style={{ 
            padding: '12px 32px', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600', 
            cursor: selectedOrder.length === 0 ? 'not-allowed' : 'pointer',
            background: '#f5f5f5',
            color: '#333',
            opacity: selectedOrder.length === 0 ? 0.6 : 1
          }} 
          onClick={handleReset}
          disabled={selectedOrder.length === 0}
        >
          Reset
        </button>
        <button 
          style={{ 
            padding: '12px 32px', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600', 
            cursor: selectedOrder.length !== currentSequence.length ? 'not-allowed' : 'pointer',
            background: selectedOrder.length !== currentSequence.length ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            opacity: selectedOrder.length !== currentSequence.length ? 0.6 : 1
          }} 
          onClick={handleCheck}
          disabled={selectedOrder.length !== currentSequence.length}
        >
          Check Answer
        </button>
      </div>
    </div>
  )
}

