import { useState } from 'react'

interface LifestyleFormProps {
  onComplete: (age: number, sleepHours: number) => void
  onBack?: () => void
}

export default function LifestyleForm({ onComplete, onBack }: LifestyleFormProps) {
  const [age, setAge] = useState<number | ''>('')
  const [sleepHours, setSleepHours] = useState<number | ''>('')
  const [functionalDecline, setFunctionalDecline] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    // Validation
    if (age === '' || age < 0 || age > 120) {
      setError('Please enter a valid age (0-120)')
      return
    }

    if (sleepHours === '' || sleepHours < 0 || sleepHours > 24) {
      setError('Please enter valid sleep hours (0-24)')
      return
    }

    if (functionalDecline === null) {
      setError('Please answer the functional decline question')
      return
    }

    setError(null)
    onComplete(age as number, sleepHours as number)
  }

  return (
    <div>
      <h2>Lifestyle Information</h2>
      <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
        Please provide some basic information about yourself.
      </p>

      {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #c62828' }}>{error}</div>}

      <label style={{ display: 'block', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
        Age:
        <input
          type="number"
          style={{ width: '100%', padding: '12px 16px', marginTop: '8px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}
          value={age}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : parseInt(e.target.value)
            if (value === '' || (!isNaN(value as number) && value >= 0 && value <= 120)) {
              setAge(value)
              setError(null)
            }
          }}
          placeholder="e.g., 65"
          min="0"
          max="120"
        />
      </label>

      <label style={{ display: 'block', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
        Average Sleep Hours per Night:
        <input
          type="number"
          style={{ width: '100%', padding: '12px 16px', marginTop: '8px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' }}
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

      <div style={{ display: 'block', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
        Have you noticed any decline in your ability to perform daily activities compared to a year ago?
        <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '10px 20px',
            borderRadius: '8px',
            border: functionalDecline === true ? '2px solid #667eea' : '2px solid #e0e0e0',
            backgroundColor: functionalDecline === true ? '#e3f2fd' : 'white'
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
            padding: '10px 20px',
            borderRadius: '8px',
            border: functionalDecline === false ? '2px solid #667eea' : '2px solid #e0e0e0',
            backgroundColor: functionalDecline === false ? '#e3f2fd' : 'white'
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

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
        {onBack && (
          <button style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: '#f5f5f5', color: '#333' }} onClick={onBack}>
            Back
          </button>
        )}
        <button 
          style={{ padding: '12px 32px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }} 
          onClick={handleSubmit}
        >
          Complete Assessment
        </button>
      </div>
    </div>
  )
}

