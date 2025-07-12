import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { queueService } from '../services/queueService';
import { logger } from '../utils/logger';

const router = express.Router();

// Get queue statistics
router.get('/stats', authenticateToken, async (req, res) => {
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

// Get job status
router.get('/job/:jobId', authenticateToken, async (req, res) => {
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

// Clean old jobs
router.post('/clean', authenticateToken, async (req, res) => {
  try {
    await queueService.cleanQueues();

    res.json({
      success: true,
      message: 'Queue cleanup completed'
    });
  } catch (error) {
    logger.error('Failed to clean queues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean queues'
    });
  }
});

// Get active jobs for user
router.get('/active', authenticateToken, async (req, res) => {
  try {
    // This would require additional implementation to track user-specific jobs
    // For now, return basic queue info
    const stats = await queueService.getQueueStats();

    res.json({
      success: true,
      data: {
        activeJobs: stats.video.active + stats.instagram.active,
        waitingJobs: stats.video.waiting + stats.instagram.waiting,
        videoQueue: stats.video,
        instagramQueue: stats.instagram
      }
    });
  } catch (error) {
    logger.error('Failed to get active jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active jobs'
    });
  }
});

export default router; 