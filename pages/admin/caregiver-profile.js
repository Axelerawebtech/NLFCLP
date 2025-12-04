import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import jsPDF from 'jspdf';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 1rem',
  },
  maxWidth: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  button: {
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    marginLeft: '0.5rem',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
    color: 'white',
  },
  buttonGreen: {
    backgroundColor: '#16a34a',
    color: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
  },
  statFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  tabs: {
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    gap: 0,
    overflowX: 'auto',
  },
  tab: {
    padding: '1rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '2px solid transparent',
    outline: 'none',
  },
  tabActive: {
    borderBottom: '2px solid #2563eb',
    color: '#2563eb',
  },
  tabInactive: {
    color: '#6b7280',
  },
  tabContent: {
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  infoValue: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#111827',
  },
  dayCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  dayTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    height: '0.5rem',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '0.5rem',
  },
  badgeGreen: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeGray: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '28rem',
    width: '100%',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#111827',
  },
  input: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
  },
  buttonFull: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    marginBottom: '0.75rem',
  },
  noteText: {
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  noteDate: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  alertBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginTop: '1rem',
  },
  alertText: {
    fontSize: '0.875rem',
    color: '#1e40af',
  },
  dayDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  checkIcon: {
    color: '#16a34a',
  },
  crossIcon: {
    color: '#9ca3af',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  backButton: {
    color: '#2563eb',
    textDecoration: 'none',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    display: 'inline-block',
  },
};

export default function CaregiverProfile() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [customWaitTime, setCustomWaitTime] = useState({ day0ToDay1: 24, betweenDays: 24 });
  const [globalWaitTimes, setGlobalWaitTimes] = useState({ day0ToDay1: 24, betweenDays: 24 });
  const [showWaitTimeModal, setShowWaitTimeModal] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [resetDayData, setResetDayData] = useState(null);
  const [success, setSuccess] = useState('');

  const formatHours = (value) => {
    const hours = Number(value) || 0;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  };

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data for assessment display
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/caregiver/profile?caregiverId=${id}&_t=${timestamp}`, {
        // Ensure no caching of assessment data
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('📊 Profile data fetched:', {
          caregiverName: data.data.caregiver?.name,
          oneTimeAssessments: data.data.assessments?.oneTimeAssessments?.length || 0,
          quickAssessments: data.data.assessments?.quickAssessments?.length || 0,
          burdenLevel: data.data.program?.burdenLevel
        });
        
        setProfileData(data.data);

        const defaultWaitTimes = data.data.waitTimeDefaults?.global || { day0ToDay1: 24, betweenDays: 24 };
        setGlobalWaitTimes(defaultWaitTimes);

        const caregiverOverrides = data.data.waitTimeDefaults?.caregiverOverrides;
        if (caregiverOverrides) {
          setCustomWaitTime({
            day0ToDay1: caregiverOverrides.day0ToDay1 ?? defaultWaitTimes.day0ToDay1,
            betweenDays: caregiverOverrides.betweenDays ?? defaultWaitTimes.betweenDays
          });
        } else {
          setCustomWaitTime(defaultWaitTimes);
        }
        
        // Validate that one-time assessments are properly loaded
        if (data.data.assessments?.oneTimeAssessments) {
          console.log('✅ One-time assessments loaded successfully:', 
            data.data.assessments.oneTimeAssessments.map(a => ({
              type: a.type,
              score: a.totalScore,
              level: a.scoreLevel
            }))
          );
        } else {
          console.log('⚠️ No one-time assessments found in response');
        }
      } else {
        setError(data.message);
        console.error('❌ Failed to fetch profile data:', data.message);
      }
    } catch (err) {
      setError('Failed to fetch caregiver profile');
      console.error('❌ Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockDay = async (day) => {
    try {
      const response = await fetch('/api/admin/program/unlock-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: id, day })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Day ${day} unlocked successfully`);
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to unlock day');
      console.error(err);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    
    try {
      const response = await fetch('/api/admin/caregiver/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId: id, 
          note: noteText,
          addedBy: 'admin'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNoteText('');
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to add note');
      console.error(err);
    }
  };

  const downloadFeedbackPDF = async (submission, index) => {
    // Check if submission contains non-Latin characters
    const hasNonLatin = Object.values(submission.responses || {}).some(response => 
      /[\u0900-\u097F\u0C80-\u0CFF]/.test(response) // Hindi/Kannada Unicode ranges
    );
    
    if (hasNonLatin) {
      const confirmDownload = window.confirm(
        'Note: This feedback contains Kannada/Hindi text. PDF may not display these characters correctly. ' +
        'Please use CSV export for proper Unicode support. Continue with PDF anyway?'
      );
      if (!confirmDownload) return;
    }
    
    // Dynamically import jspdf-autotable
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    const caregiver = profileData?.caregiver;
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Feedback Form Response', 14, 20);
    
    // Caregiver Info
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Caregiver: ${caregiver?.name || 'N/A'}`, 14, 30);
    doc.text(`Participant ID: ${submission.participantId || 'N/A'}`, 14, 36);
    doc.text(`Day: ${submission.day}`, 14, 42);
    doc.text(`Language: ${submission.language.charAt(0).toUpperCase() + submission.language.slice(1)}`, 14, 48);
    doc.text(`Submitted: ${new Date(submission.submittedAt).toLocaleString()}`, 14, 54);
    
    // Responses Table
    const tableData = Object.entries(submission.responses || {}).map(([fieldId, response]) => {
      const fieldLabel = submission.fieldLabels?.[fieldId] || `Question ${fieldId}`;
      return [fieldLabel, response || 'No response'];
    });
    
    autoTable(doc, {
      startY: 62,
      head: [['Question', 'Response']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [251, 191, 36], textColor: 0 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 110 }
      }
    });
    
    // Save PDF
    const filename = `feedback_${caregiver?.name?.replace(/\s+/g, '_')}_day${submission.day}_${index + 1}.pdf`;
    doc.save(filename);
  };

  const downloadFeedbackCSV = (submission, index) => {
    const caregiver = profileData?.caregiver;
    
    // CSV Headers with BOM for Excel compatibility
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'Caregiver Name,Participant ID,Day,Language,Submitted At,Question,Response\n';
    
    // Add each response as a row
    Object.entries(submission.responses || {}).forEach(([fieldId, response]) => {
      const fieldLabel = submission.fieldLabels?.[fieldId] || `Question ${fieldId}`;
      const row = [
        caregiver?.name || 'N/A',
        submission.participantId || 'N/A',
        submission.day,
        submission.language,
        new Date(submission.submittedAt).toLocaleString(),
        `"${fieldLabel.replace(/"/g, '""')}"`,
        `"${(response || 'No response').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });
    
    // Create download using Blob with better browser support
    try {
      const filename = `feedback_${caregiver?.name?.replace(/\s+/g, '_')}_day${submission.day}_${index + 1}.csv`;
      
      // Create blob and force download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      // Try modern download API first
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // IE workaround
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        // Modern browsers
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup with longer delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 250);
      }
      
      console.log('CSV download initiated:', filename);
    } catch (error) {
      console.error('CSV download failed:', error);
      alert('Failed to download CSV file: ' + error.message);
    }
  };

  const downloadAllFeedbackPDF = async () => {
    const caregiver = profileData?.caregiver;
    const submissions = caregiver?.feedbackSubmissions || [];
    
    if (submissions.length === 0) return;
    
    // Check if any submission contains non-Latin characters
    const hasNonLatin = submissions.some(submission =>
      Object.values(submission.responses || {}).some(response => 
        /[\u0900-\u097F\u0C80-\u0CFF]/.test(response) // Hindi/Kannada Unicode ranges
      )
    );
    
    if (hasNonLatin) {
      const confirmDownload = window.confirm(
        'Note: Some feedback contains Kannada/Hindi text. PDF may not display these characters correctly. ' +
        'Please use CSV export for proper Unicode support. Continue with PDF anyway?'
      );
      if (!confirmDownload) return;
    }
    
    // Dynamically import jspdf-autotable
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF();
    
    // Title Page
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('All Feedback Responses', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Caregiver: ${caregiver?.name || 'N/A'}`, 14, 30);
    doc.text(`Total Submissions: ${submissions.length}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);
    
    let yPosition = 52;
    
    // Loop through each submission
    submissions.forEach((submission, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Submission Header
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Feedback #${index + 1}`, 14, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Day: ${submission.day} | Language: ${submission.language} | Submitted: ${new Date(submission.submittedAt).toLocaleString()}`, 14, yPosition);
      yPosition += 8;
      
      // Responses Table
      const tableData = Object.entries(submission.responses || {}).map(([fieldId, response]) => {
        const fieldLabel = submission.fieldLabels?.[fieldId] || `Question ${fieldId}`;
        return [fieldLabel, response || 'No response'];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Question', 'Response']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [251, 191, 36], textColor: 0, fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 110 }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : yPosition + 50;
    });
    
    // Save PDF
    const filename = `all_feedback_${caregiver?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const downloadAllFeedbackCSV = () => {
    const caregiver = profileData?.caregiver;
    const submissions = caregiver?.feedbackSubmissions || [];
    
    if (submissions.length === 0) return;
    
    // CSV Headers with BOM for Excel compatibility
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'Submission #,Caregiver Name,Participant ID,Day,Language,Submitted At,Question,Response\n';
    
    // Add each submission's responses
    submissions.forEach((submission, index) => {
      Object.entries(submission.responses || {}).forEach(([fieldId, response]) => {
        const fieldLabel = submission.fieldLabels?.[fieldId] || `Question ${fieldId}`;
        const row = [
          index + 1,
          caregiver?.name || 'N/A',
          submission.participantId || 'N/A',
          submission.day,
          submission.language,
          new Date(submission.submittedAt).toLocaleString(),
          `"${fieldLabel.replace(/"/g, '""')}"`,
          `"${(response || 'No response').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });
    });
    
    // Create download using Blob with better browser support
    try {
      const filename = `all_feedback_${caregiver?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Create blob and force download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      // Try modern download API first
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // IE workaround
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        // Modern browsers
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup with longer delay
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 250);
      }
      
      console.log('CSV download initiated:', filename);
    } catch (error) {
      console.error('CSV download failed:', error);
      alert('Failed to download CSV file: ' + error.message);
    }
  };

  const handleUpdateWaitTime = async () => {
    try {
      const response = await fetch('/api/admin/program/update-wait-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId: id, 
          day0ToDay1: Number(customWaitTime.day0ToDay1) || 0,
          betweenDays: Number(customWaitTime.betweenDays) || 0
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Wait times updated successfully');
        setShowWaitTimeModal(false);
        fetchProfileData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to update wait times');
      console.error(err);
    }
  };

  const handleToggleLock = async (day, currentStatus) => {
    try {
      const response = await fetch('/api/admin/toggle-day-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: id,
          day,
          permission: !currentStatus
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Day ${day} ${!currentStatus ? 'unlocked' : 'locked'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
        fetchProfileData();
      } else {
        alert(data.error || 'Failed to update permission');
      }
    } catch (error) {
      console.error('Permission toggle error:', error);
      alert('Network error. Please try again.');
    }
  };

  const getAssessmentMeta = (dayInfo = {}) => {
    if (!dayInfo || typeof dayInfo !== 'object') {
      return {
        hasConfiguredAssessment: false,
        hasAssessmentResults: false,
        dynamicTestName: null
      };
    }

    const dynamicTaskTitle = Array.isArray(dayInfo.tasks)
      ? dayInfo.tasks.find(task => task?.taskType === 'dynamic-test')?.title
      : null;

    const dynamicTestName = dayInfo.dynamicTest?.testName
      || dynamicTaskTitle
      || (dayInfo.hasDynamicTest ? 'assessment' : null);

    const hasConfiguredAssessment = Boolean(
      dayInfo.hasDynamicTest ||
      dynamicTaskTitle ||
      dayInfo.dynamicTest
    );

    const hasAssessmentResults = Boolean(
      dayInfo.dynamicTestCompleted ||
      dayInfo.dynamicTest?.completedAt ||
      (Array.isArray(dayInfo.dynamicTest?.answers) && dayInfo.dynamicTest.answers.length > 0) ||
      typeof dayInfo.dynamicTest?.totalScore === 'number'
    );

    return {
      hasConfiguredAssessment,
      hasAssessmentResults,
      dynamicTestName
    };
  };

  const openResetDialog = (dayInfo) => {
    const defaultPayload = {
      day: typeof dayInfo === 'number' ? dayInfo : null,
      hasDynamicTest: false,
      canResetAssessment: false,
      dynamicTestName: null
    };

    if (dayInfo && typeof dayInfo === 'object') {
      const assessmentMeta = getAssessmentMeta(dayInfo);

      setResetDayData({
        day: dayInfo.day,
        hasDynamicTest: assessmentMeta.hasConfiguredAssessment,
        canResetAssessment: assessmentMeta.hasAssessmentResults,
        dynamicTestName: assessmentMeta.dynamicTestName
      });
    } else {
      setResetDayData(defaultPayload);
    }

    setResetDialog(true);
  };

  const handleResetDayProgress = async ({ resetAssessment = false } = {}) => {
    if (!resetDayData) return;

    try {
      const response = await fetch('/api/admin/reset-day-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId: id,
          day: resetDayData.day,
          resetDynamicTest: Boolean(resetAssessment),
          resetBurdenTest: Boolean(resetAssessment && resetDayData.day === 1)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => setSuccess(''), 3000);
        setResetDialog(false);
        setResetDayData(null);
        fetchProfileData();
      } else {
        alert(data.error || 'Failed to reset day progress');
      }
    } catch (error) {
      console.error('Reset day progress error:', error);
      alert('Network error. Please try again.');
    }
  };

  const getBurdenLevelStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'mild': return { ...styles.badge, ...styles.badgeGreen };
      case 'moderate': return { ...styles.badge, ...styles.badgeYellow };
      case 'severe': return { ...styles.badge, ...styles.badgeRed };
      default: return { ...styles.badge, ...styles.badgeGray };
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return '#16a34a';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spinner {
            border: 3px solid #f3f4f6;
            border-top-color: #2563eb;
            border-radius: 50%;
            width: 3rem;
            height: 3rem;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading caregiver profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontSize: '1.25rem', marginBottom: '1rem' }}>{error || 'Profile not found'}</p>
          <button 
            onClick={() => router.back()}
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { caregiver, program, statistics, assessments, waitTimeDefaults } = profileData;
  const waitTimeOverrides = waitTimeDefaults?.caregiverOverrides || null;
  const effectiveWaitTimes = {
    day0ToDay1: waitTimeOverrides?.day0ToDay1 ?? globalWaitTimes.day0ToDay1,
    betweenDays: waitTimeOverrides?.betweenDays ?? globalWaitTimes.betweenDays
  };
  const usingGlobalDefaults = !waitTimeOverrides;

  return (
    <>
      <Head>
        <title>{caregiver.name} - Caregiver Profile</title>
      </Head>
      
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Header */}
          <div style={styles.card}>
            <a onClick={() => router.back()} style={styles.backButton}>
              ← Back to Dashboard
            </a>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>{caregiver.name}</h1>
                <p style={styles.subtitle}>Caregiver ID: {caregiver.caregiverId}</p>
              </div>
              <div>
                <button
                  onClick={() => setShowWaitTimeModal(true)}
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Configure Wait Times
                </button>
                <button
                  onClick={fetchProfileData}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div style={{ 
              backgroundColor: '#d1fae5', 
              border: '1px solid #6ee7b7', 
              borderRadius: '0.5rem', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              color: '#065f46'
            }}>
              {success}
            </div>
          )}

          {/* Statistics Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Overall Progress</p>
                  <p style={{ ...styles.statValue, color: '#2563eb' }}>
                    {Math.round(statistics.overallProgress)}%
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📊</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Current Day</p>
                  <p style={{ ...styles.statValue, color: '#16a34a' }}>
                    Day {statistics.currentDay}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>📅</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Completed Days</p>
                  <p style={{ ...styles.statValue, color: '#7c3aed' }}>
                    {statistics.completedDays} / {statistics.totalDays}
                  </p>
                </div>
                <div style={{ fontSize: '2.5rem' }}>✅</div>
              </div>
            </div>
            
            <div style={styles.statCard}>
              <div style={styles.statFlex}>
                <div>
                  <p style={styles.statLabel}>Burden Level</p>
                  <span style={getBurdenLevelStyle(statistics.burdenLevel)}>
                    {statistics.burdenLevel}
                  </span>
                </div>
                <div style={{ fontSize: '2.5rem' }}>🎯</div>
              </div>
            </div>
          </div>

          {/* Wait Time Summary */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Wait Time Settings</h2>
                <p style={{ marginTop: '0.25rem', color: '#6b7280', fontSize: '0.95rem' }}>
                  Global defaults apply to every caregiver unless you set an override below.
                </p>
              </div>
              <div>
                <span style={{
                  ...styles.badge,
                  ...(usingGlobalDefaults ? styles.badgeGray : styles.badgeGreen)
                }}>
                  {usingGlobalDefaults ? 'Using global defaults' : 'Custom override active'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb' }}>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Global Day 0 ➜ Day 1</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb', margin: '0.35rem 0 0' }}>
                  {formatHours(globalWaitTimes.day0ToDay1)}
                </p>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb' }}>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Global Between Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb', margin: '0.35rem 0 0' }}>
                  {formatHours(globalWaitTimes.betweenDays)}
                </p>
              </div>
              <div style={{ border: '1px solid #d1fae5', borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#ecfdf5' }}>
                <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>This Caregiver: Day 0 ➜ Day 1</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857', margin: '0.35rem 0 0' }}>
                  {formatHours(effectiveWaitTimes.day0ToDay1)}
                </p>
              </div>
              <div style={{ border: '1px solid #d1fae5', borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#ecfdf5' }}>
                <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>This Caregiver: Between Days</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857', margin: '0.35rem 0 0' }}>
                  {formatHours(effectiveWaitTimes.betweenDays)}
                </p>
              </div>
            </div>

            <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
              Unlock schedules shown on the progress tab use the values above. Use the button at the top of this page to adjust overrides for this caregiver.
            </p>
          </div>

          {/* Tabs */}
          <div style={styles.card}>
            <div style={styles.tabs}>
              {['overview', 'progress', 'tasks', 'feedback', 'support', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tab,
                    ...(activeTab === tab ? styles.tabActive : styles.tabInactive)
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={styles.tabContent}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}>Personal Information</h3>
                    <div style={styles.infoGrid}>
                      <div>
                        <p style={styles.infoLabel}>Phone</p>
                        <p style={styles.infoValue}>{caregiver.phone}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Age</p>
                        <p style={styles.infoValue}>{caregiver.age}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Gender</p>
                        <p style={styles.infoValue}>{caregiver.gender}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Marital Status</p>
                        <p style={styles.infoValue}>{caregiver.maritalStatus}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Education Level</p>
                        <p style={styles.infoValue}>{caregiver.educationLevel}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Employment Status</p>
                        <p style={styles.infoValue}>{caregiver.employmentStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}>Caregiving Information</h3>
                    <div style={styles.infoGrid}>
                      <div>
                        <p style={styles.infoLabel}>Relationship to Patient</p>
                        <p style={styles.infoValue}>{caregiver.relationshipToPatient}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Hours Per Day</p>
                        <p style={styles.infoValue}>{caregiver.hoursPerDay}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Duration of Caregiving</p>
                        <p style={styles.infoValue}>{caregiver.durationOfCaregiving}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Previous Experience</p>
                        <p style={styles.infoValue}>{caregiver.previousExperience}</p>
                      </div>
                    </div>
                  </div>

                  {program && (
                    <div>
                      <h3 style={styles.sectionTitle}>Program Timeline</h3>
                      <div style={styles.infoGrid}>
                        <div>
                          <p style={styles.infoLabel}>Program Started</p>
                          <p style={styles.infoValue}>
                            {new Date(program.programStartedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p style={styles.infoLabel}>Last Active</p>
                          <p style={styles.infoValue}>
                            {new Date(program.lastActiveAt).toLocaleDateString()}
                          </p>
                        </div>
                        {program.burdenTestCompletedAt && (
                          <div>
                            <p style={styles.infoLabel}>Burden Test Completed</p>
                            <p style={styles.infoValue}>
                              {new Date(program.burdenTestCompletedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div>
                  <h3 style={styles.sectionTitle}>7-Day Program Progress</h3>
                  
                  <div>
                    {statistics.daysProgress.map((day) => {
                      const hasVideoContent = Boolean(day.videoUrl || day.videoTitle || day.videoWatched !== undefined);
                      const showVideoProgress = hasVideoContent && typeof day.videoProgress === 'number';
                      const assessmentMeta = getAssessmentMeta(day);
                      const shouldShowResetButton = day.progressPercentage > 0 || assessmentMeta.hasAssessmentResults;

                      return (
                      <div key={day.day} style={styles.dayCard}>
                        <div style={styles.dayHeader}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <h4 style={styles.dayTitle}>Day {day.day}</h4>
                              {day.completedAt && (
                                <span style={{ ...styles.badge, ...styles.badgeGreen }}>
                                  Completed
                                </span>
                              )}
                              {!day.isUnlocked && (
                                <span style={{ ...styles.badge, ...styles.badgeGray }}>
                                  Locked
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{day.videoTitle}</p>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>
                                {day.progressPercentage}%
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Day Progress</p>
                            </div>
                            
                            {/* Video Watch Progress */}
                            {showVideoProgress && (
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7c3aed', margin: 0 }}>
                                  {Math.round(day.videoProgress)}%
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Video Watched</p>
                              </div>
                            )}
                            
                            {/* Audio Completion Status */}
                            {day.day === 0 && (
                              <div style={{ textAlign: 'center' }}>
                                <p style={{ 
                                  fontSize: '1.25rem', 
                                  fontWeight: 'bold', 
                                  color: day.audioCompleted ? '#16a34a' : '#6b7280', 
                                  margin: 0 
                                }}>
                                  {day.audioCompleted ? '✅' : '⏳'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Audio Status</p>
                              </div>
                            )}
                            
                            {/* Lock/Unlock Button */}
                            {day.day !== 0 && (
                              <button
                                onClick={() => handleToggleLock(day.day, day.isUnlocked)}
                                style={{ 
                                  ...styles.button, 
                                  backgroundColor: day.isUnlocked ? '#dc2626' : '#16a34a',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 0.75rem'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = day.isUnlocked ? '#b91c1c' : '#15803d'}
                                onMouseOut={(e) => e.target.style.backgroundColor = day.isUnlocked ? '#dc2626' : '#16a34a'}
                              >
                                {day.isUnlocked ? '🔓 Lock' : '🔒 Unlock'}
                              </button>
                            )}
                            
                            {/* Reset Progress Button */}
                            {shouldShowResetButton && (
                              <button
                                onClick={() => openResetDialog(day)}
                                style={{ 
                                  ...styles.button, 
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  padding: '0.5rem 0.75rem'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                              >
                                🔄 Reset
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={styles.progressBar}>
                          <div
                            style={{ 
                              width: `${day.progressPercentage}%`, 
                              height: '100%', 
                              backgroundColor: getProgressColor(day.progressPercentage),
                              borderRadius: '9999px',
                              transition: 'width 0.3s'
                            }}
                          ></div>
                        </div>
                        
                        {/* Day Details */}
                        <div style={styles.dayDetailGrid}>
                          {hasVideoContent && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={day.videoWatched ? styles.checkIcon : styles.crossIcon}>
                                {day.videoWatched ? '✅' : '⭕'}
                              </span>
                              <span style={{ color: '#6b7280' }}>Video</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={day.tasksCompleted ? styles.checkIcon : styles.crossIcon}>
                              {day.tasksCompleted ? '✅' : '⭕'}
                            </span>
                            <span style={{ color: '#6b7280' }}>Tasks ({day.completedTasks || 0}/{day.totalTasks || 0})</span>
                          </div>
                          {day.hasDynamicTest && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={day.dynamicTestCompleted ? styles.checkIcon : styles.crossIcon}>
                                {day.dynamicTestCompleted ? '✅' : '⭕'}
                              </span>
                              <span style={{ color: '#6b7280' }}>Assessment</span>
                            </div>
                          )}
                          {day.completedAt && (
                            <div style={{ color: '#6b7280' }}>
                              <p style={{ fontSize: '0.75rem', margin: 0 }}>
                                Completed: {new Date(day.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Task Progress Details */}
                        {day.tasks && day.tasks.length > 0 && (
                          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                              Task Progress ({day.completedTasks || 0}/{day.totalTasks || 0})
                            </h5>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {day.tasks.map((task, idx) => {
                                const taskResponse = day.taskResponses?.find(tr => tr.taskId === task.taskId);
                                const isCompleted = !!taskResponse;
                                
                                return (
                                  <div key={idx} style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '0.375rem',
                                    border: `1px solid ${isCompleted ? '#10b981' : '#e5e7eb'}`
                                  }}>
                                    <span style={{ fontSize: '1.25rem' }}>
                                      {isCompleted ? '✅' : '⏳'}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                                        {task.title || task.taskType}
                                      </p>
                                      {taskResponse && (
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                                          Response: {taskResponse.responseSummary || taskResponse.responseText || 'Completed'}
                                          {taskResponse.completedAt && ` • ${new Date(taskResponse.completedAt).toLocaleString()}`}
                                        </p>
                                      )}
                                    </div>
                                    <span style={{ 
                                      fontSize: '0.75rem', 
                                      color: '#6b7280',
                                      backgroundColor: '#f3f4f6',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '0.25rem'
                                    }}>
                                      {task.taskType}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div>
                  <h3 style={styles.sectionTitle}>Task Responses & Progress</h3>
                  {statistics.daysProgress.length === 0 ? (
                    <p style={{ color: '#6b7280' }}>No task activity recorded yet.</p>
                  ) : (
                    statistics.daysProgress.map((day) => (
                      <div key={`tasks-${day.day}`} style={styles.dayCard}>
                        <div style={styles.dayHeader}>
                          <div style={{ flex: 1 }}>
                            <h4 style={styles.dayTitle}>Day {day.day}</h4>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              {day.videoTitle || 'Program Content'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
                              {day.progressPercentage}%
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>({day.completedTasks || 0}/{day.totalTasks || 0} tasks)</p>
                          </div>
                        </div>

                        {day.tasks && day.tasks.length > 0 ? (
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {day.tasks.map((task) => {
                              const taskResponse = day.taskResponses?.find(tr => tr.taskId === task.taskId);
                              return (
                                <div key={task.taskId} style={{
                                  border: `1px solid ${taskResponse ? '#10b981' : '#e5e7eb'}`,
                                  borderRadius: '0.5rem',
                                  padding: '0.75rem',
                                  backgroundColor: 'white'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div>
                                      <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#111827' }}>
                                        {task.title || task.taskType}
                                      </p>
                                      <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.15rem 0 0 0' }}>
                                        {task.description || 'Task instructions'}
                                      </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <span style={{
                                        ...styles.badge,
                                        ...(taskResponse ? styles.badgeGreen : styles.badgeGray)
                                      }}>
                                        {taskResponse ? 'Completed' : 'Pending'}
                                      </span>
                                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                                        {task.taskType}
                                      </p>
                                    </div>
                                  </div>

                                  {taskResponse ? (
                                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem' }}>
                                      {taskResponse.responseSummary ? (
                                        <p style={{ fontSize: '0.85rem', color: '#111827', margin: 0 }}>
                                          <strong>Answer:</strong> {taskResponse.responseSummary}
                                        </p>
                                      ) : (
                                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
                                          No written answer captured for this completion.
                                        </p>
                                      )}

                                      {Array.isArray(taskResponse.responseDetails) && taskResponse.responseDetails.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.35rem' }}>
                                          {taskResponse.responseDetails.map((detail, idx) => (
                                            <div key={`${task.taskId}-detail-${idx}`} style={{
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              gap: '0.75rem',
                                              fontSize: '0.78rem',
                                              color: '#1f2937'
                                            }}>
                                              <span style={{ color: '#6b7280' }}>{detail.label}</span>
                                              <span style={{ fontWeight: 600, textAlign: 'right' }}>{detail.value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {taskResponse.responseData && (
                                        <details style={{ marginTop: '0.5rem' }}>
                                          <summary style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer' }}>
                                            View raw payload
                                          </summary>
                                          <pre style={{
                                            marginTop: '0.5rem',
                                            backgroundColor: '#fff',
                                            borderRadius: '0.375rem',
                                            padding: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: '#374151',
                                            overflowX: 'auto'
                                          }}>
                                            {JSON.stringify(taskResponse.responseData, null, 2)}
                                          </pre>
                                        </details>
                                      )}

                                      <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                        Completed at: {taskResponse.completedAt ? new Date(taskResponse.completedAt).toLocaleString() : 'N/A'}
                                      </p>
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
                                      Awaiting caregiver response
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ color: '#9ca3af' }}>No tasks assigned for this day.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Assessment Tab */}
             

              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={styles.sectionTitle}>Feedback Submissions</h3>
                      {caregiver?.feedbackSubmissions && caregiver.feedbackSubmissions.length > 0 && (
                        <>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                            Total: {caregiver.feedbackSubmissions.length} submission{caregiver.feedbackSubmissions.length !== 1 ? 's' : ''}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#f59e0b', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                            ⚠️ For Kannada/Hindi responses, use CSV export for correct character display
                          </p>
                        </>
                      )}
                    </div>
                    {caregiver?.feedbackSubmissions && caregiver.feedbackSubmissions.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right', marginBottom: '0.25rem' }}>
                          Export All Submissions:
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => downloadAllFeedbackPDF()}
                            style={{
                              ...styles.button,
                              backgroundColor: '#dc2626',
                              color: 'white',
                              padding: '0.625rem 1rem',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                          >
                            📄 All as PDF
                          </button>
                          <button
                            onClick={() => downloadAllFeedbackCSV()}
                            style={{
                              ...styles.button,
                              backgroundColor: '#16a34a',
                              color: 'white',
                              padding: '0.625rem 1rem',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                          >
                            📊 All as CSV
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {caregiver?.feedbackSubmissions && caregiver.feedbackSubmissions.length > 0 ? (
                    <div>
                      {caregiver.feedbackSubmissions.map((submission, index) => (
                        <div key={index} style={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          padding: '1.5rem',
                          marginBottom: '1rem',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 0.5rem 0' }}>
                                📝 Feedback #{caregiver.feedbackSubmissions.length - index}
                              </h4>
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                <span>📅 Day {submission.day}</span>
                                <span>🌐 {submission.language.charAt(0).toUpperCase() + submission.language.slice(1)}</span>
                                <span>🕒 {new Date(submission.submittedAt).toLocaleString()}</span>
                                {submission.participantId && <span>👤 ID: {submission.participantId}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => downloadFeedbackPDF(submission, index)}
                                style={{
                                  ...styles.button,
                                  backgroundColor: '#dc2626',
                                  color: 'white',
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.875rem'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                              >
                                📄 PDF
                              </button>
                              <button
                                onClick={() => downloadFeedbackCSV(submission, index)}
                                style={{
                                  ...styles.button,
                                  backgroundColor: '#16a34a',
                                  color: 'white',
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.875rem'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                              >
                                📊 CSV
                              </button>
                            </div>
                          </div>
                          
                          <div style={{ marginTop: '1rem' }}>
                            {Object.entries(submission.responses || {}).map(([fieldId, response], idx) => {
                              const fieldLabel = submission.fieldLabels?.[fieldId] || `Question ${idx + 1}`;
                              return (
                                <div key={fieldId} style={{
                                  padding: '1rem',
                                  backgroundColor: '#f9fafb',
                                  borderRadius: '0.5rem',
                                  marginBottom: '0.75rem'
                                }}>
                                  <p style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    {fieldLabel}
                                  </p>
                                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                                    {response || 'No response'}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>📝 No feedback submissions yet</p>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        Feedback will appear here when the caregiver completes a feedback form
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Support Requests Tab */}
              {activeTab === 'support' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={styles.sectionTitle}>Support Requests</h3>
                    <button
                      onClick={() => {
                        console.log('🔍 Support Requests Debug:', {
                          caregiverExists: !!caregiver,
                          supportRequestsExists: !!caregiver?.supportRequests,
                          supportRequestsLength: caregiver?.supportRequests?.length || 0,
                          supportRequests: caregiver?.supportRequests
                        });
                        fetchProfileData();
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                  {caregiver?.supportRequests && caregiver.supportRequests.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {caregiver.supportRequests.slice().reverse().map((request, index) => (
                        <div 
                          key={request._id || index} 
                          style={{
                            backgroundColor: request.status === 'resolved' ? '#f9fafb' : '#fef3c7',
                            border: `2px solid ${request.status === 'resolved' ? '#e5e7eb' : '#fcd34d'}`,
                            borderRadius: '12px',
                            padding: '20px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '20px' }}>
                                  {request.requestType === 'admin-call' ? '📞' : '🩺'}
                                </span>
                                <h4 style={{ margin: 0, color: '#1f2937', fontWeight: '600' }}>
                                  {request.requestType === 'admin-call' ? 'Admin Call Request' : 'Contact Nurse PI'}
                                </h4>
                              </div>
                              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                                Requested: {new Date(request.requestedAt).toLocaleString()}
                              </p>
                              {request.status === 'resolved' && (
                                <p style={{ fontSize: '14px', color: '#16a34a', margin: '0 0 8px 0', fontWeight: '600' }}>
                                  ✅ Resolved: {new Date(request.resolvedAt).toLocaleString()}
                                  {request.resolvedBy && ` by ${request.resolvedBy}`}
                                </p>
                              )}
                            </div>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: request.status === 'resolved' ? '#d1fae5' : '#fed7aa',
                              color: request.status === 'resolved' ? '#065f46' : '#92400e'
                            }}>
                              {request.status === 'resolved' ? 'Resolved' : 'Pending'}
                            </span>
                          </div>
                          
                          {request.message && (
                            <div style={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '12px',
                              marginBottom: '12px'
                            }}>
                              <p style={{ fontSize: '13px', color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {request.message}
                              </p>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <button
                              onClick={async () => {
                                if (confirm('Mark this support request as resolved?')) {
                                  try {
                                    const response = await fetch('/api/caregiver/resolve-support-request', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        caregiverId: caregiver.caregiverId,
                                        requestId: request._id,
                                        resolvedBy: 'admin'
                                      })
                                    });

                                    if (response.ok) {
                                      alert('Support request marked as resolved');
                                      window.location.reload();
                                    } else {
                                      const errorData = await response.json();
                                      alert(`Failed to resolve: ${errorData.message}`);
                                    }
                                  } catch (err) {
                                    console.error('Error resolving support request:', err);
                                    alert('Failed to resolve support request');
                                  }
                                }
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                            >
                              Mark as Resolved
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
                      <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                        No support requests submitted yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div>
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}>Add Admin Note</h3>
                    <div>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Enter note..."
                        style={styles.textarea}
                        rows="3"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                        style={{ 
                          ...styles.button, 
                          ...styles.buttonPrimary, 
                          marginTop: '0.5rem',
                          opacity: !noteText.trim() ? 0.5 : 1,
                          cursor: !noteText.trim() ? 'not-allowed' : 'pointer'
                        }}
                        onMouseOver={(e) => {
                          if (noteText.trim()) e.target.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseOut={(e) => {
                          if (noteText.trim()) e.target.style.backgroundColor = '#2563eb';
                        }}
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={styles.sectionTitle}>Previous Notes</h3>
                    {program?.adminNotes && program.adminNotes.length > 0 ? (
                      <div>
                        {program.adminNotes.slice().reverse().map((note, index) => (
                          <div key={index} style={styles.noteCard}>
                            <p style={styles.noteText}>{note.note}</p>
                            <p style={styles.noteDate}>
                              {new Date(note.addedAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                        <p style={{ color: '#6b7280' }}>No notes yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wait Time Modal */}
        {showWaitTimeModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>Configure Wait Times</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Day 0 to Day 1 (hours)
                </label>
                <input
                  type="number"
                  value={customWaitTime.day0ToDay1}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomWaitTime({
                      ...customWaitTime,
                      day0ToDay1: value === '' ? '' : Math.max(0, parseInt(value, 10) || 0)
                    });
                  }}
                  style={styles.input}
                  min="0"
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Global default: {formatHours(globalWaitTimes.day0ToDay1)}
                </p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Between Days (hours)
                </label>
                <input
                  type="number"
                  value={customWaitTime.betweenDays}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomWaitTime({
                      ...customWaitTime,
                      betweenDays: value === '' ? '' : Math.max(0, parseInt(value, 10) || 0)
                    });
                  }}
                  style={styles.input}
                  min="0"
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Global default: {formatHours(globalWaitTimes.betweenDays)}
                </p>
              </div>
              
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setShowWaitTimeModal(false)}
                  style={{ ...styles.button, ...styles.buttonFull, border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateWaitTime}
                  style={{ ...styles.button, ...styles.buttonPrimary, ...styles.buttonFull }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Day Progress Confirmation Dialog */}
        {resetDialog && (
          <div style={styles.modal}>
            <div style={{ ...styles.modalContent, maxWidth: '32rem' }}>
              <h3 style={styles.modalTitle}>🔄 Reset Day {resetDayData?.day} Progress</h3>
              
              <div style={{ 
                backgroundColor: '#fef3c7', 
                border: '1px solid #fbbf24', 
                borderRadius: '0.5rem', 
                padding: '0.75rem', 
                marginBottom: '1rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0, fontWeight: '500' }}>
                  ⚠️ This action will reset all progress for Day {resetDayData?.day}
                </p>
              </div>
              
              <div style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  • Video progress will be cleared
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  • Task completion will be reset
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                  • Progress percentage will be set to 0%
                </p>
                {resetDayData?.hasDynamicTest && (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem', fontWeight: '600' }}>
                      • Optionally reset {resetDayData?.dynamicTestName || 'assessment'} results
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', paddingLeft: '1rem' }}>
                      (If you reset the {resetDayData?.dynamicTestName || 'assessment'}, the caregiver will need to retake it)
                    </p>
                  </>
                )}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                The caregiver will need to complete Day {resetDayData?.day} again from the beginning.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resetDayData?.canResetAssessment && (
                  <button
                    onClick={() => handleResetDayProgress({ resetAssessment: true })}
                    style={{ 
                      ...styles.button, 
                      width: '100%',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '0.75rem'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                  >
                    🗑️ Reset Including {resetDayData?.dynamicTestName || 'Assessment'}
                  </button>
                )}
                <button
                  onClick={() => handleResetDayProgress({ resetAssessment: false })}
                  style={{ 
                    ...styles.button, 
                    width: '100%',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '0.75rem'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                >
                  🔄 Reset Progress Only
                </button>
                <button
                  onClick={() => {
                    setResetDialog(false);
                    setResetDayData(null);
                  }}
                  style={{ 
                    ...styles.button, 
                    width: '100%',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    padding: '0.75rem'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
