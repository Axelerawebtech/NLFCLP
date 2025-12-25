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
  
  // Questionnaire state
  const [questionnaireRetakeSchedule, setQuestionnaireRetakeSchedule] = useState('');
  const [schedulingQuestionnaire, setSchedulingQuestionnaire] = useState(false);
  const [compareQuestionnaireDialog, setCompareQuestionnaireDialog] = useState(false);
  const [assessmentConfig, setAssessmentConfig] = useState(null);

  const formatHours = (value) => {
    const hours = Number(value) || 0;
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  };

  useEffect(() => {
    if (id) {
      fetchProfileData();
      fetchAssessmentConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAssessmentConfig = async () => {
    try {
      const response = await fetch('/api/admin/caregiver-assessment/config');
      const data = await response.json();
      if (data.success && data.data) {
        console.log('[Assessment Config] Full config:', data.data);
        console.log('[Assessment Config] First section:', data.data.sections?.[0]);
        console.log('[Assessment Config] First question:', data.data.sections?.[0]?.questions?.[0]);
        console.log('[Assessment Config] First question options:', data.data.sections?.[0]?.questions?.[0]?.options);
        setAssessmentConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching assessment config:', error);
    }
  };

  const getAnswerLabel = (answer, language = null, returnBoth = false) => {
    if (!assessmentConfig || !assessmentConfig.sections) {
      return answer.answer;
    }
    
    // Use the language from the answer object if not provided
    const lang = language || answer.language || 'en';
    const langKey = lang === 'en' ? 'english' : lang === 'hi' ? 'hindi' : lang === 'kn' ? 'kannada' : 'english';
    
    // Extract section and question index from questionId (e.g., "zarit-burden_3")
    if (answer.questionId) {
      const parts = answer.questionId.split('_');
      if (parts.length === 2) {
        const sectionId = parts[0];
        const questionIndex = parseInt(parts[1]);
        
        // Find the section
        const section = assessmentConfig.sections.find(s => s.sectionId === sectionId);
        if (section && section.questions && section.questions[questionIndex]) {
          const question = section.questions[questionIndex];
          if (question.options) {
            // Find the option with matching value
            const option = question.options.find(opt => opt.value === answer.answer);
            if (option && option.label) {
              const localLabel = option.label[langKey] || option.label.english || option.label || answer.answer;
              const englishLabel = option.label.english || option.label || answer.answer;
              
              if (returnBoth && langKey !== 'english') {
                return `${localLabel} (${englishLabel})`;
              }
              return localLabel;
            }
          }
        }
      }
    }
    
    // If answer has sectionId and questionIndex, use them directly (for newer data)
    if (answer.sectionId && answer.questionIndex !== undefined) {
      const section = assessmentConfig.sections.find(s => s.sectionId === answer.sectionId);
      if (!section || !section.questions) return answer.answer;
      
      const question = section.questions[answer.questionIndex];
      if (!question || !question.options) return answer.answer;
      
      // Find the option with matching value
      const option = question.options.find(opt => opt.value === answer.answer);
      if (!option) return answer.answer;
      
      // Return label in the requested language
      const localLabel = option.label?.[langKey] || option.label?.english || option.label || answer.answer;
      const englishLabel = option.label?.english || option.label || answer.answer;
      
      if (returnBoth && langKey !== 'english') {
        return `${localLabel} (${englishLabel})`;
      }
      return localLabel;
    }
    
    // Fallback: Reconstruct using global index (for legacy data)
    let currentGlobalIndex = 0;
    for (const section of assessmentConfig.sections) {
      if (!section.questions) continue;
      
      for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
        if (currentGlobalIndex === answer.questionIndex) {
          const question = section.questions[qIdx];
          if (!question.options) return answer.answer;
          
          // Find the option with matching value
          const option = question.options.find(opt => opt.value === answer.answer);
          if (!option) return answer.answer;
          
          // Return English label
          return option.label?.english || option.label || answer.answer;
        }
        currentGlobalIndex++;
      }
    }
    
    return answer.answer;
  };

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
          burdenLevel: data.data.program?.burdenLevel,
          questionnaireAttempts: data.data.caregiver?.questionnaireAttempts?.length || 0,
          questionnaireAnswers: data.data.caregiver?.questionnaireAnswers?.length || 0
        });
        
        console.log('🔍 Full caregiver questionnaire data:', {
          attempts: data.data.caregiver?.questionnaireAttempts,
          answers: data.data.caregiver?.questionnaireAnswers
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

  const downloadDayAssessmentCSV = async (day) => {
    const caregiver = profileData?.caregiver;
    const dayData = statistics.daysProgress.find(d => d.day === day);
    
    if (!dayData || !dayData.dynamicTest || !dayData.dynamicTest.answers || dayData.dynamicTest.answers.length === 0) {
      alert('No assessment data available for this day');
      return;
    }

    const answers = dayData.dynamicTest.answers;
    const testName = dayData.dynamicTest.testName || `Day ${day} Assessment`;
    const completedAt = dayData.dynamicTest.completedAt;
    const totalScore = dayData.dynamicTest.totalScore;
    const scoreLevel = dayData.dynamicTest.scoreLevel;
    const rawDynamicTest = dayData.dynamicTest.raw || dayData.dynamicTest;
    
    // Detect language - check raw data first
    let language = rawDynamicTest.language || dayData.dynamicTest.language || 'en';

    // Level shown in admin is typically stored as assignedLevel
    const assignedLevel =
      rawDynamicTest?.assignedLevel
      || dayData.dynamicTest?.assignedLevel
      || rawDynamicTest?.burdenLevel
      || dayData.dynamicTest?.burdenLevel
      || scoreLevel;

    const assessmentTypeRaw = String(
      rawDynamicTest?.assessmentType
      || rawDynamicTest?.type
      || dayData.dynamicTest?.assessmentType
      || dayData.dynamicTest?.type
      || ''
    ).toLowerCase();

    const assessmentKind = assessmentTypeRaw.includes('stress')
      ? 'stress'
      : assessmentTypeRaw.includes('whoqol')
        ? 'whoqol'
        : (day === 2 ? 'stress' : day === 3 ? 'whoqol' : 'burden');
    
    // Prepare patient info (will fetch asynchronously, non-blocking)
    let patientInfo = { id: 'N/A', name: 'N/A' };
    
    // Debug logging
    console.log('Day Assessment Export Debug:', {
      day,
      testName,
      language,
      totalAnswers: answers.length,
      sampleAnswer: answers[0],
      caregiverId: caregiver?.caregiverId,
      assignedPatient: caregiver?.assignedPatient,
      dynamicTest: dayData.dynamicTest
    });
    
    // Fetch the assessment configuration to get questions and options
    try {
      // IMPORTANT: /api/admin/program/config returns waitTimes/contentRules (no questions)
      // Assessment questions live under /api/admin/caregiver-assessment/config
      const configResponse = await fetch('/api/admin/caregiver-assessment/config');
      
      if (!configResponse.ok) {
        console.error('Config API error:', configResponse.status, configResponse.statusText);
        alert(`Failed to fetch test configuration: ${configResponse.status} ${configResponse.statusText}`);
        return;
      }
      
      const configData = await configResponse.json();
      console.log('Assessment config API response:', configData);

      if (configData && configData.success === false) {
        console.error('Assessment config API returned success=false:', configData);
        alert(`Failed to fetch test configuration: ${configData.message || 'Unknown error'}`);
        return;
      }

      const configRoot = (configData && configData.data) ? configData.data : configData;

      // Support multiple config shapes:
      // 1) { success: true, data: { sections: [...] } } (comprehensive assessment)
      // 2) { success: true, data: { days: [...] } } (older day-based program)
      // 3) { days: [...] } / { sections: [...] } (unwrapped)
      let questions = [];

      const assessmentTypeRaw = String(
        rawDynamicTest?.assessmentType
        || rawDynamicTest?.type
        || dayData?.dynamicTest?.assessmentType
        || dayData?.dynamicTest?.type
        || ''
      ).toLowerCase();

      const desiredSectionId =
        rawDynamicTest?.sectionId
        || (assessmentTypeRaw.includes('stress') ? 'dass-7-stress'
          : assessmentTypeRaw.includes('whoqol') ? 'whoqol'
          : 'zarit-burden');

      if (Array.isArray(configRoot?.days)) {
        const dayConfig = configRoot.days.find(d => String(d.day) === String(day));
        if (Array.isArray(dayConfig?.burdenTestQuestions)) {
          questions = dayConfig.burdenTestQuestions;
        } else if (Array.isArray(dayConfig?.sections)) {
          questions = dayConfig.sections.flatMap(section => section?.questions || []);
        }
      } else if (Array.isArray(configRoot?.sections)) {
        const desiredSection = configRoot.sections.find(s => s?.sectionId === desiredSectionId);
        if (desiredSection && Array.isArray(desiredSection.questions)) {
          questions = desiredSection.questions;
        } else {
          questions = configRoot.sections.flatMap(section => section?.questions || []);
        }
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        console.error('No questions found in config:', {
          day,
          desiredSectionId,
          assessmentTypeRaw,
          configRootKeys: configRoot ? Object.keys(configRoot) : null,
          sectionsCount: Array.isArray(configRoot?.sections) ? configRoot.sections.length : null
        });
        alert('Failed to fetch test configuration: No questions found');
        return;
      }

      // Fetch patient details if assigned (non-blocking)
      if (caregiver?.assignedPatient) {
        try {
          const patientResponse = await fetch(`/api/admin/patient/details?patientId=${caregiver.assignedPatient}`);
          if (patientResponse.ok) {
            const patientData = await patientResponse.json();
            if (patientData.success && patientData.patient) {
              patientInfo = {
                id: patientData.patient.patientId || caregiver.assignedPatient,
                name: patientData.patient.name || 'N/A'
              };
              console.log('✅ Patient details fetched:', patientInfo);
            }
          }
        } catch (error) {
          console.warn('⚠️ Failed to fetch patient details:', error);
          // Continue with N/A values
        }
      }

      // CSV Headers with BOM for Excel compatibility
      let csv = '\uFEFF'; // UTF-8 BOM
      
      // Header section with all required information
      csv += 'Day Assessment Export\n';
      csv += `Caregiver Name,${caregiver?.name || 'N/A'}\n`;
      csv += `Caregiver ID,${caregiver?.caregiverId || 'N/A'}\n`;
      csv += `Patient Name,${patientInfo.name}\n`;
      csv += `Patient ID,${patientInfo.id}\n`;
      csv += `Assessment Name,${testName}\n`;
      csv += `Day,${day}\n`;
      csv += `Language Used,${language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : language}\n`;
      csv += `Total Score,${totalScore !== undefined && totalScore !== null ? totalScore : 'N/A'}\n`;
      if (assessmentKind === 'burden') {
        csv += `Assigned Burden Level,${assignedLevel || 'N/A'}\n`;
      } else if (assessmentKind === 'stress') {
        csv += `Assigned Stress Level,${assignedLevel || 'N/A'}\n`;
      } else if (assessmentKind === 'whoqol') {
        csv += `Assigned Quality of Life Level,${assignedLevel || 'N/A'}\n`;
      } else {
        csv += `Assigned Level,${assignedLevel || 'N/A'}\n`;
      }
      csv += `Completed At,${completedAt ? new Date(completedAt).toLocaleString() : 'N/A'}\n`;
      csv += `Report Generated,${new Date().toLocaleString()}\n`;
      csv += '\n';

      // Question responses section - English labels only
      csv += 'Question #,Question Text (English),Answer (English)\n';
      
      // Map answers with questions from config - Always use English labels in CSV
      answers.forEach((answerValue, index) => {
        const questionNumber = index + 1;
        const question = questions[index];
        
        if (!question) {
          console.warn(`Question ${questionNumber} not found in config`);
          return;
        }
        
        // Always get question text in English for CSV
        const questionTextSource =
          question?.questionText?.english
          || question?.question?.english
          || question?.questionText
          || question?.text
          || `Question ${questionNumber}`;

        const questionText = String(questionTextSource).replace(/"/g, '""');

        // Find the selected option based on the answer value (handle string/number mismatches)
        const options = Array.isArray(question?.options) ? question.options : [];
        const selectedOption = options.find(opt => {
          if (opt == null) return false;
          const optValue = opt.value;
          if (optValue === answerValue) return true;
          const optNum = Number(optValue);
          const ansNum = Number(answerValue);
          return Number.isFinite(optNum) && Number.isFinite(ansNum) && optNum === ansNum;
        });
        
        let englishAnswer = 'N/A';
        
        if (selectedOption) {
          // Always get answer in English for CSV
          englishAnswer = selectedOption.label?.english
            || selectedOption.text
            || selectedOption.label
            || String(answerValue);
        } else {
          // Fallback if option not found
          englishAnswer = String(answerValue);
        }
        
        // Ensure answer is string before replacing
        const englishAnswerStr = String(englishAnswer);
        
        const row = [
          questionNumber,
          `"${questionText}"`,
          `"${englishAnswerStr.replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });

    // Create download
    try {
      const filename = `Day${day}_Assessment_${caregiver?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 250);
      }
      
      console.log('Day assessment CSV download initiated:', filename);
    } catch (error) {
      console.error('CSV download failed:', error);
      alert('Failed to download CSV file: ' + error.message);
    }
    } catch (error) {
      console.error('Error loading assessment data:', error);
      alert('Failed to load assessment data: ' + error.message);
    }
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

  // Questionnaire handlers
  const toggleQuestionnaireEnabled = async () => {
    const caregiver = profileData?.caregiver;
    if (!caregiver) return;
    
    try {
      const response = await fetch(`/api/admin/caregiver/update-questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId: caregiver.caregiverId, 
          questionnaireEnabled: !caregiver.questionnaireEnabled 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(`Questionnaire ${!caregiver.questionnaireEnabled ? 'enabled' : 'disabled'} successfully`);
        setTimeout(() => setSuccess(''), 3000);
        fetchProfileData();
      } else {
        alert(data.message || 'Failed to update questionnaire status');
      }
    } catch (error) {
      console.error('Error toggling questionnaire:', error);
      alert('Failed to update questionnaire status');
    }
  };

  const handleScheduleQuestionnaireRetake = async () => {
    const caregiver = profileData?.caregiver;
    if (!caregiver || !questionnaireRetakeSchedule) {
      alert('Please select a date and time');
      return;
    }
    
    const scheduleDate = new Date(questionnaireRetakeSchedule);
    if (Number.isNaN(scheduleDate.getTime())) {
      alert('Invalid date');
      return;
    }
    
    setSchedulingQuestionnaire(true);
    try {
      const response = await fetch(`/api/admin/caregiver/schedule-questionnaire-retake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          caregiverId: caregiver.caregiverId, 
          scheduleAt: scheduleDate.toISOString() 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Second assessment scheduled successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchProfileData();
      } else {
        alert(data.message || 'Failed to schedule retake');
      }
    } catch (error) {
      console.error('Error scheduling retake:', error);
      alert('Failed to schedule retake');
    } finally {
      setSchedulingQuestionnaire(false);
    }
  };

  const handleCancelQuestionnaireRetake = async () => {
    const caregiver = profileData?.caregiver;
    if (!caregiver) return;
    
    setSchedulingQuestionnaire(true);
    try {
      const response = await fetch(`/api/admin/caregiver/cancel-questionnaire-retake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: caregiver.caregiverId })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Scheduled retake cancelled');
        setTimeout(() => setSuccess(''), 3000);
        fetchProfileData();
      } else {
        alert(data.message || 'Failed to cancel retake');
      }
    } catch (error) {
      console.error('Error cancelling retake:', error);
      alert('Failed to cancel retake');
    } finally {
      setSchedulingQuestionnaire(false);
    }
  };

  const handleResetQuestionnaire = async () => {
    const caregiver = profileData?.caregiver;
    if (!caregiver) return;
    
    console.log('[Admin] Reset button clicked for caregiver:', caregiver.caregiverId);
    
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete all assessment attempts and responses for this caregiver.\n\n' +
      'This action cannot be undone. The caregiver will need to complete the assessments from scratch.\n\n' +
      'Are you sure you want to continue?'
    );
    
    if (!confirmed) {
      console.log('[Admin] Reset cancelled by user');
      return;
    }
    
    try {
      console.log('[Admin] Calling reset API for caregiver:', caregiver.caregiverId);
      const response = await fetch(`/api/admin/caregiver/reset-questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: caregiver.caregiverId })
      });
      
      const data = await response.json();
      console.log('[Admin] Reset API response:', data);
      
      if (data.success) {
        console.log('[Admin] ✅ Reset successful, verification:', data.data?.verification);
        setSuccess('Assessment data reset successfully - caregiver can now start fresh');
        setTimeout(() => setSuccess(''), 4000);
        fetchProfileData();
      } else {
        console.error('[Admin] Reset failed:', data.message);
        alert(data.message || 'Failed to reset assessment');
      }
    } catch (error) {
      console.error('[Admin] Error resetting assessment:', error);
      alert('Failed to reset assessment');
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
              {['overview', 'progress', 'tasks', 'feedback', 'questionnaire', 'support', 'notes'].map((tab) => (
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
                  <h3 style={styles.sectionTitle}>NLFCP Program Progress</h3>
                  
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <h4 style={styles.dayTitle}>Day {day.day}</h4>
                              {day.hasDynamicTest && day.dynamicTestCompleted && day.dynamicTest?.answers?.length > 0 && (
                                <button
                                  onClick={() => downloadDayAssessmentCSV(day.day)}
                                  style={{
                                    ...styles.button,
                                    backgroundColor: '#16a34a',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    padding: '0.375rem 0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                                  title="Download assessment responses as CSV with English translations"
                                >
                                  📥 Export Assessment CSV
                                </button>
                              )}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              {day.videoTitle || 'Program Content'}
                            </p>
                            {day.hasDynamicTest && day.dynamicTestCompleted && day.dynamicTest && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#059669' }}>
                                <strong>✅ Assessment Complete:</strong> Score: {day.dynamicTest.totalScore || 'N/A'} | Level: {day.dynamicTest.scoreLevel || 'N/A'} | {day.dynamicTest.answers?.length || 0} responses
                              </div>
                            )}
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

              {/* Questionnaire Tab */}
              {activeTab === 'questionnaire' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={styles.sectionTitle}>Caregiver Assessment</h3>
                    <button
                      onClick={toggleQuestionnaireEnabled}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: caregiver?.questionnaireEnabled ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {caregiver?.questionnaireEnabled ? '🔒 Disable Assessment' : '✅ Enable Assessment'}
                    </button>
                  </div>

                  {/* Assessment Status Card */}
                  <div style={{
                    backgroundColor: caregiver?.questionnaireEnabled ? '#d1fae5' : '#fee2e2',
                    border: `2px solid ${caregiver?.questionnaireEnabled ? '#34d399' : '#fca5a5'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {caregiver?.questionnaireEnabled ? '✅' : '🔒'}
                      </span>
                      <h4 style={{ margin: 0, color: caregiver?.questionnaireEnabled ? '#065f46' : '#991b1b' }}>
                        Assessment {caregiver?.questionnaireEnabled ? 'Enabled' : 'Disabled'}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: caregiver?.questionnaireEnabled ? '#064e3b' : '#7f1d1d' }}>
                      {caregiver?.questionnaireEnabled 
                        ? 'The caregiver can now access and complete the assessment on their dashboard.'
                        : 'Enable the assessment to allow this caregiver to complete it. This is independent of daily program modules.'}
                    </p>
                  </div>

                  {/* Attempts Overview */}
                  {caregiver?.questionnaireAttempts && caregiver.questionnaireAttempts.length > 0 && (
                    <div style={{
                      backgroundColor: '#eff6ff',
                      border: '2px solid #93c5fd',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>Assessment Attempts</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {caregiver.questionnaireAttempts.map((attempt) => (
                          <div key={attempt.attemptNumber} style={{
                            backgroundColor: 'white',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe'
                          }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                              {attempt.attemptNumber === 1 ? '📝' : '📋'}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                              {attempt.attemptNumber === 1 ? '⚡ Immediate Post-Test' : '📅 Scheduled Post-Test'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              Submitted: {new Date(attempt.submittedAt).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                              {attempt.answers?.length || 0} responses
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Compare Button */}
                      {caregiver.questionnaireAttempts.length === 2 && (
                        <button
                          onClick={() => setCompareQuestionnaireDialog(true)}
                          style={{
                            marginTop: '16px',
                            padding: '10px 20px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            width: '100%'
                          }}
                        >
                          📊 Compare Both Assessments
                        </button>
                      )}

                      {/* Reset Button */}
                      <button
                        onClick={handleResetQuestionnaire}
                        style={{
                          marginTop: '12px',
                          padding: '10px 20px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        🗑️ Reset All Assessment Data
                      </button>
                    </div>
                  )}

                  {/* Schedule Second Assessment */}
                  {caregiver?.questionnaireAttempts && caregiver.questionnaireAttempts.length === 1 && (
                    <div style={{
                      backgroundColor: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>📅 Schedule Scheduled Post-Test (Second Assessment)</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#78350f' }}>
                        The caregiver has completed the immediate post-test. Schedule the second assessment for a future date.
                      </p>
                      
                      {caregiver.questionnaireRetakeStatus === 'scheduled' && (
                        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                            📅 Scheduled For:
                          </div>
                          <div style={{ fontSize: '15px', color: '#1e3a8a' }}>
                            {new Date(caregiver.questionnaireRetakeScheduledFor).toLocaleString()}
                          </div>
                        </div>
                      )}

                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#78350f' }}>
                        Select Date & Time for Second Assessment:
                      </label>
                      <input
                        type="datetime-local"
                        value={questionnaireRetakeSchedule}
                        onChange={(e) => setQuestionnaireRetakeSchedule(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #fbbf24',
                          borderRadius: '6px',
                          fontSize: '14px',
                          marginBottom: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                      
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleScheduleQuestionnaireRetake}
                          disabled={schedulingQuestionnaire || !questionnaireRetakeSchedule}
                          style={{
                            flex: 1,
                            minWidth: '150px',
                            padding: '10px 20px',
                            backgroundColor: schedulingQuestionnaire || !questionnaireRetakeSchedule ? '#9ca3af' : '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: schedulingQuestionnaire || !questionnaireRetakeSchedule ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {schedulingQuestionnaire ? '⏳ Scheduling...' : '📅 Schedule Second Assessment'}
                        </button>
                        
                        {caregiver.questionnaireRetakeStatus === 'scheduled' && (
                          <button
                            onClick={handleCancelQuestionnaireRetake}
                            disabled={schedulingQuestionnaire}
                            style={{
                              flex: 1,
                              minWidth: '150px',
                              padding: '10px 20px',
                              backgroundColor: schedulingQuestionnaire ? '#9ca3af' : '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: schedulingQuestionnaire ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ❌ Cancel Schedule
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailed Responses */}
                  {caregiver?.questionnaireAnswers && caregiver.questionnaireAnswers.length > 0 && (
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px'
                    }}>
                      <h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Latest Responses</h4>
                      {caregiver.questionnaireAnswers.map((answer, idx) => {
                        const displayAnswer = Array.isArray(answer.answer) 
                          ? answer.answer.join(', ')
                          : getAnswerLabel(answer);
                        
                        return (
                          <div key={idx} style={{
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                              Q{idx + 1}: {answer.questionText}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', paddingLeft: '12px' }}>
                              {displayAnswer}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!caregiver?.questionnaireAnswers || caregiver.questionnaireAnswers.length === 0 && (
                    <div style={{
                      backgroundColor: '#f9fafb',
                      border: '2px dashed #d1d5db',
                      borderRadius: '12px',
                      padding: '40px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                      <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>No Responses Yet</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
                        {caregiver?.questionnaireEnabled 
                          ? 'The caregiver has not submitted the assessment yet.'
                          : 'Enable the assessment to allow the caregiver to submit responses.'}
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

        {/* Questionnaire Comparison Dialog */}
        {compareQuestionnaireDialog && caregiver?.questionnaireAttempts && caregiver.questionnaireAttempts.length === 2 && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 10000
            }}
            onClick={() => setCompareQuestionnaireDialog(false)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '1200px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                  📊 Assessment Comparison: Immediate vs Scheduled Post-Test
                </h3>
                <button
                  onClick={() => setCompareQuestionnaireDialog(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Comparison Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[1, 2].map(attemptNum => {
                  const attempt = caregiver.questionnaireAttempts.find(a => a.attemptNumber === attemptNum);
                  return (
                    <div key={attemptNum} style={{
                      backgroundColor: attemptNum === 1 ? '#dbeafe' : '#d1fae5',
                      border: `2px solid ${attemptNum === 1 ? '#93c5fd' : '#6ee7b7'}`,
                      borderRadius: '10px',
                      padding: '16px'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {attemptNum === 1 ? '📝' : '📋'}
                      </div>
                      <h4 style={{ margin: '0 0 8px 0', color: attemptNum === 1 ? '#1e40af' : '#065f46' }}>
                        {attemptNum === 1 ? '⚡ Immediate Post-Test' : '📅 Scheduled Post-Test'}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {new Date(attempt.submittedAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                        {attempt.answers?.length || 0} responses
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Question-by-Question Comparison */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '20px',
                maxHeight: '60vh',
                overflow: 'auto'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Response Comparison</h4>
                
                {(() => {
                  const attempt1 = caregiver.questionnaireAttempts.find(a => a.attemptNumber === 1);
                  const attempt2 = caregiver.questionnaireAttempts.find(a => a.attemptNumber === 2);
                  
                  if (!attempt1 || !attempt2) return <p>Unable to load comparison data</p>;
                  
                  const maxLength = Math.max(attempt1.answers?.length || 0, attempt2.answers?.length || 0);
                  const rows = [];
                  
                  for (let i = 0; i < maxLength; i++) {
                    const ans1 = attempt1.answers?.[i];
                    const ans2 = attempt2.answers?.[i];
                    
                    if (!ans1 && !ans2) continue;
                    
                    // Use the question text from the answer (already in the correct language)
                    const question = ans1?.questionText || ans2?.questionText || `Question ${i + 1}`;
                    // Get the answer labels with both language and English (for admin)
                    const answer1 = ans1 ? (Array.isArray(ans1.answer) ? ans1.answer.join(', ') : getAnswerLabel(ans1, ans1.language, true)) : '—';
                    const answer2 = ans2 ? (Array.isArray(ans2.answer) ? ans2.answer.join(', ') : getAnswerLabel(ans2, ans2.language, true)) : '—';
                    
                    const hasChanged = answer1 !== answer2;
                    
                    rows.push(
                      <div key={i} style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        border: hasChanged ? '2px solid #fbbf24' : '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          {hasChanged && (
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                          )}
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                            Q{i + 1}: {question}
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#eff6ff',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe'
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '6px' }}>
                              ⚡ Immediate Post-Test
                            </div>
                            <div style={{ fontSize: '14px', color: '#1e3a8a', wordWrap: 'break-word' }}>
                              {answer1}
                            </div>
                          </div>
                          
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#d1fae5',
                            borderRadius: '6px',
                            border: '1px solid #6ee7b7'
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46', marginBottom: '6px' }}>
                              📅 Scheduled Post-Test
                            </div>
                            <div style={{ fontSize: '14px', color: '#064e3b', wordWrap: 'break-word' }}>
                              {answer2}
                            </div>
                          </div>
                        </div>
                        
                        {hasChanged && (
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#92400e'
                          }}>
                            ⚠️ Response changed between assessments
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return rows;
                })()}
              </div>

              {/* Export Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => {
                    const attempt1 = caregiver.questionnaireAttempts.find(a => a.attemptNumber === 1);
                    const attempt2 = caregiver.questionnaireAttempts.find(a => a.attemptNumber === 2);
                    
                    // Header section with caregiver details
                    const csvRows = [
                      ['Assessment Comparison Report'],
                      [''],
                      ['Caregiver Information'],
                      ['Caregiver Name', caregiver.name || 'N/A'],
                      ['Caregiver ID', caregiver.caregiverId || 'N/A'],
                      ['Phone', caregiver.phoneNumber || 'N/A'],
                      ['Email', caregiver.email || 'N/A'],
                      [''],
                      ['Assessment Details'],
                      ['First Assessment (Immediate Post-Test)', attempt1?.submittedAt ? new Date(attempt1.submittedAt).toLocaleString() : 'N/A'],
                      ['First Assessment Language', attempt1?.answers?.[0]?.language === 'en' ? 'English' : attempt1?.answers?.[0]?.language === 'hi' ? 'Hindi' : attempt1?.answers?.[0]?.language === 'kn' ? 'Kannada' : 'N/A'],
                      ['Second Assessment (Scheduled Post-Test)', attempt2?.submittedAt ? new Date(attempt2.submittedAt).toLocaleString() : 'N/A'],
                      ['Second Assessment Language', attempt2?.answers?.[0]?.language === 'en' ? 'English' : attempt2?.answers?.[0]?.language === 'hi' ? 'Hindi' : attempt2?.answers?.[0]?.language === 'kn' ? 'Kannada' : 'N/A'],
                      ['Total Questions', Math.max(attempt1.answers?.length || 0, attempt2.answers?.length || 0)],
                      ['Report Generated', new Date().toLocaleString()],
                      [''],
                      ['Question Responses'],
                      ['Question #', 'Question Text', 'First Assessment', 'Second Assessment', 'Changed']
                    ];
                    
                    const maxLength = Math.max(attempt1.answers?.length || 0, attempt2.answers?.length || 0);
                    
                    for (let i = 0; i < maxLength; i++) {
                      const ans1 = attempt1.answers?.[i];
                      const ans2 = attempt2.answers?.[i];
                      const question = ans1?.questionText || ans2?.questionText || `Question ${i + 1}`;
                      // For CSV, use only English labels
                      const answer1 = ans1 ? (Array.isArray(ans1.answer) ? ans1.answer.join(', ') : getAnswerLabel(ans1, 'en', false)) : '—';
                      const answer2 = ans2 ? (Array.isArray(ans2.answer) ? ans2.answer.join(', ') : getAnswerLabel(ans2, 'en', false)) : '—';
                      const changed = answer1 !== answer2 ? 'Yes' : 'No';
                      
                      csvRows.push([`Q${i + 1}`, question, answer1, answer2, changed]);
                    }
                    
                    const csvContent = csvRows.map(row => 
                      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
                    ).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `caregiver_${caregiver.caregiverId}_assessment_comparison_${Date.now()}.csv`;
                    link.click();
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📊 Export to CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
