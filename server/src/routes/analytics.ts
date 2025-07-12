import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { 
  getUserAnalytics, 
  getVideoAnalytics, 
  getTopPerformingVideos,
  trackVideoPerformance 
} from '../services/analyticsService';
import { logger } from '../utils/logger';

// Extend Request interface to include user
interface AuthRequest extends express.Request {
  user?: any;
}

const router = express.Router();

// Get user analytics summary
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const analytics = await getUserAnalytics(req.user.id, timeRange as '7d' | '30d' | '90d');

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Failed to get user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
});

// Get video-specific analytics
router.get('/video/:videoId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { videoId } = req.params;
    const analytics = await getVideoAnalytics(videoId);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Video analytics not found'
      });
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Failed to get video analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get video analytics'
    });
  }
});

// Get top performing videos
router.get('/top-performing', authenticate, async (req: AuthRequest, res) => {
  try {
    const { limit = '10' } = req.query;
    const videos = await getTopPerformingVideos(req.user.id, parseInt(limit as string));

    res.json({
      success: true,
      data: { videos }
    });
  } catch (error) {
    logger.error('Failed to get top performing videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top performing videos'
    });
  }
});

// Manually trigger analytics tracking for a video
router.post('/track/:videoId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { videoId } = req.params;
    const { instagramId } = req.body;

    if (!instagramId) {
      return res.status(400).json({
        success: false,
        message: 'Instagram ID is required'
      });
    }

    const insights = await trackVideoPerformance(videoId, instagramId);

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'Failed to track video performance'
      });
    }

    res.json({
      success: true,
      data: { insights }
    });
  } catch (error) {
    logger.error('Failed to track video performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track video performance'
    });
  }
});

export default router; 