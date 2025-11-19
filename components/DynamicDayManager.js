import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';

/**
 * DynamicDayManager Component
 * 
 * Complete dynamic day content management with:
 * - Language tabs at the top
 * - Test configuration UI
 * - Cloudinary video upload
 * - Framer Motion reordering
 * - All content types supported
 */

export default function DynamicDayManager() {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayConfig, setDayConfig] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('default');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTestConfig, setShowTestConfig] = useState(false);

  const languages = [
    { code: 'english', label: 'English', flag: '🇺🇸' },
    { code: 'kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'hindi', label: 'हिंदी', flag: '🇮🇳' }
  ];

  // Load all configured days for current language
  useEffect(() => {
    fetchDays();
  }, [selectedLanguage]);

  const fetchDays = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dynamic-days/config?language=${selectedLanguage}`);
      const data = await res.json();
      
      if (data.success) {
        setDays(data.days || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load days');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load specific day configuration for current language
  const loadDayConfig = async (dayNum) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/dynamic-days/config?day=${dayNum}&language=${selectedLanguage}`);
      const data = await res.json();
      
      if (data.success) {
        // Check if this is a new day (not yet configured)
        if (data.isNew || !data.dayConfig) {
          // Create new empty configuration
          setDayConfig({
            dayNumber: dayNum,
            language: selectedLanguage,
            dayName: '',
            hasTest: false,
            testConfig: null,
            contentByLevel: [{
              levelKey: 'default',
              levelLabel: 'Default',
              tasks: []
            }],
            enabled: true
          });
          setSelectedLevel('default');
          console.log(`✨ Creating new configuration for Day ${dayNum} (${selectedLanguage})`);
        } else {
          // Load existing configuration
          setDayConfig(data.dayConfig);
          
          // Set default level
          if (data.dayConfig.hasTest && data.dayConfig.testConfig?.scoreRanges?.length > 0) {
            setSelectedLevel(data.dayConfig.testConfig.scoreRanges[0].levelKey);
          } else {
            setSelectedLevel('default');
          }
          console.log(`✅ Loaded configuration for Day ${dayNum} (${selectedLanguage})`);
        }
      } else {
        setError(data.error || 'Failed to load day configuration');
      }
    } catch (err) {
      setError('Failed to load day configuration');
      console.error('Error loading day config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save day configuration
  const saveDayConfig = async () => {
    if (!dayConfig) return;

    try {
      setSaving(true);
      setError('');

      const res = await fetch('/api/admin/dynamic-days/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: selectedDay,
          language: selectedLanguage,
          dayConfig
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Day ${selectedDay} (${selectedLanguage}) saved successfully!`);
        await fetchDays();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle test configuration
  const toggleHasTest = (hasTest) => {
    setDayConfig(prev => {
      const updated = { ...prev, hasTest };
      
      if (hasTest) {
        // Initialize test config with 3 default levels
        updated.testConfig = {
          testName: '',
          testType: 'custom',
          questions: [],
          scoreRanges: [
            {
              rangeName: 'mild',
              label: 'Mild',
              minScore: 0,
              maxScore: 40,
              levelKey: 'mild'
            },
            {
              rangeName: 'moderate',
              label: 'Moderate',
              minScore: 41,
              maxScore: 60,
              levelKey: 'moderate'
            },
            {
              rangeName: 'severe',
              label: 'Severe',
              minScore: 61,
              maxScore: 88,
              levelKey: 'severe'
            }
          ]
        };

        // Create content by level structure
        updated.contentByLevel = updated.testConfig.scoreRanges.map(range => ({
          levelKey: range.levelKey,
          levelLabel: range.label,
          tasks: []
        }));

        setSelectedLevel('mild');
      } else {
        // Reset to default level
        updated.testConfig = null;
        updated.contentByLevel = [{
          levelKey: 'default',
          levelLabel: 'Default',
          tasks: []
        }];
        setSelectedLevel('default');
      }
      
      return updated;
    });
  };

  // Add task
  const addTask = async (taskData) => {
    try {
      // First, check if day config exists in database by trying to add the task
      let res = await fetch('/api/admin/dynamic-days/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: selectedDay,
          language: selectedLanguage,
          levelKey: selectedLevel,
          task: taskData
        })
      });

      let data = await res.json();
      
      // If day doesn't exist, save it first then retry
      if (!data.success && data.error?.includes('not found')) {
        console.log('Day not in database yet, saving configuration first...');
        
        // Save day configuration
        const saveRes = await fetch('/api/admin/dynamic-days/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: selectedDay,
            language: selectedLanguage,
            dayConfig
          })
        });

        const saveData = await saveRes.json();
        
        if (!saveData.success) {
          alert('Failed to save day configuration: ' + saveData.error);
          return;
        }

        console.log('✅ Day configuration saved, now adding task...');

        // Retry adding the task
        res = await fetch('/api/admin/dynamic-days/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: selectedDay,
            language: selectedLanguage,
            levelKey: selectedLevel,
            task: taskData
          })
        });

        data = await res.json();
      }
      
      if (data.success) {
        await loadDayConfig(selectedDay);
        await fetchDays(); // Refresh days list
        setShowAddTask(false);
        console.log('✅ Task added successfully');
        return data;
      } else {
        alert(data.error);
        return data;
      }
    } catch (err) {
      alert('Failed to add task');
      console.error(err);
      return { success: false, error: err.message };
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!confirm('⚠️ Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(
        `/api/admin/dynamic-days/tasks?dayNumber=${selectedDay}&language=${selectedLanguage}&levelKey=${selectedLevel}&taskId=${taskId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();
      
      if (data.success) {
        await loadDayConfig(selectedDay);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete task');
      console.error(err);
    }
  };

  // Update task order after reordering
  const handleReorder = async (newOrderedTasks) => {
    // Update local state immediately for smooth UX
    setDayConfig(prev => {
      const updated = { ...prev };
      const levelConfig = updated.contentByLevel.find(l => l.levelKey === selectedLevel);
      if (levelConfig) {
        levelConfig.tasks = newOrderedTasks.map((task, index) => ({
          ...task,
          taskOrder: index + 1
        }));
      }
      return updated;
    });

    // Save to backend
    try {
      for (let i = 0; i < newOrderedTasks.length; i++) {
        const task = newOrderedTasks[i];
        const newOrder = i + 1;
        
        if (task.taskOrder !== newOrder) {
          await fetch('/api/admin/dynamic-days/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayNumber: selectedDay,
              language: selectedLanguage,
              levelKey: selectedLevel,
              taskId: task.taskId,
              reorder: { newOrder }
            })
          });
        }
      }
    } catch (err) {
      console.error('Failed to save reordered tasks:', err);
      // Reload to get correct state
      await loadDayConfig(selectedDay);
    }
  };

  const currentLevelConfig = dayConfig?.contentByLevel?.find(l => l.levelKey === selectedLevel);

  return (
    <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Language Tabs - Top Level */}
      <div style={{ 
        marginBottom: '30px', 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#374151' }}>
          🌐 Select Language for Configuration
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {languages.map(lang => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLanguage(lang.code)}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedLanguage === lang.code ? '#3b82f6' : '#f3f4f6',
                color: selectedLanguage === lang.code ? 'white' : '#374151',
                border: selectedLanguage === lang.code ? '2px solid #2563eb' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '20px' }}>{lang.flag}</span>
              {lang.label}
            </motion.button>
          ))}
        </div>
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>
        🗓️ Dynamic Day Content Manager
      </h2>

      {/* Day Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '12px',
          border: '2px solid #e5e7eb'
        }}
      >
        <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#111827' }}>
          📅 Select Day to Configure
        </label>
        <select
          value={selectedDay || ''}
          onChange={(e) => {
            const day = parseInt(e.target.value);
            setSelectedDay(day);
            loadDayConfig(day);
          }}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '12px 16px',
            fontSize: '15px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <option value="">Choose a day...</option>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(day => {
            const configured = days.find(d => d.dayNumber === day);
            return (
              <option key={day} value={day}>
                Day {day} {configured ? '✓ Configured' : '○ Not configured'}
              </option>
            );
          })}
        </select>
      </motion.div>

      {selectedDay !== null && dayConfig && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Day Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Day Name ({selectedLanguage})
              </label>
              <input
                type="text"
                value={dayConfig.dayName || ''}
                onChange={(e) => setDayConfig(prev => ({
                  ...prev,
                  dayName: e.target.value
                }))}
                placeholder={`e.g., Day ${selectedDay} - Introduction`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Test Configuration */}
            <motion.div 
              layout
              style={{ 
                marginBottom: '30px', 
                padding: '24px', 
                backgroundColor: '#f0f9ff', 
                border: '2px solid #bfdbfe', 
                borderRadius: '12px' 
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#1e40af' }}>
                📊 Test/Assessment Configuration
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dayConfig.hasTest}
                    onChange={(e) => toggleHasTest(e.target.checked)}
                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#1e40af' }}>
                    This day has a test/assessment with multiple levels
                  </span>
                </label>
              </div>

              <AnimatePresence>
                {dayConfig.hasTest && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}
                  >
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                        Test Name ({selectedLanguage})
                      </label>
                      <input
                        type="text"
                        value={dayConfig.testConfig?.testName || ''}
                        onChange={(e) => setDayConfig(prev => ({
                          ...prev,
                          testConfig: {
                            ...prev.testConfig,
                            testName: e.target.value
                          }
                        }))}
                        placeholder="e.g., Stress Level Assessment"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          fontSize: '15px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                    </div>

                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                      📊 Levels configured: {dayConfig.testConfig?.scoreRanges?.length || 0}
                    </p>
                    
                    <button
                      onClick={() => setShowTestConfig(!showTestConfig)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {showTestConfig ? '▼ Hide' : '▶'} Configure Test Questions & Score Ranges
                    </button>

                    <AnimatePresence>
                      {showTestConfig && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <TestConfigEditor
                            testConfig={dayConfig.testConfig}
                            selectedLanguage={selectedLanguage}
                            onChange={(updatedConfig) => setDayConfig(prev => ({
                              ...prev,
                              testConfig: updatedConfig
                            }))}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Level Tabs */}
            <AnimatePresence>
              {dayConfig.hasTest && dayConfig.testConfig?.scoreRanges?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginBottom: '20px' }}
                >
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '3px solid #e5e7eb', flexWrap: 'wrap' }}>
                    {dayConfig.testConfig.scoreRanges.map(range => (
                      <motion.button
                        key={range.levelKey}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLevel(range.levelKey)}
                        style={{
                          padding: '14px 28px',
                          backgroundColor: selectedLevel === range.levelKey ? '#3b82f6' : 'transparent',
                          color: selectedLevel === range.levelKey ? 'white' : '#374151',
                          border: 'none',
                          borderBottom: selectedLevel === range.levelKey ? '4px solid #2563eb' : 'none',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderRadius: '8px 8px 0 0'
                        }}
                      >
                        {range.label[selectedLanguage]}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Tasks Manager */}
            <motion.div layout style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  📝 Content Tasks {currentLevelConfig && `(${currentLevelConfig.levelLabel})`}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddTask(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>+</span> Add Task
                </motion.button>
              </div>

              {/* Task List with Framer Motion Reorder */}
              {currentLevelConfig?.tasks && currentLevelConfig.tasks.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={currentLevelConfig.tasks.sort((a, b) => a.taskOrder - b.taskOrder)}
                  onReorder={handleReorder}
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {currentLevelConfig.tasks
                    .sort((a, b) => a.taskOrder - b.taskOrder)
                    .map((task) => (
                      <Reorder.Item
                        key={task.taskId}
                        value={task}
                        style={{ marginBottom: '12px' }}
                      >
                        <TaskCard
                          task={task}
                          selectedLanguage={selectedLanguage}
                          onEdit={() => setEditingTask(task)}
                          onDelete={() => deleteTask(task.taskId)}
                        />
                      </Reorder.Item>
                    ))}
                </Reorder.Group>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ 
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    backgroundColor: '#f9fafb', 
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                    No tasks added yet
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Click "Add Task" to create your first content task
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Save Button */}
            <motion.div 
              layout
              style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveDayConfig}
                disabled={saving}
                style={{
                  padding: '14px 36px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Day Configuration'}
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <TaskEditorModal
            selectedLanguage={selectedLanguage}
            onSave={addTask}
            onClose={() => setShowAddTask(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <TaskEditorModal
            selectedLanguage={selectedLanguage}
            task={editingTask}
              onSave={async (taskData) => {
                try {
                  const res = await fetch('/api/admin/dynamic-days/tasks', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      dayNumber: selectedDay,
                      language: selectedLanguage,
                      levelKey: selectedLevel,
                      taskId: editingTask.taskId,
                      updates: taskData
                    })
                  });

                  const data = await res.json();

                  if (data.success) {
                    await loadDayConfig(selectedDay);
                    setEditingTask(null);
                  }

                  return data;
                } catch (err) {
                  console.error('Failed to update task:', err);
                  return { success: false, error: err.message };
                }
              }}
            onClose={() => setEditingTask(null)}
          />
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '20px', 
            padding: '16px 20px', 
            backgroundColor: '#fee2e2', 
            border: '2px solid #fecaca', 
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ⚠️ {error}
        </motion.div>
      )}
    </div>
  );
}

// Task Editor Modal Component with Cloudinary Upload
function TaskEditorModal({ selectedLanguage, task, onSave, onClose }) {
  const [taskType, setTaskType] = useState(task?.taskType || '');
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [content, setContent] = useState(task?.content || {});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingTask, setSavingTask] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const taskTypes = [
    { value: 'video', label: '🎥 Video' },
    { value: 'motivation-message', label: '💪 Motivation Message' },
    { value: 'quick-assessment', label: '📊 Quick Assessment' },
    { value: 'reminder', label: '⏰ Reminder' },
    { value: 'interactive-field', label: '✍️ Interactive Field' },
    { value: 'greeting-message', label: '👋 Greeting Message' },
    { value: 'activity-selector', label: '🎯 Activity Selector' },
    { value: 'calming-video', label: '🧘 Calming Video' },
    { value: 'reflection-prompt', label: '💭 Reflection Prompt' },
    { value: 'feeling-check', label: '😊 How Are You Feeling?' },
    { value: 'audio-message', label: '🔊 Audio Message' },
    { value: 'healthcare-tip', label: '🏥 Healthcare Tip' },
    { value: 'task-checklist', label: '✅ Task Checklist' }
  ];

  // Handle video upload to Cloudinary
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Please upload a valid video file (MP4, MOV, AVI, MKV)');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ File size exceeds 500MB limit');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('language', selectedLanguage);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            // Update content with video URL (simple string, not multi-language)
            setContent(prev => ({
              ...prev,
              videoUrl: data.url
            }));
            alert('✅ Video uploaded successfully!');
          } else {
            alert('❌ Upload failed: ' + (data.error || 'Unknown error'));
          }
        } else {
          alert('❌ Upload failed with status: ' + xhr.status);
        }
        setUploading(false);
        setUploadProgress(0);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        alert('❌ Upload failed. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      });

      // Send request
      xhr.open('POST', '/api/admin/upload-video');
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Failed to upload video');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async (closeAfter = true) => {
    if (!taskType || !title) {
      alert('⚠️ Please fill in required fields (Task Type and Title)');
      return;
    }

    const taskData = {
      taskType,
      title,
      description,
      content,
      enabled: true
    };

    try {
      setSavingTask(true);
      setSaveMessage('');

      const result = await onSave(taskData);

      if (result && result.success) {
        setSaveMessage('✅ Saved successfully');
        if (closeAfter) onClose();
      } else {
        const err = (result && result.error) || 'Failed to save task';
        alert(err);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save task');
    } finally {
      setSavingTask(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
          {task ? '✏️ Edit Task' : '➕ Add New Task'}
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Task Type *
          </label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="">Select task type...</option>
            {taskTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Title ({selectedLanguage}) *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Description ({selectedLanguage})
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Type-specific content fields */}
        {(taskType === 'video' || taskType === 'calming-video') && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f0f9ff', border: '2px solid #bfdbfe', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e40af' }}>
              🎥 Video Upload ({selectedLanguage})
            </label>
            
            {content.videoUrl && (
              <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
                <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, wordBreak: 'break-all' }}>
                  ✅ Current: {content.videoUrl}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                style={{
                  padding: '12px 20px',
                  backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload Video to Cloudinary'}
              </label>

              {uploading && (
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      style={{ 
                        height: '100%', 
                        backgroundColor: '#3b82f6',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', textAlign: 'center' }}>
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Or enter video URL manually:
                </label>
                <input
                  type="text"
                  value={content.videoUrl || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    videoUrl: e.target.value
                  }))}
                  placeholder="https://..."
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {(taskType === 'motivation-message' || taskType === 'greeting-message' || taskType === 'healthcare-tip' || taskType === 'reflection-prompt') && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Message Content ({selectedLanguage})
            </label>
            <textarea
              value={content.textContent || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                textContent: e.target.value
              }))}
              placeholder="Enter message content"
              rows={5}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        )}

        {taskType === 'audio-message' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Audio URL ({selectedLanguage})
            </label>
            <input
              type="text"
              value={content.audioUrl || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                audioUrl: e.target.value
              }))}
              placeholder="Enter audio file URL"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {taskType === 'interactive-field' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Field Type
            </label>
            <select
              value={content.fieldType || 'text'}
              onChange={(e) => setContent(prev => ({ ...prev, fieldType: e.target.value }))}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="text">Text Input</option>
              <option value="textarea">Text Area</option>
              <option value="rating">Rating (1-5)</option>
              <option value="mood-selector">Mood Selector</option>
            </select>

            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginTop: '12px', marginBottom: '8px', color: '#374151' }}>
              Placeholder ({selectedLanguage})
            </label>
            <input
              type="text"
              value={content.placeholder || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                placeholder: e.target.value
              }))}
              placeholder="Enter placeholder text"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {taskType === 'quick-assessment' && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e6eef8', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
              📊 Quick Assessment Questions ({(content.questions || []).length})
            </label>

            {(content.questions || []).map((q, qi) => (
              <div key={qi} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px' }}>Question {qi + 1}</strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={q.questionType || 'yes-no'}
                      onChange={(e) => {
                        const updated = (content.questions || []).slice();
                        updated[qi] = { ...updated[qi], questionType: e.target.value };
                        // ensure options for yes-no
                        if (e.target.value === 'yes-no') {
                          updated[qi].options = [{ optionText: 'Yes' }, { optionText: 'No' }];
                        }
                        setContent(prev => ({ ...prev, questions: updated }));
                      }}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                      <option value="yes-no">Yes / No</option>
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="rating">Rating (1-5)</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!confirm('⚠️ Delete this question?')) return;
                        const updated = (content.questions || []).filter((_, i) => i !== qi);
                        setContent(prev => ({ ...prev, questions: updated }));
                      }}
                      style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <textarea
                  value={q.questionText || ''}
                  onChange={(e) => {
                    const updated = (content.questions || []).slice();
                    updated[qi] = { ...updated[qi], questionText: e.target.value };
                    setContent(prev => ({ ...prev, questions: updated }));
                  }}
                  placeholder="Enter question text"
                  rows={2}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '8px' }}
                />

                {q.questionType === 'multiple-choice' && (
                  <div style={{ marginLeft: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px' }}>Options</strong>
                      <button
                        onClick={() => {
                          const updated = (content.questions || []).slice();
                          updated[qi] = { ...updated[qi], options: [...(updated[qi].options || []), { optionText: '' }] };
                          setContent(prev => ({ ...prev, questions: updated }));
                        }}
                        style={{ padding: '6px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >+ Add Option</button>
                    </div>
                    {(q.options || []).map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          value={opt.optionText || ''}
                          onChange={(e) => {
                            const updated = (content.questions || []).slice();
                            updated[qi].options = updated[qi].options.slice();
                            updated[qi].options[oi] = { ...updated[qi].options[oi], optionText: e.target.value };
                            setContent(prev => ({ ...prev, questions: updated }));
                          }}
                          placeholder={`Option ${oi + 1}`}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                        <button
                          onClick={() => {
                            const updated = (content.questions || []).slice();
                            updated[qi].options = updated[qi].options.filter((_, i) => i !== oi);
                            setContent(prev => ({ ...prev, questions: updated }));
                          }}
                          style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => {
                  const q = { questionText: '', questionType: 'yes-no', options: [{ optionText: 'Yes' }, { optionText: 'No' }] };
                  setContent(prev => ({ ...prev, questions: [...(prev.questions || []), q] }));
                }}
                style={{ padding: '10px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >+ Add Yes/No Question</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '2px solid #e5e7eb', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            disabled={uploading || savingTask}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: uploading || savingTask ? 'not-allowed' : 'pointer',
              opacity: uploading || savingTask ? 0.5 : 1
            }}
          >
            Cancel
          </motion.button>
          {taskType === 'quick-assessment' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave(false)}
              disabled={uploading || savingTask}
              style={{
                padding: '12px 24px',
                backgroundColor: savingTask ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: uploading || savingTask ? 'not-allowed' : 'pointer',
                opacity: uploading || savingTask ? 0.6 : 1
              }}
            >
              {savingTask ? '⏳ Saving...' : '💾 Save Questions'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(true)}
            disabled={uploading || savingTask}
            style={{
              padding: '12px 28px',
              backgroundColor: uploading || savingTask ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: uploading || savingTask ? 'not-allowed' : 'pointer'
            }}
          >
            {task ? '💾 Update Task' : '➕ Add Task'}
          </motion.button>
          {saveMessage && (
            <div style={{ marginLeft: '12px', color: '#10b981', fontWeight: 600 }}>{saveMessage}</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// TaskCard Component - Individual task display with animations
function TaskCard({ task, selectedLanguage, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      style={{
        padding: '20px',
        backgroundColor: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        cursor: 'grab',
        transition: 'box-shadow 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '6px 12px', 
              backgroundColor: '#dbeafe', 
              color: '#1e40af', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '16px' }}>☰</span> #{task.taskOrder}
            </span>
            <span style={{ 
              padding: '6px 12px', 
              backgroundColor: getTypeColor(task.taskType).bg, 
              color: getTypeColor(task.taskType).text, 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {getTypeIcon(task.taskType)} {task.taskType.replace(/-/g, ' ')}
            </span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: '600', margin: '8px 0', color: '#111827' }}>
            {task.title || 'Untitled Task'}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
            {task.description || 'No description'}
          </p>

          {task.taskType === 'quick-assessment' && task.content?.questions && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#374151' }}>
              <strong>Questions:</strong> {(task.content.questions || []).length} question(s)
              {(task.content.questions || []).slice(0, 2).map((q, i) => (
                <div key={i} style={{ marginTop: '6px', color: '#6b7280' }}>{i + 1}. {typeof q.questionText === 'string' ? q.questionText : JSON.stringify(q.questionText)}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ✏️ Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🗑️ Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Helper functions for task types
function getTypeIcon(type) {
  const icons = {
    'video': '🎥',
    'motivation-message': '💪',
    'quick-assessment': '📊',
    'reminder': '⏰',
    'interactive-field': '✍️',
    'greeting-message': '👋',
    'activity-selector': '🎯',
    'calming-video': '🧘',
    'reflection-prompt': '💭',
    'feeling-check': '😊',
    'audio-message': '🔊',
    'healthcare-tip': '🏥',
    'task-checklist': '✅'
  };
  return icons[type] || '📄';
}

function getTypeColor(type) {
  const colors = {
    'video': { bg: '#dbeafe', text: '#1e40af' },
    'motivation-message': { bg: '#fef3c7', text: '#92400e' },
    'quick-assessment': { bg: '#e0e7ff', text: '#3730a3' },
    'reminder': { bg: '#fee2e2', text: '#991b1b' },
    'interactive-field': { bg: '#dcfce7', text: '#166534' },
    'greeting-message': { bg: '#fce7f3', text: '#9f1239' },
    'activity-selector': { bg: '#e0f2fe', text: '#075985' },
    'calming-video': { bg: '#f3e8ff', text: '#6b21a8' },
    'reflection-prompt': { bg: '#fef9c3', text: '#854d0e' },
    'feeling-check': { bg: '#fed7aa', text: '#9a3412' },
    'audio-message': { bg: '#ddd6fe', text: '#5b21b6' },
    'healthcare-tip': { bg: '#d1fae5', text: '#065f46' },
    'task-checklist': { bg: '#e0e7ff', text: '#3730a3' }
  };
  return colors[type] || { bg: '#f3f4f6', text: '#374151' };
}

// Test Configuration Editor Component
function TestConfigEditor({ testConfig, selectedLanguage, onChange }) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const addQuestion = () => {
    const newQuestion = {
      id: (testConfig.questions?.length || 0) + 1,
      questionText: '',
      options: [
        { optionText: '', score: 0 },
        { optionText: '', score: 1 },
        { optionText: '', score: 2 },
        { optionText: '', score: 3 },
        { optionText: '', score: 4 }
      ],
      enabled: true
    };
    
    onChange({
      ...testConfig,
      questions: [...(testConfig.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...testConfig.questions];
    updated[index][field] = value;
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const deleteQuestion = (index) => {
    if (!confirm('⚠️ Delete this question?')) return;
    const updated = testConfig.questions.filter((_, i) => i !== index);
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updated = [...testConfig.questions];
    updated[questionIndex].options[optionIndex][field] = value;
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const addOption = (questionIndex) => {
    const updated = [...testConfig.questions];
    updated[questionIndex].options.push({
      optionText: '',
      score: updated[questionIndex].options.length
    });
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const updated = [...testConfig.questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    onChange({
      ...testConfig,
      questions: updated
    });
  };
  
  const addScoreRange = () => {
    const newRange = {
      rangeName: `level_${testConfig.scoreRanges.length + 1}`,
      label: '',
      minScore: 0,
      maxScore: 10,
      levelKey: `level_${testConfig.scoreRanges.length + 1}`
    };
    
    onChange({
      ...testConfig,
      scoreRanges: [...testConfig.scoreRanges, newRange]
    });
  };

  const updateScoreRange = (index, field, value) => {
    const updated = [...testConfig.scoreRanges];
    updated[index][field] = value;
    
    onChange({
      ...testConfig,
      scoreRanges: updated
    });
  };

  const deleteScoreRange = (index) => {
    if (!confirm('⚠️ Delete this score range? This will also remove associated content.')) return;
    
    const updated = testConfig.scoreRanges.filter((_, i) => i !== index);
    onChange({
      ...testConfig,
      scoreRanges: updated
    });
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      
      {/* Questions Section */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '2px solid #bfdbfe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
            ❓ Test Questions ({testConfig.questions?.length || 0})
          </h4>
          <button
            onClick={addQuestion}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Add Question
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {testConfig.questions?.map((question, qIndex) => (
            <div key={qIndex} style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Question {qIndex + 1}</span>
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              <textarea
                value={question.questionText}
                onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                placeholder="Enter question text..."
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  minHeight: '60px',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ marginLeft: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Options:</span>
                  <button
                    onClick={() => addOption(qIndex)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Option
                  </button>
                </div>

                {question.options?.map((option, oIndex) => (
                  <div key={oIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) => updateOption(qIndex, oIndex, 'optionText', e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '13px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    />
                    <input
                      type="number"
                      value={option.score}
                      onChange={(e) => updateOption(qIndex, oIndex, 'score', parseInt(e.target.value) || 0)}
                      placeholder="Score"
                      style={{
                        width: '70px',
                        padding: '8px',
                        fontSize: '13px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    />
                    {question.options.length > 2 && (
                      <button
                        onClick={() => deleteOption(qIndex, oIndex)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(!testConfig.questions || testConfig.questions.length === 0) && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              No questions added yet. Click "Add Question" to create test questions.
            </p>
          )}
        </div>
      </div>

      {/* Score Ranges Section */}
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
        🎯 Score Ranges & Levels
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        {testConfig.scoreRanges.map((range, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#374151' }}>
                Level {index + 1}: {range.levelKey}
              </h5>
              {testConfig.scoreRanges.length > 1 && (
                <button
                  onClick={() => deleteScoreRange(index)}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Level Label ({selectedLanguage})
                </label>
                <input
                  type="text"
                  value={range.label || ''}
                  onChange={(e) => updateScoreRange(index, 'label', e.target.value)}
                  placeholder="e.g., Mild"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Level Key
                </label>
                <input
                  type="text"
                  value={range.levelKey}
                  onChange={(e) => updateScoreRange(index, 'levelKey', e.target.value)}
                  placeholder="e.g., mild"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Min Score
                </label>
                <input
                  type="number"
                  value={range.minScore}
                  onChange={(e) => updateScoreRange(index, 'minScore', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Max Score
                </label>
                <input
                  type="number"
                  value={range.maxScore}
                  onChange={(e) => updateScoreRange(index, 'maxScore', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addScoreRange}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        + Add Score Range
      </motion.button>

      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {showQuestions ? '▼ Hide' : '▶'} Configure Test Questions ({testConfig.questions?.length || 0} questions)
        </button>

        <AnimatePresence>
          {showQuestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: '20px' }}
            >
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                ℹ️ Test questions configuration will be added here. For now, you can reuse the Burden Assessment configuration or add custom questions via API.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
