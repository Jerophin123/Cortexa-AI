import { useState } from 'react'

interface AccountInfo {
  firstName: string
  lastName: string
  age: number
  gender: string
  bloodGroup: string
}

interface AccountCreationProps {
  onComplete: (accountInfo: AccountInfo) => void
}

export default function AccountCreation({ onComplete }: AccountCreationProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [error, setError] = useState<string | null>(null)

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say']

  const handleSubmit = () => {
    // Validation
    if (!firstName.trim()) {
      setError('Please enter your first name')
      return
    }

    if (!lastName.trim()) {
      setError('Please enter your last name')
      return
    }

    if (age === '' || age < 0 || age > 120) {
      setError('Please enter a valid age (0-120)')
      return
    }

    if (!gender) {
      setError('Please select your gender')
      return
    }

    if (!bloodGroup) {
      setError('Please select your blood group')
      return
    }

    setError(null)
    onComplete({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: age as number,
      gender,
      bloodGroup
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Create Your Account
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '20px', lineHeight: '1.6', fontSize: '1rem' }}>
          Please provide your basic information to begin the assessment.
        </p>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          borderLeft: '4px solid #c62828',
          flexShrink: 0
        }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ 
          flex: 1,
          padding: '24px', 
          backgroundColor: '#f9fafb', 
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflowY: 'auto'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', color: '#333', fontWeight: '500' }}>
              First Name:
              <input
                type="text"
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  marginTop: '8px', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '8px', 
                  fontSize: '1rem', 
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter your first name"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', color: '#333', fontWeight: '500' }}>
              Last Name:
              <input
                type="text"
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  marginTop: '8px', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '8px', 
                  fontSize: '1rem', 
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter your last name"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
            Age:
            <input
              type="number"
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '8px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px', 
                fontSize: '1rem', 
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
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
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
            Gender:
            <select
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '8px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px', 
                fontSize: '1rem', 
                fontFamily: 'inherit',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              value={gender}
              onChange={(e) => {
                setGender(e.target.value)
                setError(null)
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <option value="">Select gender</option>
              {genders.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', color: '#333', fontWeight: '500' }}>
            Blood Group:
            <select
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '8px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px', 
                fontSize: '1rem', 
                fontFamily: 'inherit',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              value={bloodGroup}
              onChange={(e) => {
                setBloodGroup(e.target.value)
                setError(null)
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <option value="">Select blood group</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end', 
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
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
          onClick={handleSubmit}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
        >
          Continue to Assessment
        </button>
      </div>
    </div>
  )
}

