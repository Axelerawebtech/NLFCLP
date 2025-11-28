const DEFAULT_TASK_META = {
  label: 'Care Task',
  showTitleByDefault: false,
  showDescriptionByDefault: false,
  titleRequired: false,
  descriptionRequired: false
};

const TASK_TYPE_META = {
  video: {
    label: 'Video Lesson',
    showTitleByDefault: true,
    showDescriptionByDefault: true,
    titleRequired: true
  },
  'calming-video': {
    label: 'Calming Video',
    showTitleByDefault: true,
    showDescriptionByDefault: true,
    titleRequired: true
  },
  'quick-assessment': {
    label: 'Quick Check-In',
    showTitleByDefault: true
  },
  'interactive-field': {
    label: 'Reflection Exercise'
  },
  'activity-selector': {
    label: 'Activity Selector'
  },
  'reflection-prompt': {
    label: 'Reflection Prompt',
    showDescriptionByDefault: true
  },
  'feeling-check': {
    label: 'Feeling Check',
    showDescriptionByDefault: true
  },
  'audio-message': {
    label: 'Audio Message'
  },
  'motivation-message': {
    label: 'Motivation Message'
  },
  'greeting-message': {
    label: 'Greeting'
  },
  'healthcare-tip': {
    label: 'Healthcare Tip'
  },
  reminder: {
    label: 'Reminder'
  },
  'task-checklist': {
    label: 'Checklist',
    showTitleByDefault: true,
    showDescriptionByDefault: true
  },
  'visual-cue': {
    label: 'Visual Cue',
    showTitleByDefault: true,
    showDescriptionByDefault: true
  }
};

export const getTaskMeta = (taskType = '') => ({
  ...DEFAULT_TASK_META,
  ...(TASK_TYPE_META[taskType] || {})
});

export const getTaskDefaultTitle = (taskType = '') => getTaskMeta(taskType).label;

export const shouldShowTitleField = (taskType = '', existingValue = '') => {
  const meta = getTaskMeta(taskType);
  return meta.titleRequired || meta.showTitleByDefault || Boolean(existingValue?.trim());
};

export const shouldShowDescriptionField = (taskType = '', existingValue = '') => {
  const meta = getTaskMeta(taskType);
  return meta.descriptionRequired || meta.showDescriptionByDefault || Boolean(existingValue?.trim());
};

export const isTitleRequired = (taskType = '') => Boolean(getTaskMeta(taskType).titleRequired);
export const isDescriptionRequired = (taskType = '') => Boolean(getTaskMeta(taskType).descriptionRequired);
