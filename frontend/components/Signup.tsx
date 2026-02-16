import { useState } from 'react'
import axios from 'axios'
import styles from '../styles/Home.module.css'

interface UserInfo {
  userId: number
  email: string
  firstName: string
  lastName: string
  age: number
  gender: string
  bloodGroup: string
}

interface SignupProps {
  onSuccess: (userInfo: UserInfo) => void
  onSwitchToLogin: () => void
}

export default function Signup({ onSuccess, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupUserInfo, setSignupUserInfo] = useState<UserInfo | null>(null)

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name')
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

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8080/api/auth/signup', {
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age,
        gender,
        bloodGroup
      })

      if (response.data.success) {
        // Store user info for after verification
        const userInfo = {
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          age: response.data.age,
          gender: response.data.gender,
          bloodGroup: response.data.bloodGroup
        }
        setSignupEmail(response.data.email)
        setSignupUserInfo(userInfo)
        setShowVerification(true)
        setError(null)
      } else {
        setError(response.data.message || 'Signup failed')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data) {
        // Handle validation errors
        const errors = err.response.data
        const errorMessages = Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
        setError(errorMessages || 'Signup failed')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits')
      return
    }

    setVerifying(true)

    try {
      const response = await axios.post('http://localhost:8080/api/auth/verify-email', {
        email: signupEmail,
        verificationCode: verificationCode
      })

      if (response.data.success && signupUserInfo) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(signupUserInfo))
        
        onSuccess(signupUserInfo)
      } else {
        setError(response.data.message || 'Verification failed')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setError(null)
    setResending(true)

    try {
      const response = await axios.post('http://localhost:8080/api/auth/resend-verification', {
        email: signupEmail
      })

      if (response.data.success) {
        setError(null)
        alert('Verification code sent to your email!')
      } else {
        setError(response.data.message || 'Failed to resend verification code')
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setResending(false)
    }
  }

  // Show verification form if signup was successful
  if (showVerification) {
    return (
      <div className={styles.assessmentCard}>
        <div className={styles.cardHeader}>
          <div>
            <h1 className={styles.title}>Verify Your Email</h1>
            <p className={styles.subtitle}>We sent a verification code to {signupEmail}</p>
          </div>
        </div>

        <div className={styles.stepContent} style={{ overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {error && (
            <div style={{ 
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              color: '#ef4444', 
              padding: '8px 12px', 
              borderRadius: '12px', 
              marginBottom: '10px', 
              border: '1px solid var(--border-glass)',
              fontSize: '0.8rem',
              flexShrink: 0,
              boxShadow: 'var(--shadow-glass)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.9rem' }}>
              Verification Code
              <input
                type="text"
                required
                maxLength={6}
                className={styles.input}
                style={{ 
                  marginTop: '8px', 
                  fontSize: '1.5rem', 
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontFamily: 'monospace',
                  fontWeight: '600'
                }}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setVerificationCode(value)
                  setError(null)
                }}
                placeholder="000000"
                autoFocus
              />
              <p style={{ 
                marginTop: '8px', 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}>
                Enter the 6-digit code sent to your email
              </p>
            </label>

            <button 
              type="submit"
              disabled={verifying || verificationCode.length !== 6}
              className={styles.button}
              style={{ 
                width: '100%',
                marginBottom: '10px',
                marginTop: 'auto',
                flexShrink: 0,
                opacity: (verifying || verificationCode.length !== 6) ? 0.6 : 1,
                background: (verifying || verificationCode.length !== 6) ? '#ccc' : undefined
              }} 
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>

            <div style={{ textAlign: 'center', paddingTop: '8px', flexShrink: 0 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 6px 0' }}>
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className={styles.buttonSecondary}
                style={{
                  width: 'auto',
                  margin: '0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: resending ? 0.6 : 1
                }}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.assessmentCard}>
      <div className={styles.cardHeader}>
        <div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Sign up to start your Cortexa AI assessment</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="56" height="56" viewBox="-20 0 190 190" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--accent-primary)' }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M129.49 114.51C129.121 116.961 128.187 119.293 126.762 121.322C125.337 123.351 123.461 125.021 121.28 126.2C120.676 126.535 120.043 126.816 119.39 127.04C120.22 138.04 102.74 142.04 93.32 139.42L96.82 151.66L87.82 151.98L72.07 129.43C66.76 130.93 60.49 131.65 56.44 125.15C56.0721 124.553 55.7382 123.935 55.44 123.3C54.4098 123.51 53.3614 123.617 52.31 123.62C49.31 123.62 44.31 122.72 41.77 120.96C39.7563 119.625 38.1588 117.75 37.16 115.55C31.75 116.29 27.16 115.02 24.16 111.88C20.36 107.97 19.28 101.51 21.26 94.58C23.87 85.33 31.81 74.91 47.59 71C48.9589 69.2982 50.5972 67.8322 52.44 66.66C62.35 60.31 78.44 59.76 90.65 65.79C95.3836 64.9082 100.27 65.376 104.75 67.14C113.53 70.43 119.91 77.31 121.11 84.3C123.487 85.5317 125.433 87.4568 126.69 89.82C129.32 94.76 129.69 99.71 127.92 103.71C129.587 107.049 130.138 110.835 129.49 114.51ZM123.01 109.31C121.612 110.048 120.056 110.434 118.475 110.434C116.894 110.434 115.338 110.048 113.94 109.31L114.67 104.46C117.75 104.76 120.26 103.8 121.57 101.83C123.04 99.64 122.81 96.39 120.95 92.9C118.87 88.99 114.38 88.37 111.89 88.34H111.73C105.49 88.34 99.13 91.89 96.56 96.52L92.82 94.73C93.5553 92.3449 94.8046 90.15 96.48 88.3C95.0376 87.0754 93.9474 85.4887 93.3217 83.703C92.696 81.9173 92.5574 79.9971 92.92 78.14L96.61 77.8C96.7789 79.302 97.4 80.7172 98.3911 81.8583C99.3822 82.9994 100.697 83.8125 102.16 84.19C105.238 82.8161 108.58 82.1335 111.95 82.19C112.43 82.19 112.89 82.24 113.36 82.27C110.969 78.0312 107.18 74.7545 102.64 73C91.56 68.7 84.09 75.37 82.38 77.67C78.26 83.19 80.9 88.41 82.91 91.8L79.61 94.8C76.736 92.314 74.8075 88.9127 74.15 85.17C69.92 86.44 64.24 86.17 61.06 80.74L64.06 78.68C67.43 81.2 72.78 80.98 75.32 77.87C75.9252 76.4949 76.6905 75.1959 77.6 74C79.044 72.093 80.7864 70.4316 82.76 69.08C74.47 66.82 62.76 67.19 55.68 71.73C53.7668 72.841 52.192 74.4517 51.1244 76.3895C50.0569 78.3274 49.5368 80.5192 49.62 82.73C49.62 86.3 52.42 91.94 56.19 92.82L54 97.07C51.5946 96.5129 49.4109 95.2487 47.73 93.44L44.48 97.58L41.23 96L44.41 87.68C43.8904 86.064 43.624 84.3774 43.62 82.68C43.628 81.3361 43.7687 79.9963 44.04 78.68C34.04 82.81 29.1 89.68 27.29 95.96C25.9 100.79 26.44 105.15 28.72 107.49C30.53 109.35 33.3 109.79 35.91 109.62L42.91 104.17L45.21 106.11L43.13 112.93C44.22 116.4 47.79 118.19 54.3 116.93C54.6375 114.169 55.7272 111.554 57.45 109.37C58.7133 107.552 60.3846 106.056 62.33 105L65.75 95.79L69.17 95.64L68.8 103.19C74.55 102.6 80.98 103.77 86.97 102.87L88.07 106.87C79.29 110.93 70.3 104.31 62.15 113.04C59.22 116.18 60.34 118.91 62.15 121.66C64.76 125.59 69.66 123.23 74.67 121.66C82.26 119.34 87.77 117.66 98.16 118.51C95.68 113.8 95.92 108.11 99.24 101.85L104.13 103.78C100.7 111.69 103.91 116.27 106.13 118.29C109.56 121.41 114.72 122.35 118.13 120.47C119.436 119.749 120.559 118.737 121.412 117.513C122.265 116.289 122.825 114.885 123.05 113.41C123.275 112.051 123.258 110.663 123 109.31H123.01Z" />
          </svg>
        </div>
      </div>

      <div className={styles.stepContent} style={{ overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {error && (
        <div style={{ 
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          color: '#ef4444', 
          padding: '8px 12px', 
          borderRadius: '12px', 
          marginBottom: '10px', 
          border: '1px solid var(--border-glass)',
          fontSize: '0.8rem',
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
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
              First Name
              <input
                type="text"
                required
                className={styles.input}
                style={{ marginTop: '4px', fontSize: '0.85rem', padding: '8px 12px' }}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  setError(null)
                }}
                placeholder="John"
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
              Last Name
              <input
                type="text"
                required
                className={styles.input}
                style={{ marginTop: '4px', fontSize: '0.85rem', padding: '8px 12px' }}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  setError(null)
                }}
                placeholder="Doe"
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
            Email Address
            <input
              type="email"
              required
              className={styles.input}
              style={{ marginTop: '6px', fontSize: '0.9rem' }}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="you@example.com"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
              Password
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className={styles.input}
                  style={{ 
                    paddingRight: '40px',
                    marginTop: '4px',
                    fontSize: '0.85rem',
                    padding: '8px 40px 8px 12px'
                  }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#667eea'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
              Confirm Password
              <div style={{ position: 'relative', marginTop: '6px' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={styles.input}
                  style={{ 
                    paddingRight: '40px',
                    marginTop: '4px',
                    fontSize: '0.85rem',
                    padding: '8px 40px 8px 12px'
                  }}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#667eea'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
              Age
              <input
                type="number"
                required
                className={styles.input}
                style={{ marginTop: '4px', fontSize: '0.85rem', padding: '8px 12px' }}
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

            <label style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
              Gender
              <select
                required
                className={styles.input}
                style={{ marginTop: '4px', fontSize: '0.85rem', cursor: 'pointer', padding: '8px 12px' }}
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value)
                  setError(null)
                }}
              >
                <option value="">Select gender</option>
                {genders.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.8rem' }}>
            Blood Group
            <select
              required
              className={styles.input}
              style={{ marginTop: '6px', fontSize: '0.9rem', cursor: 'pointer' }}
              value={bloodGroup}
              onChange={(e) => {
                setBloodGroup(e.target.value)
                setError(null)
              }}
            >
              <option value="">Select blood group</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </label>

          <button 
            type="submit"
            disabled={loading}
            className={styles.button}
            style={{ 
              width: '100%',
              marginBottom: '10px',
              marginTop: 'auto',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              opacity: loading ? 0.6 : 1,
              background: loading ? '#ccc' : undefined
            }} 
          >
            {!loading && (
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
            )}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', paddingTop: '8px', flexShrink: 0 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 6px 0' }}>
              Already have an account?
            </p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className={styles.buttonSecondary}
              style={{
                width: 'auto',
                margin: '0 auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Sign in instead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

