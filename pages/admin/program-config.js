import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProgramConfigManager from '../../components/ProgramConfigManager';
import BurdenAssessmentConfig from '../../components/BurdenAssessmentConfig';
import DynamicDayManager from '../../components/DynamicDayManager';

export default function ProgramConfigPage() {
  const router = useRouter();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('dynamic'); // 'dynamic', 'program', or 'burden'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      
      if (!adminToken || !adminData) {
        console.log('No admin credentials found, redirecting to login...');
        router.push('/admin/login');
        return;
      }
      
      // Verify token hasn't expired (basic check)
      try {
        const tokenPayload = JSON.parse(atob(adminToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.log('Admin token expired, redirecting to login...');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          router.push('/admin/login');
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        router.push('/admin/login');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔐 Verifying Admin Access...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we authenticate your session</div>
        </div>
      </div>
    );
  }

  // Only render the page if authenticated
  if (!isAuthenticated) {
    return null;
  }

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
        <title>7-Day Program Configuration - Admin</title>
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
                  7-Day Program Configuration
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
              style={styles.tab(activeTab === 'dynamic')}
              onClick={() => setActiveTab('dynamic')}
            >
              🗓️ Dynamic Day Content
            </button>
            <button
              style={styles.tab(activeTab === 'program')}
              onClick={() => setActiveTab('program')}
            >
              📅 Legacy Program Content
            </button>
            <button
              style={styles.tab(activeTab === 'burden')}
              onClick={() => setActiveTab('burden')}
            >
              📋 Burden Assessment (Day 1)
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {activeTab === 'dynamic' && <DynamicDayManager />}
          {activeTab === 'program' && <ProgramConfigManager />}
          {activeTab === 'burden' && <BurdenAssessmentConfig />}
        </div>
      </div>
    </>
  );
}
