import { useState } from 'react'

interface LifestyleFormProps {
  age: number
  onComplete: (sleepHours: number) => void
  onBack?: () => void
}

export default function LifestyleForm({ age, onComplete, onBack }: LifestyleFormProps) {
  const [sleepHours, setSleepHours] = useState<number | ''>('')
  const [functionalDecline, setFunctionalDecline] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    // Validation
    if (sleepHours === '' || sleepHours < 0 || sleepHours > 24) {
      setError('Please enter valid sleep hours (0-24)')
      return
    }

    if (functionalDecline === null) {
      setError('Please answer the functional decline question')
      return
    }

    setError(null)
    onComplete(sleepHours as number)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Lifestyle Information
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5', fontSize: '0.95rem' }}>
          Please provide some additional information about your lifestyle.
        </p>
      </div>

      {error && (
        <div style={{ 
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          color: '#ef4444', 
          padding: '10px 14px', 
          borderRadius: '12px', 
          marginBottom: '16px', 
          border: '1px solid var(--border-glass)',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        flex: 1,
        padding: '20px', 
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-glass)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
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
          borderRadius: '24px 24px 0 0',
          zIndex: 1
        }} />
        <div style={{ 
          marginBottom: '16px', 
          padding: '14px', 
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
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
            borderRadius: '12px 12px 0 0'
          }} />
          <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '4px', fontSize: '0.9rem' }}>Your Age</div>
          <div style={{ background: 'var(--accent-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '1.1rem', fontWeight: '700' }}>{age} years</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>This information was collected during account creation</div>
        </div>

        <label style={{ display: 'block', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.9rem', flexShrink: 0 }}>
          Average Sleep Hours per Night:
          <input
            type="number"
            style={{ 
              width: '100%', 
              padding: '10px 14px', 
              marginTop: '8px', 
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              border: '1px solid var(--border-glass)', 
              borderRadius: '12px', 
              fontSize: '0.95rem', 
              fontFamily: 'inherit',
              color: 'var(--text-primary)'
            }}
            value={sleepHours}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : parseFloat(e.target.value)
              if (value === '' || (!isNaN(value as number) && value >= 0 && value <= 24)) {
                setSleepHours(value)
                setError(null)
              }
            }}
            placeholder="e.g., 7.5"
            min="0"
            max="24"
            step="0.5"
          />
        </label>

        <div style={{ display: 'block', marginBottom: '0', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.9rem', flexShrink: 0 }}>
          Have you noticed any decline in your ability to perform daily activities compared to a year ago?
          <div style={{ marginTop: '10px', display: 'flex', gap: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '10px 18px',
              borderRadius: '12px',
              background: functionalDecline === true ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              border: functionalDecline === true ? '2px solid #667eea' : '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              flex: 1
            }}>
              <input
                type="radio"
                name="functionalDecline"
                checked={functionalDecline === true}
                onChange={() => {
                  setFunctionalDecline(true)
                  setError(null)
                }}
                style={{ marginRight: '8px' }}
              />
              Yes
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '10px 18px',
              borderRadius: '12px',
              background: functionalDecline === false ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              border: functionalDecline === false ? '2px solid #667eea' : '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              flex: 1
            }}>
              <input
                type="radio"
                name="functionalDecline"
                checked={functionalDecline === false}
                onChange={() => {
                  setFunctionalDecline(false)
                  setError(null)
                }}
                style={{ marginRight: '8px' }}
              />
              No
            </label>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end', 
        marginTop: '16px',
        flexShrink: 0
      }}>
        {onBack && (
          <button 
            style={{ 
              padding: '10px 24px', 
              border: '1px solid var(--border-glass)', 
              borderRadius: '12px', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              cursor: 'pointer', 
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              color: 'var(--text-primary)',
              transition: 'all 0.3s ease'
            }} 
            onClick={onBack}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-glass-hover)'
              e.currentTarget.style.borderColor = 'var(--border-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-glass)'
              e.currentTarget.style.borderColor = 'var(--border-glass)'
            }}
          >
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
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            cursor: 'pointer',
            background: 'var(--accent-primary)',
            color: 'var(--text-inverse)',
            boxShadow: 'var(--shadow-glass)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }} 
          onClick={handleSubmit}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-glass-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-glass)'
          }}
        >
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
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Complete Assessment
        </button>
      </div>
    </div>
  )
}

