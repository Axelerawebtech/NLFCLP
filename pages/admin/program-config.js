import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProgramConfigManager from '../../components/ProgramConfigManager';

export default function ProgramConfigPage() {
  const router = useRouter();
  const [isBackHovered, setIsBackHovered] = useState(false);

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    header: {
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderBottom: '1px solid #e5e7eb'
    },
    headerInner: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px',
      '@media (min-width: 640px)': {
        padding: '16px 24px'
      },
      '@media (min-width: 1024px)': {
        padding: '16px 32px'
      }
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      '@media (min-width: 640px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    },
    backButton: {
      color: isBackHovered ? '#1d4ed8' : '#2563eb',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      padding: '4px 0',
      transition: 'color 0.2s'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
      '@media (min-width: 640px)': {
        fontSize: '30px'
      }
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '4px'
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 16px',
      '@media (min-width: 640px)': {
        padding: '32px 24px'
      },
      '@media (min-width: 1024px)': {
        padding: '32px 32px'
      }
    }
  };

  return (
    <>
      <Head>
        <title>10-Day Program Configuration - Admin</title>
      </Head>
      
      <div style={styles.pageContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.headerContent}>
              <div>
                <button 
                  onClick={() => router.back()}
                  style={styles.backButton}
                  onMouseEnter={() => setIsBackHovered(true)}
                  onMouseLeave={() => setIsBackHovered(false)}
                >
                  ← Back to Dashboard
                </button>
                <h1 style={styles.title}>
                  10-Day Program Configuration
                </h1>
                <p style={styles.subtitle}>
                  Configure wait times and dynamic content for caregiver programs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <ProgramConfigManager />
        </div>
      </div>
    </>
  );
}
