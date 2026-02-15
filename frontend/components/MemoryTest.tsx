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
        <h2 style={{ color: 'var(--text-primary)' }}>Memory Recall Test</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.6' }}>
        Memorize the following 5 words. You have 30 seconds to study them.
      </p>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', background: 'var(--accent-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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
                background: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
                borderRadius: '12px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                minWidth: '120px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {word}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
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

        <label style={{ display: 'block', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: '500' }}>
          Enter the words you remember:
          <textarea
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              marginTop: '8px', 
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              border: '1px solid var(--border-glass)', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              minHeight: '100px', 
              resize: 'vertical'
            }}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., apple river mountain book cloud"
            rows={4}
          />
        </label>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
          {onBack && (
            <button style={{ padding: '12px 32px', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: 'var(--text-primary)' }} onClick={onBack}>
              Back
            </button>
          )}
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'var(--accent-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-glass)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} onClick={handleSubmit}>
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
            Submit
          </button>
        </div>
      </div>
    )
  }

  // Complete phase
  return (
    <div>
      <h2 style={{ color: 'var(--text-primary)' }}>Memory Recall Test</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.6' }}>
        Your memory score has been calculated.
      </p>

      <div style={{ 
        textAlign: 'center', 
        padding: '30px', 
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1px solid var(--border-glass)', 
        borderRadius: '24px',
        marginBottom: '20px',
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
          borderRadius: '24px 24px 0 0'
        }} />
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'var(--accent-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '10px' }}>
          {memoryScore}%
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          You remembered {words.filter(word => 
            userInput.toLowerCase().split(/\s+/).includes(word.toLowerCase())
          ).length} out of {words.length} words
        </div>
      </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
          {onBack && (
            <button style={{ padding: '12px 32px', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M19 12H5"></path>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
          )}
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'var(--accent-primary)', color: 'var(--text-inverse)', boxShadow: 'var(--shadow-glass)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleContinue}>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            Continue
          </button>
        </div>
    </div>
  )
}

