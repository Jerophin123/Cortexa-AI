import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from '../styles/AssessmentHistory.module.css'

interface AssessmentHistoryItem {
  id: number
  timestamp: string
  patientName: string
  age: number
  riskLevel: string
  recommendation: string
}

interface AssessmentHistoryProps {
  userId: number
  onBack: () => void
}

export default function AssessmentHistory({ userId, onBack }: AssessmentHistoryProps) {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`http://localhost:8080/api/assessment/history/${userId}`)
      setHistory(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskColor = (riskLevel: string) => {
    const level = riskLevel.toLowerCase()
    if (level === 'low') return '#4caf50'
    if (level === 'medium') return '#ff9800'
    if (level === 'high') return '#f44336'
    return '#757575'
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading assessment history...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button className={styles.backButton} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M19 12H5"></path>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px', verticalAlign: 'middle' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Assessment History
        </h1>
        <p className={styles.subtitle}>View your previous assessment results</p>
        <button className={styles.backButton} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M19 12H5"></path>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Assessment
        </button>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h2>No Assessment History</h2>
          <p>You haven't completed any assessments yet. Start your first assessment to see results here.</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((assessment) => (
            <div key={assessment.id} className={styles.historyCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <div className={styles.patientName}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {assessment.patientName}
                  </div>
                  <div className={styles.timestamp}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.7 }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {formatDate(assessment.timestamp)}
                  </div>
                </div>
                <div
                  className={styles.riskBadge}
                  style={{ backgroundColor: getRiskColor(assessment.riskLevel) }}
                >
                  {assessment.riskLevel}
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.cardDetails}>
                  <div className={styles.detailItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.7 }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className={styles.detailLabel}>Age at Assessment:</span>
                    <span className={styles.detailValue}>{assessment.age} years</span>
                  </div>
                </div>
                
                <div className={styles.recommendation}>
                  <h4 className={styles.recommendationTitle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Recommendation
                  </h4>
                  <p className={styles.recommendationText}>{assessment.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

