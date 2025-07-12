import express from 'express';
import { InstagramService } from '../services/instagramService';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = express.Router();

// Get Instagram account info
router.get('/account', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings?.instagramConnected || !settings.instagramAccessToken) {
      return res.status(404).json({
        success: false,
        message: 'Instagram account not connected'
      });
    }

    const instagramService = new InstagramService(settings.instagramAccessToken);
    const accountInfo = await instagramService.getAccountInfo();

    res.json({
      success: true,
      data: accountInfo
    });
  } catch (error) {
    logger.error('Failed to get Instagram account info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Instagram account info'
    });
  }
});

// Post reel to Instagram
router.post('/post-reel', authenticateToken, async (req, res) => {
  try {
    const { videoId, caption, hashtags } = req.body;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    // Get video details
    const video = await prisma.video.findUnique({
      where: { id: videoId, userId: req.user.id }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Video must be completed before posting'
      });
    }

    if (!video.videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video URL not available'
      });
    }

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings?.instagramConnected || !settings.instagramAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'Instagram account not connected'
      });
    }

    // Create Instagram service instance
    const instagramService = new InstagramService(settings.instagramAccessToken);

    // Prepare posting options
    const postOptions = {
      videoUrl: video.videoUrl,
      caption: caption || settings.defaultCaption || video.title,
      hashtags: hashtags || settings.defaultHashtags || [],
    };

    // Post to Instagram
    const postResult = await instagramService.postReel(postOptions);

    // Update video status
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'POSTED',
        instagramPostId: postResult.id,
        postedAt: new Date(),
      }
    });

    logger.info(`Reel posted successfully: ${postResult.id} for video: ${videoId}`);

    res.json({
      success: true,
      data: {
        instagramPostId: postResult.id,
        permalink: postResult.permalink,
        videoId: videoId
      }
    });
  } catch (error) {
    logger.error('Failed to post reel to Instagram:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to post reel to Instagram'
    });
  }
});

// Connect Instagram account
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Validate access token
    const instagramService = new InstagramService(accessToken);
    const isValid = await instagramService.validateAccessToken();

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Instagram access token'
      });
    }

    // Get account info
    const accountInfo = await instagramService.getAccountInfo();

    // Update or create settings
    await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        instagramConnected: true,
        instagramAccessToken: accessToken,
        instagramAccountId: accountInfo.id,
        updatedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        instagramConnected: true,
        instagramAccessToken: accessToken,
        instagramAccountId: accountInfo.id,
        defaultWidth: 1080,
        defaultHeight: 1920,
        defaultFps: 30,
        defaultQuality: 'high',
        defaultLanguage: 'en',
        autoPost: false,
        defaultHashtags: ['#reels', '#viral', '#trending'],
        emailNotifications: true,
        pushNotifications: true,
      },
    });

    logger.info(`Instagram account connected for user: ${req.user.id}`);

    res.json({
      success: true,
      data: {
        accountInfo,
        message: 'Instagram account connected successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to connect Instagram account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Instagram account'
    });
  }
});

// Disconnect Instagram account
router.delete('/disconnect', authenticateToken, async (req, res) => {
  try {
    await prisma.settings.update({
      where: { userId: req.user.id },
      data: {
        instagramConnected: false,
        instagramAccessToken: null,
        instagramAccountId: null,
        updatedAt: new Date(),
      },
    });

    logger.info(`Instagram account disconnected for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Instagram account disconnected successfully'
    });
  } catch (error) {
    logger.error('Failed to disconnect Instagram account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Instagram account'
    });
  }
});

// Get media insights
router.get('/media/:mediaId/insights', authenticateToken, async (req, res) => {
  try {
    const { mediaId } = req.params;

    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings?.instagramConnected || !settings.instagramAccessToken) {
      return res.status(404).json({
        success: false,
        message: 'Instagram account not connected'
      });
    }

    const instagramService = new InstagramService(settings.instagramAccessToken);
    const mediaInfo = await instagramService.getMediaInfo(mediaId);

    res.json({
      success: true,
      data: mediaInfo
    });
  } catch (error) {
    logger.error('Failed to get media insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media insights'
    });
  }
});

// Delete media from Instagram
router.delete('/media/:mediaId', authenticateToken, async (req, res) => {
  try {
    const { mediaId } = req.params;

    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings?.instagramConnected || !settings.instagramAccessToken) {
      return res.status(404).json({
        success: false,
        message: 'Instagram account not connected'
      });
    }

    const instagramService = new InstagramService(settings.instagramAccessToken);
    await instagramService.deleteMedia(mediaId);

    // Update video status if it exists
    await prisma.video.updateMany({
      where: { 
        instagramPostId: mediaId,
        userId: req.user.id 
      },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      }
    });

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete media:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media'
    });
  }
});

export default router; 