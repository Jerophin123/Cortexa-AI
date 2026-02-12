import { useState, useEffect } from 'react'

interface MemoryTestProps {
  onComplete: (memoryScore: number) => void
  onBack?: () => void
}

const WORD_POOL = [
  'apple', 'river', 'mountain', 'book', 'cloud',
  'ocean', 'forest', 'bridge', 'candle', 'garden',
  'window', 'mirror', 'guitar', 'piano', 'bicycle',
  'tiger', 'eagle', 'dolphin', 'butterfly', 'elephant'
]

export default function MemoryTest({ onComplete, onBack }: MemoryTestProps) {
  const [words, setWords] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [phase, setPhase] = useState<'showing' | 'recall' | 'complete'>('showing')
  const [userInput, setUserInput] = useState('')
  const [memoryScore, setMemoryScore] = useState<number | null>(null)

  useEffect(() => {
    // Select 5 random words
    const shuffled = [...WORD_POOL].sort(() => Math.random() - 0.5)
    setWords(shuffled.slice(0, 5))
  }, [])

  useEffect(() => {
    if (phase === 'showing' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setPhase('recall')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [phase, timeRemaining])

  const calculateScore = () => {
    const userWords = userInput
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.trim().length > 0)
      .map(w => w.trim())

    const correctWords = words.filter(word => 
      userWords.includes(word.toLowerCase())
    ).length

    const score = (correctWords / words.length) * 100
    return Math.round(score)
  }

  const handleSubmit = () => {
    if (userInput.trim().length === 0) {
      alert('Please enter at least one word before submitting.')
      return
    }

    const score = calculateScore()
    setMemoryScore(score)
    setPhase('complete')
  }

  const handleContinue = () => {
    if (memoryScore !== null) {
      onComplete(memoryScore)
    }
  }

  if (phase === 'showing') {
    return (
      <div>
        <h2>Memory Recall Test</h2>
      <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
        Memorize the following 5 words. You have 30 seconds to study them.
      </p>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea' }}>
            {timeRemaining}s
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          {words.map((word, index) => (
            <div
              key={index}
              style={{
                padding: '20px 30px',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '8px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                minWidth: '120px',
                textAlign: 'center'
              }}
            >
              {word}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', color: '#666' }}>
          Study these words carefully...
        </div>
      </div>
    )
  }

  if (phase === 'recall') {
    return (
      <div>
        <h2>Memory Recall Test</h2>
        <p className="stepDescription">
          Type the words you remember (separated by spaces). You don't need to type them in order.
        </p>

        <label style={{ display: 'block', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
          Enter the words you remember:
          <textarea
            style={{ width: '100%', padding: '12px 16px', marginTop: '8px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., apple river mountain book cloud"
            rows={4}
            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
          />
        </label>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
          {onBack && (
            <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: '#f5f5f5', color: '#333' }} onClick={onBack}>
              Back
            </button>
          )}
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    )
  }

  // Complete phase
  return (
    <div>
      <h2>Memory Recall Test</h2>
      <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
        Your memory score has been calculated.
      </p>

      <div style={{ 
        textAlign: 'center', 
        padding: '30px', 
        backgroundColor: '#e8f5e9', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '10px' }}>
          {memoryScore}%
        </div>
        <div style={{ color: '#666' }}>
          You remembered {words.filter(word => 
            userInput.toLowerCase().split(/\s+/).includes(word.toLowerCase())
          ).length} out of {words.length} words
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

