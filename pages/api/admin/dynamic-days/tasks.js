import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';

/**
 * API Route: /api/admin/dynamic-days/tasks
 * Methods: POST, PUT, DELETE
 * 
 * Purpose: Manage tasks within a day/level
 * - Add new task
 * - Update task (including reorder)
 * - Delete task
 */

export default async function handler(req, res) {
  await dbConnect();

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'POST') {
    // Add new task
    try {
      const { dayNumber, language, levelKey, task } = req.body;

      if (dayNumber === undefined || !language || !levelKey || !task) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number, language, level key, and task data are required' 
        });
      }

      const config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      const dayConfig = config.dynamicDays?.find(
        d => d.dayNumber === dayNumber && d.language === language
      );
      if (!dayConfig) {
        return res.status(404).json({ 
          success: false,
          error: `Day ${dayNumber} (${language}) not found` 
        });
      }

      const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
      if (!levelConfig) {
        return res.status(404).json({ 
          success: false,
          error: `Level ${levelKey} not found in day ${dayNumber}` 
        });
      }

      // Generate task ID and order
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const maxOrder = levelConfig.tasks?.length > 0 
        ? Math.max(...levelConfig.tasks.map(t => t.taskOrder)) 
        : 0;

      const newTask = {
        ...task,
        taskId,
        taskOrder: maxOrder + 1,
        createdAt: new Date()
      };

      if (!levelConfig.tasks) {
        levelConfig.tasks = [];
      }
      levelConfig.tasks.push(newTask);

      config.markModified('dynamicDays');
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: 'Task added successfully',
        task: newTask
      });

    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to add task',
        details: error.message 
      });
    }

  } else if (req.method === 'PUT') {
    // Update task or reorder
    try {
      const { dayNumber, language, levelKey, taskId, updates, reorder } = req.body;

      if (dayNumber === undefined || !language || !levelKey || !taskId) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number, language, level key, and task ID are required' 
        });
      }

      const config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      const dayConfig = config.dynamicDays?.find(
        d => d.dayNumber === dayNumber && d.language === language
      );
      if (!dayConfig) {
        return res.status(404).json({ 
          success: false,
          error: `Day ${dayNumber} (${language}) not found` 
        });
      }

      const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
      if (!levelConfig || !levelConfig.tasks) {
        return res.status(404).json({ 
          success: false,
          error: `Level ${levelKey} not found` 
        });
      }

      const taskIndex = levelConfig.tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Task not found' 
        });
      }

      if (reorder) {
        // Reorder tasks
        const { newOrder } = reorder;
        const task = levelConfig.tasks[taskIndex];
        const oldOrder = task.taskOrder;

        if (newOrder !== oldOrder) {
          // Update orders
          levelConfig.tasks.forEach(t => {
            if (newOrder > oldOrder) {
              // Moving down
              if (t.taskOrder > oldOrder && t.taskOrder <= newOrder) {
                t.taskOrder--;
              }
            } else {
              // Moving up
              if (t.taskOrder >= newOrder && t.taskOrder < oldOrder) {
                t.taskOrder++;
              }
            }
          });

          task.taskOrder = newOrder;
          levelConfig.tasks.sort((a, b) => a.taskOrder - b.taskOrder);
        }
      } else if (updates) {
        // Update task content
        Object.assign(levelConfig.tasks[taskIndex], updates);
      }

      config.markModified('dynamicDays');
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: 'Task updated successfully',
        task: levelConfig.tasks[taskIndex]
      });

    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update task',
        details: error.message 
      });
    }

  } else if (req.method === 'DELETE') {
    // Delete task
    try {
      const { dayNumber, language, levelKey, taskId } = req.query;

      if (!dayNumber || !language || !levelKey || !taskId) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number, language, level key, and task ID are required' 
        });
      }

      const config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      const dayConfig = config.dynamicDays?.find(
        d => d.dayNumber === parseInt(dayNumber) && d.language === language
      );
      if (!dayConfig) {
        return res.status(404).json({ 
          success: false,
          error: `Day ${dayNumber} (${language}) not found` 
        });
      }

      const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
      if (!levelConfig || !levelConfig.tasks) {
        return res.status(404).json({ 
          success: false,
          error: `Level ${levelKey} not found` 
        });
      }

      const taskIndex = levelConfig.tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Task not found' 
        });
      }

      const deletedOrder = levelConfig.tasks[taskIndex].taskOrder;
      
      // Remove task
      levelConfig.tasks.splice(taskIndex, 1);
      
      // Reorder remaining tasks
      levelConfig.tasks.forEach(t => {
        if (t.taskOrder > deletedOrder) {
          t.taskOrder--;
        }
      });

      config.markModified('dynamicDays');
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: 'Task deleted successfully' 
      });

    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete task',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
}
