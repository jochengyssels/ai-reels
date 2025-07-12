import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { queueService } from '../services/queueService';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all videos for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { videos }
    });
  } catch (error) {
    logger.error('Failed to fetch videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
});

// Get single video
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: { video }
    });
  } catch (error) {
    logger.error('Failed to fetch video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video'
    });
  }
});

// Generate new video (adds to queue)
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { 
      prompt, 
      imageUrl, 
      title, 
      description, 
      width = 1080, 
      height = 1920, 
      fps = 30, 
      quality = 'high',
      contentType,
      optimizeForViral = false,
      generateVariations = false,
      variationCount = 3
    } = req.body;

    if (!prompt || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Prompt and image URL are required'
      });
    }

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        title: title || prompt.substring(0, 50),
        description,
        prompt,
        status: 'PENDING',
        width,
        height,
        fps,
        quality,
        tags: [],
        language: 'en',
        userId: req.user.id,
      },
    });

    // Get user settings for Instagram integration
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    // Prepare job data
    const jobData = {
      videoId: video.id,
      userId: req.user.id,
      prompt,
      imageUrl,
      title: video.title,
      description,
      settings: {
        width,
        height,
        fps,
        quality,
        contentType,
        optimizeForViral,
        generateVariations,
        variationCount,
      },
      instagramSettings: settings?.instagramConnected ? {
        accessToken: settings.instagramAccessToken!,
        caption: settings.defaultCaption,
        hashtags: settings.defaultHashtags,
        autoPost: settings.autoPost,
      } : undefined,
    };

    // Add to queue
    const jobId = await queueService.addVideoGenerationJob(jobData);

    logger.info(`Video generation queued: ${video.id}, job: ${jobId}`);

    res.json({
      success: true,
      data: {
        video,
        jobId,
        message: 'Video generation queued successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to queue video generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to queue video generation'
    });
  }
});

// Get job status
router.get('/job/:jobId/status', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { queueType = 'video' } = req.query;

    const status = await queueService.getJobStatus(jobId, queueType as 'video' | 'instagram');

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job status'
    });
  }
});

// Cancel job
router.delete('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { queueType = 'video' } = req.query;

    const cancelled = await queueService.cancelJob(jobId, queueType as 'video' | 'instagram');

    if (!cancelled) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    logger.error('Failed to cancel job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel job'
    });
  }
});

// Update video
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;

    const video = await prisma.video.update({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      data: {
        title,
        description,
        tags,
        category,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: { video }
    });
  } catch (error) {
    logger.error('Failed to update video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video'
    });
  }
});

// Delete video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // If video is posted to Instagram, delete it
    if (video.instagramPostId) {
      try {
        const settings = await prisma.settings.findUnique({
          where: { userId: req.user.id }
        });

        if (settings?.instagramConnected && settings.instagramAccessToken) {
          const { InstagramService } = await import('../services/instagramService');
          const instagramService = new InstagramService(settings.instagramAccessToken);
          await instagramService.deleteMedia(video.instagramPostId);
        }
      } catch (instagramError) {
        logger.warn('Failed to delete Instagram post:', instagramError);
      }
    }

    await prisma.video.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
});

// Get queue statistics
router.get('/queue/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await queueService.getQueueStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Failed to get queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue stats'
    });
  }
});

// Retry failed video generation
router.post('/:id/retry', authenticateToken, async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.status !== 'FAILED') {
      return res.status(400).json({
        success: false,
        message: 'Only failed videos can be retried'
      });
    }

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    // Prepare job data for retry
    const jobData = {
      videoId: video.id,
      userId: req.user.id,
      prompt: video.prompt,
      imageUrl: '', // This would need to be stored or retrieved
      title: video.title,
      description: video.description,
      settings: {
        width: video.width,
        height: video.height,
        fps: video.fps,
        quality: video.quality,
      },
      instagramSettings: settings?.instagramConnected ? {
        accessToken: settings.instagramAccessToken!,
        caption: settings.defaultCaption,
        hashtags: settings.defaultHashtags,
        autoPost: settings.autoPost,
      } : undefined,
    };

    // Add to queue
    const jobId = await queueService.addVideoGenerationJob(jobData);

    logger.info(`Video retry queued: ${video.id}, job: ${jobId}`);

    res.json({
      success: true,
      data: {
        jobId,
        message: 'Video retry queued successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to retry video generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry video generation'
    });
  }
});

export default router; 