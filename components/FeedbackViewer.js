import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function FeedbackViewer() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/caregiver-feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      alert('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = (caregiver) => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(16);
      doc.text('Caregiver Feedback Report', 14, 20);
      
      // Caregiver Info
      doc.setFontSize(12);
      doc.text(`Caregiver ID: ${caregiver.caregiverId}`, 14, 30);
      doc.text(`Name: ${caregiver.name}`, 14, 37);
      doc.text(`Phone: ${caregiver.phone}`, 14, 44);
      doc.text(`Total Feedback Submissions: ${caregiver.feedbackSubmissions.length}`, 14, 51);
      
      let yPos = 60;
      
      caregiver.feedbackSubmissions.forEach((feedback, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text(`Feedback #${index + 1}`, 14, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.text(`Day: ${feedback.day} | Task ID: ${feedback.taskId}`, 14, yPos);
        yPos += 5;
        doc.text(`Date: ${new Date(feedback.submittedAt).toLocaleString()}`, 14, yPos);
        yPos += 5;
        doc.text(`Language: ${feedback.language}`, 14, yPos);
        yPos += 10;
        
        // Responses
        doc.setFontSize(11);
        Object.entries(feedback.responses || {}).forEach(([fieldIdx, response]) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          const label = feedback.fieldLabels?.[fieldIdx] || `Question ${parseInt(fieldIdx) + 1}`;
          doc.text(`${label}:`, 14, yPos);
          yPos += 6;
          
          // Handle long text responses
          const responseText = String(response || 'No response');
          const splitText = doc.splitTextToSize(responseText, 180);
          doc.setFontSize(10);
          doc.setTextColor(60);
          splitText.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 20, yPos);
            yPos += 5;
          });
          doc.setTextColor(0);
          yPos += 5;
        });
        
        yPos += 10;
      });
      
      doc.save(`feedback_${caregiver.caregiverId}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = (caregiver) => {
    setExporting(true);
    try {
      const rows = [];
      
      // Header
      rows.push([
        'Caregiver ID',
        'Name',
        'Phone',
        'Feedback #',
        'Day',
        'Task ID',
        'Submission Date',
        'Language',
        'Question',
        'Response'
      ]);
      
      // Data rows
      caregiver.feedbackSubmissions.forEach((feedback, fbIndex) => {
        Object.entries(feedback.responses || {}).forEach(([fieldIdx, response]) => {
          const label = feedback.fieldLabels?.[fieldIdx] || `Question ${parseInt(fieldIdx) + 1}`;
          rows.push([
            caregiver.caregiverId,
            caregiver.name,
            caregiver.phone,
            fbIndex + 1,
            feedback.day,
            feedback.taskId,
            new Date(feedback.submittedAt).toLocaleString(),
            feedback.language,
            label,
            String(response || 'No response')
          ]);
        });
      });
      
      // Convert to CSV
      const csvContent = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `feedback_${caregiver.caregiverId}_${Date.now()}.csv`;
      link.click();
    } catch (err) {
      console.error('Error generating CSV:', err);
      alert('Failed to generate CSV');
    } finally {
      setExporting(false);
    }
  };

  const exportAllToCSV = () => {
    setExporting(true);
    try {
      const rows = [];
      
      // Header
      rows.push([
        'Caregiver ID',
        'Name',
        'Phone',
        'Feedback #',
        'Day',
        'Task ID',
        'Submission Date',
        'Language',
        'Question',
        'Response'
      ]);
      
      // Data rows for all caregivers
      feedbackData.forEach(caregiver => {
        caregiver.feedbackSubmissions.forEach((feedback, fbIndex) => {
          Object.entries(feedback.responses || {}).forEach(([fieldIdx, response]) => {
            const label = feedback.fieldLabels?.[fieldIdx] || `Question ${parseInt(fieldIdx) + 1}`;
            rows.push([
              caregiver.caregiverId,
              caregiver.name,
              caregiver.phone,
              fbIndex + 1,
              feedback.day,
              feedback.taskId,
              new Date(feedback.submittedAt).toLocaleString(),
              feedback.language,
              label,
              String(response || 'No response')
            ]);
          });
        });
      });
      
      // Convert to CSV
      const csvContent = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `all_feedback_${Date.now()}.csv`;
      link.click();
    } catch (err) {
      console.error('Error generating CSV:', err);
      alert('Failed to generate CSV');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading feedback data...</p>
      </div>
    );
  }

  if (selectedCaregiver) {
    const caregiver = feedbackData.find(cg => cg.caregiverId === selectedCaregiver);
    if (!caregiver) return null;

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setSelectedCaregiver(null)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to List
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => exportToPDF(caregiver)}
              disabled={exporting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: exporting ? 0.5 : 1
              }}
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => exportToCSV(caregiver)}
              disabled={exporting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: exporting ? 0.5 : 1
              }}
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            {caregiver.name} ({caregiver.caregiverId})
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            Phone: {caregiver.phone} | Total Submissions: {caregiver.feedbackSubmissions.length}
          </p>

          {caregiver.feedbackSubmissions.map((feedback, index) => (
            <div key={index} style={{ 
              marginBottom: '24px', 
              padding: '20px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Feedback #{index + 1}</h3>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {new Date(feedback.submittedAt).toLocaleString()}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <strong style={{ fontSize: '12px', color: '#6b7280' }}>Day:</strong>
                  <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{feedback.day}</p>
                </div>
                <div>
                  <strong style={{ fontSize: '12px', color: '#6b7280' }}>Task ID:</strong>
                  <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{feedback.taskId}</p>
                </div>
                <div>
                  <strong style={{ fontSize: '12px', color: '#6b7280' }}>Language:</strong>
                  <p style={{ fontSize: '14px', margin: '4px 0 0 0' }}>{feedback.language}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Responses:</h4>
                {Object.entries(feedback.responses || {}).map(([fieldIdx, response]) => (
                  <div key={fieldIdx} style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      {feedback.fieldLabels?.[fieldIdx] || `Question ${parseInt(fieldIdx) + 1}`}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      padding: '8px 12px', 
                      backgroundColor: 'white', 
                      borderRadius: '6px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {response || 'No response'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Caregiver Feedback Responses</h1>
        {feedbackData.length > 0 && (
          <button
            onClick={exportAllToCSV}
            disabled={exporting}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: exporting ? 0.5 : 1
            }}
          >
            📊 Export All to CSV
          </button>
        )}
      </div>

      {feedbackData.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '60px', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>No feedback submissions found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {feedbackData.map((caregiver) => (
            <motion.div
              key={caregiver.caregiverId}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedCaregiver(caregiver.caregiverId)}
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    {caregiver.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    ID: {caregiver.caregiverId} | Phone: {caregiver.phone}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {caregiver.feedbackSubmissions.length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    {caregiver.feedbackSubmissions.length === 1 ? 'Submission' : 'Submissions'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
