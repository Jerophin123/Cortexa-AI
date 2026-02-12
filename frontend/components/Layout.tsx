import { ReactNode } from 'react'
import styles from '../styles/Layout.module.css'

interface LayoutProps {
  children: ReactNode
  currentStep?: number
  totalSteps?: number
}

export default function Layout({ children, currentStep, totalSteps }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🧠</div>
            <div className={styles.logoText}>
              <h1>Dementia Risk</h1>
              <p>Assessment System</p>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <h3 className={styles.navTitle}>Assessment Steps</h3>
            <ul className={styles.navList}>
              <li className={`${styles.navItem} ${currentStep === 1 ? styles.active : ''}`}>
                <span className={styles.navNumber}>1</span>
                <span className={styles.navLabel}>Speech Test</span>
              </li>
              <li className={`${styles.navItem} ${currentStep === 2 ? styles.active : ''}`}>
                <span className={styles.navNumber}>2</span>
                <span className={styles.navLabel}>Memory Recall</span>
              </li>
              <li className={`${styles.navItem} ${currentStep === 3 ? styles.active : ''}`}>
                <span className={styles.navNumber}>3</span>
                <span className={styles.navLabel}>Reaction Time</span>
              </li>
              <li className={`${styles.navItem} ${currentStep === 4 ? styles.active : ''}`}>
                <span className={styles.navNumber}>4</span>
                <span className={styles.navLabel}>Task Performance</span>
              </li>
              <li className={`${styles.navItem} ${currentStep === 5 ? styles.active : ''}`}>
                <span className={styles.navNumber}>5</span>
                <span className={styles.navLabel}>Lifestyle Info</span>
              </li>
            </ul>
          </div>

          {currentStep && totalSteps && (
            <div className={styles.progressSection}>
              <div className={styles.progressInfo}>
                <span className={styles.progressLabel}>Progress</span>
                <span className={styles.progressPercent}>
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.infoCard}>
            <h4>About This Assessment</h4>
            <p>
              This cognitive risk screening tool evaluates multiple factors to assess early-stage dementia risk.
              Results are for screening purposes only and not a medical diagnosis.
            </p>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  )
}



