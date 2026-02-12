import { useState } from 'react'
import axios from 'axios'
import styles from '../styles/Home.module.css'
import Layout from '../components/Layout'
import SpeechTest from '../components/SpeechTest'
import MemoryTest from '../components/MemoryTest'
import ReactionTest from '../components/ReactionTest'
import PuzzleTest from '../components/PuzzleTest'
import LifestyleForm from '../components/LifestyleForm'

interface AssessmentData {
  age: number
  reaction_time_ms: number
  memory_score: number
  speech_pause_ms: number
  word_repetition_rate: number
  task_error_rate: number
  sleep_hours: number
}

interface AssessmentResponse {
  riskLevel: string
  recommendation: string
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [assessmentData, setAssessmentData] = useState<Partial<AssessmentData>>({})
  const [result, setResult] = useState<AssessmentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setError(null)
    }
  }

  const handleSpeechComplete = (speechPauseMs: number, wordRepetitionRate: number) => {
    setAssessmentData(prev => ({
      ...prev,
      speech_pause_ms: speechPauseMs,
      word_repetition_rate: wordRepetitionRate
    }))
    handleNext()
  }

  const handleMemoryComplete = (memoryScore: number) => {
    setAssessmentData(prev => ({
      ...prev,
      memory_score: memoryScore
    }))
    handleNext()
  }

  const handleReactionComplete = (averageReactionTime: number) => {
    setAssessmentData(prev => ({
      ...prev,
      reaction_time_ms: averageReactionTime
    }))
    handleNext()
  }

  const handlePuzzleComplete = (errorRate: number) => {
    setAssessmentData(prev => ({
      ...prev,
      task_error_rate: errorRate
    }))
    handleNext()
  }

  const handleLifestyleComplete = (age: number, sleepHours: number) => {
    const updatedData = {
      ...assessmentData,
      age: age,
      sleep_hours: sleepHours
    }
    setAssessmentData(updatedData)
    handleSubmit(updatedData)
  }

  const handleSubmit = async (dataToSubmit?: Partial<AssessmentData>) => {
    // Use provided data or fall back to state
    const data = dataToSubmit || assessmentData
    
    // Validate all fields are filled
    const requiredFields: (keyof AssessmentData)[] = [
      'age',
      'reaction_time_ms',
      'memory_score',
      'speech_pause_ms',
      'word_repetition_rate',
      'task_error_rate',
      'sleep_hours'
    ]

    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null
    )

    if (missingFields.length > 0) {
      setError(`Missing required data: ${missingFields.join(', ')}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.post<AssessmentResponse>(
        'http://localhost:8080/api/assessment',
        {
          age: data.age,
          reaction_time_ms: data.reaction_time_ms,
          memory_score: data.memory_score,
          speech_pause_ms: data.speech_pause_ms,
          word_repetition_rate: data.word_repetition_rate,
          task_error_rate: data.task_error_rate,
          sleep_hours: data.sleep_hours,
        }
      )
      setResult(response.data)
    } catch (err: any) {
      // Better error handling
      if (err.response?.data?.errors) {
        // Parse validation errors
        const errors = err.response.data.errors
        const errorMessages = Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
        setError(`Validation failed: ${errorMessages}`)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(`Error: ${err.message}`)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setAssessmentData({})
    setResult(null)
    setError(null)
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return '#4caf50'
      case 'medium':
        return '#ff9800'
      case 'high':
        return '#f44336'
      default:
        return '#2196f3'
    }
  }

  if (result) {
    return (
      <Layout>
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <h1 className={styles.title}>Assessment Complete</h1>
            <p className={styles.subtitle}>Your cognitive risk assessment results</p>
          </div>
          
          <div className={styles.resultContent}>
            <div
              className={styles.riskBadge}
              style={{ backgroundColor: getRiskColor(result.riskLevel) }}
            >
              <span className={styles.riskLabel}>Risk Level</span>
              <span className={styles.riskValue}>{result.riskLevel}</span>
            </div>
            
            <div className={styles.recommendationCard}>
              <h3 className={styles.recommendationTitle}>Recommendation</h3>
              <p className={styles.recommendation}>{result.recommendation}</p>
            </div>
            
            <div className={styles.disclaimer}>
              <strong>⚠️ Important Disclaimer:</strong>
              <p>This is a cognitive risk screening tool and not a medical diagnosis. Please consult with a healthcare professional for a comprehensive evaluation.</p>
            </div>
            
            <div className={styles.actionButtons}>
              <button className={styles.button} onClick={handleReset}>
                Start New Assessment
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
      <Layout currentStep={currentStep} totalSteps={totalSteps}>
      <div className={styles.assessmentCard}>
        <div className={styles.cardHeader}>
          <div>
            <h1 className={styles.title}>Cognitive Risk Assessment</h1>
            <p className={styles.subtitle}>Step {currentStep} of {totalSteps}</p>
          </div>
          <div className={styles.stepBadge}>
            <span>Step {currentStep}</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner}></div>
            <p>Processing your assessment...</p>
          </div>
        )}

        <div className={styles.stepContent}>
          {currentStep === 1 && (
            <SpeechTest 
              onComplete={handleSpeechComplete}
              onBack={currentStep > 1 ? handleBack : undefined}
            />
          )}

          {currentStep === 2 && (
            <MemoryTest 
              onComplete={handleMemoryComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <ReactionTest 
              onComplete={handleReactionComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <PuzzleTest 
              onComplete={handlePuzzleComplete}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <LifestyleForm 
              onComplete={handleLifestyleComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
