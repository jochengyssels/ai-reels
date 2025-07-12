import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { InstagramService } from '../services/instagramService';

interface AuthRequest extends Request {
  user?: any;
}

const instagramService = new InstagramService();

export const connectAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { accessToken, accountId } = req.body;

    if (!accessToken || !accountId) {
      return res.status(400).json({
        success: false,
        error: 'Access token and account ID are required',
      });
    }

    // Verify the access token with Instagram
    const accountInfo = await instagramService.verifyAccessToken(accessToken);
    
    if (!accountInfo) {
      return res.status(400).json({
        success: false,
        error: 'Invalid access token',
      });
    }

    // Update or create settings
    await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        instagramConnected: true,
        instagramAccountId: accountId,
        instagramAccessToken: accessToken,
        instagramTokenExpires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
      create: {
        userId: req.user.id,
        instagramConnected: true,
        instagramAccountId: accountId,
        instagramAccessToken: accessToken,
        instagramTokenExpires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    });

    logger.info(`Instagram account connected for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Instagram account connected successfully',
      data: { accountInfo },
    });
  } catch (error) {
    logger.error('Instagram connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while connecting Instagram account',
    });
  }
};

export const postVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { videoId, caption, hashtags = [], location } = req.body;

    // Get video
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: req.user.id,
        status: 'COMPLETED',
      },
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found or not ready for posting',
      });
    }

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings?.instagramConnected) {
      return res.status(400).json({
        success: false,
        error: 'Instagram account not connected',
      });
    }

    // Prepare caption
    const finalCaption = caption || settings.defaultCaption || '';
    const finalHashtags = hashtags.length > 0 ? hashtags : settings.defaultHashtags;
    const hashtagString = finalHashtags.map((tag: string) => `#${tag}`).join(' ');

    const fullCaption = `${finalCaption}\n\n${hashtagString}`.trim();

    // Post to Instagram
    const postResult = await instagramService.postVideo({
      videoUrl: video.videoUrl!,
      caption: fullCaption,
      location,
      accessToken: settings.instagramAccessToken!,
      accountId: settings.instagramAccountId!,
    });

    // Update video with post information
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'POSTED',
        instagramPostId: postResult.id,
        postedAt: new Date(),
      },
    });

    logger.info(`Video posted to Instagram: ${videoId} by user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Video posted to Instagram successfully',
      data: { postResult },
    });
  } catch (error) {
    logger.error('Instagram posting error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while posting to Instagram',
    });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, platform = 'instagram' } = req.query;

    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings?.instagramConnected) {
      return res.status(400).json({
        success: false,
        error: 'Instagram account not connected',
      });
    }

    // Get analytics from Instagram
    const analytics = await instagramService.getAnalytics({
      accessToken: settings.instagramAccessToken!,
      accountId: settings.instagramAccountId!,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    // Store analytics in database
    if (analytics.data) {
      for (const metric of analytics.data) {
        await prisma.analytics.create({
          data: {
            userId: req.user.id,
            metric: metric.name,
            value: metric.value,
            platform: platform as string,
            date: new Date(),
          },
        });
      }
    }

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Instagram analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching Instagram analytics',
    });
  }
};

export const disconnectAccount = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.settings.update({
      where: { userId: req.user.id },
      data: {
        instagramConnected: false,
        instagramAccountId: null,
        instagramAccessToken: null,
        instagramTokenExpires: null,
      },
    });

    logger.info(`Instagram account disconnected for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Instagram account disconnected successfully',
    });
  } catch (error) {
    logger.error('Instagram disconnection error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while disconnecting Instagram account',
    });
  }
}; 