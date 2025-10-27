import dbConnect from '../../../lib/mongodb';
import Content from '../../../models/Content';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Fetch ordered content for a day
async function handleGet(req, res) {
  try {
    await dbConnect();

    const { day, category, language } = req.query;

    if (day === undefined) {
      return res.status(400).json({ error: 'Day parameter is required' });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    const orderedContent = await Content.getOrderedContentForDay(
      dayNum, 
      category || 'all', 
      language || 'english'
    );

    return res.status(200).json({
      success: true,
      data: orderedContent,
      count: orderedContent.length
    });

  } catch (error) {
    console.error('Error fetching ordered content:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// POST: Create new ordered content
async function handlePost(req, res) {
  try {
    await dbConnect();

    const {
      day,
      orderNumber,
      contentType,
      category,
      title,
      description,
      content,
      completionCriteria,
      requiresPreviousCompletion,
      estimatedDuration,
      difficulty
    } = req.body;

    // Validation
    if (day === undefined || !orderNumber || !contentType || !title?.english) {
      return res.status(400).json({ 
        error: 'Required fields: day, orderNumber, contentType, title.english' 
      });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    const orderNum = parseInt(orderNumber);
    if (isNaN(orderNum) || orderNum < 1) {
      return res.status(400).json({ error: 'Order number must be a positive integer' });
    }

    // Check for existing content with same day, category, and order number
    const existingContent = await Content.findOne({
      day: dayNum,
      category: category || 'all',
      orderNumber: orderNum
    });

    if (existingContent) {
      return res.status(400).json({ 
        error: `Content with order number ${orderNum} already exists for Day ${dayNum} in category '${category || 'all'}'` 
      });
    }

    // Create new content
    const newContent = new Content({
      day: dayNum,
      orderNumber: orderNum,
      contentType,
      category: category || 'all',
      title,
      description,
      content,
      completionCriteria: completionCriteria || 'view',
      requiresPreviousCompletion: requiresPreviousCompletion !== false,
      estimatedDuration: estimatedDuration || 5,
      difficulty: difficulty || 'easy',
      isActive: true
    });

    await newContent.save();

    console.log(`✅ Created new content: Day ${dayNum}, Order ${orderNum}, Type: ${contentType}`);

    return res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: newContent
    });

  } catch (error) {
    console.error('Error creating content:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Content with this order number already exists for this day and category' 
      });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// PUT: Update existing content
async function handlePut(req, res) {
  try {
    await dbConnect();

    const { contentId } = req.query;
    const updateData = req.body;

    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Handle order number change - check for conflicts
    if (updateData.orderNumber && updateData.orderNumber !== content.orderNumber) {
      const existingContent = await Content.findOne({
        _id: { $ne: contentId },
        day: content.day,
        category: content.category,
        orderNumber: updateData.orderNumber
      });

      if (existingContent) {
        return res.status(400).json({ 
          error: `Content with order number ${updateData.orderNumber} already exists for Day ${content.day} in category '${content.category}'` 
        });
      }
    }

    // Update content
    Object.assign(content, updateData);
    await content.save();

    console.log(`✅ Updated content: ${contentId}`);

    return res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// DELETE: Delete content
async function handleDelete(req, res) {
  try {
    await dbConnect();

    const { contentId } = req.query;

    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    await Content.findByIdAndDelete(contentId);

    console.log(`✅ Deleted content: ${contentId} (Day ${content.day}, Order ${content.orderNumber})`);

    return res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}