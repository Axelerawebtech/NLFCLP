import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProgramConfigManager from '../../components/ProgramConfigManager';
import BurdenAssessmentConfig from '../../components/BurdenAssessmentConfig';

export default function ProgramConfigPage() {
  const router = useRouter();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('program'); // 'program' or 'burden'

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
    },
    tabsContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 16px',
      '@media (min-width: 640px)': {
        padding: '0 24px'
      },
      '@media (min-width: 1024px)': {
        padding: '0 32px'
      }
    },
    tabs: {
      display: 'flex',
      gap: '0',
      borderBottom: '2px solid #e5e7eb',
      overflowX: 'auto'
    },
    tab: (active) => ({
      padding: '16px 24px',
      fontSize: '15px',
      fontWeight: active ? '600' : '400',
      color: active ? '#2563eb' : '#6b7280',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    })
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

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            <button
              style={styles.tab(activeTab === 'program')}
              onClick={() => setActiveTab('program')}
            >
              📅 Program Content
            </button>
            <button
              style={styles.tab(activeTab === 'burden')}
              onClick={() => setActiveTab('burden')}
            >
              📋 Burden Assessment
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {activeTab === 'program' && <ProgramConfigManager />}
          {activeTab === 'burden' && <BurdenAssessmentConfig />}
        </div>
      </div>
    </>
  );
}
